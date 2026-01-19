import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TreatmentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface TreatmentProgress {
  diseaseId: string;
  treatmentId: string;
  steps: TreatmentStep[];
  startedAt: string;
  completedAt?: string;
  userId?: string;
}

const STORAGE_KEY = '@treatment_progress';

class TreatmentProgressService {
  /**
   * Obtiene el progreso de un tratamiento específico
   */
  async getProgress(diseaseId: string, treatmentId: string): Promise<TreatmentProgress | null> {
    try {
      const key = `${STORAGE_KEY}_${diseaseId}_${treatmentId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      return null;
    }
  }

  /**
   * Guarda el progreso de un tratamiento
   */
  async saveProgress(progress: TreatmentProgress): Promise<void> {
    try {
      const key = `${STORAGE_KEY}_${progress.diseaseId}_${progress.treatmentId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
      console.log('✅ Progreso guardado:', progress);
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      throw error;
    }
  }

  /**
   * Marca un paso como completado
   */
  async completeStep(
    diseaseId: string, 
    treatmentId: string, 
    stepId: string
  ): Promise<TreatmentProgress | null> {
    try {
      let progress = await this.getProgress(diseaseId, treatmentId);
      
      if (!progress) {
        console.warn('No se encontró progreso, no se puede marcar paso');
        return null;
      }

      // Actualizar paso
      progress.steps = progress.steps.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, completedAt: new Date().toISOString() }
          : step
      );

      // Si todos los pasos están completos, marcar tratamiento completo
      const allCompleted = progress.steps.every(s => s.completed);
      if (allCompleted && !progress.completedAt) {
        progress.completedAt = new Date().toISOString();
      }

      await this.saveProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error al completar paso:', error);
      return null;
    }
  }

  /**
   * Desmarca un paso
   */
  async uncompleteStep(
    diseaseId: string, 
    treatmentId: string, 
    stepId: string
  ): Promise<TreatmentProgress | null> {
    try {
      let progress = await this.getProgress(diseaseId, treatmentId);
      
      if (!progress) {
        return null;
      }

      // Actualizar paso
      progress.steps = progress.steps.map(step => 
        step.id === stepId 
          ? { ...step, completed: false, completedAt: undefined }
          : step
      );

      // Quitar marca de completado del tratamiento
      progress.completedAt = undefined;

      await this.saveProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error al desmarcar paso:', error);
      return null;
    }
  }

  /**
   * Inicializa un nuevo progreso de tratamiento
   */
  async initializeProgress(
    diseaseId: string,
    treatmentId: string,
    steps: Omit<TreatmentStep, 'completed' | 'completedAt'>[]
  ): Promise<TreatmentProgress> {
    const progress: TreatmentProgress = {
      diseaseId,
      treatmentId,
      steps: steps.map(s => ({ ...s, completed: false })),
      startedAt: new Date().toISOString(),
    };

    await this.saveProgress(progress);
    return progress;
  }

  /**
   * Obtiene todos los progresos guardados (para estadísticas)
   */
  async getAllProgress(): Promise<TreatmentProgress[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(k => k.startsWith(STORAGE_KEY));
      
      const progressData = await AsyncStorage.multiGet(progressKeys);
      
      return progressData
        .map(([_, value]) => value ? JSON.parse(value) : null)
        .filter((p): p is TreatmentProgress => p !== null);
    } catch (error) {
      console.error('Error al obtener todos los progresos:', error);
      return [];
    }
  }

  /**
   * Limpia todos los progresos (para testing)
   */
  async clearAllProgress(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(k => k.startsWith(STORAGE_KEY));
      await AsyncStorage.multiRemove(progressKeys);
      console.log('🧹 Todos los progresos limpiados');
    } catch (error) {
      console.error('Error al limpiar progresos:', error);
    }
  }
}

export default new TreatmentProgressService();
