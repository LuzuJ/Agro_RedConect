import { useState, useEffect, useCallback } from 'react';
import { container } from '@/config/container';
import { Disease } from '@/models/Disease';
import { DiseaseSeverity } from '@/types';

export function useDiseases() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiseases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedDiseases = await container.diseaseService.getAllDiseases();
      setDiseases(fetchedDiseases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar enfermedades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  const searchDiseases = async (query: string) => {
    try {
      setIsLoading(true);
      const results = await container.diseaseService.searchDiseases(query);
      setDiseases(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const filterByPlant = async (plant: string | null) => {
    try {
      setIsLoading(true);
      if (plant) {
        const results = await container.diseaseService.getDiseasesByPlant(plant);
        setDiseases(results);
      } else {
        await fetchDiseases();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBySeverity = async (severity: DiseaseSeverity | null) => {
    try {
      setIsLoading(true);
      if (severity) {
        const results = await container.diseaseService.getDiseasesBySeverity(severity);
        setDiseases(results);
      } else {
        await fetchDiseases();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    diseases,
    isLoading,
    error,
    searchDiseases,
    filterByPlant,
    filterBySeverity,
    refreshDiseases: fetchDiseases,
  };
}

export function useAffectedPlants() {
  const [plants, setPlants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const affectedPlants = await container.diseaseService.getAffectedPlants();
        setPlants(affectedPlants);
      } catch (err) {
        console.error('Error fetching affected plants:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlants();
  }, []);

  return { plants, isLoading };
}
