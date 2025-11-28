import { useState, useEffect, useCallback } from 'react';
import { usePlants } from '@/hooks';
import { Plant } from '@/models/Plant';
import { Icons } from '@/components/ui/Icons';

interface PlotGridProps {
  readonly plotId: string;
  readonly onPlantClick: (plantId: string) => void;
  readonly onStartDiagnosis: (plantId: string) => void;
}

export function PlotGrid({ plotId, onPlantClick, onStartDiagnosis }: PlotGridProps) {
  const {
    grid,
    plants,
    propagationAlerts,
    loading,
    loadPlotGrid,
    analyzePropagation,
    getPlotStats,
  } = usePlants();

  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    diseased: { name: string; count: number }[];
  } | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadPlotGrid(plotId);
    analyzePropagation(plotId);
  }, [plotId, loadPlotGrid, analyzePropagation]);

  useEffect(() => {
    const loadStats = async () => {
      const plotStats = await getPlotStats(plotId);
      setStats(plotStats);
    };
    loadStats();
  }, [plotId, plants, getPlotStats]);

  const getPlantColor = useCallback((plant: Plant | null): string => {
    if (!plant) return 'bg-gray-100 border-gray-200';
    
    switch (plant.status) {
      case 'Saludable':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'Observación':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'Enfermo':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'Recuperándose':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'Muerto':
        return 'bg-gray-300 border-gray-400';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  }, []);

  const getPlantEmoji = (plant: Plant | null): string => {
    if (!plant) return '➕';
    return plant.statusEmoji;
  };

  const getRiskLevelStyle = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-200 text-red-800';
      case 'high':
        return 'bg-orange-200 text-orange-800';
      default:
        return 'bg-yellow-200 text-yellow-800';
    }
  };

  const getRiskLevelLabel = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
        return 'Crítico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      default:
        return 'Bajo';
    }
  };

  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case 'Saludable':
        return 'bg-green-100 text-green-700';
      case 'Observación':
        return 'bg-yellow-100 text-yellow-700';
      case 'Enfermo':
        return 'bg-red-100 text-red-700';
      case 'Recuperándose':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!grid) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se pudo cargar la grilla
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            
            <div className="h-4 w-px bg-gray-200" />
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">{stats.byStatus['Saludable'] || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">{stats.byStatus['Observación'] || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">{stats.byStatus['Enfermo'] || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">{stats.byStatus['Recuperándose'] || 0}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icons.Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icons.Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Diseases detected */}
          {stats.diseased.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Enfermedades detectadas:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {stats.diseased.map((d) => (
                  <span
                    key={d.name}
                    className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                  >
                    {d.name} ({d.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Propagation Alerts */}
      {propagationAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icons.AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-800">Alertas de Propagación</h4>
          </div>
          <div className="space-y-2">
            {propagationAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm text-orange-700">
                <span className="font-medium">{alert.diseaseName}</span>
                {' - '}
                <span className={`px-1 py-0.5 rounded text-xs ${getRiskLevelStyle(alert.riskLevel)}`}>
                  {getRiskLevelLabel(alert.riskLevel)}
                </span>
                {' - '}
                {alert.plantsAtRisk} plantas en riesgo
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
          <div 
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${grid[0]?.length || 1}, minmax(48px, 1fr))`,
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((plant, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => plant && onPlantClick(plant.id)}
                  className={`
                    aspect-square rounded-lg border-2 flex items-center justify-center
                    text-lg transition-all
                    ${getPlantColor(plant)}
                    ${plant ? 'cursor-pointer' : 'cursor-default opacity-50'}
                  `}
                  title={plant ? `${plant.name} - ${plant.status}` : 'Vacío'}
                  disabled={!plant}
                >
                  {getPlantEmoji(plant)}
                </button>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-medium">Leyenda:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-300" aria-hidden="true" />
              <span>Saludable</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" aria-hidden="true" />
              <span>Observación</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-100 border border-red-300" aria-hidden="true" />
              <span>Enfermo</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-100 border border-blue-300" aria-hidden="true" />
              <span>Recuperándose</span>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {plants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onPlantClick(plant.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{plant.statusEmoji}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{plant.name}</h4>
                  <p className="text-sm text-gray-500">
                    {plant.variety && `${plant.variety} · `}
                    Fila {(plant.position?.row ?? 0) + 1}, Col {(plant.position?.column ?? 0) + 1}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {plant.currentDisease && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    {plant.currentDisease.name}
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(plant.status)}`}>
                  {plant.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartDiagnosis(plant.id);
                  }}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Iniciar diagnóstico"
                >
                  <Icons.Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
