import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IPlot, IPlotCreate } from '@/types';
import { Plot } from '@/models/Plot';
import type { IPlotRepository } from './interfaces/IPlotRepository';

export class PlotRepository implements IPlotRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAll(): Promise<Plot[]> {
    const plots = await this.db.getAll<IPlot>(STORE_NAMES.PLOTS);
    return plots.map(p => Plot.fromJSON(p));
  }

  async getById(id: string): Promise<Plot | null> {
    const plot = await this.db.getById<IPlot>(STORE_NAMES.PLOTS, id);
    return plot ? Plot.fromJSON(plot) : null;
  }

  async findByFarmId(farmId: string): Promise<Plot[]> {
    const plots = await this.db.getByIndex<IPlot>(STORE_NAMES.PLOTS, 'farmId', farmId);
    return plots.map(p => Plot.fromJSON(p));
  }

  async findByUserId(userId: string): Promise<Plot[]> {
    const plots = await this.db.getByIndex<IPlot>(STORE_NAMES.PLOTS, 'userId', userId);
    return plots.map(p => Plot.fromJSON(p));
  }

  async create(data: IPlotCreate): Promise<Plot> {
    const plot = Plot.create(data);
    await this.db.add(STORE_NAMES.PLOTS, plot.toJSON());
    return plot;
  }

  async update(plot: Plot): Promise<Plot> {
    await this.db.put(STORE_NAMES.PLOTS, plot.toJSON());
    return plot;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.PLOTS, id);
  }
}
