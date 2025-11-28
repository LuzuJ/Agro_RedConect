import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IPlantRecord, IPlantRecordCreate, PlantRecordType } from '@/types';
import { PlantRecord } from '@/models/PlantRecord';
import type { IPlantRecordRepository } from './interfaces/IPlantRecordRepository';

export class PlantRecordRepository implements IPlantRecordRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAll(): Promise<PlantRecord[]> {
    const records = await this.db.getAll<IPlantRecord>(STORE_NAMES.PLANT_RECORDS);
    return records.map(r => PlantRecord.fromJSON(r));
  }

  async getById(id: string): Promise<PlantRecord | null> {
    const record = await this.db.getById<IPlantRecord>(STORE_NAMES.PLANT_RECORDS, id);
    return record ? PlantRecord.fromJSON(record) : null;
  }

  async findByPlantId(plantId: string): Promise<PlantRecord[]> {
    const records = await this.db.getByIndex<IPlantRecord>(STORE_NAMES.PLANT_RECORDS, 'plantId', plantId);
    return records
      .map(r => PlantRecord.fromJSON(r))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findByUserId(userId: string): Promise<PlantRecord[]> {
    const records = await this.db.getByIndex<IPlantRecord>(STORE_NAMES.PLANT_RECORDS, 'userId', userId);
    return records
      .map(r => PlantRecord.fromJSON(r))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findByType(type: PlantRecordType): Promise<PlantRecord[]> {
    const records = await this.db.getByIndex<IPlantRecord>(STORE_NAMES.PLANT_RECORDS, 'type', type);
    return records
      .map(r => PlantRecord.fromJSON(r))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findByPlantIdAndType(plantId: string, type: PlantRecordType): Promise<PlantRecord[]> {
    const records = await this.findByPlantId(plantId);
    return records.filter(r => r.type === type);
  }

  async create(data: IPlantRecordCreate): Promise<PlantRecord> {
    const record = PlantRecord.create(data);
    await this.db.add(STORE_NAMES.PLANT_RECORDS, record.toJSON());
    return record;
  }

  async update(record: PlantRecord): Promise<PlantRecord> {
    await this.db.put(STORE_NAMES.PLANT_RECORDS, record.toJSON());
    return record;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.PLANT_RECORDS, id);
  }
}
