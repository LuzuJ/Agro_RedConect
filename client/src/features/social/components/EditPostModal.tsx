import React, { useState, useEffect } from 'react';
import { Post } from '@/models/Post';
import { Modal, Button, Icons } from '@/components/ui';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSave: (postId: string, content: string, image?: string) => Promise<void>;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<string | undefined>(post.image);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(post.content);
    setImage(post.image);
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(post.id, content.trim(), image);
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar publicación">
      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué quieres compartir?"
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />

        {/* Image Preview */}
        {image && (
          <div className="relative">
            <img
              src={image}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Upload */}
        {!image && (
          <label className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex items-center space-x-2 text-gray-500">
              <Icons.Upload className="w-5 h-5" />
              <span>Agregar imagen</span>
            </div>
          </label>
        )}

        <p className="text-xs text-gray-500">
          Tip: Usa #hashtags para etiquetar tu publicación
        </p>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!content.trim() || isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
