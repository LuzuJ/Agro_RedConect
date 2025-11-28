import React, { useState, useMemo } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { Icons, Button } from '@/components/ui';
import { PostCard, CreatePost } from '../components';

interface SocialViewProps {
  onNavigateToProfile?: (userId: string) => void;
}

export const SocialView: React.FC<SocialViewProps> = ({ onNavigateToProfile }) => {
  const { posts, isLoading, error, createPost, deletePost, editPost, toggleLike } = usePosts();
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);

  // Get all unique hashtags from posts
  const allHashtags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts by hashtag
  const filteredPosts = useMemo(() => {
    if (!activeHashtag) return posts;
    return posts.filter(post => post.tags.includes(activeHashtag));
  }, [posts, activeHashtag]);

  const handleCreatePost = async (content: string, image?: string, tags?: string[]) => {
    await createPost(content, image, tags);
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleDelete = async (postId: string) => {
    if (globalThis.confirm('¿Estás seguro de eliminar esta publicación?')) {
      await deletePost(postId);
    }
  };

  const handleEdit = async (postId: string, content: string, image?: string) => {
    await editPost(postId, content, image);
  };

  const handleTagClick = (tag: string) => {
    setActiveHashtag(activeHashtag === tag ? null : tag);
  };

  const handleAuthorClick = (userId: string) => {
    if (onNavigateToProfile) {
      onNavigateToProfile(userId);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <Icons.Close className="w-12 h-12 mb-3" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create post */}
      <CreatePost onSubmit={handleCreatePost} />

      {/* Hashtag filter */}
      {allHashtags.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por hashtag</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  activeHashtag === tag
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeHashtag && (
              <button
                onClick={() => setActiveHashtag(null)}
                className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center gap-1"
              >
                <Icons.Close className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filter indicator */}
      {activeHashtag && (
        <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-4 py-2">
          <span className="text-sm text-emerald-700">
            Mostrando publicaciones con <strong>#{activeHashtag}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveHashtag(null)}
            className="text-emerald-600"
          >
            Ver todas
          </Button>
        </div>
      )}

      {/* Posts feed */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Cargando publicaciones...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icons.Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {activeHashtag 
              ? `No hay publicaciones con #${activeHashtag}`
              : '¡Tu feed está vacío!'
            }
          </h3>
          <p className="text-sm">
            {activeHashtag 
              ? 'Prueba con otro hashtag o ve todas las publicaciones'
              : 'Sé el primero en compartir algo con la comunidad'
            }
          </p>
          {activeHashtag && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setActiveHashtag(null)}
            >
              Ver todas las publicaciones
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onTagClick={handleTagClick}
              onAuthorClick={handleAuthorClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
