import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IPlant, IPlantCreate, PlantStatus } from '@/types';
import { Plant } from '@/models/Plant';
import type { IPlantRepository } from './interfaces/IPlantRepository';

export class PlantRepository implements IPlantRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAll(): Promise<Plant[]> {
    const plants = await this.db.getAll<IPlant>(STORE_NAMES.PLANTS);
    return plants.map(p => Plant.fromJSON(p));
  }

  async getById(id: string): Promise<Plant | null> {
    const plant = await this.db.getById<IPlant>(STORE_NAMES.PLANTS, id);
    return plant ? Plant.fromJSON(plant) : null;
  }

  async findByPlotId(plotId: string): Promise<Plant[]> {
    const plants = await this.db.getByIndex<IPlant>(STORE_NAMES.PLANTS, 'plotId', plotId);
    return plants.map(p => Plant.fromJSON(p));
  }

  async findByUserId(userId: string): Promise<Plant[]> {
    const plants = await this.db.getByIndex<IPlant>(STORE_NAMES.PLANTS, 'userId', userId);
    return plants.map(p => Plant.fromJSON(p));
  }

  async findByStatus(status: PlantStatus): Promise<Plant[]> {
    const plants = await this.db.getByIndex<IPlant>(STORE_NAMES.PLANTS, 'status', status);
    return plants.map(p => Plant.fromJSON(p));
  }

  async findByPlotIdAndPosition(plotId: string, row: number, column: number): Promise<Plant | null> {
    const plants = await this.findByPlotId(plotId);
    return plants.find(p => p.position?.row === row && p.position?.column === column) || null;
  }

  async create(data: IPlantCreate): Promise<Plant> {
    const plant = Plant.create(data);
    await this.db.add(STORE_NAMES.PLANTS, plant.toJSON());
    return plant;
  }

  async update(plant: Plant): Promise<Plant> {
    await this.db.put(STORE_NAMES.PLANTS, plant.toJSON());
    return plant;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.PLANTS, id);
  }
}
