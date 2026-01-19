import { ModelLabel } from '../constants/modelConfig';

export interface Treatment {
  id: string;
  type: 'immediate' | 'biological' | 'chemical';
  title: string;
  description: string;
  ingredients?: string[];
  dosage?: string;
  frequency?: string;
  duration?: string;
  application?: string;
  precautions?: string[];
  effectiveness?: 'high' | 'medium' | 'low';
  cost?: 'low' | 'medium' | 'high';
  steps?: string[]; // NUEVO: Pasos para el checklist interactivo
}

export interface DiseaseInfo {
  disease: ModelLabel;
  scientificName: string;
  description: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  severity: 'high' | 'medium' | 'low';
  treatments: Treatment[];
}

/**
 * Base de datos de tratamientos por enfermedad
 */
export const DISEASE_TREATMENTS: Record<ModelLabel, DiseaseInfo> = {
  Monilia: {
    disease: 'Monilia',
    scientificName: 'Moniliophthora roreri',
    description: 'Enfermedad fúngica que ataca las mazorcas del cacao, causando pudrición interna y pérdidas significativas de producción.',
    symptoms: [
      'Manchas irregulares amarillo-verdosas en mazorcas jóvenes',
      'Abultamientos y deformaciones en la superficie',
      'Pudrición blanda en el interior de la mazorca',
      'Esporulación blanquecina que se torna crema',
      'Olor desagradable característico',
    ],
    causes: [
      'Alta humedad relativa (>85%)',
      'Temperaturas entre 20-30°C',
      'Falta de poda y ventilación',
      'Presencia de mazorcas enfermas sin remover',
      'Lluvias frecuentes',
    ],
    prevention: [
      'Remover semanalmente mazorcas enfermas',
      'Podar para mejorar ventilación',
      'Aplicar fungicidas preventivos en época lluviosa',
      'Fertilización balanceada para fortalecer plantas',
      'No dejar residuos de cosecha en el suelo',
    ],
    severity: 'high',
    treatments: [
      {
        id: 'monilia_immediate_1',
        type: 'immediate',
        title: 'Remoción de mazorcas infectadas',
        description: 'Eliminación inmediata y quema de mazorcas con síntomas visibles',
        application: 'Cortar mazorcas enfermas con tijeras desinfectadas. Enterrar o quemar lejos de la plantación (mínimo 50m).',
        frequency: 'Semanal durante época de cosecha',
        precautions: [
          'Desinfectar herramientas con alcohol 70% entre cada corte',
          'No tocar mazorcas sanas después de manipular enfermas',
          'Usar guantes desechables',
          'Lavarse las manos con jabón después',
        ],
        effectiveness: 'high',
        cost: 'low',
        steps: [
          'Preparar alcohol 70% para desinfectar tijeras',
          'Ponerse guantes desechables',
          'Identificar todas las mazorcas con manchas',
          'Cortar cada mazorca enferma con tijeras limpias',
          'Desinfectar tijeras después de cada corte',
          'Llevar mazorcas a zona de entierro (50m+)',
          'Cavar hoyo de 50cm de profundidad',
          'Depositar mazorcas y cubrir con tierra + cal',
          'Quitarse guantes y lavarlos',
          'Lavarse manos con agua y jabón',
        ],
      },
      {
        id: 'monilia_immediate_2',
        type: 'immediate',
        title: 'Poda sanitaria',
        description: 'Eliminar ramas bajas y chupones para mejorar ventilación',
        application: 'Podar ramas que toquen el suelo o estén muy densas. Dejar 30-40cm entre ramas.',
        frequency: 'Cada 2-3 meses',
        precautions: [
          'Realizar en época seca',
          'Desinfectar machetes y serruchos',
          'Aplicar pasta cúprica en cortes grandes',
        ],
        effectiveness: 'high',
        cost: 'low',
        steps: [
          'Verificar que sea época seca',
          'Preparar machete o serrucho limpio',
          'Desinfectar herramientas con alcohol',
          'Identificar ramas que tocan el suelo',
          'Cortar ramas bajas dejando 30cm del suelo',
          'Eliminar chupones del tronco',
          'Remover ramas entrecruzadas',
          'Aplicar pasta cúprica en cortes >3cm',
          'Recoger y quemar restos de poda',
        ],
      },
      {
        id: 'monilia_biological_1',
        type: 'biological',
        title: 'Trichoderma harzianum',
        description: 'Hongo antagonista que controla Monilia de forma natural',
        ingredients: ['Trichoderma harzianum (2x10⁸ esporas/ml)'],
        dosage: '3-5 gramos por litro de agua',
        application: 'Aspersión foliar cubriendo toda la mazorca. Aplicar en horas tempranas (6-9am).',
        frequency: 'Cada 15 días en época lluviosa',
        duration: '3-4 meses durante temporada crítica',
        precautions: [
          'No mezclar con fungicidas químicos',
          'Almacenar en refrigeración (4-8°C)',
          'Usar agua limpia sin cloro',
          'Aplicar en días nublados o tarde',
        ],
        effectiveness: 'medium',
        cost: 'medium',
      },
      {
        id: 'monilia_biological_2',
        type: 'biological',
        title: 'Extracto de cola de caballo',
        description: 'Fungicida natural con propiedades preventivas',
        ingredients: [
          'Cola de caballo (Equisetum arvense) - 500g',
          'Agua - 5 litros',
          'Jabón neutro - 10ml',
        ],
        dosage: 'Diluir 1:3 (1 litro de extracto en 3 litros de agua)',
        application: 'Hervir cola de caballo 30 min, dejar reposar 24h, colar y diluir. Aspersión foliar completa.',
        frequency: 'Semanal como preventivo',
        duration: 'Durante época lluviosa',
        precautions: [
          'Usar inmediatamente después de preparar',
          'No aplicar en floración',
          'Probar en pocas plantas primero',
        ],
        effectiveness: 'low',
        cost: 'low',
      },
      {
        id: 'monilia_chemical_1',
        type: 'chemical',
        title: 'Azoxystrobin + Difenoconazole',
        description: 'Fungicida sistémico de amplio espectro',
        ingredients: ['Azoxystrobin 200g/L', 'Difenoconazole 125g/L'],
        dosage: '0.5ml por litro de agua (500ml/ha)',
        application: 'Aspersión dirigida a mazorcas y follaje. Cobertura total. Presión: 40-60 PSI.',
        frequency: 'Cada 21 días (máximo 4 aplicaciones/año)',
        duration: 'Época de alta incidencia (lluvias)',
        precautions: [
          '⚠️ USAR EQUIPO DE PROTECCIÓN COMPLETO',
          'Carencia: 30 días antes de cosecha',
          'No aplicar con viento o lluvia próxima',
          'Mantener fuera del alcance de niños',
          'No contaminar fuentes de agua',
          'Alternar con otros fungicidas (evitar resistencia)',
        ],
        effectiveness: 'high',
        cost: 'high',
      },
      {
        id: 'monilia_chemical_2',
        type: 'chemical',
        title: 'Hidróxido de Cobre',
        description: 'Fungicida de contacto preventivo',
        ingredients: ['Hidróxido de cobre 77% WP'],
        dosage: '3-4 gramos por litro de agua',
        application: 'Aspersión foliar preventiva. Cubrir ambas caras de hojas y mazorcas.',
        frequency: 'Cada 10-15 días en época lluviosa',
        duration: 'Todo el año como preventivo',
        precautions: [
          'Usar mascarilla y guantes',
          'Carencia: 7 días antes de cosecha',
          'Puede causar fitotoxicidad en exceso',
          'No mezclar con aceites',
        ],
        effectiveness: 'medium',
        cost: 'low',
      },
    ],
  },

  Fitoftora: {
    disease: 'Fitoftora',
    scientificName: 'Phytophthora palmivora',
    description: 'Oomiceto que causa pudrición de mazorcas, raíces y chancros en tallo. Altamente destructiva en condiciones húmedas.',
    symptoms: [
      'Manchas acuosas de color café oscuro en mazorcas',
      'Crecimiento blanco algodonoso en superficie',
      'Pudrición negra que avanza rápidamente',
      'Lesiones en tallo (chancros)',
      'Marchitamiento de hojas',
    ],
    causes: [
      'Exceso de humedad y mal drenaje',
      'Salpicaduras de agua de lluvia',
      'Temperaturas de 25-30°C',
      'Suelos compactados',
      'Heridas en plantas',
    ],
    prevention: [
      'Mejorar drenaje del suelo',
      'Aplicar mulch para evitar salpicaduras',
      'Remover mazorcas enfermas inmediatamente',
      'Evitar heridas en tronco y ramas',
      'Aplicar fosfitos preventivos',
    ],
    severity: 'high',
    treatments: [
      {
        id: 'fitoftora_immediate_1',
        type: 'immediate',
        title: 'Drenaje y aireación del suelo',
        description: 'Mejorar circulación de agua para reducir humedad',
        application: 'Cavar canales de drenaje (30cm profundidad) en áreas encharcadas. Aplicar materia orgánica.',
        frequency: 'Una vez al inicio de época lluviosa',
        precautions: [
          'No dañar raíces superficiales',
          'Dirigir agua lejos de plantas',
        ],
        effectiveness: 'high',
        cost: 'low',
      },
      {
        id: 'fitoftora_immediate_2',
        type: 'immediate',
        title: 'Remoción de partes infectadas',
        description: 'Cortar y destruir tejido enfermo',
        application: 'Cortar 10cm por debajo de la lesión. Aplicar pasta fungicida en herida.',
        frequency: 'Inmediato al detectar síntomas',
        precautions: [
          'Desinfectar herramientas entre cortes',
          'Quemar o enterrar material infectado',
        ],
        effectiveness: 'high',
        cost: 'low',
      },
      {
        id: 'fitoftora_biological_1',
        type: 'biological',
        title: 'Bacillus subtilis',
        description: 'Bacteria antagonista con acción fungicida',
        ingredients: ['Bacillus subtilis (1x10⁹ UFC/g)'],
        dosage: '2-3 gramos por litro de agua',
        application: 'Aspersión al follaje y drench al suelo. Aplicar al amanecer.',
        frequency: 'Cada 10 días',
        duration: '2-3 meses',
        precautions: [
          'No usar con antibióticos',
          'Mantener refrigerado',
          'pH del agua: 6-7',
        ],
        effectiveness: 'medium',
        cost: 'medium',
      },
      {
        id: 'fitoftora_biological_2',
        type: 'biological',
        title: 'Fosfito de Potasio',
        description: 'Inductor de resistencia sistémica',
        ingredients: ['Fosfito de potasio 40%'],
        dosage: '2-3 ml por litro de agua',
        application: 'Aspersión foliar y aplicación al suelo (drench).',
        frequency: 'Cada 15 días',
        duration: 'Época lluviosa completa',
        precautions: [
          'No es un fertilizante',
          'Aplicar preventivamente',
          'Compatible con la mayoría de productos',
        ],
        effectiveness: 'high',
        cost: 'medium',
      },
      {
        id: 'fitoftora_chemical_1',
        type: 'chemical',
        title: 'Metalaxil + Mancozeb',
        description: 'Fungicida sistémico y de contacto',
        ingredients: ['Metalaxil 8%', 'Mancozeb 64%'],
        dosage: '2.5 gramos por litro de agua',
        application: 'Aspersión total. Énfasis en tronco y mazorcas bajas.',
        frequency: 'Cada 14 días (máximo 6 aplicaciones/año)',
        duration: 'Época de alta presión de enfermedad',
        precautions: [
          '⚠️ EQUIPO DE PROTECCIÓN OBLIGATORIO',
          'Carencia: 21 días',
          'Rotar con otros fungicidas',
          'No aplicar en floración',
        ],
        effectiveness: 'high',
        cost: 'high',
      },
      {
        id: 'fitoftora_chemical_2',
        type: 'chemical',
        title: 'Oxicloruro de Cobre',
        description: 'Fungicida de contacto preventivo',
        ingredients: ['Oxicloruro de cobre 58.8%'],
        dosage: '3 gramos por litro de agua',
        application: 'Aspersión preventiva a follaje y frutos.',
        frequency: 'Cada 7-10 días en época crítica',
        duration: 'Durante temporada de lluvias',
        precautions: [
          'Usar equipo de protección',
          'Carencia: 14 días',
          'Evitar sobredosis (fitotoxicidad)',
        ],
        effectiveness: 'medium',
        cost: 'low',
      },
    ],
  },

  Sano: {
    disease: 'Sano',
    scientificName: 'Estado saludable',
    description: 'Planta sin signos de enfermedad. Mantener prácticas preventivas para conservar la salud.',
    symptoms: [],
    causes: [],
    prevention: [
      'Mantener programa de poda regular',
      'Aplicar fertilización balanceada',
      'Monitorear semanalmente',
      'Mantener registros de aplicaciones',
      'Capacitación continua',
    ],
    severity: 'low',
    treatments: [
      {
        id: 'sano_maintenance_1',
        type: 'immediate',
        title: 'Mantenimiento preventivo',
        description: 'Prácticas culturales para mantener plantas sanas',
        application: 'Poda regular, fertilización, monitoreo semanal, remoción de malezas.',
        frequency: 'Continuo',
        precautions: [
          'No descuidar la observación',
          'Mantener limpieza del área',
        ],
        effectiveness: 'high',
        cost: 'low',
      },
      {
        id: 'sano_biological_1',
        type: 'biological',
        title: 'Aplicaciones preventivas de biocontroladores',
        description: 'Mantener población de microorganismos benéficos',
        ingredients: ['Trichoderma sp.', 'Bacillus subtilis'],
        dosage: '2 gramos por litro de agua',
        application: 'Aspersión foliar y al suelo mensualmente.',
        frequency: 'Mensual',
        duration: 'Todo el año',
        precautions: [
          'Rotar productos',
          'Aplicar en horas frescas',
        ],
        effectiveness: 'medium',
        cost: 'low',
      },
    ],
  },
};

/**
 * Obtiene información de tratamientos para una enfermedad específica
 */
export function getTreatmentsForDisease(disease: ModelLabel | 'Sano'): DiseaseInfo {
  return DISEASE_TREATMENTS[disease as ModelLabel] || DISEASE_TREATMENTS.Sano;
}

/**
 * Filtra tratamientos por tipo
 */
export function filterTreatmentsByType(
  disease: ModelLabel | 'Sano',
  type: 'immediate' | 'biological' | 'chemical'
): Treatment[] {
  const diseaseInfo = getTreatmentsForDisease(disease);
  return diseaseInfo.treatments.filter(t => t.type === type);
}

/**
 * Busca tratamientos por texto
 */
export function searchTreatments(disease: ModelLabel | 'Sano', query: string): Treatment[] {
  const diseaseInfo = getTreatmentsForDisease(disease);
  const lowerQuery = query.toLowerCase();
  
  return diseaseInfo.treatments.filter(
    t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.ingredients?.some(i => i.toLowerCase().includes(lowerQuery))
  );
}
