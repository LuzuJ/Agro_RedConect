export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: unknown): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
