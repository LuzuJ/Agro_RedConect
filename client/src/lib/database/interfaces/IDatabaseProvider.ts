/**
 * Database Provider Interface
 * Defines the contract for database implementations
 * Allows switching between IndexedDB, REST API, or any other data source
 */
export interface IDatabaseProvider {
  /**
   * Initialize the database connection
   */
  initialize(): Promise<void>;

  /**
   * Check if the database is initialized
   */
  isInitialized(): boolean;

  /**
   * Get all items from a collection/store
   */
  getAll<T>(storeName: string): Promise<T[]>;

  /**
   * Get a single item by ID
   */
  getById<T>(storeName: string, id: string): Promise<T | null>;

  /**
   * Get items by an index
   */
  getByIndex<T>(storeName: string, indexName: string, value: unknown): Promise<T[]>;

  /**
   * Get a single item by index
   */
  getOneByIndex<T>(storeName: string, indexName: string, value: unknown): Promise<T | null>;

  /**
   * Add a new item
   */
  add<T>(storeName: string, data: T): Promise<T>;

  /**
   * Update an existing item
   */
  put<T>(storeName: string, data: T): Promise<T>;

  /**
   * Delete an item by ID
   */
  delete(storeName: string, id: string): Promise<boolean>;

  /**
   * Clear all items from a store
   */
  clear(storeName: string): Promise<void>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
}

/**
 * Store names used in the database
 */
export const STORE_NAMES = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  PRODUCTS: 'products',
  DISEASES: 'diseases',
  GROUPS: 'groups',
  FARMS: 'farms',
  PLOTS: 'plots',
  PLANTS: 'plants',
  PLANT_RECORDS: 'plantRecords',
} as const;

export type StoreName = typeof STORE_NAMES[keyof typeof STORE_NAMES];
