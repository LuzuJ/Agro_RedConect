import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/contexts';
import { Button, Input, Select, Alert, Icons, CheckboxGroup } from '@/components/ui';
import { UserRole, CropType, UserInterest, ExperienceLevel } from '@/types';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  location: string;
  crops: CropType[];
  interests: UserInterest[];
  experienceLevel: ExperienceLevel | '';
}

// Opciones de cultivos
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
  { value: 'Aguacate', label: 'Aguacate' },
  { value: 'Cítricos', label: 'Cítricos' },
  { value: 'Hortalizas', label: 'Hortalizas' },
  { value: 'Frutas Tropicales', label: 'Frutas Tropicales' },
  { value: 'Otro', label: 'Otro' },
];

// Opciones de intereses
const interestOptions: { value: UserInterest; label: string }[] = [
  { value: 'Agricultura Orgánica', label: 'Agricultura Orgánica' },
  { value: 'Tecnología Agrícola', label: 'Tecnología Agrícola' },
  { value: 'Riego y Drenaje', label: 'Riego y Drenaje' },
  { value: 'Control de Plagas', label: 'Control de Plagas' },
  { value: 'Fertilización', label: 'Fertilización' },
  { value: 'Comercialización', label: 'Comercialización' },
  { value: 'Agricultura Sostenible', label: 'Agricultura Sostenible' },
  { value: 'Ganadería', label: 'Ganadería' },
  { value: 'Hidroponía', label: 'Hidroponía' },
  { value: 'Permacultura', label: 'Permacultura' },
  { value: 'Agroforestería', label: 'Agroforestería' },
  { value: 'Exportación', label: 'Exportación' },
];

// Opciones de nivel de experiencia
const experienceLevelOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'Principiante', label: 'Principiante' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzado', label: 'Avanzado' },
  { value: 'Experto', label: 'Experto' },
];

export const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1 = datos básicos, 2 = perfil agrícola
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Agricultor',
    location: '',
    crops: [],
    interests: [],
    experienceLevel: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'Agricultor', label: 'Agricultor' },
    { value: 'Ingeniero', label: 'Ingeniero Agrónomo' },
    { value: 'Proveedor', label: 'Proveedor' },
  ];

  const validateStep1 = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.location) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        location: formData.location,
        crops: formData.crops,
        interests: formData.interests,
        experienceLevel: formData.experienceLevel || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCropsChange = (values: string[]) => {
    setFormData({ ...formData, crops: values as CropType[] });
  };

  const handleInterestsChange = (values: string[]) => {
    setFormData({ ...formData, interests: values as UserInterest[] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="bg-emerald-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 shadow-lg flex items-center justify-center">
            <Icons.Globe className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Agri<span className="text-emerald-600">Connect</span>
          </h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6 gap-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-gray-300'}`} />
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-300'}`} />
        </div>

        {/* Register form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 1 ? 'Datos básicos' : 'Perfil agrícola'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2 (opcional)'}
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Juan Pérez"
              />

              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />

              <Select
                label="Rol"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                required
              />

              <Input
                label="Ubicación"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Ciudad, País"
              />

              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
              />

              <Input
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
              />

              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-6"
                size="lg"
              >
                Siguiente →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Nivel de experiencia"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Selecciona tu nivel' },
                  ...experienceLevelOptions,
                ]}
              />

              <CheckboxGroup
                label="¿Qué cultivos manejas?"
                options={cropOptions}
                value={formData.crops}
                onChange={handleCropsChange}
                helperText="Selecciona todos los que apliquen"
                columns={2}
              />

              <CheckboxGroup
                label="¿Cuáles son tus intereses?"
                options={interestOptions}
                value={formData.interests}
                onChange={handleInterestsChange}
                helperText="Selecciona todos los que apliquen"
                columns={2}
              />

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex-1"
                >
                  ← Atrás
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                  size="lg"
                >
                  Crear Cuenta
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
