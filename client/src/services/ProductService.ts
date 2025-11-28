import { ProductRepository } from '@/repositories/ProductRepository';
import { Product } from '@/models/Product';
import { IProductCreate, ProductCategory } from '@/types';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.getAllProducts();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.getProductById(id);
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.productRepository.getProductsByCategory(category);
  }

  async getMyProducts(userId: string): Promise<Product[]> {
    return this.productRepository.getProductsBySeller(userId);
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) {
      return this.getAllProducts();
    }
    return this.productRepository.searchProducts(query);
  }

  async createProduct(data: IProductCreate): Promise<Product> {
    if (!data.name.trim()) {
      throw new Error('El nombre del producto es requerido');
    }
    if (data.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    return this.productRepository.createProduct(data);
  }

  async updateProduct(
    productId: string, 
    userId: string, 
    updates: Partial<Pick<Product, 'name' | 'price' | 'description' | 'category' | 'image' | 'stock'>>
  ): Promise<Product | null> {
    const product = await this.productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    if (product.sellerId !== userId) {
      throw new Error('No tienes permiso para editar este producto');
    }

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.image !== undefined) product.image = updates.image;
    if (updates.stock !== undefined) product.stock = updates.stock;

    return this.productRepository.updateProduct(product);
  }

  async deleteProduct(productId: string, userId: string): Promise<void> {
    const product = await this.productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    if (product.sellerId !== userId) {
      throw new Error('No tienes permiso para eliminar este producto');
    }
    await this.productRepository.deleteProduct(productId);
  }
}
