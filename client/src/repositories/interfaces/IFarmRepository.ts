import type { IFarm } from '../../types';
import type { IRepository } from './IRepository';

export interface IFarmRepository extends IRepository<IFarm> {
  findByUserId(userId: string): Promise<IFarm[]>;
}
