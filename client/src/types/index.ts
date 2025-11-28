// ============================================
// USER TYPES
// ============================================
export type UserRole = 'Agricultor' | 'Ingeniero' | 'Proveedor';

// Tipos de cultivos disponibles
export type CropType = 
  | 'Café'
  | 'Cacao'
  | 'Maíz'
  | 'Arroz'
  | 'Papa'
  | 'Tomate'
  | 'Frijol'
  | 'Yuca'
  | 'Plátano'
  | 'Banano'
  | 'Caña de Azúcar'
  | 'Aguacate'
  | 'Cítricos'
  | 'Hortalizas'
  | 'Frutas Tropicales'
  | 'Flores'
  | 'Otro';

// Intereses del usuario
export type UserInterest =
  | 'Agricultura Orgánica'
  | 'Agricultura Sostenible'
  | 'Control de Plagas'
  | 'Fertilización'
  | 'Riego y Drenaje'
  | 'Comercialización'
  | 'Tecnología Agrícola'
  | 'Ganadería'
  | 'Apicultura'
  | 'Hidroponía'
  | 'Permacultura'
  | 'Agroforestería'
  | 'Certificaciones'
  | 'Exportación';

// Nivel de experiencia
export type ExperienceLevel = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Solo para uso interno, nunca exponer
  avatar: string;
  location: string;
  role: UserRole;
  bio?: string;
  // Nuevos campos
  phone?: string;
  crops: CropType[];
  interests: UserInterest[];
  experienceLevel: ExperienceLevel;
  farmSize?: string; // ej: "5 hectáreas"
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  crops: CropType[];
  interests: UserInterest[];
  experienceLevel: ExperienceLevel;
  farmSize?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location: string;
  avatar?: string;
  bio?: string;
  crops?: CropType[];
  interests?: UserInterest[];
  experienceLevel?: ExperienceLevel;
  phone?: string;
  farmSize?: string;
  website?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserUpdate {
  name?: string;
  avatar?: string;
  location?: string;
  bio?: string;
  phone?: string;
  crops?: CropType[];
  interests?: UserInterest[];
  experienceLevel?: ExperienceLevel;
  farmSize?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  isProfileComplete?: boolean;
  updatedAt?: string;
}

// ============================================
// POST TYPES
// ============================================
export interface IPost {
  id: string;
  userId: string;
  author: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
  timestamp: string;
}

export interface IPostCreate {
  userId: string;
  author: string;
  authorAvatar: string;
  content: string;
  image?: string;
  tags?: string[];
}

export interface IPostUpdate {
  content?: string;
  image?: string;
  tags?: string[];
}

// ============================================
// COMMENT TYPES
// ============================================
export interface IComment {
  id: string;
  postId: string;
  userId: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  timestamp: string;
}

export interface ICommentCreate {
  postId: string;
  userId: string;
  author: string;
  authorAvatar: string;
  content: string;
}

// ============================================
// PRODUCT TYPES
// ============================================
export type ProductCategory = 'Semillas' | 'Fertilizantes' | 'Herramientas' | 'Equipos' | 'Otro';

export interface IProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: ProductCategory;
  image: string;
  sellerId: string;
  seller: string;
  stock: number;
  createdAt: string;
}

export interface IProductCreate {
  name: string;
  price: number;
  currency?: string;
  description: string;
  category: ProductCategory;
  image: string;
  sellerId: string;
  seller: string;
  stock: number;
}

// ============================================
// DISEASE TYPES
// ============================================
export type DiseaseSeverity = 'Baja' | 'Media' | 'Alta';

export interface IDisease {
  id: string;
  name: string;
  scientificName: string;
  symptoms: string[];
  treatment: string;
  plants: string[];
  image: string;
  preventativeMeasures: string[];
  severity: DiseaseSeverity;
}

// ============================================
// DIAGNOSIS TYPES
// ============================================
export type DiagnosisSeverity = 'none' | 'low' | 'medium' | 'high';

export interface IDiagnosisResult {
  diseaseName: string;
  scientificName?: string;
  confidence: number; // 0-1
  severity: DiagnosisSeverity;
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  analyzedAt: string;
}

// ============================================
// FARM & PLOT TYPES (Terreno y Lotes)
// ============================================
export interface IFarm {
  id: string;
  userId: string;
  name: string;
  location: string;
  totalArea?: string;
  image?: string;
  createdAt: string;
}

export interface IFarmCreate {
  userId: string;
  name: string;
  location: string;
  totalArea?: string;
  image?: string;
}

export interface IPlotPosition {
  x: number;      // Posición X en el mapa (0-100%)
  y: number;      // Posición Y en el mapa (0-100%)
  width: number;  // Ancho relativo
  height: number; // Alto relativo
}

export interface IPlot {
  id: string;
  farmId: string;
  userId: string;
  name: string;
  cropType: CropType;
  area?: string;
  rows: number;
  columns: number;
  position: IPlotPosition;
  createdAt: string;
}

export interface IPlotCreate {
  farmId: string;
  userId: string;
  name: string;
  cropType: CropType;
  area?: string;
  rows: number;
  columns: number;
  position?: IPlotPosition;
}

// ============================================
// PLANT TYPES (Plantas individuales)
// ============================================
export type PlantStatus = 'Saludable' | 'Observación' | 'Enfermo' | 'Recuperándose' | 'Muerto';

export interface IPlantPosition {
  row: number;
  column: number;
}

export interface IPlantCoordinates {
  latitude: number;
  longitude: number;
}

export interface IPlantDisease {
  id: string;
  name: string;
}

export interface IPlant {
  id: string;
  userId: string;
  plotId?: string;
  name: string;
  type: CropType;
  variety?: string;
  position?: IPlantPosition;
  coordinates?: IPlantCoordinates;
  status: PlantStatus;
  currentDisease?: IPlantDisease;
  lastDiagnosisDate?: string;
  plantedDate: string;
  image: string;
  createdAt: string;
  lastUpdated?: string;
}

export interface IPlantCreate {
  userId: string;
  plotId?: string;
  name: string;
  type: CropType;
  variety?: string;
  position?: IPlantPosition;
  coordinates?: IPlantCoordinates;
  plantedDate: string;
  image?: string;
}

// ============================================
// PLANT RECORD TYPES (Historial de la planta)
// ============================================
export type PlantRecordType = 'diagnosis' | 'note' | 'treatment' | 'growth' | 'harvest';

export interface IPlantRecord {
  id: string;
  plantId: string;
  userId: string;
  type: PlantRecordType;
  date: string;
  diagnosis?: IDiagnosisResult;
  note?: string;
  image?: string;
  sharedPostId?: string;
  createdAt: string;
}

export interface IPlantRecordCreate {
  plantId: string;
  userId: string;
  type: PlantRecordType;
  date?: string;
  diagnosis?: IDiagnosisResult;
  note?: string;
  image?: string;
}

// ============================================
// PROPAGATION ALERT TYPES
// ============================================
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface IAffectedZone {
  row: number;
  column: number;
  plantId: string;
  status: PlantStatus;
}

export interface IPropagationAlert {
  id: string;
  plotId: string;
  diseaseId: string;
  diseaseName: string;
  affectedZones: IAffectedZone[];
  riskLevel: RiskLevel;
  plantsAtRisk: number;
  recommendations: string[];
  detectedAt: string;
}

// ============================================
// GROUP TYPES
// ============================================
export interface IGroup {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  isJoined: boolean;
  createdAt: string;
  adminId?: string;
}

export interface IGroupCreate {
  name: string;
  description: string;
  image: string;
  adminId: string;
}

// ============================================
// APP NAVIGATION
// ============================================
export enum AppView {
  SOCIAL = 'SOCIAL',
  MARKET = 'MARKET',
  DIAGNOSIS = 'DIAGNOSIS',
  WIKI = 'WIKI',
  GROUPS = 'GROUPS',
  PROFILE = 'PROFILE'
}

// ============================================
// AUTH TYPES
// ============================================
export interface IAuthState {
  user: IUserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IAuthResponse {
  user: IUserPublic;
  token?: string;
}
