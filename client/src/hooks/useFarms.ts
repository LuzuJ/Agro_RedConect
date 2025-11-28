import { useState, useCallback } from 'react';
import { container } from '@/config/container';
import { Farm } from '@/models/Farm';
import { Plot } from '@/models/Plot';
import type { IFarmCreate, IPlotCreate } from '@/types';

export function useFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const farmService = container.farmService;

  const loadUserFarms = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userFarms = await farmService.getUserFarms(userId);
      setFarms(userFarms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar fincas');
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const selectFarm = useCallback(async (farmId: string) => {
    setLoading(true);
    setError(null);
    try {
      const farm = await farmService.getFarmById(farmId);
      setSelectedFarm(farm);
      if (farm) {
        const farmPlots = await farmService.getPlotsByFarm(farmId);
        setPlots(farmPlots);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al seleccionar finca');
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const createFarm = useCallback(async (data: IFarmCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newFarm = await farmService.createFarm(data);
      setFarms(prev => [...prev, newFarm]);
      return newFarm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear finca');
      return null;
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const updateFarm = useCallback(async (farm: Farm) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await farmService.updateFarm(farm);
      setFarms(prev => prev.map(f => f.id === updated.id ? updated : f));
      if (selectedFarm?.id === updated.id) {
        setSelectedFarm(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar finca');
      return null;
    } finally {
      setLoading(false);
    }
  }, [farmService, selectedFarm]);

  const deleteFarm = useCallback(async (farmId: string) => {
    setLoading(true);
    setError(null);
    try {
      await farmService.deleteFarm(farmId);
      setFarms(prev => prev.filter(f => f.id !== farmId));
      if (selectedFarm?.id === farmId) {
        setSelectedFarm(null);
        setPlots([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar finca');
    } finally {
      setLoading(false);
    }
  }, [farmService, selectedFarm]);

  // Plot operations
  const createPlot = useCallback(async (data: IPlotCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newPlot = await farmService.createPlot(data);
      setPlots(prev => [...prev, newPlot]);
      return newPlot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear parcela');
      return null;
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const updatePlot = useCallback(async (plot: Plot) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await farmService.updatePlot(plot);
      setPlots(prev => prev.map(p => p.id === updated.id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar parcela');
      return null;
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const deletePlot = useCallback(async (plotId: string) => {
    setLoading(true);
    setError(null);
    try {
      await farmService.deletePlot(plotId);
      setPlots(prev => prev.filter(p => p.id !== plotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar parcela');
    } finally {
      setLoading(false);
    }
  }, [farmService]);

  const getFarmStats = useCallback(async (farmId: string) => {
    try {
      return await farmService.getFarmStats(farmId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      return null;
    }
  }, [farmService]);

  return {
    farms,
    selectedFarm,
    plots,
    loading,
    error,
    loadUserFarms,
    selectFarm,
    createFarm,
    updateFarm,
    deleteFarm,
    createPlot,
    updatePlot,
    deletePlot,
    getFarmStats,
  };
}
