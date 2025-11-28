import { useState, useCallback } from 'react';
import { Disease } from '@/models';
import { DiseaseSeverity } from '@/types';
import { useDiseases, useAffectedPlants } from '@/hooks';
import { DiseaseCard, DiseaseDetailModal } from '../components';
import { Input, Select, Badge, LoadingSpinner } from '@/components/ui';
import { Search, BookOpen, Bug, Filter, X } from 'lucide-react';

export function WikiView() {
  const { 
    diseases, 
    isLoading, 
    error, 
    searchDiseases, 
    filterByPlant, 
    filterBySeverity 
  } = useDiseases();
  
  const { plants } = useAffectedPlants();
  
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<DiseaseSeverity | ''>('');

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedPlant('');
    setSelectedSeverity('');
    searchDiseases(term);
  }, [searchDiseases]);

  const handlePlantFilter = useCallback((plant: string) => {
    setSelectedPlant(plant);
    setSearchTerm('');
    setSelectedSeverity('');
    if (plant) {
      filterByPlant(plant);
    } else {
      searchDiseases('');
    }
  }, [filterByPlant, searchDiseases]);

  const handleSeverityFilter = useCallback((severity: DiseaseSeverity | '') => {
    setSelectedSeverity(severity);
    setSearchTerm('');
    setSelectedPlant('');
    if (severity) {
      filterBySeverity(severity);
    } else {
      searchDiseases('');
    }
  }, [filterBySeverity, searchDiseases]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedPlant('');
    setSelectedSeverity('');
    searchDiseases('');
  }, [searchDiseases]);

  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDisease(null);
  };

  const hasActiveFilters = searchTerm || selectedPlant || selectedSeverity;

  const severityOptions = [
    { value: '', label: 'Todas las severidades' },
    { value: 'Alta', label: '🔴 Alta' },
    { value: 'Media', label: '🟡 Media' },
    { value: 'Baja', label: '🟢 Baja' },
  ];

  const plantOptions = [
    { value: '', label: 'Todas las plantas' },
    ...plants.map(plant => ({ value: plant, label: plant }))
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Bug className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error al cargar las enfermedades
        </h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Wiki de Enfermedades
            </h1>
            <p className="text-gray-500">
              Encuentra información sobre plagas y enfermedades de cultivos
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Buscar y filtrar</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o síntoma..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por planta */}
          <Select
            value={selectedPlant}
            onChange={(e) => handlePlantFilter(e.target.value)}
            options={plantOptions}
          />

          {/* Filtro por severidad */}
          <Select
            value={selectedSeverity}
            onChange={(e) => handleSeverityFilter(e.target.value as DiseaseSeverity | '')}
            options={severityOptions}
          />
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {searchTerm && (
              <Badge variant="primary">
                Búsqueda: "{searchTerm}"
              </Badge>
            )}
            {selectedPlant && (
              <Badge variant="primary">
                Planta: {selectedPlant}
              </Badge>
            )}
            {selectedSeverity && (
              <Badge variant="primary">
                Severidad: {selectedSeverity}
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="ml-2 text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Grid de enfermedades */}
      {!isLoading && diseases.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
            {diseases.length} enfermedad{diseases.length === 1 ? '' : 'es'} encontrada{diseases.length === 1 ? '' : 's'}
          </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diseases.map((disease) => (
              <DiseaseCard
                key={disease.id}
                disease={disease}
                onClick={() => handleDiseaseClick(disease)}
              />
            ))}
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!isLoading && diseases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bug className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron enfermedades
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters 
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'No hay enfermedades registradas en la wiki'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Modal de detalle */}
      <DiseaseDetailModal
        disease={selectedDisease}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
