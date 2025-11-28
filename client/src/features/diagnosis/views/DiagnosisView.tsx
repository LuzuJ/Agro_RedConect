import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFarms } from '@/hooks';
import { Farm } from '@/models/Farm';
import { Plot } from '@/models/Plot';
import type { CropType } from '@/types';
import { FarmCard } from '../components/FarmCard';
import { PlotGrid } from '../components/PlotGrid';
import { CreateFarmModal } from '../components/CreateFarmModal';
import { CreatePlotModal } from '../components/CreatePlotModal';
import { PlantDetailModal } from '../components/PlantDetailModal';
import { DiagnosisModal } from '../components/DiagnosisModal';
import { PropagationAlerts } from '../components/PropagationAlerts';
import { Icons } from '@/components/ui/Icons';

interface CreateFarmData {
  name: string;
  location: string;
  totalArea?: string;
  image?: string;
}

interface CreatePlotData {
  name: string;
  cropType: CropType;
  rows: number;
  columns: number;
  area?: string;
}

export function DiagnosisView() {
  const { user } = useAuth();
  const {
    farms,
    selectedFarm,
    plots,
    loading,
    error,
    loadUserFarms,
    selectFarm,
    createFarm,
    deleteFarm,
    createPlot,
    deletePlot,
    getFarmStats,
  } = useFarms();

  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [showCreatePlot, setShowCreatePlot] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisPlantId, setDiagnosisPlantId] = useState<string | null>(null);
  const [farmStats, setFarmStats] = useState<Record<string, {
    totalPlots: number;
    totalPlants: number;
    healthyPlants: number;
    sickPlants: number;
  }>>({});

  useEffect(() => {
    if (user) {
      loadUserFarms(user.id);
    }
  }, [user, loadUserFarms]);

  useEffect(() => {
    const loadStats = async () => {
      const stats: typeof farmStats = {};
      for (const farm of farms) {
        const farmStat = await getFarmStats(farm.id);
        if (farmStat) {
          stats[farm.id] = farmStat;
        }
      }
      setFarmStats(stats);
    };
    if (farms.length > 0) {
      loadStats();
    }
  }, [farms, getFarmStats]);

  const handleSelectFarm = async (farm: Farm) => {
    await selectFarm(farm.id);
    setSelectedPlot(null);
  };

  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlot(plot);
  };

  const handlePlantClick = (plantId: string) => {
    setSelectedPlantId(plantId);
  };

  const handleStartDiagnosis = (plantId: string) => {
    setDiagnosisPlantId(plantId);
    setShowDiagnosisModal(true);
    setSelectedPlantId(null);
  };

  const handleBackToFarms = () => {
    setSelectedPlot(null);
  };

  const handleBackToPlots = () => {
    setSelectedPlot(null);
  };

  // Render functions to avoid nested ternaries
  const renderHeaderButton = () => {
    if (selectedPlot) return null;
    if (!selectedFarm) {
      return (
        <button
          onClick={() => setShowCreateFarm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Icons.Plus className="w-5 h-5" />
          Nueva Finca
        </button>
      );
    }
    return (
      <button
        onClick={() => setShowCreatePlot(true)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Icons.Plus className="w-5 h-5" />
        Nueva Parcela
      </button>
    );
  };

  const renderFarmsView = () => (
    <div className="space-y-4">
      {farms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icons.Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes fincas registradas
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primera finca para gestionar tus cultivos
          </p>
          <button
            onClick={() => setShowCreateFarm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Icons.Plus className="w-5 h-5" />
            Crear Finca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              stats={farmStats[farm.id]}
              onClick={() => handleSelectFarm(farm)}
              onDelete={() => deleteFarm(farm.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderPlotsView = () => (
    <div className="space-y-4">
      <PropagationAlerts plots={plots} />

      {plots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icons.Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay parcelas en esta finca
          </h3>
          <p className="text-gray-500 mb-4">
            Crea parcelas para organizar tus cultivos
          </p>
          <button
            onClick={() => setShowCreatePlot(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Icons.Plus className="w-5 h-5" />
            Crear Parcela
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plots.map((plot) => (
            <div
              key={plot.id}
              onClick={() => handleSelectPlot(plot)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{plot.name}</h3>
                  <p className="text-sm text-gray-500">{plot.cropType}</p>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  {plot.rows} × {plot.columns}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icons.Grid className="w-4 h-4" />
                <span>{plot.totalPlants} plantas</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlot(plot.id);
                }}
                className="mt-3 text-xs text-red-500 hover:text-red-700"
              >
                Eliminar parcela
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlantGridView = () => {
    if (!selectedPlot) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleBackToPlots}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedPlot.name}</h2>
            <p className="text-sm text-gray-500">{selectedPlot.cropType}</p>
          </div>
        </div>

        <PlotGrid
          plotId={selectedPlot.id}
          onPlantClick={handlePlantClick}
          onStartDiagnosis={handleStartDiagnosis}
        />
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      );
    }
    if (!selectedFarm) {
      return renderFarmsView();
    }
    if (!selectedPlot) {
      return renderPlotsView();
    }
    return renderPlantGridView();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Inicia sesión para ver tus fincas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedFarm && (
            <button
              onClick={handleBackToFarms}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedFarm ? selectedFarm.name : '🌱 Mis Fincas'}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedFarm
                ? `${plots.length} parcelas · ${selectedFarm.location}`
                : 'Gestiona tus cultivos y realiza diagnósticos con IA'}
            </p>
          </div>
        </div>
        
        {renderHeaderButton()}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {renderMainContent()}

      {/* Modals */}
      <CreateFarmModal
        isOpen={showCreateFarm}
        onClose={() => setShowCreateFarm(false)}
        onSubmit={async (data: CreateFarmData) => {
          if (user) {
            await createFarm({ ...data, userId: user.id });
            setShowCreateFarm(false);
          }
        }}
      />

      <CreatePlotModal
        isOpen={showCreatePlot}
        onClose={() => setShowCreatePlot(false)}
        onSubmit={async (data: CreatePlotData) => {
          if (user && selectedFarm) {
            await createPlot({ ...data, farmId: selectedFarm.id, userId: user.id });
            setShowCreatePlot(false);
          }
        }}
      />

      {selectedPlantId && (
        <PlantDetailModal
          plantId={selectedPlantId}
          isOpen={!!selectedPlantId}
          onClose={() => setSelectedPlantId(null)}
          onStartDiagnosis={handleStartDiagnosis}
        />
      )}

      {diagnosisPlantId && (
        <DiagnosisModal
          plantId={diagnosisPlantId}
          isOpen={showDiagnosisModal}
          onClose={() => {
            setShowDiagnosisModal(false);
            setDiagnosisPlantId(null);
          }}
        />
      )}
    </div>
  );
}
