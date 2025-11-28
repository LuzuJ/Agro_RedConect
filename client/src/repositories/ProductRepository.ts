import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IProduct, IProductCreate, ProductCategory } from '@/types';
import { Product } from '@/models/Product';

export class ProductRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAllProducts(): Promise<Product[]> {
    const products = await this.db.getAll<IProduct>(STORE_NAMES.PRODUCTS);
    return products
      .map(p => Product.fromJSON(p))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.db.getById<IProduct>(STORE_NAMES.PRODUCTS, id);
    return product ? Product.fromJSON(product) : null;
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    const products = await this.db.getByIndex<IProduct>(
      STORE_NAMES.PRODUCTS,
      'category',
      category
    );
    return products
      .map(p => Product.fromJSON(p))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const products = await this.db.getByIndex<IProduct>(
      STORE_NAMES.PRODUCTS,
      'sellerId',
      sellerId
    );
    return products
      .map(p => Product.fromJSON(p))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchProducts(query: string): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createProduct(data: IProductCreate): Promise<Product> {
    const product = Product.create(data);
    await this.db.add(STORE_NAMES.PRODUCTS, product.toJSON());
    return product;
  }

  async updateProduct(product: Product): Promise<Product> {
    await this.db.put(STORE_NAMES.PRODUCTS, product.toJSON());
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.PRODUCTS, id);
  }
}
