import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, Button, Badge, Icons, Modal } from '@components/ui';
import { EditProfileView } from './EditProfileView';
import { CropType, UserInterest, ExperienceLevel } from '@/types';

export function ProfileView() {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No hay usuario autenticado</p>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion(user);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header con foto de perfil */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 pt-8 pb-24 px-4">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-white text-xl font-bold">Mi Perfil</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white hover:bg-white/20"
          >
            <Icons.Logout className="w-5 h-5 mr-1" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Tarjeta de perfil principal */}
      <div className="px-4 -mt-20">
        <Card className="mb-4">
          <CardContent className="pt-6">
            {/* Avatar y nombre */}
            <div className="flex flex-col items-center -mt-16 mb-4">
              <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">{user.name}</h2>
              {user.location && (
                <p className="text-gray-500 flex items-center mt-1">
                  <Icons.MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </p>
              )}
              {user.experienceLevel && (
                <Badge variant="primary" className="mt-2">
                  {user.experienceLevel}
                </Badge>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-600 text-center mb-4 px-4">{user.bio}</p>
            )}

            {/* Barra de completitud del perfil */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Perfil completado</span>
                <span className="font-medium text-emerald-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-500 mt-1">
                  Completa tu perfil para conectar mejor con otros agricultores
                </p>
              )}
            </div>

            {/* Botón de editar */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditModalOpen(true)}
            >
              Editar perfil
            </Button>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card className="mb-4">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Estadísticas</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">0</p>
                <p className="text-sm text-gray-500">Publicaciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">0</p>
                <p className="text-sm text-gray-500">Diagnósticos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">0</p>
                <p className="text-sm text-gray-500">Grupos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cultivos */}
        <Card className="mb-4">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 flex items-center">
              🌱 Mis Cultivos
            </h3>
          </CardHeader>
          <CardContent>
            {user.crops && user.crops.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.crops.map((crop) => (
                  <Badge key={crop} variant="success">
                    {crop}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No has agregado cultivos aún.{' '}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-emerald-600 hover:underline"
                >
                  Agregar ahora
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card className="mb-4">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 flex items-center">
              ❤️ Mis Intereses
            </h3>
          </CardHeader>
          <CardContent>
            {user.interests && user.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No has agregado intereses aún.{' '}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-emerald-600 hover:underline"
                >
                  Agregar ahora
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mb-4">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Información adicional</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="mr-3">📧</span>
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center text-gray-600">
                <span className="mr-3">📱</span>
                <span>{user.phone}</span>
              </div>
            )}
            {user.farmSize && (
              <div className="flex items-center text-gray-600">
                <span className="mr-3">🏞️</span>
                <span>{user.farmSize}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center text-gray-600">
                <span className="mr-3">🔗</span>
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <span className="mr-3">📅</span>
              <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil"
        size="lg"
      >
        <EditProfileView onClose={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  );
}

// Función para calcular el porcentaje de completitud del perfil
function calculateProfileCompletion(user: {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  crops?: CropType[];
  interests?: UserInterest[];
  experienceLevel?: ExperienceLevel;
  phone?: string;
  farmSize?: string;
}): number {
  const fields = [
    { value: user.name, weight: 15 },
    { value: user.email, weight: 15 },
    { value: user.bio, weight: 15 },
    { value: user.location, weight: 10 },
    { value: user.crops && user.crops.length > 0, weight: 15 },
    { value: user.interests && user.interests.length > 0, weight: 15 },
    { value: user.experienceLevel, weight: 10 },
    { value: user.phone, weight: 2.5 },
    { value: user.farmSize, weight: 2.5 },
  ];

  const completed = fields.reduce((acc, field) => {
    return acc + (field.value ? field.weight : 0);
  }, 0);

  return Math.round(completed);
}
