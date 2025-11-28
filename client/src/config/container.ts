import { IndexedDBProvider, IDatabaseProvider } from '@/lib/database';
import { UserRepository, IUserRepository, PostRepository } from '@/repositories';
import { ProductRepository } from '@/repositories/ProductRepository';
import { DiseaseRepository } from '@/repositories/DiseaseRepository';
import { GroupRepository } from '@/repositories/GroupRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import { PlotRepository } from '@/repositories/PlotRepository';
import { PlantRepository } from '@/repositories/PlantRepository';
import { PlantRecordRepository } from '@/repositories/PlantRecordRepository';
import { AuthService, PostService, DiagnosisService, FarmService, PlantService } from '@/services';
import { ProductService } from '@/services/ProductService';
import { DiseaseService } from '@/services/DiseaseService';
import { GroupService } from '@/services/GroupService';

/**
 * Dependency Injection Container
 * Centralized container for managing application dependencies
 * This allows easy swapping of implementations (e.g., switching from IndexedDB to API)
 */
class Container {
  private static instance: Container;

  // Database provider
  private _databaseProvider?: IDatabaseProvider;

  // Repositories
  private _userRepository?: IUserRepository;
  private _postRepository?: PostRepository;
  private _productRepository?: ProductRepository;
  private _diseaseRepository?: DiseaseRepository;
  private _groupRepository?: GroupRepository;
  private _farmRepository?: FarmRepository;
  private _plotRepository?: PlotRepository;
  private _plantRepository?: PlantRepository;
  private _plantRecordRepository?: PlantRecordRepository;

  // Services
  private _authService?: AuthService;
  private _postService?: PostService;
  private _productService?: ProductService;
  private _diseaseService?: DiseaseService;
  private _groupService?: GroupService;
  private _diagnosisService?: DiagnosisService;
  private _farmService?: FarmService;
  private _plantService?: PlantService;

  private _initialized = false;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Initialize the container with all dependencies
   */
  async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    console.log('🚀 Initializing application container...');

    // Initialize database provider
    this._databaseProvider = new IndexedDBProvider('AgriConnectDB', 2);
    await this._databaseProvider.initialize();

    // Initialize repositories
    this._userRepository = new UserRepository(this._databaseProvider);
    this._postRepository = new PostRepository(this._databaseProvider);
    this._productRepository = new ProductRepository(this._databaseProvider);
    this._diseaseRepository = new DiseaseRepository(this._databaseProvider);
    this._groupRepository = new GroupRepository(this._databaseProvider);
    this._farmRepository = new FarmRepository(this._databaseProvider);
    this._plotRepository = new PlotRepository(this._databaseProvider);
    this._plantRepository = new PlantRepository(this._databaseProvider);
    this._plantRecordRepository = new PlantRecordRepository(this._databaseProvider);

    // Initialize services
    this._authService = new AuthService(this._userRepository);
    this._postService = new PostService(this._postRepository);
    this._productService = new ProductService(this._productRepository);
    this._diseaseService = new DiseaseService(this._diseaseRepository);
    this._groupService = new GroupService(this._groupRepository);
    this._diagnosisService = new DiagnosisService(
      this._plantRepository,
      this._plantRecordRepository,
      this._postRepository,
      { useMockAI: true }
    );
    this._farmService = new FarmService(
      this._farmRepository,
      this._plotRepository,
      this._plantRepository
    );
    this._plantService = new PlantService(
      this._plantRepository,
      this._plantRecordRepository,
      this._plotRepository
    );

    this._initialized = true;
    console.log('✅ Application container initialized successfully');
  }

  /**
   * Check if the container is initialized
   */
  get isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Get database provider
   */
  get databaseProvider(): IDatabaseProvider {
    this.ensureInitialized();
    return this._databaseProvider!;
  }

  /**
   * Get user repository
   */
  get userRepository(): IUserRepository {
    this.ensureInitialized();
    return this._userRepository!;
  }

  /**
   * Get auth service
   */
  get authService(): AuthService {
    this.ensureInitialized();
    return this._authService!;
  }

  /**
   * Get post repository
   */
  get postRepository(): PostRepository {
    this.ensureInitialized();
    return this._postRepository!;
  }

  /**
   * Get post service
   */
  get postService(): PostService {
    this.ensureInitialized();
    return this._postService!;
  }

  /**
   * Get product repository
   */
  get productRepository(): ProductRepository {
    this.ensureInitialized();
    return this._productRepository!;
  }

  /**
   * Get product service
   */
  get productService(): ProductService {
    this.ensureInitialized();
    return this._productService!;
  }

  /**
   * Get disease repository
   */
  get diseaseRepository(): DiseaseRepository {
    this.ensureInitialized();
    return this._diseaseRepository!;
  }

  /**
   * Get disease service
   */
  get diseaseService(): DiseaseService {
    this.ensureInitialized();
    return this._diseaseService!;
  }

  /**
   * Get group repository
   */
  get groupRepository(): GroupRepository {
    this.ensureInitialized();
    return this._groupRepository!;
  }

  /**
   * Get group service
   */
  get groupService(): GroupService {
    this.ensureInitialized();
    return this._groupService!;
  }

  /**
   * Get farm repository
   */
  get farmRepository(): FarmRepository {
    this.ensureInitialized();
    return this._farmRepository!;
  }

  /**
   * Get plot repository
   */
  get plotRepository(): PlotRepository {
    this.ensureInitialized();
    return this._plotRepository!;
  }

  /**
   * Get plant repository
   */
  get plantRepository(): PlantRepository {
    this.ensureInitialized();
    return this._plantRepository!;
  }

  /**
   * Get plant record repository
   */
  get plantRecordRepository(): PlantRecordRepository {
    this.ensureInitialized();
    return this._plantRecordRepository!;
  }

  /**
   * Get diagnosis service
   */
  get diagnosisService(): DiagnosisService {
    this.ensureInitialized();
    return this._diagnosisService!;
  }

  /**
   * Get farm service
   */
  get farmService(): FarmService {
    this.ensureInitialized();
    return this._farmService!;
  }

  /**
   * Get plant service
   */
  get plantService(): PlantService {
    this.ensureInitialized();
    return this._plantService!;
  }

  /**
   * Ensure container is initialized
   */
  private ensureInitialized(): void {
    if (!this._initialized) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
  }

  /**
   * Reset the container (useful for testing)
   */
  reset(): void {
    this._databaseProvider = undefined;
    this._userRepository = undefined;
    this._postRepository = undefined;
    this._productRepository = undefined;
    this._diseaseRepository = undefined;
    this._groupRepository = undefined;
    this._farmRepository = undefined;
    this._plotRepository = undefined;
    this._plantRepository = undefined;
    this._plantRecordRepository = undefined;
    this._authService = undefined;
    this._postService = undefined;
    this._productService = undefined;
    this._diseaseService = undefined;
    this._groupService = undefined;
    this._diagnosisService = undefined;
    this._farmService = undefined;
    this._plantService = undefined;
    this._initialized = false;
  }
}

export const container = Container.getInstance();
