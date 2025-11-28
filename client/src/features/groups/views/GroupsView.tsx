import { useState, useCallback } from 'react';
import { Group } from '@/models/Group';
import { useGroups, useGroupCategories } from '@/hooks';
import { useAuth } from '@/contexts';
import { GroupCard, CreateGroupModal, GroupDetailModal } from '../components';
import { Input, Select, Button, LoadingSpinner } from '@/components/ui';
import { Search, Users, Plus, Filter, X } from 'lucide-react';

export function GroupsView() {
  const { user } = useAuth();
  const { 
    groups, 
    isLoading, 
    error, 
    searchGroups, 
    filterByCategory,
    createGroup,
    joinGroup, 
    leaveGroup,
    deleteGroup,
    refreshGroups
  } = useGroups();
  
  const { categories } = useGroupCategories();
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMyGroups, setShowMyGroups] = useState(false);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedCategory('');
    setShowMyGroups(false);
    searchGroups(term);
  }, [searchGroups]);

  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setShowMyGroups(false);
    filterByCategory(category);
  }, [filterByCategory]);

  const handleMyGroupsFilter = useCallback(() => {
    setShowMyGroups(!showMyGroups);
    setSearchTerm('');
    setSelectedCategory('');
    // Filtrar grupos del usuario localmente
    refreshGroups();
  }, [showMyGroups, refreshGroups]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowMyGroups(false);
    refreshGroups();
  }, [refreshGroups]);

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedGroup(null);
  };

  const handleCreateGroup = async (data: { name: string; description: string; image: string }) => {
    const result = await createGroup(data);
    if (result) {
      setIsCreateOpen(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    const success = await joinGroup(groupId);
    if (success && selectedGroup?.id === groupId) {
      // Actualizar el grupo seleccionado
      const updatedGroup = groups.find(g => g.id === groupId);
      if (updatedGroup) setSelectedGroup(updatedGroup);
    }
  };

  const handleLeave = async (groupId: string) => {
    const success = await leaveGroup(groupId);
    if (success && selectedGroup?.id === groupId) {
      const updatedGroup = groups.find(g => g.id === groupId);
      if (updatedGroup) setSelectedGroup(updatedGroup);
    }
  };

  const handleDelete = async (groupId: string) => {
    await deleteGroup(groupId);
    handleCloseDetail();
  };

  const hasActiveFilters = searchTerm || selectedCategory || showMyGroups;

  // Filtrar grupos si showMyGroups está activo
  const displayedGroups = showMyGroups && user
    ? groups.filter(g => g.isMember(user.id))
    : groups;

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Users className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error al cargar los grupos
        </h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Comunidades
              </h1>
              <p className="text-gray-500">
                Únete a grupos de agricultores con intereses similares
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear grupo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Buscar y filtrar</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>

          {/* Filtro mis grupos */}
          <Button
            variant={showMyGroups ? 'primary' : 'outline'}
            onClick={handleMyGroupsFilter}
          >
            Mis grupos
          </Button>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                Búsqueda: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                Categoría: {selectedCategory}
              </span>
            )}
            {showMyGroups && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                Mis grupos
              </span>
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

      {/* Grid de grupos */}
      {!isLoading && displayedGroups.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {displayedGroups.length} grupo{displayedGroups.length === 1 ? '' : 's'} encontrado{displayedGroups.length === 1 ? '' : 's'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={user?.id || ''}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onClick={handleGroupClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!isLoading && displayedGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron grupos
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters 
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'Sé el primero en crear un grupo'
            }
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Limpiar filtros
            </button>
          ) : (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear grupo
            </Button>
          )}
        </div>
      )}

      {/* Modal de detalle */}
      <GroupDetailModal
        group={selectedGroup}
        isOpen={isDetailOpen}
        currentUserId={user?.id || ''}
        onClose={handleCloseDetail}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onDelete={handleDelete}
      />

      {/* Modal de creación */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}
