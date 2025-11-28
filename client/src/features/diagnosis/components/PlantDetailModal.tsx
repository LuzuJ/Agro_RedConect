import { useState, useEffect } from 'react';
import { usePlants } from '@/hooks';
import { Plant } from '@/models/Plant';
import { PlantRecord } from '@/models/PlantRecord';
import { Icons } from '@/components/ui/Icons';

interface PlantDetailModalProps {
  readonly plantId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onStartDiagnosis: (plantId: string) => void;
}

export function PlantDetailModal({
  plantId,
  isOpen,
  onClose,
  onStartDiagnosis,
}: PlantDetailModalProps) {
  const { getPlant, getPlantHistory, updatePlantStatus } = usePlants();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [history, setHistory] = useState<PlantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'growth'>('info');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [plantData, historyData] = await Promise.all([
          getPlant(plantId),
          getPlantHistory(plantId),
        ]);
        setPlant(plantData);
        setHistory(historyData);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && plantId) {
      loadData();
    }
  }, [isOpen, plantId, getPlant, getPlantHistory]);

  const handleStatusChange = async (newStatus: string) => {
    if (!plant) return;
    await updatePlantStatus(plant.id, newStatus as Plant['status']);
    const updatedPlant = await getPlant(plantId);
    setPlant(updatedPlant);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saludable':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Observación':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Enfermo':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Recuperándose':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Muerto':
        return 'bg-gray-300 text-gray-700 border-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const getRecordIcon = (type: PlantRecord['type']) => {
    switch (type) {
      case 'diagnosis':
        return <Icons.Microscope className="w-4 h-4 text-purple-500" />;
      case 'treatment':
        return <Icons.Droplet className="w-4 h-4 text-blue-500" />;
      case 'note':
        return <Icons.Edit className="w-4 h-4 text-gray-500" />;
      case 'growth':
        return <Icons.TrendingUp className="w-4 h-4 text-green-500" />;
      case 'harvest':
        return <Icons.Check className="w-4 h-4 text-orange-500" />;
      default:
        return <Icons.Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecordLabel = (type: PlantRecord['type']) => {
    switch (type) {
      case 'diagnosis':
        return 'Diagnóstico';
      case 'treatment':
        return 'Tratamiento';
      case 'note':
        return 'Nota';
      case 'growth':
        return 'Crecimiento';
      case 'harvest':
        return 'Cosecha';
      default:
        return type;
    }
  };

  const getTabLabel = (tab: 'info' | 'history' | 'growth') => {
    if (tab === 'info') return 'Información';
    if (tab === 'history') return 'Historial';
    return 'Crecimiento';
  };

  const getPlantAge = (plantedDate: string) => {
    const planted = new Date(plantedDate);
    const now = new Date();
    const diffMs = now.getTime() - planted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} años`;
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  );

  const renderNotFound = () => (
    <div className="p-8 text-center text-gray-500">
      Planta no encontrada
    </div>
  );

  const renderInfoTab = () => {
    if (!plant) return null;
    return (
      <div className="space-y-4">
        {/* Status */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Estado actual
          </span>
          <div className="flex flex-wrap gap-2">
            {['Saludable', 'Observación', 'Enfermo', 'Recuperándose'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 text-sm rounded-full border-2 transition-colors ${
                  plant.status === status
                    ? getStatusColor(status)
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Current Disease */}
        {plant.currentDisease && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icons.AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">Enfermedad Detectada</h4>
            </div>
            <p className="text-red-700">{plant.currentDisease.name}</p>
          </div>
        )}

        {/* Plant Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Plantada</div>
            <div className="text-sm font-medium">{formatDate(plant.plantedDate)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Edad</div>
            <div className="text-sm font-medium">{getPlantAge(plant.plantedDate)}</div>
          </div>
          {plant.lastDiagnosisDate && (
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <div className="text-xs text-gray-500 mb-1">Último diagnóstico</div>
              <div className="text-sm font-medium">{formatDate(plant.lastDiagnosisDate)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => (
    <div className="space-y-3">
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icons.Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay registros aún</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
          {history.map((record) => (
            <div key={record.id} className="relative pl-10 pb-4 last:pb-0">
              <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-white border-2 border-emerald-500" />
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {getRecordIcon(record.type)}
                  <span className="text-sm font-medium text-gray-900">
                    {getRecordLabel(record.type)}
                  </span>
                </div>
                {record.note && (
                  <p className="text-sm text-gray-600 mb-2">{record.note}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(record.date)}</span>
                  {record.diagnosis && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded">
                      {record.diagnosis.diseaseName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGrowthTab = () => (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-500">
        <Icons.TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="mb-2">Gráfica de crecimiento</p>
        <p className="text-xs">Próximamente...</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Registrar mediciones</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="growth-height" className="block text-xs text-gray-500 mb-1">
              Altura (cm)
            </label>
            <input
              id="growth-height"
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label htmlFor="growth-leaves" className="block text-xs text-gray-500 mb-1">
              Hojas
            </label>
            <input
              id="growth-leaves"
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label htmlFor="growth-fruits" className="block text-xs text-gray-500 mb-1">
              Frutos
            </label>
            <input
              id="growth-fruits"
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <button className="mt-3 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors">
          Guardar mediciones
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'info') return renderInfoTab();
    if (activeTab === 'history') return renderHistoryTab();
    return renderGrowthTab();
  };

  const renderPlantContent = () => {
    if (!plant) return null;
    return (
      <>
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['info', 'history', 'growth'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => onStartDiagnosis(plantId)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Icons.Camera className="w-5 h-5" />
            Iniciar Diagnóstico con IA
          </button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (loading) return renderLoading();
    if (!plant) return renderNotFound();
    return renderPlantContent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {plant && (
              <>
                <span className="text-3xl">{plant.statusEmoji}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{plant.name}</h2>
                  <p className="text-sm text-gray-500">
                    {plant.variety && `${plant.variety} · `}
                    Fila {(plant.position?.row ?? 0) + 1}, Col {(plant.position?.column ?? 0) + 1}
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
