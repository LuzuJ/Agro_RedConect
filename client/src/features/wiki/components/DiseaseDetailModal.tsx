import { Disease } from '@/models';
import { DiseaseSeverity } from '@/types';
import { Modal, Badge, Button } from '@/components/ui';
import { 
  Bug, 
  AlertTriangle, 
  Pill, 
  Shield, 
  Leaf, 
  X,
  BookOpen
} from 'lucide-react';

interface DiseaseDetailModalProps {
  disease: Disease | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DiseaseDetailModal({ disease, isOpen, onClose }: DiseaseDetailModalProps) {
  if (!disease) return null;

  const getSeverityVariant = (severity: DiseaseSeverity): 'success' | 'warning' | 'danger' => {
    switch (severity) {
      case 'Baja':
        return 'success';
      case 'Media':
        return 'warning';
      case 'Alta':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getSeverityIcon = (severity: DiseaseSeverity) => {
    switch (severity) {
      case 'Alta':
        return <AlertTriangle className="w-5 h-5" />;
      case 'Media':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bug className="w-5 h-5" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Header con imagen */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-emerald-50">
          {disease.image ? (
            <img 
              src={disease.image} 
              alt={disease.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bug className="w-20 h-20 text-emerald-300" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Título sobre la imagen */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {disease.name}
                </h2>
                {disease.scientificName && (
                  <p className="text-white/80 italic text-sm mt-1">
                    {disease.scientificName}
                  </p>
                )}
              </div>
              <Badge variant={getSeverityVariant(disease.severity)} className="flex items-center gap-1">
                {getSeverityIcon(disease.severity)}
                Severidad {disease.severity}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Plantas afectadas */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Plantas Afectadas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {disease.plants.map((plant, index) => (
                <span 
                  key={`plant-${plant}-${index}`}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {plant}
                </span>
              ))}
            </div>
          </section>

          {/* Síntomas */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Síntomas</h3>
            </div>
            <ul className="space-y-2">
              {disease.symptoms.map((symptom, index) => (
                <li 
                  key={`symptom-${index}`}
                  className="flex items-start gap-2 text-gray-600"
                >
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  {symptom}
                </li>
              ))}
            </ul>
          </section>

          {/* Tratamiento */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Tratamiento</h3>
            </div>
            <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">
              {disease.treatment}
            </p>
          </section>

          {/* Medidas preventivas */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Medidas Preventivas</h3>
            </div>
            <ul className="space-y-2">
              {disease.preventativeMeasures.map((measure, index) => (
                <li 
                  key={`measure-${index}`}
                  className="flex items-start gap-2 text-gray-600"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  {measure}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>Wiki de Enfermedades</span>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
