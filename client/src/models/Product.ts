import { IProduct, IProductCreate, ProductCategory } from '@/types';

export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public currency: string,
    public description: string,
    public category: ProductCategory,
    public image: string,
    public sellerId: string,
    public seller: string,
    public stock: number,
    public createdAt: string
  ) {}

  private static generateId(): string {
    return `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IProductCreate): Product {
    return new Product(
      Product.generateId(),
      data.name,
      data.price,
      data.currency || 'COP',
      data.description,
      data.category,
      data.image,
      data.sellerId,
      data.seller,
      data.stock,
      new Date().toISOString()
    );
  }

  static fromJSON(data: IProduct): Product {
    return new Product(
      data.id,
      data.name,
      data.price,
      data.currency,
      data.description,
      data.category,
      data.image,
      data.sellerId,
      data.seller,
      data.stock,
      data.createdAt
    );
  }

  toJSON(): IProduct {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      currency: this.currency,
      description: this.description,
      category: this.category,
      image: this.image,
      sellerId: this.sellerId,
      seller: this.seller,
      stock: this.stock,
      createdAt: this.createdAt,
    };
  }

  get isAvailable(): boolean {
    return this.stock > 0;
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
    }).format(this.price);
  }

  updateStock(quantity: number): void {
    this.stock = Math.max(0, this.stock + quantity);
  }
}
