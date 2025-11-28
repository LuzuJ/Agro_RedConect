import { 
  IPlantCreate, 
  PlantStatus, 
  IPropagationAlert,
  RiskLevel,
  IPlantDisease,
  IPlantRecordCreate 
} from '@/types';
import { PlantRepository } from '@/repositories/PlantRepository';
import { PlantRecordRepository } from '@/repositories/PlantRecordRepository';
import { PlotRepository } from '@/repositories/PlotRepository';
import { Plant } from '@/models/Plant';
import { PlantRecord } from '@/models/PlantRecord';

export class PlantService {
  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly plantRecordRepository: PlantRecordRepository,
    private readonly plotRepository: PlotRepository
  ) {}

  // ============ PLANTS ============

  async createPlant(data: IPlantCreate): Promise<Plant> {
    // Verificar que la posición no esté ocupada
    if (data.position && data.plotId) {
      const existing = await this.plantRepository.findByPlotIdAndPosition(
        data.plotId,
        data.position.row,
        data.position.column
      );
      if (existing) {
        throw new Error('Ya existe una planta en esa posición');
      }
    }

    return this.plantRepository.create(data);
  }

  async getPlantsByPlot(plotId: string): Promise<Plant[]> {
    return this.plantRepository.findByPlotId(plotId);
  }

  async getPlantById(plantId: string): Promise<Plant | null> {
    return this.plantRepository.getById(plantId);
  }

  async updatePlant(plant: Plant): Promise<Plant> {
    return this.plantRepository.update(plant);
  }

  async deletePlant(plantId: string): Promise<void> {
    // Eliminar registros asociados
    const records = await this.plantRecordRepository.findByPlantId(plantId);
    for (const record of records) {
      await this.plantRecordRepository.delete(record.id);
    }
    await this.plantRepository.delete(plantId);
  }

  async updatePlantStatus(
    plantId: string, 
    status: PlantStatus,
    disease?: IPlantDisease
  ): Promise<Plant | null> {
    const plant = await this.plantRepository.getById(plantId);
    if (!plant) return null;

    plant.status = status;
    if (status === 'Saludable') {
      plant.currentDisease = undefined;
    } else if (disease) {
      plant.currentDisease = disease;
      plant.lastDiagnosisDate = new Date().toISOString();
    }
    plant.lastUpdated = new Date().toISOString();
    
    return this.plantRepository.update(plant);
  }

  // ============ PLANT RECORDS ============

  async addPlantNote(
    plantId: string,
    userId: string,
    note: string,
    image?: string
  ): Promise<PlantRecord> {
    return this.plantRecordRepository.create({
      plantId,
      userId,
      type: 'note',
      note,
      image,
    });
  }

  async addPlantTreatment(
    plantId: string,
    userId: string,
    treatment: string,
    image?: string
  ): Promise<PlantRecord> {
    // Marcar planta como en recuperación
    const plant = await this.plantRepository.getById(plantId);
    if (plant && plant.status === 'Enfermo') {
      plant.markAsRecovering();
      await this.plantRepository.update(plant);
    }

    return this.plantRecordRepository.create({
      plantId,
      userId,
      type: 'treatment',
      note: treatment,
      image,
    });
  }

  async addGrowthRecord(
    plantId: string,
    userId: string,
    note: string,
    image?: string
  ): Promise<PlantRecord> {
    return this.plantRecordRepository.create({
      plantId,
      userId,
      type: 'growth',
      note,
      image,
    });
  }

  async getPlantHistory(plantId: string): Promise<PlantRecord[]> {
    return this.plantRecordRepository.findByPlantId(plantId);
  }

  async addPlantRecord(
    plantId: string,
    record: Omit<IPlantRecordCreate, 'plantId'>
  ): Promise<PlantRecord> {
    return this.plantRecordRepository.create({
      ...record,
      plantId,
    });
  }

  // ============ GRID VISUALIZATION ============

  async getPlotGrid(plotId: string): Promise<{
    rows: number;
    columns: number;
    plants: Plant[];
    grid: (Plant | null)[][];
  }> {
    const plot = await this.plotRepository.getById(plotId);
    if (!plot) {
      throw new Error('Parcela no encontrada');
    }

    const plants = await this.plantRepository.findByPlotId(plotId);
    
    // Crear matriz vacía
    const grid: (Plant | null)[][] = [];
    for (let r = 0; r < plot.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < plot.columns; c++) {
        grid[r][c] = null;
      }
    }

    // Llenar matriz con plantas
    for (const plant of plants) {
      if (plant.position) {
        const { row, column } = plant.position;
        if (row >= 0 && row < plot.rows && column >= 0 && column < plot.columns) {
          grid[row][column] = plant;
        }
      }
    }

    return {
      rows: plot.rows,
      columns: plot.columns,
      plants,
      grid,
    };
  }

  // ============ PROPAGATION ANALYSIS ============

  async analyzePropagation(plotId: string): Promise<IPropagationAlert[]> {
    const { grid, rows, columns, plants } = await this.getPlotGrid(plotId);
    const alerts: IPropagationAlert[] = [];
    const processedDiseases = new Set<string>();

    // Buscar plantas enfermas
    const sickPlants = plants.filter(
      p => p.status === 'Enfermo' && p.currentDisease
    );

    for (const sickPlant of sickPlants) {
      if (!sickPlant.currentDisease || !sickPlant.position) continue;
      
      const diseaseKey = sickPlant.currentDisease.id;
      if (processedDiseases.has(diseaseKey)) continue;

      // Encontrar todas las plantas con la misma enfermedad
      const sameDiseased = sickPlants.filter(
        p => p.currentDisease?.id === diseaseKey
      );

      // Calcular zonas afectadas y en riesgo
      const affectedZones = sameDiseased.map(p => ({
        row: p.position!.row,
        column: p.position!.column,
        plantId: p.id,
        status: p.status,
      }));

      // Calcular plantas vecinas en riesgo
      const atRiskPlants: string[] = [];
      for (const affected of affectedZones) {
        const neighbors = this.getNeighbors(grid, affected.row, affected.column, rows, columns);
        for (const neighbor of neighbors) {
          if (neighbor && neighbor.status === 'Saludable' && !atRiskPlants.includes(neighbor.id)) {
            atRiskPlants.push(neighbor.id);
          }
        }
      }

      // Determinar nivel de riesgo
      let riskLevel: RiskLevel = 'low';
      const affectedPercentage = (sameDiseased.length / plants.length) * 100;
      
      if (affectedPercentage > 30) {
        riskLevel = 'critical';
      } else if (affectedPercentage > 15) {
        riskLevel = 'high';
      } else if (affectedPercentage > 5) {
        riskLevel = 'medium';
      }

      alerts.push({
        id: `alert_${Date.now()}_${diseaseKey}`,
        plotId,
        diseaseId: diseaseKey,
        diseaseName: sickPlant.currentDisease.name,
        affectedZones,
        riskLevel,
        plantsAtRisk: atRiskPlants.length,
        recommendations: this.getPropagationRecommendations(riskLevel, sickPlant.currentDisease.name),
        detectedAt: new Date().toISOString(),
      });

      processedDiseases.add(diseaseKey);
    }

    return alerts.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
  }

  private getNeighbors(
    grid: (Plant | null)[][],
    row: number,
    column: number,
    maxRows: number,
    maxCols: number
  ): (Plant | null)[] {
    const neighbors: (Plant | null)[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = column + dc;
      if (newRow >= 0 && newRow < maxRows && newCol >= 0 && newCol < maxCols) {
        neighbors.push(grid[newRow][newCol]);
      }
    }

    return neighbors;
  }

  private getPropagationRecommendations(riskLevel: RiskLevel, diseaseName: string): string[] {
    const baseRecs = [
      `Aislar plantas afectadas con ${diseaseName}`,
      'Desinfectar herramientas después de cada uso',
      'Aumentar la vigilancia en plantas vecinas',
    ];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      return [
        ...baseRecs,
        'Considerar eliminación de plantas severamente afectadas',
        'Aplicar tratamiento preventivo a plantas vecinas',
        'Mejorar ventilación y espaciado entre plantas',
        'Consultar con un agrónomo especializado',
      ];
    } else if (riskLevel === 'medium') {
      return [
        ...baseRecs,
        'Aplicar fungicida preventivo en área circundante',
        'Reducir riego para evitar condiciones húmedas',
      ];
    }

    return baseRecs;
  }

  // ============ STATS ============

  async getPlotStats(plotId: string): Promise<{
    total: number;
    byStatus: Record<PlantStatus, number>;
    diseased: { name: string; count: number }[];
  }> {
    const plants = await this.plantRepository.findByPlotId(plotId);
    
    const byStatus: Record<PlantStatus, number> = {
      'Saludable': 0,
      'Observación': 0,
      'Enfermo': 0,
      'Recuperándose': 0,
      'Muerto': 0,
    };

    const diseaseCount: Record<string, number> = {};

    for (const plant of plants) {
      byStatus[plant.status]++;
      
      if (plant.currentDisease) {
        const name = plant.currentDisease.name;
        diseaseCount[name] = (diseaseCount[name] || 0) + 1;
      }
    }

    const diseased = Object.entries(diseaseCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: plants.length,
      byStatus,
      diseased,
    };
  }
}
