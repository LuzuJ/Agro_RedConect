import { IUser, IUserCreate, UserRole, CropType, UserInterest, ExperienceLevel } from '@/types';

/**
 * User Model
 * Encapsulates user data and related logic
 */
export class User implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public password?: string;
  public avatar: string;
  public location: string;
  public role: UserRole;
  public bio?: string;
  public phone?: string;
  public crops: CropType[];
  public interests: UserInterest[];
  public experienceLevel: ExperienceLevel;
  public farmSize?: string;
  public website?: string;
  public socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  public isProfileComplete: boolean;
  public createdAt: string;
  public updatedAt?: string;

  constructor(data: IUser) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.avatar = data.avatar;
    this.location = data.location;
    this.role = data.role;
    this.bio = data.bio;
    this.phone = data.phone;
    this.crops = data.crops || [];
    this.interests = data.interests || [];
    this.experienceLevel = data.experienceLevel || 'Principiante';
    this.farmSize = data.farmSize;
    this.website = data.website;
    this.socialLinks = data.socialLinks;
    this.isProfileComplete = data.isProfileComplete || false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new User from registration data
   */
  static create(data: IUserCreate): User {
    return new User({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=10b981&color=fff`,
      location: data.location,
      role: data.role,
      bio: data.bio,
      crops: data.crops || [],
      interests: data.interests || [],
      experienceLevel: data.experienceLevel || 'Principiante',
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Create User from JSON data
   */
  static fromJSON(json: IUser): User {
    return new User(json);
  }

  /**
   * Convert to JSON (includes password for storage)
   */
  toJSON(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      location: this.location,
      role: this.role,
      bio: this.bio,
      phone: this.phone,
      crops: this.crops,
      interests: this.interests,
      experienceLevel: this.experienceLevel,
      farmSize: this.farmSize,
      website: this.website,
      socialLinks: this.socialLinks,
      isProfileComplete: this.isProfileComplete,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to public JSON (excludes password)
   */
  toPublicJSON(): Omit<IUser, 'password'> {
    const { password, ...publicData } = this.toJSON();
    return publicData;
  }

  /**
   * Check if passwords match
   */
  validatePassword(password: string): boolean {
    return this.password === password;
  }

  /**
   * Check if profile has minimum required fields
   */
  checkProfileComplete(): boolean {
    return !!(
      this.name &&
      this.location &&
      this.crops.length > 0 &&
      this.interests.length > 0 &&
      this.bio
    );
  }
}
