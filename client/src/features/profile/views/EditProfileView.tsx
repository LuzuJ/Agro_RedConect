import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, TextArea, Select, CheckboxGroup, Alert } from '@components/ui';
import { CropType, UserInterest, ExperienceLevel } from '@/types';

interface EditProfileViewProps {
  readonly onClose: () => void;
}

// Opciones de cultivos (en español, coinciden con los tipos)
const cropOptions: { value: CropType; label: string }[] = [
  { value: 'Café', label: 'Café' },
  { value: 'Cacao', label: 'Cacao' },
  { value: 'Maíz', label: 'Maíz' },
  { value: 'Arroz', label: 'Arroz' },
  { value: 'Papa', label: 'Papa' },
  { value: 'Tomate', label: 'Tomate' },
  { value: 'Frijol', label: 'Frijol' },
  { value: 'Yuca', label: 'Yuca' },
  { value: 'Plátano', label: 'Plátano' },
  { value: 'Banano', label: 'Banano' },
  { value: 'Caña de Azúcar', label: 'Caña de Azúcar' },
  { value: 'Aguacate', label: 'Aguacate' },
  { value: 'Cítricos', label: 'Cítricos' },
  { value: 'Hortalizas', label: 'Hortalizas' },
  { value: 'Frutas Tropicales', label: 'Frutas Tropicales' },
  { value: 'Flores', label: 'Flores' },
  { value: 'Otro', label: 'Otro' },
];

// Opciones de intereses (en español, coinciden con los tipos)
const interestOptions: { value: UserInterest; label: string }[] = [
  { value: 'Agricultura Orgánica', label: 'Agricultura Orgánica' },
  { value: 'Agricultura Sostenible', label: 'Agricultura Sostenible' },
  { value: 'Control de Plagas', label: 'Control de Plagas' },
  { value: 'Fertilización', label: 'Fertilización' },
  { value: 'Riego y Drenaje', label: 'Riego y Drenaje' },
  { value: 'Comercialización', label: 'Comercialización' },
  { value: 'Tecnología Agrícola', label: 'Tecnología Agrícola' },
  { value: 'Ganadería', label: 'Ganadería' },
  { value: 'Apicultura', label: 'Apicultura' },
  { value: 'Hidroponía', label: 'Hidroponía' },
  { value: 'Permacultura', label: 'Permacultura' },
  { value: 'Agroforestería', label: 'Agroforestería' },
  { value: 'Certificaciones', label: 'Certificaciones' },
  { value: 'Exportación', label: 'Exportación' },
];

// Opciones de nivel de experiencia
const experienceLevelOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'Principiante', label: 'Principiante - Recién comenzando' },
  { value: 'Intermedio', label: 'Intermedio - Algunos años de experiencia' },
  { value: 'Avanzado', label: 'Avanzado - Muchos años de experiencia' },
  { value: 'Experto', label: 'Experto - Profesional del sector' },
];

export function EditProfileView({ onClose }: EditProfileViewProps) {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    farmSize: user?.farmSize || '',
    website: user?.website || '',
    experienceLevel: user?.experienceLevel || '',
    crops: user?.crops || [],
    interests: user?.interests || [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        farmSize: formData.farmSize.trim() || undefined,
        website: formData.website.trim() || undefined,
        experienceLevel: formData.experienceLevel as ExperienceLevel || undefined,
        crops: formData.crops as CropType[],
        interests: formData.interests as UserInterest[],
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          ¡Perfil actualizado correctamente!
        </Alert>
      )}

      {/* Información básica */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          👤 Información básica
        </h4>
        
        <Input
          label="Nombre completo"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Tu nombre"
          required
        />
        
        <TextArea
          label="Biografía"
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Cuéntanos sobre ti y tu experiencia en la agricultura..."
          helperText="Máximo 500 caracteres"
          rows={3}
        />
        
        <Input
          label="Ubicación"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Ciudad, Región o País"
        />
      </div>

      {/* Experiencia y cultivos */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          🌱 Experiencia agrícola
        </h4>
        
        <Select
          label="Nivel de experiencia"
          value={formData.experienceLevel}
          onChange={(e) => handleChange('experienceLevel', e.target.value)}
          options={[
            { value: '', label: 'Selecciona tu nivel' },
            ...experienceLevelOptions,
          ]}
        />
        
        <Input
          label="Tamaño de la finca/parcela"
          value={formData.farmSize}
          onChange={(e) => handleChange('farmSize', e.target.value)}
          placeholder="Ej: 50 hectáreas, 2 acres, etc."
        />
        
        <CheckboxGroup
          label="¿Qué cultivos produces?"
          options={cropOptions}
          selectedValues={formData.crops}
          onChange={(values) => handleChange('crops', values)}
          columns={2}
          helperText="Selecciona todos los que apliquen"
        />
      </div>

      {/* Intereses */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          ❤️ Intereses
        </h4>
        
        <CheckboxGroup
          label="¿Qué temas te interesan?"
          options={interestOptions}
          selectedValues={formData.interests}
          onChange={(values) => handleChange('interests', values)}
          columns={2}
          helperText="Selecciona todos los que apliquen"
        />
      </div>

      {/* Contacto */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          📧 Información de contacto
        </h4>
        
        <Input
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 234 567 890"
        />
        
        <Input
          label="Sitio web"
          type="url"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://tu-sitio-web.com"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
        >
          ✓ Guardar cambios
        </Button>
      </div>
    </form>
  );
}
