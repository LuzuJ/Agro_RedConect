import type { IPlot } from '../../types';
import type { IRepository } from './IRepository';

export interface IPlotRepository extends IRepository<IPlot> {
  findByFarmId(farmId: string): Promise<IPlot[]>;
  findByUserId(userId: string): Promise<IPlot[]>;
}
