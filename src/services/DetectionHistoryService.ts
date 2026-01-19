import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModelLabel } from '../constants/modelConfig';

export interface DetectionHistoryEntry {
  id: string;
  timestamp: number;
  disease: ModelLabel | 'Sano';
  confidence: number;
  imageUri: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  boxes: Array<{
    label: ModelLabel;
    confidence: number;
  }>;
}

const STORAGE_KEY = '@agrocacao:detection_history';
const MAX_HISTORY_SIZE = 100; // Máximo 100 detecciones en historial

class DetectionHistoryService {
  /**
   * Guarda una detección en el historial
   */
  async saveDetection(entry: Omit<DetectionHistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = `detection_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const timestamp = Date.now();

      const newEntry: DetectionHistoryEntry = {
        id,
        timestamp,
        ...entry,
      };

      console.log('💾 Guardando detección en historial:', newEntry.disease);

      // Obtener historial actual
      const history = await this.getHistory();

      // Agregar nueva entrada al inicio
      history.unshift(newEntry);

      // Limitar tamaño del historial
      const trimmedHistory = history.slice(0, MAX_HISTORY_SIZE);

      // Guardar
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));

      console.log(`✅ Detección guardada (total: ${trimmedHistory.length})`);
    } catch (error) {
      console.error('❌ Error al guardar detección:', error);
      throw error;
    }
  }

  /**
   * Obtiene todo el historial de detecciones
   */
  async getHistory(): Promise<DetectionHistoryEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      const history: DetectionHistoryEntry[] = JSON.parse(data);
      console.log(`📖 Historial cargado: ${history.length} entradas`);
      
      return history;
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      return [];
    }
  }

  /**
   * Obtiene detecciones filtradas por enfermedad
   */
  async getByDisease(disease: ModelLabel | 'Sano'): Promise<DetectionHistoryEntry[]> {
    const history = await this.getHistory();
    return history.filter(entry => entry.disease === disease);
  }

  /**
   * Obtiene detecciones de un rango de fechas
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<DetectionHistoryEntry[]> {
    const history = await this.getHistory();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return history.filter(
      entry => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Obtiene estadísticas del historial
   */
  async getStatistics(): Promise<{
    total: number;
    byDisease: Record<string, number>;
    lastWeek: number;
    lastMonth: number;
  }> {
    const history = await this.getHistory();
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const byDisease: Record<string, number> = {};
    let lastWeek = 0;
    let lastMonth = 0;

    history.forEach(entry => {
      // Contar por enfermedad
      byDisease[entry.disease] = (byDisease[entry.disease] || 0) + 1;

      // Contar por período
      if (entry.timestamp >= oneWeekAgo) {
        lastWeek++;
      }
      if (entry.timestamp >= oneMonthAgo) {
        lastMonth++;
      }
    });

    return {
      total: history.length,
      byDisease,
      lastWeek,
      lastMonth,
    };
  }

  /**
   * Elimina una detección específica
   */
  async deleteDetection(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(entry => entry.id !== id);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log(`🗑️ Detección ${id} eliminada`);
    } catch (error) {
      console.error('❌ Error al eliminar detección:', error);
      throw error;
    }
  }

  /**
   * Limpia todo el historial
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Historial limpiado');
    } catch (error) {
      console.error('❌ Error al limpiar historial:', error);
      throw error;
    }
  }

  /**
   * Exporta historial como JSON
   */
  async exportHistory(): Promise<string> {
    const history = await this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Importa historial desde JSON
   */
  async importHistory(jsonData: string): Promise<void> {
    try {
      const imported: DetectionHistoryEntry[] = JSON.parse(jsonData);
      
      // Validar estructura básica
      if (!Array.isArray(imported)) {
        throw new TypeError('Formato inválido: debe ser un array');
      }

      // Merge con historial actual (evitar duplicados por ID)
      const currentHistory = await this.getHistory();
      const currentIds = new Set(currentHistory.map(e => e.id));
      
      const newEntries = imported.filter(e => !currentIds.has(e.id));
      const merged = [...currentHistory, ...newEntries];

      // Ordenar por timestamp (más reciente primero)
      merged.sort((a, b) => b.timestamp - a.timestamp);

      // Limitar tamaño
      const trimmed = merged.slice(0, MAX_HISTORY_SIZE);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      console.log(`📥 Historial importado: ${newEntries.length} nuevas entradas`);
    } catch (error) {
      console.error('❌ Error al importar historial:', error);
      throw error;
    }
  }

  /**
   * Exporta historial completo como JSON string
   */
  async exportAsJSON(): Promise<string> {
    try {
      const history = await this.getHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('❌ Error al exportar como JSON:', error);
      throw error;
    }
  }

  /**
   * Exporta historial como CSV string
   */
  async exportAsCSV(): Promise<string> {
    try {
      const history = await this.getHistory();
      
      // Headers
      const headers = ['ID', 'Fecha', 'Enfermedad', 'Confianza', 'Detecciones', 'Latitud', 'Longitud'];
      const rows = [headers.join(',')];
      
      // Data rows
      history.forEach(entry => {
        const date = new Date(entry.timestamp).toISOString();
        const detections = entry.boxes.length;
        const lat = entry.location?.latitude || '';
        const lng = entry.location?.longitude || '';
        
        const row = [
          entry.id,
          date,
          entry.disease,
          (entry.confidence * 100).toFixed(2),
          detections,
          lat,
          lng
        ].join(',');
        
        rows.push(row);
      });
      
      return rows.join('\n');
    } catch (error) {
      console.error('❌ Error al exportar como CSV:', error);
      throw error;
    }
  }
}

export const detectionHistoryService = new DetectionHistoryService();
