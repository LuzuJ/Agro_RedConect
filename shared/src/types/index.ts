// ============================================
// USER TYPES
// ============================================
export type UserRole = 'Agricultor' | 'Ingeniero' | 'Proveedor';

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location: string;
  avatar?: string;
  bio?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
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
  timestamp: number;
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
export interface IDiagnosisResult {
  diseaseName: string;
  confidence: 'Alto' | 'Medio' | 'Bajo';
  description: string;
  treatment: string;
  preventativeMeasures: string[];
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
// API RESPONSE TYPES
// ============================================
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// AUTH TYPES
// ============================================
export interface IAuthResponse {
  user: IUser;
  token?: string;
}

// ============================================
// APP NAVIGATION
// ============================================
export enum AppView {
  SOCIAL = 'SOCIAL',
  MARKET = 'MARKET',
  DIAGNOSIS = 'DIAGNOSIS',
  WIKI = 'WIKI',
  GROUPS = 'GROUPS'
}
