import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const GAMIFICATION_KEY = '@gamification_data';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'scans' | 'treatments' | 'discoveries' | 'streak' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface GamificationData {
  level: number;
  totalXP: number;
  achievements: Achievement[];
  stats: {
    totalScans: number;
    totalTreatments: number;
    diseasesFound: number;
    healthyFound: number;
    moniliaFound: number;
    fitoftoraFound: number;
    currentStreak: number;
    longestStreak: number;
    lastScanDate?: string;
  };
}

// Definición de todos los logros
const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Escaneos
  {
    id: 'first_scan',
    title: 'Primera Detección',
    description: 'Realiza tu primer escaneo',
    emoji: '🌱',
    category: 'scans',
    requirement: 1,
  },
  {
    id: 'scan_10',
    title: 'Explorador',
    description: 'Realiza 10 escaneos',
    emoji: '🔍',
    category: 'scans',
    requirement: 10,
  },
  {
    id: 'scan_50',
    title: 'Vigilante del Cacao',
    description: 'Realiza 50 escaneos',
    emoji: '👁️',
    category: 'scans',
    requirement: 50,
  },
  {
    id: 'scan_100',
    title: 'Guardián Experto',
    description: 'Realiza 100 escaneos',
    emoji: '🛡️',
    category: 'scans',
    requirement: 100,
  },
  {
    id: 'scan_500',
    title: 'Maestro del Diagnóstico',
    description: 'Realiza 500 escaneos',
    emoji: '👑',
    category: 'scans',
    requirement: 500,
  },

  // Tratamientos
  {
    id: 'first_treatment',
    title: 'Primer Tratamiento',
    description: 'Completa tu primer tratamiento',
    emoji: '💊',
    category: 'treatments',
    requirement: 1,
  },
  {
    id: 'treatment_5',
    title: 'Sanador',
    description: 'Completa 5 tratamientos',
    emoji: '⚕️',
    category: 'treatments',
    requirement: 5,
  },
  {
    id: 'treatment_20',
    title: 'Doctor del Cacao',
    description: 'Completa 20 tratamientos',
    emoji: '🩺',
    category: 'treatments',
    requirement: 20,
  },
  {
    id: 'treatment_50',
    title: 'Especialista Certificado',
    description: 'Completa 50 tratamientos',
    emoji: '🏆',
    category: 'treatments',
    requirement: 50,
  },

  // Descubrimientos
  {
    id: 'first_monilia',
    title: 'Detector de Monilia',
    description: 'Detecta tu primera Monilia',
    emoji: '🔴',
    category: 'discoveries',
    requirement: 1,
  },
  {
    id: 'first_fitoftora',
    title: 'Detector de Fitóftora',
    description: 'Detecta tu primera Fitóftora',
    emoji: '💧',
    category: 'discoveries',
    requirement: 1,
  },
  {
    id: 'healthy_10',
    title: 'Cultivo Saludable',
    description: 'Encuentra 10 mazorcas sanas',
    emoji: '✅',
    category: 'discoveries',
    requirement: 10,
  },
  {
    id: 'healthy_50',
    title: 'Plantación Próspera',
    description: 'Encuentra 50 mazorcas sanas',
    emoji: '🌟',
    category: 'discoveries',
    requirement: 50,
  },

  // Rachas
  {
    id: 'streak_3',
    title: 'Constante',
    description: 'Escanea 3 días seguidos',
    emoji: '🔥',
    category: 'streak',
    requirement: 3,
  },
  {
    id: 'streak_7',
    title: 'Comprometido',
    description: 'Escanea 7 días seguidos',
    emoji: '💪',
    category: 'streak',
    requirement: 7,
  },
  {
    id: 'streak_30',
    title: 'Disciplinado',
    description: 'Escanea 30 días seguidos',
    emoji: '⚡',
    category: 'streak',
    requirement: 30,
  },

  // Especiales
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Escanea antes de las 7 AM',
    emoji: '🌅',
    category: 'special',
    requirement: 1,
  },
  {
    id: 'night_owl',
    title: 'Búho Nocturno',
    description: 'Escanea después de las 8 PM',
    emoji: '🦉',
    category: 'special',
    requirement: 1,
  },
];

// Calcular nivel basado en XP
function calculateLevel(xp: number): number {
  // Fórmula: nivel = floor(sqrt(xp / 100))
  // Nivel 1 = 0 XP
  // Nivel 2 = 100 XP
  // Nivel 3 = 400 XP
  // Nivel 4 = 900 XP
  // Nivel 5 = 1600 XP
  // etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Calcular XP requerido para siguiente nivel
export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return (nextLevel - 1) * (nextLevel - 1) * 100;
}

// Calcular XP del nivel actual
export function getXPForCurrentLevel(currentLevel: number): number {
  if (currentLevel <= 1) return 0;
  return (currentLevel - 1) * (currentLevel - 1) * 100;
}

class GamificationService {
  private data: GamificationData | null = null;

  async initialize(): Promise<GamificationData> {
    try {
      const stored = await AsyncStorage.getItem(GAMIFICATION_KEY);
      
      if (stored) {
        this.data = JSON.parse(stored);
        // Asegurar que todos los logros estén presentes
        this.data = this.ensureAllAchievements(this.data!);
      } else {
        // Inicializar datos
        this.data = {
          level: 1,
          totalXP: 0,
          achievements: ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
          stats: {
            totalScans: 0,
            totalTreatments: 0,
            diseasesFound: 0,
            healthyFound: 0,
            moniliaFound: 0,
            fitoftoraFound: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
        };
        await this.save();
      }

      return this.data;
    } catch (error) {
      console.error('Error inicializando gamificación:', error);
      throw error;
    }
  }

  private ensureAllAchievements(data: GamificationData): GamificationData {
    const existingIds = new Set(data.achievements.map(a => a.id));
    const newAchievements = ALL_ACHIEVEMENTS.filter(a => !existingIds.has(a.id)).map(a => ({
      ...a,
      unlocked: false,
    }));
    
    return {
      ...data,
      achievements: [...data.achievements, ...newAchievements],
    };
  }

  async getData(): Promise<GamificationData> {
    if (!this.data) {
      await this.initialize();
    }
    return this.data!;
  }

  private async save(): Promise<void> {
    if (this.data) {
      await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(this.data));
    }
  }

  private addXP(amount: number): number {
    if (!this.data) return 0;
    
    const oldLevel = this.data.level;
    this.data.totalXP += amount;
    this.data.level = calculateLevel(this.data.totalXP);
    
    return this.data.level - oldLevel; // Retorna niveles ganados
  }

  private async checkAndUnlockAchievements(): Promise<Achievement[]> {
    if (!this.data) return [];

    const newlyUnlocked: Achievement[] = [];
    const now = new Date();

    this.data.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        // Escaneos
        case 'first_scan':
          shouldUnlock = this.data!.stats.totalScans >= 1;
          break;
        case 'scan_10':
          shouldUnlock = this.data!.stats.totalScans >= 10;
          break;
        case 'scan_50':
          shouldUnlock = this.data!.stats.totalScans >= 50;
          break;
        case 'scan_100':
          shouldUnlock = this.data!.stats.totalScans >= 100;
          break;
        case 'scan_500':
          shouldUnlock = this.data!.stats.totalScans >= 500;
          break;

        // Tratamientos
        case 'first_treatment':
          shouldUnlock = this.data!.stats.totalTreatments >= 1;
          break;
        case 'treatment_5':
          shouldUnlock = this.data!.stats.totalTreatments >= 5;
          break;
        case 'treatment_20':
          shouldUnlock = this.data!.stats.totalTreatments >= 20;
          break;
        case 'treatment_50':
          shouldUnlock = this.data!.stats.totalTreatments >= 50;
          break;

        // Descubrimientos
        case 'first_monilia':
          shouldUnlock = this.data!.stats.moniliaFound >= 1;
          break;
        case 'first_fitoftora':
          shouldUnlock = this.data!.stats.fitoftoraFound >= 1;
          break;
        case 'healthy_10':
          shouldUnlock = this.data!.stats.healthyFound >= 10;
          break;
        case 'healthy_50':
          shouldUnlock = this.data!.stats.healthyFound >= 50;
          break;

        // Rachas
        case 'streak_3':
          shouldUnlock = this.data!.stats.currentStreak >= 3;
          break;
        case 'streak_7':
          shouldUnlock = this.data!.stats.currentStreak >= 7;
          break;
        case 'streak_30':
          shouldUnlock = this.data!.stats.currentStreak >= 30;
          break;

        // Especiales (se manejan en recordScan)
        default:
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = now;
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  async recordScan(detections: { label: string }[]): Promise<{ newAchievements: Achievement[]; levelsGained: number }> {
    await this.getData();
    if (!this.data) throw new Error('No se pudo cargar datos de gamificación');

    // Actualizar estadísticas
    this.data.stats.totalScans++;

    detections.forEach(detection => {
      if (detection.label === 'Sano') {
        this.data!.stats.healthyFound++;
      } else if (detection.label === 'Monilia') {
        this.data!.stats.moniliaFound++;
        this.data!.stats.diseasesFound++;
      } else if (detection.label === 'Fitoftora') {
        this.data!.stats.fitoftoraFound++;
        this.data!.stats.diseasesFound++;
      }
    });

    // Actualizar racha
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (this.data.stats.lastScanDate) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (this.data.stats.lastScanDate === today) {
        // Mismo día, no actualizar racha
      } else if (this.data.stats.lastScanDate === yesterdayStr) {
        // Día consecutivo
        this.data.stats.currentStreak++;
        if (this.data.stats.currentStreak > this.data.stats.longestStreak) {
          this.data.stats.longestStreak = this.data.stats.currentStreak;
        }
      } else {
        // Racha rota
        this.data.stats.currentStreak = 1;
      }
    } else {
      // Primera vez
      this.data.stats.currentStreak = 1;
      this.data.stats.longestStreak = 1;
    }
    
    this.data.stats.lastScanDate = today;

    // Logros especiales basados en hora
    const hour = now.getHours();
    if (hour < 7) {
      const earlyBird = this.data.achievements.find(a => a.id === 'early_bird');
      if (earlyBird && !earlyBird.unlocked) {
        earlyBird.unlocked = true;
        earlyBird.unlockedAt = now;
      }
    }
    if (hour >= 20) {
      const nightOwl = this.data.achievements.find(a => a.id === 'night_owl');
      if (nightOwl && !nightOwl.unlocked) {
        nightOwl.unlocked = true;
        nightOwl.unlockedAt = now;
      }
    }

    // Ganar XP
    const levelsGained = this.addXP(10); // 10 XP por escaneo

    // Verificar logros
    const newAchievements = await this.checkAndUnlockAchievements();

    // Bonus XP por logros desbloqueados
    if (newAchievements.length > 0) {
      this.addXP(newAchievements.length * 50); // 50 XP por logro
    }

    await this.save();

    return { newAchievements, levelsGained };
  }

  async recordTreatmentComplete(): Promise<{ newAchievements: Achievement[]; levelsGained: number }> {
    await this.getData();
    if (!this.data) throw new Error('No se pudo cargar datos de gamificación');

    this.data.stats.totalTreatments++;

    // Ganar XP
    const levelsGained = this.addXP(25); // 25 XP por tratamiento completado

    // Verificar logros
    const newAchievements = await this.checkAndUnlockAchievements();

    // Bonus XP por logros
    if (newAchievements.length > 0) {
      this.addXP(newAchievements.length * 50);
    }

    await this.save();

    return { newAchievements, levelsGained };
  }

  async getUnlockedAchievements(): Promise<Achievement[]> {
    await this.getData();
    return this.data?.achievements.filter(a => a.unlocked) || [];
  }

  async getLockedAchievements(): Promise<Achievement[]> {
    await this.getData();
    return this.data?.achievements.filter(a => !a.unlocked) || [];
  }

  async reset(): Promise<void> {
    await AsyncStorage.removeItem(GAMIFICATION_KEY);
    this.data = null;
  }
}

export const gamificationService = new GamificationService();

// Función helper para mostrar notificación de logro
export function showAchievementNotification(achievement: Achievement) {
  Alert.alert(
    `${achievement.emoji} ¡Logro Desbloqueado!`,
    `${achievement.title}\n${achievement.description}`,
    [{ text: 'Genial! 🎉', style: 'default' }],
    { cancelable: true }
  );
}
