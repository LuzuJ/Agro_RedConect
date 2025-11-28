import { IDiagnosisResult } from '@/types';
import { PlantRepository } from '@/repositories/PlantRepository';
import { PlantRecordRepository } from '@/repositories/PlantRecordRepository';
import { PostRepository } from '@/repositories/PostRepository';
import { Plant } from '@/models/Plant';
import { PlantRecord } from '@/models/PlantRecord';

// Mock diseases database for simulation
const MOCK_DISEASES = [
  {
    name: 'Tizón tardío',
    scientificName: 'Phytophthora infestans',
    confidence: 0.92,
    severity: 'high' as const,
    description: 'El tizón tardío es una enfermedad devastadora causada por un oomiceto que afecta principalmente a solanáceas.',
    symptoms: [
      'Manchas marrones o negras en las hojas',
      'Pudrición húmeda en tallos y frutos',
      'Moho blanco en el envés de las hojas',
      'Marchitamiento rápido de la planta'
    ],
    treatment: [
      'Aplicar fungicidas a base de cobre',
      'Eliminar y destruir partes infectadas',
      'Mejorar la ventilación entre plantas',
      'Evitar riego por aspersión',
      'Rotar cultivos cada 2-3 años'
    ],
    prevention: [
      'Usar semillas y plántulas certificadas',
      'Mantener espacio adecuado entre plantas',
      'Aplicar fungicidas preventivos en épocas húmedas',
      'Monitorear constantemente el cultivo'
    ]
  },
  {
    name: 'Oídio',
    scientificName: 'Erysiphe cichoracearum',
    confidence: 0.88,
    severity: 'medium' as const,
    description: 'El oídio es un hongo que forma una capa polvorienta blanca sobre las hojas y tallos.',
    symptoms: [
      'Polvo blanco en la superficie de las hojas',
      'Hojas amarillentas y deformadas',
      'Reducción del crecimiento',
      'Caída prematura de hojas'
    ],
    treatment: [
      'Aplicar fungicidas azufrados',
      'Usar aceite de neem',
      'Mezcla de bicarbonato de sodio con agua',
      'Podar partes afectadas'
    ],
    prevention: [
      'Evitar el exceso de nitrógeno',
      'Mantener buena circulación de aire',
      'Regar por la mañana',
      'Usar variedades resistentes'
    ]
  },
  {
    name: 'Roya del tomate',
    scientificName: 'Puccinia spp.',
    confidence: 0.85,
    severity: 'medium' as const,
    description: 'La roya es una enfermedad fúngica que produce pústulas características de color óxido en las hojas.',
    symptoms: [
      'Pústulas anaranjadas o marrones en el envés',
      'Manchas amarillas en el haz de las hojas',
      'Defoliación prematura',
      'Debilitamiento general de la planta'
    ],
    treatment: [
      'Aplicar fungicidas sistémicos',
      'Eliminar hojas infectadas',
      'Fungicidas a base de mancozeb',
      'Tratamiento con productos triazoles'
    ],
    prevention: [
      'Evitar mojar el follaje',
      'Usar variedades resistentes',
      'Rotación de cultivos',
      'Control de malezas hospederas'
    ]
  },
  {
    name: 'Mosca blanca',
    scientificName: 'Bemisia tabaci',
    confidence: 0.91,
    severity: 'high' as const,
    description: 'La mosca blanca es una plaga que succiona savia y transmite virus a las plantas.',
    symptoms: [
      'Pequeños insectos blancos voladores',
      'Hojas amarillentas y enrolladas',
      'Presencia de melaza pegajosa',
      'Fumagina (moho negro) en hojas'
    ],
    treatment: [
      'Aplicar jabón potásico',
      'Uso de aceite de neem',
      'Trampas amarillas adhesivas',
      'Insecticidas sistémicos si es severo',
      'Liberación de parasitoides (Encarsia formosa)'
    ],
    prevention: [
      'Inspección regular de plantas nuevas',
      'Eliminar plantas hospederas',
      'Mantener control de malezas',
      'Usar mallas antiinsectos'
    ]
  },
  {
    name: 'Planta sana',
    scientificName: 'N/A',
    confidence: 0.95,
    severity: 'none' as const,
    description: 'La planta muestra un estado óptimo de salud sin signos visibles de enfermedades o plagas.',
    symptoms: [
      'Hojas de color verde uniforme',
      'Crecimiento vigoroso',
      'Sin manchas ni deformaciones',
      'Buen desarrollo de frutos'
    ],
    treatment: [
      'Continuar con el cuidado habitual',
      'Mantener riego adecuado',
      'Fertilizar según necesidades'
    ],
    prevention: [
      'Monitoreo continuo',
      'Mantener buenas prácticas agrícolas',
      'Rotación de cultivos preventiva'
    ]
  }
];

export interface DiagnosisServiceConfig {
  useMockAI: boolean;
  apiKey?: string;
}

export class DiagnosisService {
  private readonly config: DiagnosisServiceConfig;

  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly plantRecordRepository: PlantRecordRepository,
    private readonly postRepository: PostRepository,
    config?: DiagnosisServiceConfig
  ) {
    this.config = config ?? { useMockAI: true };
  }

  /**
   * Realiza un diagnóstico de la planta usando IA (mock o real)
   */
  async diagnose(
    image: string,
    plantId: string,
    userId: string,
    additionalContext?: string
  ): Promise<{ diagnosis: IDiagnosisResult; record: PlantRecord }> {
    // Obtener la planta
    const plant = await this.plantRepository.getById(plantId);
    if (!plant) {
      throw new Error('Planta no encontrada');
    }

    // Realizar diagnóstico (mock o real)
    const diagnosis = this.config.useMockAI
      ? await this.mockDiagnosis(image, additionalContext)
      : await this.realDiagnosis(image, additionalContext);

    // Actualizar estado de la planta según diagnóstico
    this.updatePlantStatus(plant, diagnosis);
    await this.plantRepository.update(plant);

    // Crear registro de diagnóstico
    const record = PlantRecord.createDiagnosis(plantId, userId, diagnosis, image);
    await this.plantRecordRepository.create({
      plantId,
      userId,
      type: 'diagnosis',
      diagnosis,
      image,
    });

    return { diagnosis, record };
  }

  /**
   * Diagnóstico mock para desarrollo
   */
  private async mockDiagnosis(
    _image: string,
    _additionalContext?: string
  ): Promise<IDiagnosisResult> {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Seleccionar enfermedad aleatoria (con mayor probabilidad de "sana")
    const random = Math.random();
    let disease;
    
    if (random > 0.7) {
      // 30% probabilidad de planta sana
      disease = MOCK_DISEASES.find(d => d.name === 'Planta sana')!;
    } else {
      // 70% probabilidad de alguna enfermedad
      const diseases = MOCK_DISEASES.filter(d => d.name !== 'Planta sana');
      disease = diseases[Math.floor(Math.random() * diseases.length)];
    }

    // Agregar variación en la confianza
    const confidenceVariation = (Math.random() * 0.1) - 0.05;
    const adjustedConfidence = Math.max(0.5, Math.min(1, disease.confidence + confidenceVariation));

    return {
      diseaseName: disease.name,
      scientificName: disease.scientificName,
      confidence: adjustedConfidence,
      severity: disease.severity,
      description: disease.description,
      symptoms: disease.symptoms,
      treatment: disease.treatment,
      prevention: disease.prevention,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Diagnóstico real usando Gemini API (para implementar)
   */
  private async realDiagnosis(
    _image: string,
    _additionalContext?: string
  ): Promise<IDiagnosisResult> {
    // TODO: Implementar integración con Gemini API
    throw new Error('Real AI diagnosis not implemented yet. Use mock mode.');
  }

  /**
   * Actualiza el estado de la planta según el diagnóstico
   */
  private updatePlantStatus(plant: Plant, diagnosis: IDiagnosisResult): void {
    if (diagnosis.diseaseName === 'Planta sana') {
      if (plant.status === 'Recuperándose' || plant.status === 'Enfermo') {
        plant.markAsRecovering();
      } else {
        plant.markAsHealthy();
      }
    } else {
      const diseaseId = diagnosis.diseaseName.toLowerCase().split(/\s+/).join('-');
      plant.setDiagnosis({ id: diseaseId, name: diagnosis.diseaseName });
    }
  }

  /**
   * Obtiene el historial de diagnósticos de una planta
   */
  async getPlantHistory(plantId: string): Promise<PlantRecord[]> {
    return this.plantRecordRepository.findByPlantId(plantId);
  }

  /**
   * Obtiene estadísticas de diagnósticos del usuario
   */
  async getUserDiagnosisStats(userId: string): Promise<{
    total: number;
    healthy: number;
    infected: number;
    byDisease: Record<string, number>;
  }> {
    const records = await this.plantRecordRepository.findByUserId(userId);
    const diagnosisRecords = records.filter(r => r.type === 'diagnosis');

    const stats = {
      total: diagnosisRecords.length,
      healthy: 0,
      infected: 0,
      byDisease: {} as Record<string, number>,
    };

    for (const record of diagnosisRecords) {
      if (record.diagnosis) {
        if (record.diagnosis.diseaseName === 'Planta sana') {
          stats.healthy++;
        } else {
          stats.infected++;
          const name = record.diagnosis.diseaseName;
          stats.byDisease[name] = (stats.byDisease[name] || 0) + 1;
        }
      }
    }

    return stats;
  }

  /**
   * Comparte un diagnóstico como post en el feed social
   */
  async shareDiagnosisAsPost(
    recordId: string,
    userId: string,
    comment: string,
    author: string,
    authorAvatar: string
  ): Promise<{ success: boolean; postId?: string }> {
    const record = await this.plantRecordRepository.getById(recordId);
    if (!record) {
      return { success: false };
    }

    if (!record.diagnosis) {
      return { success: false };
    }

    // Crear contenido del post
    const content = this.formatDiagnosisForPost(record.diagnosis, comment);

    // Crear el post
    const post = await this.postRepository.createPost({
      userId,
      author,
      authorAvatar,
      content,
      image: record.image,
      tags: ['diagnóstico', 'agricultura', record.diagnosis.diseaseName.toLowerCase()],
    });

    // Actualizar el registro con el ID del post
    record.setSharedPost(post.id);
    await this.plantRecordRepository.update(record);

    return { success: true, postId: post.id };
  }

  /**
   * Formatea el diagnóstico para compartir como post
   */
  private formatDiagnosisForPost(diagnosis: IDiagnosisResult, comment: string): string {
    const severityEmoji: Record<string, string> = {
      none: '✅',
      low: '🟡',
      medium: '🟠',
      high: '🔴',
    };

    let content = '';
    
    if (comment) {
      content += `${comment}\n\n`;
    }

    content += `🔬 **Diagnóstico IA**\n`;
    content += `━━━━━━━━━━━━━━━━━━━━\n`;
    content += `${severityEmoji[diagnosis.severity] || '⚪'} **${diagnosis.diseaseName}**\n`;
    
    if (diagnosis.scientificName && diagnosis.scientificName !== 'N/A') {
      content += `_${diagnosis.scientificName}_\n`;
    }
    
    content += `\n📊 Confianza: ${(diagnosis.confidence * 100).toFixed(0)}%\n`;
    content += `\n${diagnosis.description}\n`;

    if (diagnosis.treatment.length > 0) {
      content += `\n💊 **Tratamiento recomendado:**\n`;
      for (const t of diagnosis.treatment.slice(0, 3)) {
        content += `• ${t}\n`;
      }
    }

    return content;
  }

  /**
   * Obtiene enfermedades disponibles para el mock
   */
  getAvailableDiseases(): Array<{ name: string; scientificName: string }> {
    return MOCK_DISEASES.map(d => ({
      name: d.name,
      scientificName: d.scientificName,
    }));
  }
}
