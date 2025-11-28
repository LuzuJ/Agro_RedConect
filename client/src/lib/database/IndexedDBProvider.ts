import { IDatabaseProvider, STORE_NAMES } from './interfaces/IDatabaseProvider';

/**
 * IndexedDB Database Provider
 * Implements IDatabaseProvider interface for IndexedDB storage
 */
export class IndexedDBProvider implements IDatabaseProvider {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly dbVersion: number;

  constructor(dbName: string = 'AgriConnectDB', dbVersion: number = 2) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Users store
    if (!db.objectStoreNames.contains(STORE_NAMES.USERS)) {
      const userStore = db.createObjectStore(STORE_NAMES.USERS, { keyPath: 'id' });
      userStore.createIndex('email', 'email', { unique: true });
      userStore.createIndex('role', 'role', { unique: false });
    }

    // Posts store
    if (!db.objectStoreNames.contains(STORE_NAMES.POSTS)) {
      const postStore = db.createObjectStore(STORE_NAMES.POSTS, { keyPath: 'id' });
      postStore.createIndex('userId', 'userId', { unique: false });
      postStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Comments store
    if (!db.objectStoreNames.contains(STORE_NAMES.COMMENTS)) {
      const commentStore = db.createObjectStore(STORE_NAMES.COMMENTS, { keyPath: 'id' });
      commentStore.createIndex('postId', 'postId', { unique: false });
      commentStore.createIndex('userId', 'userId', { unique: false });
    }

    // Products store
    if (!db.objectStoreNames.contains(STORE_NAMES.PRODUCTS)) {
      const productStore = db.createObjectStore(STORE_NAMES.PRODUCTS, { keyPath: 'id' });
      productStore.createIndex('category', 'category', { unique: false });
      productStore.createIndex('sellerId', 'sellerId', { unique: false });
    }

    // Diseases store
    if (!db.objectStoreNames.contains(STORE_NAMES.DISEASES)) {
      const diseaseStore = db.createObjectStore(STORE_NAMES.DISEASES, { keyPath: 'id' });
      diseaseStore.createIndex('name', 'name', { unique: false });
    }

    // Groups store
    if (!db.objectStoreNames.contains(STORE_NAMES.GROUPS)) {
      const groupStore = db.createObjectStore(STORE_NAMES.GROUPS, { keyPath: 'id' });
      groupStore.createIndex('adminId', 'adminId', { unique: false });
    }

    // Farms store
    if (!db.objectStoreNames.contains(STORE_NAMES.FARMS)) {
      const farmStore = db.createObjectStore(STORE_NAMES.FARMS, { keyPath: 'id' });
      farmStore.createIndex('userId', 'userId', { unique: false });
    }

    // Plots store
    if (!db.objectStoreNames.contains(STORE_NAMES.PLOTS)) {
      const plotStore = db.createObjectStore(STORE_NAMES.PLOTS, { keyPath: 'id' });
      plotStore.createIndex('farmId', 'farmId', { unique: false });
      plotStore.createIndex('userId', 'userId', { unique: false });
    }

    // Plants store
    if (!db.objectStoreNames.contains(STORE_NAMES.PLANTS)) {
      const plantStore = db.createObjectStore(STORE_NAMES.PLANTS, { keyPath: 'id' });
      plantStore.createIndex('plotId', 'plotId', { unique: false });
      plantStore.createIndex('userId', 'userId', { unique: false });
      plantStore.createIndex('status', 'status', { unique: false });
    }

    // Plant Records store
    if (!db.objectStoreNames.contains(STORE_NAMES.PLANT_RECORDS)) {
      const recordStore = db.createObjectStore(STORE_NAMES.PLANT_RECORDS, { keyPath: 'id' });
      recordStore.createIndex('plantId', 'plantId', { unique: false });
      recordStore.createIndex('userId', 'userId', { unique: false });
      recordStore.createIndex('type', 'type', { unique: false });
    }
  }

  isInitialized(): boolean {
    return this.db !== null;
  }

  private getDatabase(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: unknown): Promise<T[]> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value as IDBValidKey);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOneByIndex<T>(storeName: string, indexName: string, value: unknown): Promise<T | null> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value as IDBValidKey);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: string, data: T): Promise<T> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<T> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<boolean> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
