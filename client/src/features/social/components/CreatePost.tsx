import React, { useState, useRef } from 'react';
import { Card, CardContent, Button, Icons } from '@/components/ui';
import { useAuth } from '@/contexts';

interface CreatePostProps {
  onSubmit: (content: string, image?: string, tags?: string[]) => Promise<void>;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Extraer hashtags del contenido
      const tags = content.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || [];
      
      await onSubmit(content.trim(), image || undefined, tags);
      setContent('');
      setImage(null);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Header con avatar */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              {!isExpanded ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="w-full text-left bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 hover:bg-gray-200 transition"
                >
                  ¿Qué quieres compartir hoy, {user?.name.split(' ')[0]}?
                </button>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`¿Qué quieres compartir hoy, ${user?.name.split(' ')[0]}?`}
                  className="w-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-500 min-h-[80px]"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Imagen preview */}
          {image && (
            <div className="mt-3 relative">
              <img
                src={image}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Actions */}
          {isExpanded && (
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Icons.Camera className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Foto</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setImage(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Publicar
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
