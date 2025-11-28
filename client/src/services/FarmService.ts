import { IFarmCreate, IPlotCreate } from '@/types';
import { FarmRepository } from '@/repositories/FarmRepository';
import { PlotRepository } from '@/repositories/PlotRepository';
import { PlantRepository } from '@/repositories/PlantRepository';
import { Farm } from '@/models/Farm';
import { Plot } from '@/models/Plot';

export class FarmService {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly plotRepository: PlotRepository,
    private readonly plantRepository: PlantRepository
  ) {}

  // ============ FARMS ============

  async createFarm(data: IFarmCreate): Promise<Farm> {
    return this.farmRepository.create(data);
  }

  async getUserFarms(userId: string): Promise<Farm[]> {
    return this.farmRepository.findByUserId(userId);
  }

  async getFarmById(farmId: string): Promise<Farm | null> {
    return this.farmRepository.getById(farmId);
  }

  async updateFarm(farm: Farm): Promise<Farm> {
    return this.farmRepository.update(farm);
  }

  async deleteFarm(farmId: string): Promise<void> {
    // Eliminar parcelas asociadas primero
    const plots = await this.plotRepository.findByFarmId(farmId);
    for (const plot of plots) {
      await this.deletePlot(plot.id);
    }
    await this.farmRepository.delete(farmId);
  }

  // ============ PLOTS ============

  async createPlot(data: IPlotCreate): Promise<Plot> {
    return this.plotRepository.create(data);
  }

  async getPlotsByFarm(farmId: string): Promise<Plot[]> {
    return this.plotRepository.findByFarmId(farmId);
  }

  async getPlotById(plotId: string): Promise<Plot | null> {
    return this.plotRepository.getById(plotId);
  }

  async updatePlot(plot: Plot): Promise<Plot> {
    return this.plotRepository.update(plot);
  }

  async deletePlot(plotId: string): Promise<void> {
    // Eliminar plantas asociadas primero
    const plants = await this.plantRepository.findByPlotId(plotId);
    for (const plant of plants) {
      await this.plantRepository.delete(plant.id);
    }
    await this.plotRepository.delete(plotId);
  }

  // ============ STATS ============

  async getFarmStats(farmId: string): Promise<{
    totalPlots: number;
    totalPlants: number;
    healthyPlants: number;
    sickPlants: number;
    observationPlants: number;
  }> {
    const plots = await this.plotRepository.findByFarmId(farmId);
    let totalPlants = 0;
    let healthyPlants = 0;
    let sickPlants = 0;
    let observationPlants = 0;

    for (const plot of plots) {
      const plants = await this.plantRepository.findByPlotId(plot.id);
      totalPlants += plants.length;
      
      for (const plant of plants) {
        switch (plant.status) {
          case 'Saludable':
            healthyPlants++;
            break;
          case 'Enfermo':
          case 'Muerto':
            sickPlants++;
            break;
          case 'Observación':
          case 'Recuperándose':
            observationPlants++;
            break;
        }
      }
    }

    return {
      totalPlots: plots.length,
      totalPlants,
      healthyPlants,
      sickPlants,
      observationPlants,
    };
  }

  async getUserFarmsWithStats(userId: string): Promise<Array<{
    farm: Farm;
    stats: {
      totalPlots: number;
      totalPlants: number;
      healthyPlants: number;
      sickPlants: number;
    };
  }>> {
    const farms = await this.farmRepository.findByUserId(userId);
    const result = [];

    for (const farm of farms) {
      const stats = await this.getFarmStats(farm.id);
      result.push({
        farm,
        stats: {
          totalPlots: stats.totalPlots,
          totalPlants: stats.totalPlants,
          healthyPlants: stats.healthyPlants,
          sickPlants: stats.sickPlants,
        },
      });
    }

    return result;
  }
}
