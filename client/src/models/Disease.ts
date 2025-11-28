import { IDisease, DiseaseSeverity } from '@/types';

export class Disease {
  constructor(
    public id: string,
    public name: string,
    public scientificName: string,
    public symptoms: string[],
    public treatment: string,
    public plants: string[],
    public image: string,
    public preventativeMeasures: string[],
    public severity: DiseaseSeverity
  ) {}

  private static generateId(): string {
    return `disease_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: Omit<IDisease, 'id'>): Disease {
    return new Disease(
      Disease.generateId(),
      data.name,
      data.scientificName,
      data.symptoms,
      data.treatment,
      data.plants,
      data.image,
      data.preventativeMeasures,
      data.severity
    );
  }

  static fromJSON(data: IDisease): Disease {
    return new Disease(
      data.id,
      data.name,
      data.scientificName,
      data.symptoms,
      data.treatment,
      data.plants,
      data.image,
      data.preventativeMeasures,
      data.severity
    );
  }

  toJSON(): IDisease {
    return {
      id: this.id,
      name: this.name,
      scientificName: this.scientificName,
      symptoms: this.symptoms,
      treatment: this.treatment,
      plants: this.plants,
      image: this.image,
      preventativeMeasures: this.preventativeMeasures,
      severity: this.severity,
    };
  }

  get severityColor(): string {
    switch (this.severity) {
      case 'Alta':
        return 'red';
      case 'Media':
        return 'yellow';
      case 'Baja':
        return 'green';
      default:
        return 'gray';
    }
  }
}
