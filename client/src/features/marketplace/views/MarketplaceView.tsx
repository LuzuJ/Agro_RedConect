import React, { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/models/Product';
import { ProductCategory } from '@/types';
import { Card, CardContent, Button, Icons, Alert } from '@/components/ui';
import { ProductCard, ProductFormModal, ProductDetailModal, ProductFormData } from '../components';

const CATEGORIES: ProductCategory[] = ['Semillas', 'Fertilizantes', 'Herramientas', 'Equipos', 'Otro'];

export const MarketplaceView: React.FC = () => {
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    filterByCategory,
    refreshProducts,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.seller.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleCategoryClick = async (category: ProductCategory | null) => {
    setSelectedCategory(category);
    await filterByCategory(category);
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    await createProduct(data);
    setAlertMessage({ type: 'success', message: 'Producto publicado exitosamente' });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    setAlertMessage({ type: 'success', message: 'Producto actualizado exitosamente' });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (globalThis.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(productId);
      setAlertMessage({ type: 'success', message: 'Producto eliminado' });
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleContact = (product: Product) => {
    // TODO: Implement contact/chat functionality
    setAlertMessage({ type: 'success', message: `Contactando a ${product.seller}...` });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <Icons.Close className="w-12 h-12 mb-3" />
        <p>{error}</p>
        <Button variant="outline" onClick={refreshProducts} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert */}
      {alertMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert variant={alertMessage.type} onClose={() => setAlertMessage(null)}>
            {alertMessage.message}
          </Alert>
        </div>
      )}

      {/* Header with Search and Create Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-5 h-5 mr-1" />
              Vender
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icons.ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchQuery || selectedCategory
              ? 'No se encontraron productos'
              : '¡El marketplace está vacío!'}
          </h3>
          <p className="text-sm mb-4">
            {searchQuery || selectedCategory
              ? 'Intenta con otra búsqueda o categoría'
              : 'Sé el primero en publicar un producto'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Publicar producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onView={setViewingProduct}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
              onContact={handleContact}
            />
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      <ProductFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onSubmit={handleUpdateProduct}
        />
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <ProductDetailModal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          product={viewingProduct}
          onEdit={(product) => {
            setViewingProduct(null);
            setEditingProduct(product);
          }}
          onContact={handleContact}
        />
      )}
    </div>
  );
};
