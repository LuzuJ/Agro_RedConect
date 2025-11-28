import { IUser, IUserCreate, IUserUpdate } from '@/types';
import { IDatabaseProvider, STORE_NAMES, IRepository } from '@/lib/database';
import { User } from '@/models';

/**
 * User Repository Interface
 */
export interface IUserRepository extends IRepository<IUser, IUserCreate, IUserUpdate> {
  findByEmail(email: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
}

/**
 * User Repository Implementation
 * Handles all user data operations
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async findAll(): Promise<IUser[]> {
    return this.db.getAll<IUser>(STORE_NAMES.USERS);
  }

  async findById(id: string): Promise<IUser | null> {
    return this.db.getById<IUser>(STORE_NAMES.USERS, id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.db.getOneByIndex<IUser>(STORE_NAMES.USERS, 'email', email);
  }

  async findByRole(role: string): Promise<IUser[]> {
    return this.db.getByIndex<IUser>(STORE_NAMES.USERS, 'role', role);
  }

  async create(data: IUserCreate): Promise<IUser> {
    const user = User.create(data);
    return this.db.add<IUser>(STORE_NAMES.USERS, user.toJSON());
  }

  async update(id: string, data: IUserUpdate): Promise<IUser> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    const updated: IUser = {
      ...existing,
      ...data,
      id: existing.id, // Ensure ID doesn't change
      email: existing.email, // Ensure email doesn't change
    };

    return this.db.put<IUser>(STORE_NAMES.USERS, updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(STORE_NAMES.USERS, id);
  }
}
