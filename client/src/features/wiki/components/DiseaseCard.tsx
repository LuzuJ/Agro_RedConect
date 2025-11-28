import { Disease } from '@/models';
import { DiseaseSeverity } from '@/types';
import { Card, Badge } from '@/components/ui';
import { Bug, Leaf } from 'lucide-react';

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

export function DiseaseCard({ disease, onClick }: DiseaseCardProps) {
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

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      {/* Imagen de la enfermedad */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-emerald-50">
        {disease.image ? (
          <img 
            src={disease.image} 
            alt={disease.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bug className="w-16 h-16 text-emerald-300" />
          </div>
        )}
        
        {/* Badge de severidad */}
        <div className="absolute top-2 right-2">
          <Badge variant={getSeverityVariant(disease.severity)}>
            {disease.severity}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
          {disease.name}
        </h3>
        
        {disease.scientificName && (
          <p className="text-sm text-gray-500 italic mb-3 line-clamp-1">
            {disease.scientificName}
          </p>
        )}

        {/* Síntomas principales */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {disease.symptoms.slice(0, 2).join('. ')}
        </p>

        {/* Plantas afectadas */}
        <div className="flex items-center gap-2 flex-wrap">
          <Leaf className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {disease.plants.slice(0, 3).map((plant, index) => (
              <span 
                key={index}
                className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
              >
                {plant}
              </span>
            ))}
            {disease.plants.length > 3 && (
              <span className="text-xs text-gray-400">
                +{disease.plants.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
