import { Group } from '@/models/Group';
import { Modal, Badge, Button } from '@/components/ui';
import { 
  Users, 
  X, 
  Calendar,
  Crown,
  LogOut,
  Trash2,
  UserPlus,
  Check
} from 'lucide-react';

interface GroupDetailModalProps {
  readonly group: Group | null;
  readonly isOpen: boolean;
  readonly currentUserId: string;
  readonly onClose: () => void;
  readonly onJoin: (groupId: string) => void;
  readonly onLeave: (groupId: string) => void;
  readonly onDelete: (groupId: string) => void;
}

export function GroupDetailModal({ 
  group, 
  isOpen, 
  currentUserId,
  onClose, 
  onJoin, 
  onLeave,
  onDelete 
}: GroupDetailModalProps) {
  if (!group) return null;

  const isMember = group.isMember(currentUserId);
  const isAdmin = group.isAdmin(currentUserId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAction = () => {
    if (isMember && !isAdmin) {
      onLeave(group.id);
    } else if (!isMember) {
      onJoin(group.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer.')) {
      onDelete(group.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Header con imagen */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-emerald-50">
          {group.image ? (
            <img 
              src={group.image} 
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-20 h-20 text-emerald-300" />
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
                  {group.name}
                </h2>
                {group.category && (
                  <Badge variant="primary" className="mt-2">
                    {group.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                <span className="font-medium">{group.members}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Estado de membresía */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            {isAdmin ? (
              <>
                <Crown className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Eres el administrador</p>
                  <p className="text-sm text-gray-500">Tienes control total sobre este grupo</p>
                </div>
              </>
            ) : isMember ? (
              <>
                <Check className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">Eres miembro</p>
                  <p className="text-sm text-gray-500">Puedes ver las publicaciones del grupo</p>
                </div>
              </>
            ) : (
              <>
                <UserPlus className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">No eres miembro</p>
                  <p className="text-sm text-gray-500">Únete para ver el contenido del grupo</p>
                </div>
              </>
            )}
          </div>

          {/* Descripción */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Acerca de este grupo</h3>
            <p className="text-gray-600">
              {group.description}
            </p>
          </div>

          {/* Info del grupo */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Creado el {formatDate(group.createdAt)}</span>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {isAdmin ? (
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar grupo
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              
              {!isAdmin && (
                <Button 
                  variant={isMember ? 'outline' : 'primary'}
                  onClick={handleAction}
                >
                  {isMember ? (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Abandonar
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Unirse al grupo
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
