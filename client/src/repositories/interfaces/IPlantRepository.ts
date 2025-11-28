import type { IPlant, PlantStatus } from '../../types';
import type { IRepository } from './IRepository';

export interface IPlantRepository extends IRepository<IPlant> {
  findByPlotId(plotId: string): Promise<IPlant[]>;
  findByUserId(userId: string): Promise<IPlant[]>;
  findByStatus(status: PlantStatus): Promise<IPlant[]>;
  findByPlotIdAndPosition(plotId: string, row: number, column: number): Promise<IPlant | null>;
}
