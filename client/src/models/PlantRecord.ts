import { 
  IPlantRecord, 
  IPlantRecordCreate, 
  PlantRecordType, 
  IDiagnosisResult 
} from '@/types';

export class PlantRecord {
  constructor(
    public id: string,
    public plantId: string,
    public userId: string,
    public type: PlantRecordType,
    public date: string,
    public diagnosis: IDiagnosisResult | undefined,
    public note: string | undefined,
    public image: string | undefined,
    public sharedPostId: string | undefined,
    public createdAt: string
  ) {}

  private static generateId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IPlantRecordCreate): PlantRecord {
    return new PlantRecord(
      PlantRecord.generateId(),
      data.plantId,
      data.userId,
      data.type,
      data.date || new Date().toISOString(),
      data.diagnosis,
      data.note,
      data.image,
      undefined,
      new Date().toISOString()
    );
  }

  static createDiagnosis(
    plantId: string,
    userId: string,
    diagnosis: IDiagnosisResult,
    image?: string
  ): PlantRecord {
    return PlantRecord.create({
      plantId,
      userId,
      type: 'diagnosis',
      diagnosis,
      image,
    });
  }

  static createNote(
    plantId: string,
    userId: string,
    note: string,
    image?: string
  ): PlantRecord {
    return PlantRecord.create({
      plantId,
      userId,
      type: 'note',
      note,
      image,
    });
  }

  static createTreatment(
    plantId: string,
    userId: string,
    note: string,
    image?: string
  ): PlantRecord {
    return PlantRecord.create({
      plantId,
      userId,
      type: 'treatment',
      note,
      image,
    });
  }

  static fromJSON(data: IPlantRecord): PlantRecord {
    return new PlantRecord(
      data.id,
      data.plantId,
      data.userId,
      data.type,
      data.date,
      data.diagnosis,
      data.note,
      data.image,
      data.sharedPostId,
      data.createdAt
    );
  }

  toJSON(): IPlantRecord {
    return {
      id: this.id,
      plantId: this.plantId,
      userId: this.userId,
      type: this.type,
      date: this.date,
      diagnosis: this.diagnosis,
      note: this.note,
      image: this.image,
      sharedPostId: this.sharedPostId,
      createdAt: this.createdAt,
    };
  }

  get typeLabel(): string {
    switch (this.type) {
      case 'diagnosis':
        return 'Diagnóstico';
      case 'note':
        return 'Nota';
      case 'treatment':
        return 'Tratamiento';
      case 'growth':
        return 'Crecimiento';
      case 'harvest':
        return 'Cosecha';
      default:
        return 'Registro';
    }
  }

  get typeIcon(): string {
    switch (this.type) {
      case 'diagnosis':
        return '🔬';
      case 'note':
        return '📝';
      case 'treatment':
        return '💊';
      case 'growth':
        return '📏';
      case 'harvest':
        return '🌾';
      default:
        return '📋';
    }
  }

  get typeColor(): string {
    switch (this.type) {
      case 'diagnosis':
        return 'red';
      case 'note':
        return 'blue';
      case 'treatment':
        return 'purple';
      case 'growth':
        return 'green';
      case 'harvest':
        return 'yellow';
      default:
        return 'gray';
    }
  }

  isShared(): boolean {
    return !!this.sharedPostId;
  }

  setSharedPost(postId: string): void {
    this.sharedPostId = postId;
  }
}
