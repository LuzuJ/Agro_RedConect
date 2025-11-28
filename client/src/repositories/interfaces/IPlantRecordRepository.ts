import type { IPlantRecord, PlantRecordType } from '../../types';
import type { IRepository } from './IRepository';

export interface IPlantRecordRepository extends IRepository<IPlantRecord> {
  findByPlantId(plantId: string): Promise<IPlantRecord[]>;
  findByUserId(userId: string): Promise<IPlantRecord[]>;
  findByType(type: PlantRecordType): Promise<IPlantRecord[]>;
  findByPlantIdAndType(plantId: string, type: PlantRecordType): Promise<IPlantRecord[]>;
}
