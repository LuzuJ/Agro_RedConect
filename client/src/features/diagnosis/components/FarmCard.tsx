import { Farm } from '@/models/Farm';
import { Icons } from '@/components/ui/Icons';

interface FarmCardProps {
  readonly farm: Farm;
  readonly stats?: {
    totalPlots: number;
    totalPlants: number;
    healthyPlants: number;
    sickPlants: number;
  };
  readonly onClick: () => void;
  readonly onDelete: () => void;
}

export function FarmCard({ farm, stats, onClick, onDelete }: FarmCardProps) {
  const healthPercentage = stats && stats.totalPlants > 0
    ? Math.round((stats.healthyPlants / stats.totalPlants) * 100)
    : 100;

  const getHealthColor = () => {
    if (healthPercentage >= 80) return 'text-green-600 bg-green-100';
    if (healthPercentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-emerald-50">
        {farm.image ? (
          <img
            src={farm.image}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icons.Home className="w-16 h-16 text-emerald-300" />
          </div>
        )}
        
        {/* Health Badge */}
        {stats && stats.totalPlants > 0 && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor()}`}>
            {healthPercentage}% sano
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
          {farm.name}
        </h3>
        
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <Icons.MapPin className="w-4 h-4" />
          <span>{farm.location}</span>
        </div>

        {farm.totalArea && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Icons.Grid className="w-4 h-4" />
            <span>{farm.totalArea}</span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.totalPlots}</div>
              <div className="text-xs text-gray-500">Parcelas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.totalPlants}</div>
              <div className="text-xs text-gray-500">Plantas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.healthyPlants}</div>
              <div className="text-xs text-gray-500">Sanas</div>
            </div>
            {stats.sickPlants > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{stats.sickPlants}</div>
                <div className="text-xs text-gray-500">Enfermas</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
