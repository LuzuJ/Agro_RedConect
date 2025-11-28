import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';

interface CreateFarmModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    name: string;
    location: string;
    totalArea?: string;
    image?: string;
  }) => Promise<void>;
}

export function CreateFarmModal({ isOpen, onClose, onSubmit }: CreateFarmModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        location: location.trim(),
        totalArea: totalArea.trim() || undefined,
      });
      setName('');
      setLocation('');
      setTotalArea('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva Finca</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="farm-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la finca *
            </label>
            <input
              id="farm-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Finca La Esperanza"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="farm-location" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <input
              id="farm-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Valle del Cauca, Colombia"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="farm-area" className="block text-sm font-medium text-gray-700 mb-1">
              Área total (opcional)
            </label>
            <input
              id="farm-area"
              type="text"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              placeholder="Ej: 25 hectáreas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !location.trim()}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Finca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
