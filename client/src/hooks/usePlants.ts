import { useState, useCallback } from 'react';
import { container } from '@/config/container';
import { Plant } from '@/models/Plant';
import { PlantRecord } from '@/models/PlantRecord';
import type { IPlantCreate, PlantStatus, IPropagationAlert, IPlantDisease, IPlantRecordCreate } from '@/types';

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plantHistory, setPlantHistory] = useState<PlantRecord[]>([]);
  const [grid, setGrid] = useState<(Plant | null)[][] | null>(null);
  const [propagationAlerts, setPropagationAlerts] = useState<IPropagationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plantService = container.plantService;

  const loadPlantsByPlot = useCallback(async (plotId: string) => {
    setLoading(true);
    setError(null);
    try {
      const plotPlants = await plantService.getPlantsByPlot(plotId);
      setPlants(plotPlants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantas');
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  const loadPlotGrid = useCallback(async (plotId: string) => {
    setLoading(true);
    setError(null);
    try {
      const gridData = await plantService.getPlotGrid(plotId);
      setGrid(gridData.grid);
      setPlants(gridData.plants);
      return gridData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar grilla');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  const selectPlant = useCallback(async (plantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const plant = await plantService.getPlantById(plantId);
      setSelectedPlant(plant);
      if (plant) {
        const history = await plantService.getPlantHistory(plantId);
        setPlantHistory(history);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al seleccionar planta');
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  // Get plant by ID
  const getPlant = useCallback(async (plantId: string): Promise<Plant | null> => {
    try {
      return await plantService.getPlantById(plantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener planta');
      return null;
    }
  }, [plantService]);

  // Get plant history
  const getPlantHistory = useCallback(async (plantId: string): Promise<PlantRecord[]> => {
    try {
      return await plantService.getPlantHistory(plantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener historial');
      return [];
    }
  }, [plantService]);

  const createPlant = useCallback(async (data: IPlantCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newPlant = await plantService.createPlant(data);
      setPlants(prev => [...prev, newPlant]);
      return newPlant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear planta');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  const updatePlantStatus = useCallback(async (
    plantId: string, 
    status: PlantStatus, 
    disease?: IPlantDisease
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await plantService.updatePlantStatus(plantId, status, disease);
      if (updated) {
        setPlants(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (selectedPlant?.id === updated.id) {
          setSelectedPlant(updated);
        }
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService, selectedPlant]);

  const deletePlant = useCallback(async (plantId: string) => {
    setLoading(true);
    setError(null);
    try {
      await plantService.deletePlant(plantId);
      setPlants(prev => prev.filter(p => p.id !== plantId));
      if (selectedPlant?.id === plantId) {
        setSelectedPlant(null);
        setPlantHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar planta');
    } finally {
      setLoading(false);
    }
  }, [plantService, selectedPlant]);

  // Records
  const addNote = useCallback(async (plantId: string, userId: string, note: string, image?: string) => {
    setLoading(true);
    setError(null);
    try {
      const record = await plantService.addPlantNote(plantId, userId, note, image);
      setPlantHistory(prev => [record, ...prev]);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar nota');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  const addTreatment = useCallback(async (plantId: string, userId: string, treatment: string, image?: string) => {
    setLoading(true);
    setError(null);
    try {
      const record = await plantService.addPlantTreatment(plantId, userId, treatment, image);
      setPlantHistory(prev => [record, ...prev]);
      // Refresh plant to get updated status
      const updatedPlant = await plantService.getPlantById(plantId);
      if (updatedPlant) {
        setPlants(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
        if (selectedPlant?.id === plantId) {
          setSelectedPlant(updatedPlant);
        }
      }
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar tratamiento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService, selectedPlant]);

  const addGrowthRecord = useCallback(async (plantId: string, userId: string, note: string, image?: string) => {
    setLoading(true);
    setError(null);
    try {
      const record = await plantService.addGrowthRecord(plantId, userId, note, image);
      setPlantHistory(prev => [record, ...prev]);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar registro de crecimiento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  // Add plant record (generic)
  const addPlantRecord = useCallback(async (
    plantId: string,
    record: Omit<IPlantRecordCreate, 'plantId'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await plantService.addPlantRecord(plantId, record);
      if (newRecord) {
        setPlantHistory(prev => [newRecord, ...prev]);
      }
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar registro');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  // Propagation
  const analyzePropagation = useCallback(async (plotId: string) => {
    setLoading(true);
    setError(null);
    try {
      const alerts = await plantService.analyzePropagation(plotId);
      setPropagationAlerts(alerts);
      return alerts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar propagación');
      return [];
    } finally {
      setLoading(false);
    }
  }, [plantService]);

  // Stats
  const getPlotStats = useCallback(async (plotId: string) => {
    try {
      return await plantService.getPlotStats(plotId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      return null;
    }
  }, [plantService]);

  return {
    plants,
    selectedPlant,
    plantHistory,
    grid,
    propagationAlerts,
    loading,
    error,
    loadPlantsByPlot,
    loadPlotGrid,
    selectPlant,
    getPlant,
    getPlantHistory,
    createPlant,
    updatePlantStatus,
    deletePlant,
    addNote,
    addTreatment,
    addGrowthRecord,
    addPlantRecord,
    analyzePropagation,
    getPlotStats,
    clearSelectedPlant: () => {
      setSelectedPlant(null);
      setPlantHistory([]);
    },
  };
}
