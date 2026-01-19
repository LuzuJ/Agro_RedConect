import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';
import * as FileSystem from 'expo-file-system/legacy';
import { MODEL_CONFIG, ModelLabel, LABEL_COLORS } from '../constants/modelConfig';
import { ModelNotLoadedError, ImageProcessingError, InferenceError } from '../utils/errors';

export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: ModelLabel;
  confidence: number;
  color: string;
}

export interface DetectionResult {
  boxes: DetectionBox[];
  hasDisease: boolean;
  dominantDisease: string | null;
  imageUri: string;
}

class DetectionService {
  private model: TensorflowModel | null = null;
  private isInitialized = false;
  private frameCount = 0;
  
  // ===== BUFFER DE PERSISTENCIA (Anti-Parpadeo) =====
  // Almacena detecciones recientes para confirmar persistencia
  private readonly detectionBuffer: Map<string, number> = new Map();
  private lastInferenceTime = 0;

  /**
   * Genera clave única para una detección basada en posición y clase
   */
  private getDetectionKey(box: DetectionBox): string {
    const centerX = Math.round((box.x1 + box.x2) / 2 / 10) * 10; // Redondeo a 10px
    const centerY = Math.round((box.y1 + box.y2) / 2 / 10) * 10;
    return `${box.label}_${centerX}_${centerY}`;
  }

  /**
   * Verifica si una detección es estable (presente en frames consecutivos)
   */
  private isStableDetection(box: DetectionBox): boolean {
    const key = this.getDetectionKey(box);
    const count = this.detectionBuffer.get(key) || 0;
    return count >= MODEL_CONFIG.minFramesForTrigger;
  }

  /**
   * Actualiza el buffer de persistencia con nuevas detecciones
   */
  private updateDetectionBuffer(boxes: DetectionBox[]): void {
    const currentKeys = new Set<string>();
    
    // Incrementar contador para detecciones presentes
    for (const box of boxes) {
      const key = this.getDetectionKey(box);
      currentKeys.add(key);
      const count = this.detectionBuffer.get(key) || 0;
      this.detectionBuffer.set(key, count + 1);
    }
    
    // Decrementar/eliminar detecciones ausentes
    for (const [key, count] of this.detectionBuffer.entries()) {
      if (!currentKeys.has(key)) {
        if (count > 1) {
          this.detectionBuffer.set(key, count - 1);
        } else {
          this.detectionBuffer.delete(key);
        }
      }
    }
  }

  /**
   * Verifica si debe ejecutar inferencia según throttling
   */
  private shouldRunInference(): boolean {
    const now = Date.now();
    const timeSinceLastInference = now - this.lastInferenceTime;
    
    if (timeSinceLastInference < MODEL_CONFIG.throttleDurationMs) {
      return false;
    }
    
    this.lastInferenceTime = now;
    return true;
  }

  /**
   * Inicializa y carga el modelo TFLite
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Modelo ya inicializado');
      return;
    }

    try {
      console.log('🔄 Iniciando carga del modelo TFLite...');
      
      // Cargar modelo TFLite desde assets
      this.model = await loadTensorflowModel(
        require('../../assets/models/best_int8.tflite')
      );
      
      console.log('✅ Modelo YOLOv8 TFLite cargado exitosamente');
      
      // VALIDAR ESTRUCTURA DEL MODELO
      console.log('\n🔍 VALIDANDO MODELO...');
      
      // 1. Validar inputs
      if (!this.model.inputs || this.model.inputs.length === 0) {
        throw new ModelNotLoadedError('El modelo no tiene inputs definidos');
      }
      
      const inputTensor = this.model.inputs[0];
      console.log(`📥 Input: ${inputTensor.name || 'unnamed'}`);
      console.log(`   - Tipo: ${inputTensor.dataType}`);
      console.log(`   - Shape: ${JSON.stringify(inputTensor.shape)}`);
      
      // Validar que el input shape sea correcto para YOLOv8
      const expectedShape = [1, MODEL_CONFIG.inputSize, MODEL_CONFIG.inputSize, 3];
      const actualShape = inputTensor.shape;
      
      if (actualShape.length !== 4) {
        throw new ModelNotLoadedError(
          `Input shape inválido. Esperado: 4 dimensiones, Actual: ${actualShape.length}`
        );
      }
      
      if (actualShape[1] !== MODEL_CONFIG.inputSize || actualShape[2] !== MODEL_CONFIG.inputSize) {
        console.warn(`⚠️ ADVERTENCIA: Input size ${actualShape[1]}x${actualShape[2]} difiere de config ${MODEL_CONFIG.inputSize}x${MODEL_CONFIG.inputSize}`);
      }
      
      if (actualShape[3] !== 3) {
        throw new ModelNotLoadedError(
          `Input debe tener 3 canales (RGB). Actual: ${actualShape[3]}`
        );
      }
      
      // Validar tipo de dato
      const isQuantized = inputTensor.dataType === 'uint8' || inputTensor.dataType === 'int8';
      if (MODEL_CONFIG.quantized && !isQuantized) {
        console.warn(`⚠️ ADVERTENCIA: Configurado como quantized (int8/uint8) pero modelo usa ${inputTensor.dataType}`);
      } else if (!MODEL_CONFIG.quantized && isQuantized) {
        console.warn(`⚠️ ADVERTENCIA: Configurado como float32 pero modelo usa ${inputTensor.dataType}`);
      } else {
        console.log(`✅ DataType correcto: ${inputTensor.dataType}`);
      }
      
      // 2. Validar outputs
      if (!this.model.outputs || this.model.outputs.length === 0) {
        throw new ModelNotLoadedError('El modelo no tiene outputs definidos');
      }
      
      console.log(`📤 Outputs: ${this.model.outputs.length} tensor(s)`);
      this.model.outputs.forEach((tensor, i) => {
        console.log(`   [${i}] ${tensor.name || 'unnamed'}: ${tensor.dataType} ${JSON.stringify(tensor.shape)}`);
      });
      
      // Validar que sea YOLOv8 (output shape típico: [1, 84, 8400] o similar)
      const outputTensor = this.model.outputs[0];
      if (outputTensor.shape.length < 2) {
        console.warn('⚠️ ADVERTENCIA: Output shape inesperado para YOLOv8');
      }
      
      // 3. Test de inferencia con imagen dummy
      console.log('\n🧪 EJECUTANDO TEST DE INFERENCIA...');
      try {
        await this.validateModelWithDummyImage();
      } catch (testError) {
        console.error('❌ Test de inferencia falló:', testError);
        this.isInitialized = false;
        throw new ModelNotLoadedError(
          `El modelo cargó pero la inferencia falló: ${testError instanceof Error ? testError.message : String(testError)}`
        );
      }
      
      this.isInitialized = true;
      
      console.log('\n✅ VALIDACIÓN COMPLETADA');
      console.log('📊 Configuración:');
      console.log(`   - Input: ${inputTensor.dataType} ${JSON.stringify(inputTensor.shape)}`);
      console.log(`   - Clases: ${MODEL_CONFIG.labels.join(', ')}`);
      console.log(`   - Confidence: ${MODEL_CONFIG.confidenceThreshold}`);
      console.log(`   - IoU: ${MODEL_CONFIG.iouThreshold}`);
      console.log(`   - Quantized: ${MODEL_CONFIG.quantized ? 'Sí (INT8)' : 'No'}`);
      
    } catch (error) {
      console.error('❌ Error al cargar modelo TFLite:', error);
      this.isInitialized = false;
      throw error instanceof ModelNotLoadedError 
        ? error 
        : new ModelNotLoadedError(
            `No se pudo cargar el modelo de IA. Verifica que best_int8.tflite exista en assets/models/`
          );
    }
  }

  /**
   * Valida el modelo ejecutando una inferencia con una imagen dummy
   */
  private async validateModelWithDummyImage(): Promise<void> {
    try {
      const inputSize = MODEL_CONFIG.inputSize;
      const totalPixels = inputSize * inputSize * 3;
      
      // Crear imagen dummy (todos los píxeles en verde - simula planta sana)
      const dummyInput = MODEL_CONFIG.quantized 
        ? new Uint8Array(totalPixels).fill(128) // Gris medio para INT8
        : new Float32Array(totalPixels).fill(0.5); // 0.5 para Float32
      
      console.log('🧪 EJECUTANDO TEST DE INFERENCIA...');
      console.log(`   - Creando imagen dummy: ${dummyInput.length} valores`);
      console.log(`   - Tipo de dato: ${dummyInput.constructor.name}`);
      console.log(`   - Quantized config: ${MODEL_CONFIG.quantized}`);
      
      if (!this.model) {
        throw new Error('Modelo no está cargado');
      }
      
      // Validar que el modelo tenga los métodos necesarios
      console.log('🔍 Validando estructura del modelo...');
      console.log('   - model.run existe:', typeof this.model.run);
      console.log('   - model.inputs:', this.model.inputs?.length);
      console.log('   - model.outputs:', this.model.outputs?.length);
      
      // Ejecutar inferencia (await porque run() es async)
      const startTime = Date.now();
      let outputs;
      
      try {
        // react-native-fast-tflite espera array de TypedArrays
        console.log('📤 Llamando model.run con input:', {
          type: dummyInput.constructor.name,
          length: dummyInput.length,
          arrayWrapper: true
        });
        outputs = await this.model.run([dummyInput]);
      } catch (runError) {
        console.error('❌ Error en model.run():', runError);
        console.error('   Input type:', typeof dummyInput);
        console.error('   Input constructor:', dummyInput.constructor.name);
        console.error('   Input length:', dummyInput.length);
        throw runError;
      }
      
      const elapsed = Date.now() - startTime;
      
      console.log(`   ✅ Inferencia exitosa en ${elapsed}ms`);
      console.log(`   - Output tensors: ${outputs.length}`);
      
      // Validar que los outputs tengan datos
      // outputs es un array de TypedArrays
      if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
        throw new Error('El modelo no retornó outputs válidos');
      }
      
      const firstOutput = outputs[0];
      
      if (!firstOutput || firstOutput.length === 0) {
        throw new Error('El primer output está vacío');
      }
      
      console.log(`   - Output size: ${firstOutput.length} elementos`);
      console.log(`   ✅ Modelo funcional`);
      
    } catch (error) {
      console.error('   ❌ Test de inferencia falló:', error);
      throw new ModelNotLoadedError(
        `El modelo cargó pero la inferencia falló: ${error}`
      );
    }
  }

  /**
   * Convierte imagen a formato JPG si es necesario
   */
  async convertToJPG(uri: string): Promise<string> {
    try {
      const extension = uri.split('.').pop()?.toLowerCase();
      console.log(`📷 Formato de imagen detectado: .${extension}`);
      
      if (extension === 'jpg' || extension === 'jpeg') {
        console.log('✅ Ya está en formato JPG');
        return uri;
      }

      console.log('🔄 Convirtiendo imagen a JPG...');
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MODEL_CONFIG.inputSize, height: MODEL_CONFIG.inputSize } }],
        // OPTIMIZADO: compress 0.7 (de 0.9) reduce tamaño ~40% con pérdida mínima
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log(`✅ Imagen convertida: ${result.uri}`);
      return result.uri;
    } catch (error) {
      console.error('❌ Error al convertir imagen:', error);
      throw new ImageProcessingError('No se pudo convertir la imagen a formato compatible');
    }
  }

  /**
   * Preprocesa la imagen para el modelo
   * Redimensiona a 640x640 y extrae píxeles RGB reales usando jpeg-js
   */
  private async preprocessImage(imageUri: string): Promise<Uint8Array | Float32Array> {
    try {
      console.log('🔄 Preprocesando imagen...');
      console.log('📷 URI:', imageUri);
      
      const inputSize = MODEL_CONFIG.inputSize;

      // OPTIMIZADO: Redimensionar con compress 0.7 para procesamiento rápido
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: inputSize, height: inputSize } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log('✅ Imagen redimensionada:', manipResult.uri);

      // Leer archivo JPEG como base64
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: 'base64',
      });

      // Convertir base64 a Uint8Array
      const jpegData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      console.log('📦 Datos JPEG leídos:', jpegData.length, 'bytes');

      // Decodificar JPEG con jpeg-js
      const decoded = jpeg.decode(jpegData, { useTArray: true });
      console.log('✅ JPEG decodificado:', {
        width: decoded.width,
        height: decoded.height,
        channels: decoded.data.length / (decoded.width * decoded.height)
      });

      // jpeg-js devuelve RGBA, necesitamos RGB
      const rgbPixels = new Uint8Array(inputSize * inputSize * 3);
      let rgbIndex = 0;
      
      for (let i = 0; i < decoded.data.length; i += 4) {
        rgbPixels[rgbIndex++] = decoded.data[i];     // R
        rgbPixels[rgbIndex++] = decoded.data[i + 1]; // G
        rgbPixels[rgbIndex++] = decoded.data[i + 2]; // B
        // Ignorar canal alpha (i + 3)
      }
      
      const sample = rgbPixels.slice(0, 12);
      console.log('📊 Muestra real (4 píxeles):', Array.from(sample));
      console.log('📈 Stats:', {
        min: Math.min(...Array.from(rgbPixels.slice(0, 10000))),
        max: Math.max(...Array.from(rgbPixels.slice(0, 10000))),
        mean: Math.round(Array.from(rgbPixels.slice(0, 10000)).reduce((a, b) => a + b, 0) / 10000)
      });
      
      if (MODEL_CONFIG.quantized) {
        console.log(`✅ Tensor UINT8: ${rgbPixels.length / 3} píxeles`);
        return rgbPixels;
      } else {
        const float32Data = new Float32Array(rgbPixels.length);
        for (let i = 0; i < rgbPixels.length; i++) {
          float32Data[i] = rgbPixels[i] / 255;
        }
        console.log(`✅ Tensor Float32: ${rgbPixels.length / 3} píxeles`);
        return float32Data;
      }
    } catch (error) {
      console.error('❌ Error:', error);
      throw new ImageProcessingError(`Error preprocesando imagen: ${error}`);
    }
  }

  /**
   * Convierte base64 a Float32Array normalizado (OBSOLETO - reemplazado por preprocessImage)
   */
  private base64ToImageData(base64: string): Float32Array {
    // NOTA: Este método ya no se usa, se mantiene por compatibilidad
    console.warn('⚠️ base64ToImageData obsoleto, usar preprocessImage()');
    
    const binaryString = atob(base64);
    const inputSize = MODEL_CONFIG.inputSize;
    const imageData = new Float32Array(inputSize * inputSize * 3);
    
    for (let i = 0; i < imageData.length; i++) {
      imageData[i] = (binaryString.charCodeAt(i % binaryString.length) & 0xFF) / 255.0;
    }

    return imageData;
  }

  /**
   * Aplica Non-Maximum Suppression (NMS)
   */
  private applyNMS(boxes: DetectionBox[]): DetectionBox[] {
    if (boxes.length === 0) return [];

    const sorted = boxes.sort((a, b) => b.confidence - a.confidence);
    const selected: DetectionBox[] = [];

    for (const box of sorted) {
      let shouldKeep = true;

      for (const selectedBox of selected) {
        const iou = this.calculateIoU(box, selectedBox);
        
        if (iou > MODEL_CONFIG.iouThreshold) {
          shouldKeep = false;
          break;
        }
      }

      if (shouldKeep) {
        selected.push(box);
      }
    }

    console.log(`📦 NMS: ${boxes.length} → ${selected.length} detecciones`);
    
    // Contar por clase
    const counts = { Sano: 0, Monilia: 0, Fitoftora: 0 };
    selected.forEach(box => {
      if (box.label in counts) {
        counts[box.label as keyof typeof counts]++;
      }
    });
    console.log(`   - Sano: ${counts.Sano}, Monilia: ${counts.Monilia}, Fitoftora: ${counts.Fitoftora}`);
    
    return selected;
  }

  /**
   * Calcula Intersection over Union (IoU)
   */
  private calculateIoU(box1: DetectionBox, box2: DetectionBox): number {
    const x1 = Math.max(box1.x1, box2.x1);
    const y1 = Math.max(box1.y1, box2.y1);
    const x2 = Math.min(box1.x2, box2.x2);
    const y2 = Math.min(box1.y2, box2.y2);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    
    const area1 = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const area2 = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
    
    const union = area1 + area2 - intersection;
    
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Ejecuta la inferencia del modelo con TFLite
   */
  private async runInference(inputData: Float32Array | Uint8Array): Promise<DetectionBox[]> {
    if (!this.model) {
      throw new ModelNotLoadedError('El modelo de IA no está cargado. Espera unos segundos.');
    }

    try {
      const startTime = Date.now();
      
      console.log('🚀 Ejecutando inferencia...');
      console.log(`   - Input size: ${inputData.length} elementos`);

      // Ejecutar inferencia con TFLite (espera array de TypedArrays)
      const outputs = await this.model.run([inputData]);
      
      const inferenceTime = Date.now() - startTime;
      console.log(`⚡ Inferencia completada en ${inferenceTime}ms`);
      
      // outputs es un array de TypedArrays
      if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
        throw new InferenceError('El modelo no retornó ningún output');
      }
      
      const outputData = outputs[0];
      
      if (!outputData || outputData.length === 0) {
        throw new InferenceError('Output inválido del modelo');
      }
      
      console.log(`📤 Output size: ${outputData.length}`);
      console.log(`📤 Output type: ${outputData.constructor.name}`);
      
      // DEQUANTIZAR si es modelo INT8
      let dequantizedOutput: Float32Array;
      
      if (MODEL_CONFIG.quantized && outputData instanceof Uint8Array) {
        console.log('🔄 Dequantizando output INT8 → Float32...');
        // Parámetros típicos de YOLOv8 quantized: scale=1/256, zero_point=0
        const scale = 1.0 / 256.0; // 0.00390625
        const zeroPoint = 0;
        
        dequantizedOutput = new Float32Array(outputData.length);
        for (let i = 0; i < outputData.length; i++) {
          dequantizedOutput[i] = (outputData[i] - zeroPoint) * scale;
        }
        
        console.log(`✅ Dequantizado: min=${Math.min(...Array.from(dequantizedOutput.slice(0, 1000)))}, max=${Math.max(...Array.from(dequantizedOutput.slice(0, 1000)))}`);
      } else {
        dequantizedOutput = outputData as Float32Array;
      }
      
      // Parsear output de YOLOv8
      const boxes = this.parseYOLOv8Output(dequantizedOutput);
      
      console.log(`📦 Detecciones crudas: ${boxes.length}`);
      
      return boxes;
    } catch (error) {
      console.error('❌ Error en inferencia:', error);
      throw error;
    }
  }

  /**
   * Parsea el output de YOLOv8 TFLite
   * Output format: [1, num_classes + 4, num_predictions] 
   * donde los primeros 4 valores son [x, y, w, h] y el resto son class probabilities
   * Para nuestro modelo: [1, 7, 8400] = [batch, 3 clases + 4 coords, 8400 predicciones]
   */
  private parseYOLOv8Output(output: Float32Array): DetectionBox[] {
    const boxes: DetectionBox[] = [];
    const numClasses = MODEL_CONFIG.labels.length; // 3: Sano, Monilia, Fitoftora
    
    // El output está en formato [1, 7, 8400]
    // Necesitamos transponer: primeros 4 son coords (x,y,w,h), siguientes 3 son clases
    const numPredictions = 8400; // YOLOv8n con 640x640
    const stride = numClasses + 4; // 7 valores por predicción
    
    console.log(`🔍 Analizando ${numPredictions} predicciones (formato [1,${stride},${numPredictions}])...`);
    
    let detectedAboveThreshold = 0;
    let maxConfidenceFound = 0;
    
    for (let i = 0; i < numPredictions; i++) {
      // En formato transpuesto: [batch, features, predictions]
      // Para obtener feature F de prediction P: output[F * numPredictions + P]
      const cx = output[0 * numPredictions + i];  // x center
      const cy = output[1 * numPredictions + i];  // y center
      const w = output[2 * numPredictions + i];   // width
      const h = output[3 * numPredictions + i];   // height
      
      // Encontrar clase con mayor probabilidad
      let maxClassScore = 0;
      let maxClassIndex = 0;
      
      for (let c = 0; c < numClasses; c++) {
        const classScore = output[(4 + c) * numPredictions + i];
        if (classScore > maxClassScore) {
          maxClassScore = classScore;
          maxClassIndex = c;
        }
      }

      const confidence = maxClassScore;
      
      // Trackear confianza máxima
      if (confidence > maxConfidenceFound) {
        maxConfidenceFound = confidence;
      }
      
      // Filtrar por confianza
      if (confidence < MODEL_CONFIG.confidenceThreshold) {
        continue;
      }
      
      detectedAboveThreshold++;

      const label = MODEL_CONFIG.labels[maxClassIndex] as ModelLabel;
      
      // Convertir de centro+tamaño a coordenadas de esquinas (normalizadas 0-1)
      const x1 = Math.max(0, Math.min(1, (cx - w / 2) / MODEL_CONFIG.inputSize));
      const y1 = Math.max(0, Math.min(1, (cy - h / 2) / MODEL_CONFIG.inputSize));
      const x2 = Math.max(0, Math.min(1, (cx + w / 2) / MODEL_CONFIG.inputSize));
      const y2 = Math.max(0, Math.min(1, (cy + h / 2) / MODEL_CONFIG.inputSize));

      boxes.push({
        x1,
        y1,
        x2,
        y2,
        label,
        confidence,
        color: LABEL_COLORS[label],
      });
    }
    
    console.log(`📊 Estadísticas de detección:`);
    console.log(`   - Confianza máxima encontrada: ${(maxConfidenceFound * 100).toFixed(1)}%`);
    console.log(`   - Detecciones sobre threshold (${MODEL_CONFIG.confidenceThreshold}): ${detectedAboveThreshold}`);
    console.log(`   - Boxes antes de NMS: ${boxes.length}`);

    return boxes;
  }

  /**
   * Detecta objetos en una imagen estática
   */
  async detectFromImage(imageUri: string): Promise<DetectionResult> {
    console.log('\n═══════════════════════════════════════');
    console.log('🎯 INICIANDO DETECCIÓN DE IMAGEN');
    console.log(`📸 URI: ${imageUri}`);
    console.log('═══════════════════════════════════════\n');

    try {
      // Inicializar si no está listo
      if (!this.isInitialized) {
        console.log('⚠️ Modelo no inicializado, inicializando...');
        await this.initialize();
      }

      // Convertir a JPG si es necesario
      const jpgUri = await this.convertToJPG(imageUri);

      // Preprocesar imagen
      const inputData = await this.preprocessImage(jpgUri);

      // Ejecutar inferencia
      const boxes = await this.runInference(inputData);

      // Aplicar NMS
      const filteredBoxes = this.applyNMS(boxes);

      // Determinar si hay enfermedad
      const hasDisease = filteredBoxes.some(box => box.label !== 'Sano');
      
      // Obtener enfermedad dominante (mayor confianza)
      const diseaseBoxes = filteredBoxes.filter(box => box.label !== 'Sano');
      const dominantDisease = diseaseBoxes.length > 0
        ? diseaseBoxes.sort((a, b) => b.confidence - a.confidence)[0].label
        : null;

      const result: DetectionResult = {
        boxes: filteredBoxes,
        hasDisease,
        dominantDisease,
        imageUri: jpgUri,
      };

      console.log('\n═══════════════════════════════════════');
      console.log('✅ DETECCIÓN COMPLETADA');
      console.log(`📦 Boxes finales: ${filteredBoxes.length}`);
      console.log(`🦠 Enfermedad detectada: ${hasDisease ? 'SÍ' : 'NO'}`);
      if (dominantDisease) {
        console.log(`🔴 Enfermedad dominante: ${dominantDisease}`);
      }
      filteredBoxes.forEach((box, i) => {
        console.log(`   [${i + 1}] ${box.label} (${(box.confidence * 100).toFixed(1)}%)`);
      });
      console.log('═══════════════════════════════════════\n');

      return result;
    } catch (error) {
      console.error('\n❌❌❌ ERROR CRÍTICO EN DETECCIÓN ❌❌❌');
      console.error(error);
      console.error('═══════════════════════════════════════\n');
      
      // Re-lanzar errores específicos
      if (
        error instanceof ModelNotLoadedError || 
        error instanceof ImageProcessingError ||
        error instanceof InferenceError
      ) {
        throw error;
      }
      
      // Error genérico
      throw new InferenceError('Error inesperado al analizar la imagen. Intenta de nuevo.');
    }
  }

  /**
   * Detecta objetos en un frame de cámara en tiempo real
   * Optimizado para procesar 1 de cada N frames (frameSkip)
   */
  /**
   * Detecta desde frame de cámara con throttling y buffer de persistencia
   */
  async detectFromFrame(imageUri: string): Promise<DetectionBox[] | null> {
    // Aplicar throttling (200ms entre inferencias)
    if (!this.shouldRunInference()) {
      return null;
    }

    this.frameCount++;
    console.log(`🎬 Frame ${this.frameCount}: Procesando con throttling...`);

    try {
      const result = await this.detectFromImage(imageUri);
      
      // Actualizar buffer de persistencia
      this.updateDetectionBuffer(result.boxes);
      
      // Filtrar solo detecciones estables (presentes en N frames consecutivos)
      const stableBoxes = result.boxes.filter(box => this.isStableDetection(box));
      
      if (stableBoxes.length < result.boxes.length) {
        console.log(`🔄 Buffer: ${stableBoxes.length}/${result.boxes.length} detecciones estables`);
      }
      
      return stableBoxes;
    } catch (error) {
      console.error('❌ Error en detección de frame:', error);
      return null;
    }
  }

  /**
   * Limpia recursos del modelo
   */
  dispose(): void {
    console.log('🧹 Limpiando recursos del modelo...');
    if (this.model) {
      // react-native-fast-tflite handles cleanup automatically
      this.model = null;
    }
    this.isInitialized = false;
    console.log('✅ Recursos liberados');
  }
}

export const detectionService = new DetectionService();
