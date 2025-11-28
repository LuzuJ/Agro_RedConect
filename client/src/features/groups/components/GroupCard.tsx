import { Group } from '@/models/Group';
import { Card, Badge, Button } from '@/components/ui';
import { Users, Check, UserPlus } from 'lucide-react';

interface GroupCardProps {
  readonly group: Group;
  readonly currentUserId: string;
  readonly onJoin: (groupId: string) => void;
  readonly onLeave: (groupId: string) => void;
  readonly onClick: (group: Group) => void;
}

export function GroupCard({ group, currentUserId, onJoin, onLeave, onClick }: GroupCardProps) {
  const isMember = group.isMember(currentUserId);
  const isAdmin = group.isAdmin(currentUserId);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMember) {
      onLeave(group.id);
    } else {
      onJoin(group.id);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={() => onClick(group)}
    >
      {/* Imagen del grupo */}
      <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-emerald-50">
        {group.image ? (
          <img 
            src={group.image} 
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-emerald-300" />
          </div>
        )}
        
        {/* Badge de categoría */}
        {group.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="primary" size="sm">
              {group.category}
            </Badge>
          </div>
        )}
        
        {/* Badge de admin */}
        {isAdmin && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" size="sm">
              Admin
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
          {group.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {group.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            <span>{group.members} miembro{group.members === 1 ? '' : 's'}</span>
          </div>

          {!isAdmin && (
            <Button
              variant={isMember ? 'outline' : 'primary'}
              size="sm"
              onClick={handleJoinClick}
            >
              {isMember ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Unido
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Unirse
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
