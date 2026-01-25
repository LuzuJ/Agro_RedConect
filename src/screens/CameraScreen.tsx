import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import { detectionService, DetectionBox } from '../services/DetectionService';
import { detectionHistoryService } from '../services/DetectionHistoryService';
import { ModelLabel, HAPTIC_CONFIG, MODEL_CONFIG } from '../constants/modelConfig';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getErrorMessage, getErrorTitle, isRetryableError } from '../utils/errors';
import { BoundingBox } from '../components/BoundingBox';

const { width, height } = Dimensions.get('window');

// Tamaño de entrada del modelo (usado para escalado)
const MODEL_INPUT_SIZE = MODEL_CONFIG.inputSize; // 640x640

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Para evitar choque con barra de estado
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [detectedBoxes, setDetectedBoxes] = useState<DetectionBox[]>([]);
  const [zoom, setZoom] = useState(0); // 0 = 1x, 0.5 = 2x, 1 = 3x (max)
  const [flashEnabled, setFlashEnabled] = useState(false); // Control de linterna
  
  const cameraRef = useRef<any>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCapturedImageRef = useRef<string | null>(null);
  const realtimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Inicializar servicio de detección
    detectionService.initialize().catch(console.error);

    return () => {
      detectionService.dispose();
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
      // Limpiar referencias de imágenes
      lastCapturedImageRef.current = null;
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color={COLORS.textSecondary} />
        <Text style={styles.permissionText}>Necesitamos acceso a tu cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isScanning) {
      // THROTTLE: Evitar detecciones muy rápidas (mínimo 1 segundo entre detecciones)
      const now = Date.now();
      if (now - lastDetectionTime < 1000) {
        console.log('⏸️ Throttle: Esperando 1 segundo entre detecciones');
        return;
      }
      
      setIsScanning(true);
      setLastDetectionTime(now);
      
      try {
        console.log('📸 Capturando foto...');
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85, // Reducido de 0.9 a 0.85 para mejor performance
          base64: false,
          exif: false,
          skipProcessing: true, // Evitar procesamiento innecesario
          enableShutterSound: false, // Silenciar sonido de captura
        });

        console.log(`✅ Foto capturada: ${photo.uri}`);
        
        // Limpiar imagen anterior para liberar memoria
        if (lastCapturedImageRef.current && lastCapturedImageRef.current !== photo.uri) {
          console.log('🧹 Liberando memoria de imagen anterior');
          lastCapturedImageRef.current = null;
        }
        lastCapturedImageRef.current = photo.uri;

        // Obtener ubicación (sin bloquear la detección si falla)
        let location: { latitude: number; longitude: number } | undefined;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000, // Cache de 5 segundos
            });
            location = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            console.log('📍 Ubicación obtenida:', location);
          }
        } catch (locError) {
          console.warn('⚠️ No se pudo obtener ubicación:', locError);
        }

        // Ejecutar detección con el modelo TFLite
        console.log('🔄 Iniciando detección...');
        const result = await detectionService.detectFromImage(photo.uri);
        
        console.log(`✅ Detección completada: ${result.boxes.length} detecciones`);
        
        // Guardar en historial (sin bloquear la navegación si falla)
        try {
          await detectionHistoryService.saveDetection({
            disease: result.hasDisease && result.dominantDisease 
              ? result.dominantDisease as ModelLabel
              : 'Sano',
            confidence: Math.max(...result.boxes.map(b => b.confidence)),
            imageUri: photo.uri,
            location,
            boxes: result.boxes.map(box => ({
              label: box.label,
              confidence: box.confidence,
            })),
          });
          console.log('💾 Detección guardada en historial');
        } catch (saveError) {
          console.error('⚠️ Error al guardar en historial:', saveError);
        }
        
        // Si detecta enfermedad, vibrar y navegar automáticamente
        if (result.hasDisease && result.dominantDisease) {
          console.log(`🦠 Enfermedad detectada: ${result.dominantDisease}`);
          
          // Feedback háptico según especificaciones técnicas
          const diseaseLabel = result.dominantDisease as ModelLabel;
          const hapticConfig = HAPTIC_CONFIG[diseaseLabel];
          
          if (hapticConfig.enabled) {
            // Vibración corta para enfermedad (Monilia/Fitoftora)
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          
          // Navegar directamente a tratamiento con la enfermedad detectada
          const maxConfidence = Math.max(...result.boxes.map(b => b.confidence));
          navigation.navigate('Diagnosis', {
            disease: result.dominantDisease as ModelLabel,
            confidence: maxConfidence,
            imageUri: photo.uri,
            boxes: result.boxes,
          });
        } else {
          console.log('✅ Planta sana detectada');
          
          // Si está sano, NO emitir vibración (según especificaciones)
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          const maxConfidence = result.boxes[0]?.confidence || 0.95;
          
          // Determinar la enfermedad correcta (puede ser Sano o null)
          const detectedDisease: ModelLabel | 'Sano' = result.dominantDisease 
            ? (result.dominantDisease as ModelLabel) 
            : 'Sano';
          
          navigation.navigate('Diagnosis', {
            disease: detectedDisease,
            confidence: maxConfidence,
            imageUri: photo.uri,
            boxes: result.boxes,
          });
        }
      } catch (error) {
        console.error('\n❌❌❌ ERROR AL CAPTURAR FOTO ❌❌❌');
        console.error(error);
        console.error('═══════════════════════════════════════\n');
        
        // Vibración de error
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Mostrar error con título y mensaje específicos
        const title = getErrorTitle(error);
        const message = getErrorMessage(error);
        const canRetry = isRetryableError(error);
        
        Alert.alert(
          title,
          message,
          canRetry 
            ? [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Reintentar', onPress: handleCapture }
              ]
            : [{ text: 'OK' }]
        );
      } finally {
        setIsScanning(false);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  /**
   * Selecciona imagen de la galería y la procesa
   */
  const pickImageFromGallery = async () => {
    try {
      // Solicitar permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Necesitamos acceso a tu galería para seleccionar imágenes.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Abrir selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) {
        return;
      }

      setIsScanning(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const imageUri = result.assets[0].uri;
      console.log('🖼️ Imagen seleccionada de galería:', imageUri);

      // Procesar con el modelo
      const detectionResult = await detectionService.detectFromImage(imageUri);

      console.log('🎯 Resultado de detección:', detectionResult);

      // Navegar a resultados
      if (detectionResult.dominantDisease === 'Sano') {
        const maxConfidence = detectionResult.boxes[0]?.confidence || 0.95;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        navigation.navigate('Diagnosis', {
          disease: 'Sano',
          confidence: maxConfidence,
          imageUri,
          boxes: detectionResult.boxes,
        });
      } else {
        const maxConfidence = detectionResult.boxes[0]?.confidence || 0;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        navigation.navigate('Diagnosis', {
          disease: detectionResult.dominantDisease as ModelLabel,
          confidence: maxConfidence,
          imageUri,
          boxes: detectionResult.boxes,
        });
      }
    } catch (error) {
      console.error('❌ Error procesando imagen de galería:', error);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const title = getErrorTitle(error);
      const message = getErrorMessage(error);
      
      Alert.alert(title, message, [{ text: 'OK' }]);
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Procesa un frame de la cámara en modo real-time
   */
  const processRealtimeFrame = async () => {
    if (!cameraRef.current || isScanning) {
      return;
    }

    try {
      // Capturar frame sin guardar (baja calidad para velocidad)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: false,
        skipProcessing: true,
      });

      // Detectar con el modelo
      const result = await detectionService.detectFromImage(photo.uri);
      
      // Actualizar boxes visuales
      setDetectedBoxes(result.boxes);
      
      console.log(`📡 Modo ayuda: ${result.boxes.length} mazorcas encontradas`);
    } catch (error) {
      // Silenciar errores en modo real-time para no saturar logs
      // Solo loggear si es un error crítico
      if (error instanceof Error && !error.message.includes('No se detectaron')) {
        console.warn('⚠️ Real-time frame error:', error.message);
      }
      // Limpiar boxes si hay error
      setDetectedBoxes([]);
    }
  };

  const toggleRealtimeMode = () => {
    const newMode = !isRealtimeMode;
    setIsRealtimeMode(newMode);
    
    if (newMode) {
      // Activar modo de ayuda visual
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        '� Asistente de Detección',
        'El modelo te ayudará a encontrar mazorcas que no ves a simple vista.\n\nLos recuadros aparecerán cada 3 segundos para una visualización estable.',
        [{ text: 'Entendido', style: 'default' }]
      );
      
      // Iniciar detección continua cada 3 segundos para evitar parpadeo
      realtimeIntervalRef.current = setInterval(() => {
        processRealtimeFrame();
      }, 3000);
      
      // Primera detección inmediata
      processRealtimeFrame();
    } else {
      // Desactivar modo ayuda
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
        realtimeIntervalRef.current = null;
      }
      
      // Limpiar boxes
      setDetectedBoxes([]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          zoom={zoom}
          enableTorch={flashEnabled}
          autofocus="on"
          ratio="4:3"
          animateShutter={false}
        />
        
        {/* Borde verde estático en modo asistente */}
        {isRealtimeMode && (
          <View style={styles.realtimeBorderOverlay} pointerEvents="none">
            <View style={styles.realtimeBorder} />
            <View style={styles.realtimeIndicator}>
              <MaterialCommunityIcons name="radar" size={20} color={COLORS.primary} />
              <Text style={styles.realtimeIndicatorText}>Asistente Activo</Text>
            </View>
          </View>
        )}
        
        {/* Recuadros de detección en tiempo real usando BoundingBox component */}
        {isRealtimeMode && detectedBoxes.length > 0 && (
          <View style={styles.realtimeBoxesOverlay} pointerEvents="none">
            {detectedBoxes.map((box, index) => {
              // ===== ESCALADO DE COORDENADAS =====
              // El modelo trabaja con 640x640, necesitamos escalar a pantalla real
              const scaleX = width / MODEL_INPUT_SIZE;
              const scaleY = height / MODEL_INPUT_SIZE;
              
              // Convertir coordenadas relativas (0-1) a píxeles del modelo (0-640)
              const modelX1 = box.x1 * MODEL_INPUT_SIZE;
              const modelY1 = box.y1 * MODEL_INPUT_SIZE;
              const modelX2 = box.x2 * MODEL_INPUT_SIZE;
              const modelY2 = box.y2 * MODEL_INPUT_SIZE;
              
              // Escalar a coordenadas de pantalla
              const screenBox = {
                left: modelX1 * scaleX,
                top: modelY1 * scaleY,
                right: modelX2 * scaleX,
                bottom: modelY2 * scaleY,
              };
              
              return (
                <BoundingBox
                  key={`box-${index}-${box.label}`}
                  box={screenBox}
                  label={box.label}
                  confidence={box.confidence}
                />
              );
            })}
          </View>
        )}
        
        {/* ===== OVERLAY REORGANIZADO ===== */}
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          
          {/* ===== BARRA SUPERIOR ===== */}
          <View style={styles.topBar}>
            {/* Indicador Offline */}
            <View style={styles.offlineChip}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineLabel}>Offline</Text>
            </View>

            {/* Botones de control */}
            <View style={styles.topActions}>
              {/* Botón de asistente de detección en tiempo real */}
              <TouchableOpacity 
                style={[styles.topButton, isRealtimeMode && styles.topButtonActive]}
                onPress={toggleRealtimeMode}
              >
                <MaterialCommunityIcons 
                  name={isRealtimeMode ? "radar" : "crosshairs-gps"} 
                  size={24} 
                  color={isRealtimeMode ? COLORS.primary : "white"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.topButton}
                onPress={() => setFlashEnabled(!flashEnabled)}
              >
                <MaterialCommunityIcons 
                  name={flashEnabled ? "flashlight" : "flashlight-off"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== ÁREA CENTRAL (Viewfinder) ===== */}
          <View style={styles.centerArea}>
            {/* Texto de guía simple */}
            <Text style={styles.guideText}>
              {(() => {
                if (isScanning) return 'Analizando...';
                if (isRealtimeMode) return `${detectedBoxes.length} mazorcas detectadas`;
                return 'Apunte a la mazorca';
              })()}
            </Text>

            {/* Marco de enfoque */}
            <View style={styles.focusFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Boxes en tiempo real */}
              {detectedBoxes.length > 0 && detectedBoxes.map((box, index) => {
                const frameSize = Math.min(width * 0.8, 320);
                const boxWidth = (box.x2 - box.x1) * frameSize;
                const boxHeight = (box.y2 - box.y1) * frameSize;
                const left = box.x1 * frameSize;
                const top = box.y1 * frameSize;
                
                return (
                  <View
                    key={`${box.label}-${index}`}
                    style={[
                      styles.detectionBox,
                      { left, top, width: boxWidth, height: boxHeight, borderColor: box.color }
                    ]}
                  >
                    <View style={[styles.detectionLabel, { backgroundColor: box.color }]}>
                      <Text style={styles.detectionLabelText}>
                        {box.label} {(box.confidence * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
              
              {/* Indicador de escaneo */}
              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
            </View>
          </View>

          {/* ===== BARRA INFERIOR ===== */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
            {/* Controles principales */}
            <View style={styles.mainControls}>
              {/* Galería */}
              <TouchableOpacity 
                style={styles.sideButton}
                onPress={pickImageFromGallery}
                disabled={isScanning}
              >
                <MaterialCommunityIcons name="image" size={28} color="white" />
              </TouchableOpacity>

              {/* Botón de captura GIGANTE */}
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <MaterialCommunityIcons name="camera" size={40} color="white" />
                )}
              </TouchableOpacity>

              {/* Flip cámara */}
              <TouchableOpacity 
                style={styles.sideButton}
                onPress={toggleCameraFacing}
              >
                <MaterialCommunityIcons name="camera-flip" size={28} color="white" />
              </TouchableOpacity>
            </View>

            {/* Navegación simplificada */}
            <View style={styles.simpleNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigation.navigate('History')}
              >
                <MaterialCommunityIcons name="history" size={20} color={COLORS.textSecondary} />
                <Text style={styles.navButtonText}>Historial</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigation.navigate('Heatmap')}
              >
                <MaterialCommunityIcons name="map-marker-radius" size={20} color={COLORS.textSecondary} />
                <Text style={styles.navButtonText}>Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <MaterialCommunityIcons name="account" size={20} color={COLORS.textSecondary} />
                <Text style={styles.navButtonText}>Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  
  // ===== BARRA SUPERIOR =====
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  offlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  offlineLabel: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },  topButtonActive: {
    backgroundColor: 'rgba(55,236,19,0.3)',
    borderColor: COLORS.primary,
  },
  // ===== ÁREA CENTRAL =====
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guideText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  focusFrame: {
    width: Math.min(width * 0.8, 320),
    height: Math.min(width * 0.8, 320),
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  detectionLabel: {
    position: 'absolute',
    top: -24,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detectionLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  
  // ===== BORDE VERDE EN MODO ASISTENTE =====
  realtimeBorderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  realtimeBorder: {
    flex: 1,
    borderWidth: 6,
    borderColor: COLORS.primary,
    borderRadius: 0,
    margin: 0,
  },
  realtimeIndicator: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -75 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(55, 236, 19, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  realtimeIndicatorText: {
    color: COLORS.backgroundDark,
    fontSize: 14,
    fontWeight: '700',
  },
  
  // ===== RECUADROS DE DETECCIÓN EN TIEMPO REAL =====
  realtimeBoxesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  realtimeDetectionBox: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  realtimeDetectionLabel: {
    position: 'absolute',
    top: -32,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  realtimeDetectionLabelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // ===== BARRA INFERIOR =====
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 16,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButton: {
    width: 80,  // BOTÓN GIGANTE
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  simpleNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // ===== PERMISOS =====
  
  // ===== PERMISOS =====
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    padding: 32,
  },
  permissionText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
