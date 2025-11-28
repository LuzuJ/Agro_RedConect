import { IPlot, IPlotCreate, IPlotPosition, CropType } from '@/types';

export class Plot {
  constructor(
    public id: string,
    public farmId: string,
    public userId: string,
    public name: string,
    public cropType: CropType,
    public area: string | undefined,
    public rows: number,
    public columns: number,
    public position: IPlotPosition,
    public createdAt: string
  ) {}

  private static generateId(): string {
    return `plot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IPlotCreate): Plot {
    return new Plot(
      Plot.generateId(),
      data.farmId,
      data.userId,
      data.name,
      data.cropType,
      data.area,
      data.rows,
      data.columns,
      data.position || { x: 0, y: 0, width: 100, height: 100 },
      new Date().toISOString()
    );
  }

  static fromJSON(data: IPlot): Plot {
    return new Plot(
      data.id,
      data.farmId,
      data.userId,
      data.name,
      data.cropType,
      data.area,
      data.rows,
      data.columns,
      data.position,
      data.createdAt
    );
  }

  toJSON(): IPlot {
    return {
      id: this.id,
      farmId: this.farmId,
      userId: this.userId,
      name: this.name,
      cropType: this.cropType,
      area: this.area,
      rows: this.rows,
      columns: this.columns,
      position: this.position,
      createdAt: this.createdAt,
    };
  }

  get totalPlants(): number {
    return this.rows * this.columns;
  }

  isValidPosition(row: number, column: number): boolean {
    return row >= 1 && row <= this.rows && column >= 1 && column <= this.columns;
  }
}
