import { useState, useEffect, useCallback } from 'react';
import { container } from '@/config/container';
import { Product } from '@/models/Product';
import { IProductCreate, ProductCategory } from '@/types';
import { useAuth } from '@/contexts';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProducts = await container.productService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const searchProducts = async (query: string) => {
    try {
      setIsLoading(true);
      const results = await container.productService.searchProducts(query);
      setProducts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const filterByCategory = async (category: ProductCategory | null) => {
    try {
      setIsLoading(true);
      if (category) {
        const results = await container.productService.getProductsByCategory(category);
        setProducts(results);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (data: Omit<IProductCreate, 'sellerId' | 'seller'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const productData: IProductCreate = {
      ...data,
      sellerId: user.id,
      seller: user.name,
    };

    const newProduct = await container.productService.createProduct(productData);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Pick<Product, 'name' | 'price' | 'description' | 'category' | 'image' | 'stock'>>
  ) => {
    if (!user) throw new Error('Usuario no autenticado');

    const updatedProduct = await container.productService.updateProduct(productId, user.id, updates);
    if (updatedProduct) {
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
    }
    return updatedProduct;
  };

  const deleteProduct = async (productId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    await container.productService.deleteProduct(productId, user.id);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return {
    products,
    isLoading,
    error,
    searchProducts,
    filterByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts,
  };
}

export function useMyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyProducts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const myProducts = await container.productService.getMyProducts(user.id);
      setProducts(myProducts);
    } catch (err) {
      console.error('Error fetching my products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  return {
    products,
    isLoading,
    refreshProducts: fetchMyProducts,
  };
}
