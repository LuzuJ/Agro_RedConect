import { IFarm, IFarmCreate } from '@/types';

export class Farm {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public location: string,
    public totalArea: string | undefined,
    public image: string | undefined,
    public createdAt: string
  ) {}

  private static generateId(): string {
    return `farm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IFarmCreate): Farm {
    return new Farm(
      Farm.generateId(),
      data.userId,
      data.name,
      data.location,
      data.totalArea,
      data.image,
      new Date().toISOString()
    );
  }

  static fromJSON(data: IFarm): Farm {
    return new Farm(
      data.id,
      data.userId,
      data.name,
      data.location,
      data.totalArea,
      data.image,
      data.createdAt
    );
  }

  toJSON(): IFarm {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      location: this.location,
      totalArea: this.totalArea,
      image: this.image,
      createdAt: this.createdAt,
    };
  }
}
