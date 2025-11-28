import React from 'react';
import { Product } from '@/models/Product';
import { Modal, Button, Icons } from '@/components/ui';
import { useAuth } from '@/contexts';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onContact?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onContact,
  onEdit,
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === product.sellerId;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Estoy interesado en el producto "${product.name}" que vi en AgriConnect. ¿Está disponible?`
    );
    globalThis.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-4">
        {/* Image */}
        <div className="relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Icons.ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full">
            {product.category}
          </div>

          {/* Stock Badge */}
          {!product.isAvailable && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              Agotado
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
          <p className="text-2xl font-bold text-emerald-600 mb-4">{product.formattedPrice}</p>
          
          {/* Seller Info */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {product.seller.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.seller}</p>
              <p className="text-xs text-gray-500">Vendedor</p>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              product.isAvailable 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {product.isAvailable 
                ? `${product.stock} disponibles` 
                : 'Sin stock'
              }
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{product.description || 'Sin descripción'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isOwner ? (
            <>
              <Button className="flex-1" onClick={() => onEdit?.(product)}>
                <Icons.Edit className="w-4 h-4 mr-2" />
                Editar producto
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={() => onContact?.(product)}>
                <Icons.Message className="w-4 h-4 mr-2" />
                Contactar vendedor
              </Button>
              <Button variant="outline" onClick={handleWhatsApp}>
                <Icons.Phone className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
