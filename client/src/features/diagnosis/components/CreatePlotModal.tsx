import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';
import type { CropType } from '@/types';

interface CreatePlotModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    name: string;
    cropType: CropType;
    rows: number;
    columns: number;
    area?: string;
  }) => Promise<void>;
}

const CROP_TYPES: CropType[] = [
  'Café', 'Cacao', 'Maíz', 'Arroz', 'Papa', 'Tomate', 'Frijol', 
  'Yuca', 'Plátano', 'Banano', 'Caña de Azúcar', 'Aguacate', 
  'Cítricos', 'Hortalizas', 'Frutas Tropicales', 'Flores', 'Otro'
];

export function CreatePlotModal({ isOpen, onClose, onSubmit }: CreatePlotModalProps) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState<CropType>('Café');
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        cropType,
        rows,
        columns,
        area: area.trim() || undefined,
      });
      setName('');
      setCropType('Café');
      setRows(5);
      setColumns(5);
      setArea('');
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
          <h2 className="text-lg font-semibold text-gray-900">Nueva Parcela</h2>
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
            <label htmlFor="plot-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la parcela *
            </label>
            <input
              id="plot-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lote Norte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="plot-crop" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cultivo *
            </label>
            <select
              id="plot-crop"
              value={cropType}
              onChange={(e) => setCropType(e.target.value as CropType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CROP_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-rows" className="block text-sm font-medium text-gray-700 mb-1">
                Filas *
              </label>
              <input
                id="plot-rows"
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Number.parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label htmlFor="plot-columns" className="block text-sm font-medium text-gray-700 mb-1">
                Columnas *
              </label>
              <input
                id="plot-columns"
                type="number"
                value={columns}
                onChange={(e) => setColumns(Math.max(1, Number.parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-sm text-gray-600">
              Capacidad: <strong>{rows * columns}</strong> plantas
            </span>
          </div>

          <div>
            <label htmlFor="plot-area" className="block text-sm font-medium text-gray-700 mb-1">
              Área (opcional)
            </label>
            <input
              id="plot-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ej: 2 hectáreas"
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
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Parcela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
