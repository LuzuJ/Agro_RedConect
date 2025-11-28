import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IFarm, IFarmCreate } from '@/types';
import { Farm } from '@/models/Farm';
import type { IFarmRepository } from './interfaces/IFarmRepository';

export class FarmRepository implements IFarmRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAll(): Promise<Farm[]> {
    const farms = await this.db.getAll<IFarm>(STORE_NAMES.FARMS);
    return farms.map(f => Farm.fromJSON(f));
  }

  async getById(id: string): Promise<Farm | null> {
    const farm = await this.db.getById<IFarm>(STORE_NAMES.FARMS, id);
    return farm ? Farm.fromJSON(farm) : null;
  }

  async findByUserId(userId: string): Promise<Farm[]> {
    const farms = await this.db.getByIndex<IFarm>(STORE_NAMES.FARMS, 'userId', userId);
    return farms.map(f => Farm.fromJSON(f));
  }

  async create(data: IFarmCreate): Promise<Farm> {
    const farm = Farm.create(data);
    await this.db.add(STORE_NAMES.FARMS, farm.toJSON());
    return farm;
  }

  async update(farm: Farm): Promise<Farm> {
    await this.db.put(STORE_NAMES.FARMS, farm.toJSON());
    return farm;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.FARMS, id);
  }
}
