import { IUser, IUserPublic, IUserCreate, IUserLogin, IUserUpdate } from '@/types';
import { IUserRepository } from '@/repositories';

const CURRENT_USER_KEY = 'agriconnect_current_user';

/**
 * Auth Service
 * Handles user authentication operations
 */
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Login user with email and password
   */
  async login(credentials: IUserLogin): Promise<IUserPublic> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Validate password (in production, use bcrypt or similar)
    if (user.password !== password) {
      throw new Error('Contraseña incorrecta');
    }

    // Store session
    const publicUser = this.toPublicUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

    return publicUser;
  }

  /**
   * Register new user
   */
  async register(data: IUserCreate): Promise<IUserPublic> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Create new user
    const newUser = await this.userRepository.create(data);

    // Store session
    const publicUser = this.toPublicUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

    return publicUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: IUserUpdate): Promise<IUserPublic> {
    const updatedUser = await this.userRepository.update(userId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // Update session
    const publicUser = this.toPublicUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

    return publicUser;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUserPublic | null> {
    const user = await this.userRepository.findById(userId);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): IUserPublic | null {
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData) as IUserPublic;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Convert IUser to IUserPublic (remove password)
   */
  private toPublicUser(user: IUser): IUserPublic {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;
    return publicUser as IUserPublic;
  }
}
