import React from 'react';
import { Product } from '@/models/Product';
import { CardContent, Button, Icons } from '@/components/ui';
import { useAuth } from '@/contexts';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onContact?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  onContact,
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === product.sellerId;

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
      onClick={() => onView(product)}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Icons.ShoppingBag className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Stock Badge */}
        {!product.isAvailable && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Agotado
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
          {product.category}
        </div>
      </div>

      <CardContent className="p-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-emerald-600 mb-2">
          {product.formattedPrice}
        </p>

        {/* Seller */}
        <p className="text-xs text-gray-500 mb-3 flex items-center">
          <Icons.User className="w-3 h-3 mr-1" />
          {product.seller}
        </p>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit?.(product)}
              >
                <Icons.Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onDelete?.(product.id)}
              >
                <Icons.Trash className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={() => onContact?.(product)}
            >
              <Icons.Message className="w-4 h-4 mr-1" />
              Contactar
            </Button>
          )}
        </div>
      </CardContent>
    </div>
  );
};
