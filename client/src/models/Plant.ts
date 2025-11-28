import { 
  IPlant, 
  IPlantCreate, 
  IPlantPosition, 
  IPlantCoordinates, 
  PlantStatus, 
  CropType,
  IPlantDisease 
} from '@/types';

export class Plant {
  constructor(
    public id: string,
    public userId: string,
    public plotId: string | undefined,
    public name: string,
    public type: CropType,
    public variety: string | undefined,
    public position: IPlantPosition | undefined,
    public coordinates: IPlantCoordinates | undefined,
    public status: PlantStatus,
    public currentDisease: IPlantDisease | undefined,
    public lastDiagnosisDate: string | undefined,
    public plantedDate: string,
    public image: string,
    public createdAt: string,
    public lastUpdated: string | undefined
  ) {}

  private static generateId(): string {
    return `plant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IPlantCreate): Plant {
    return new Plant(
      Plant.generateId(),
      data.userId,
      data.plotId,
      data.name,
      data.type,
      data.variety,
      data.position,
      data.coordinates,
      'Saludable',
      undefined,
      undefined,
      data.plantedDate,
      data.image || '',
      new Date().toISOString(),
      undefined
    );
  }

  static fromJSON(data: IPlant): Plant {
    return new Plant(
      data.id,
      data.userId,
      data.plotId,
      data.name,
      data.type,
      data.variety,
      data.position,
      data.coordinates,
      data.status,
      data.currentDisease,
      data.lastDiagnosisDate,
      data.plantedDate,
      data.image,
      data.createdAt,
      data.lastUpdated
    );
  }

  toJSON(): IPlant {
    return {
      id: this.id,
      userId: this.userId,
      plotId: this.plotId,
      name: this.name,
      type: this.type,
      variety: this.variety,
      position: this.position,
      coordinates: this.coordinates,
      status: this.status,
      currentDisease: this.currentDisease,
      lastDiagnosisDate: this.lastDiagnosisDate,
      plantedDate: this.plantedDate,
      image: this.image,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
    };
  }

  get statusColor(): string {
    switch (this.status) {
      case 'Saludable':
        return 'green';
      case 'Observación':
        return 'yellow';
      case 'Enfermo':
        return 'red';
      case 'Recuperándose':
        return 'blue';
      case 'Muerto':
        return 'gray';
      default:
        return 'gray';
    }
  }

  get statusEmoji(): string {
    switch (this.status) {
      case 'Saludable':
        return '🟢';
      case 'Observación':
        return '🟡';
      case 'Enfermo':
        return '🔴';
      case 'Recuperándose':
        return '🔵';
      case 'Muerto':
        return '⚫';
      default:
        return '⚪';
    }
  }

  updateStatus(newStatus: PlantStatus, disease?: IPlantDisease): void {
    this.status = newStatus;
    this.lastUpdated = new Date().toISOString();
    if (disease) {
      this.currentDisease = disease;
    } else if (newStatus === 'Saludable') {
      this.currentDisease = undefined;
    }
  }

  setDiagnosis(disease: IPlantDisease): void {
    this.currentDisease = disease;
    this.status = 'Enfermo';
    this.lastDiagnosisDate = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
  }

  markAsRecovering(): void {
    this.status = 'Recuperándose';
    this.lastUpdated = new Date().toISOString();
  }

  markAsHealthy(): void {
    this.status = 'Saludable';
    this.currentDisease = undefined;
    this.lastUpdated = new Date().toISOString();
  }
}
