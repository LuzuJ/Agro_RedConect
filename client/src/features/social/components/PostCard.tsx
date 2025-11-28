import React, { useState } from 'react';
import { Post } from '@/models/Post';
import { Card, CardContent, Button, Icons, Alert } from '@/components/ui';
import { useAuth } from '@/contexts';
import { usePostComments } from '@/hooks/usePosts';
import { DropdownMenu } from './DropdownMenu';
import { EditPostModal } from './EditPostModal';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onEdit?: (postId: string, content: string, image?: string) => Promise<void>;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onDelete,
  onEdit,
  onTagClick,
  onAuthorClick,
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareAlert, setShowShareAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  
  const isLiked = user ? post.isLikedBy(user.id) : false;
  const isOwner = user?.id === post.userId;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${globalThis.location.origin}/post/${post.id}`;
    const shareText = `${post.author}: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgriConnect',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowShareAlert(true);
    setTimeout(() => setShowShareAlert(false), 3000);
  };

  const handleReport = () => {
    setShowReportAlert(true);
    setTimeout(() => setShowReportAlert(false), 3000);
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(post.userId);
    }
  };

  const handleEditSave = async (postId: string, content: string, image?: string) => {
    if (onEdit) {
      await onEdit(postId, content, image);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Build dropdown menu items
  const menuItems = [];
  
  if (isOwner && onEdit) {
    menuItems.push({
      label: 'Editar publicación',
      icon: <Icons.Edit className="w-4 h-4" />,
      onClick: () => setShowEditModal(true),
    });
  }

  if (isOwner && onDelete) {
    menuItems.push({
      label: 'Eliminar publicación',
      icon: <Icons.Trash className="w-4 h-4" />,
      onClick: () => onDelete(post.id),
      danger: true,
    });
  }

  if (!isOwner) {
    menuItems.push({
      label: 'Reportar publicación',
      icon: <Icons.Flag className="w-4 h-4" />,
      onClick: handleReport,
    });
  }

  return (
    <>
      {/* Alerts */}
      {showShareAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert variant="success" onClose={() => setShowShareAlert(false)}>
            Enlace copiado al portapapeles
          </Alert>
        </div>
      )}
      {showReportAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert variant="success" onClose={() => setShowReportAlert(false)}>
            Publicación reportada. Gracias por tu ayuda.
          </Alert>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAuthorClick}
                className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold hover:ring-2 hover:ring-emerald-300 transition"
              >
                {post.author.charAt(0).toUpperCase()}
              </button>
              <div>
                <button
                  onClick={handleAuthorClick}
                  className="font-semibold text-gray-900 hover:text-emerald-600 transition text-left"
                >
                  {post.author}
                </button>
                <p className="text-xs text-gray-500">{formatDate(post.timestamp)}</p>
              </div>
            </div>
            {menuItems.length > 0 && (
              <DropdownMenu items={menuItems} />
            )}
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Image */}
          {post.image && (
            <div className="w-full">
              <img
                src={post.image}
                alt="Post"
                className="w-full object-cover max-h-96"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-1">
              {post.tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => onTagClick?.(tag)}
                  className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full hover:bg-emerald-100 transition cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-4">
            {post.likes > 0 && (
              <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
            )}
            {post.comments > 0 && (
              <span>{post.comments} {post.comments === 1 ? 'comentario' : 'comentarios'}</span>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-around">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isLiked 
                  ? 'text-red-500 hover:bg-red-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isLiked ? (
                <Icons.Heart className="w-5 h-5" />
              ) : (
                <Icons.HeartOutline className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">Me gusta</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              <Icons.Message className="w-5 h-5" />
              <span className="text-sm font-medium">Comentar</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              <Icons.Share className="w-5 h-5" />
              <span className="text-sm font-medium">Compartir</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <CommentsSection postId={post.id} />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

// Comments Section Component
const CommentsSection: React.FC<{ postId: string }> = ({ postId }) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment } = usePostComments(postId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newComment.trim() || isSubmitting}
          className="rounded-full"
        >
          {isSubmitting ? '...' : 'Enviar'}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">Sé el primero en comentar</div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold flex-shrink-0">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                  <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                  <p className="text-sm text-gray-800">{comment.content}</p>
                </div>
                <span className="text-xs text-gray-500 ml-2">{formatDate(comment.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
