import { useState, useCallback } from 'react';
import { container } from '@/config/container';
import { PlantRecord } from '@/models/PlantRecord';
import type { IDiagnosisResult } from '@/types';

export function useDiagnosis() {
  const [diagnosisResult, setDiagnosisResult] = useState<IDiagnosisResult | null>(null);
  const [lastRecord, setLastRecord] = useState<PlantRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    total: number;
    healthy: number;
    infected: number;
    byDisease: Record<string, number>;
  } | null>(null);

  const diagnosisService = container.diagnosisService;

  const diagnose = useCallback(async (
    image: string,
    plantId: string,
    userId: string,
    additionalContext?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setDiagnosisResult(null);
    
    try {
      const result = await diagnosisService.diagnose(image, plantId, userId, additionalContext);
      setDiagnosisResult(result.diagnosis);
      setLastRecord(result.record);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar diagnóstico');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [diagnosisService]);

  const getPlantHistory = useCallback(async (plantId: string) => {
    try {
      return await diagnosisService.getPlantHistory(plantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener historial');
      return [];
    }
  }, [diagnosisService]);

  const loadUserStats = useCallback(async (userId: string) => {
    try {
      const stats = await diagnosisService.getUserDiagnosisStats(userId);
      setUserStats(stats);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      return null;
    }
  }, [diagnosisService]);

  const shareAsPost = useCallback(async (
    recordId: string,
    userId: string,
    comment: string,
    author: string,
    authorAvatar: string
  ) => {
    try {
      const result = await diagnosisService.shareDiagnosisAsPost(recordId, userId, comment, author, authorAvatar);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al compartir diagnóstico');
      return { success: false };
    }
  }, [diagnosisService]);

  const getAvailableDiseases = useCallback(() => {
    return diagnosisService.getAvailableDiseases();
  }, [diagnosisService]);

  const clearDiagnosis = useCallback(() => {
    setDiagnosisResult(null);
    setLastRecord(null);
    setError(null);
  }, []);

  return {
    diagnosisResult,
    lastRecord,
    isAnalyzing,
    error,
    userStats,
    diagnose,
    getPlantHistory,
    loadUserStats,
    shareAsPost,
    getAvailableDiseases,
    clearDiagnosis,
  };
}
