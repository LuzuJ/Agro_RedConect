import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IDisease } from '@/types';
import { Disease } from '@/models/Disease';

export class DiseaseRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAllDiseases(): Promise<Disease[]> {
    const diseases = await this.db.getAll<IDisease>(STORE_NAMES.DISEASES);
    return diseases.map(d => Disease.fromJSON(d));
  }

  async getDiseaseById(id: string): Promise<Disease | null> {
    const disease = await this.db.getById<IDisease>(STORE_NAMES.DISEASES, id);
    return disease ? Disease.fromJSON(disease) : null;
  }

  async searchDiseases(query: string): Promise<Disease[]> {
    const allDiseases = await this.getAllDiseases();
    const lowerQuery = query.toLowerCase();
    return allDiseases.filter(d =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.scientificName.toLowerCase().includes(lowerQuery) ||
      d.symptoms.some(s => s.toLowerCase().includes(lowerQuery)) ||
      d.plants.some(p => p.toLowerCase().includes(lowerQuery))
    );
  }

  async getDiseasesByPlant(plant: string): Promise<Disease[]> {
    const allDiseases = await this.getAllDiseases();
    const lowerPlant = plant.toLowerCase();
    return allDiseases.filter(d =>
      d.plants.some(p => p.toLowerCase().includes(lowerPlant))
    );
  }

  async getDiseasesBySeverity(severity: string): Promise<Disease[]> {
    const allDiseases = await this.getAllDiseases();
    return allDiseases.filter(d => d.severity === severity);
  }

  async createDisease(data: Omit<IDisease, 'id'>): Promise<Disease> {
    const disease = Disease.create(data);
    await this.db.add(STORE_NAMES.DISEASES, disease.toJSON());
    return disease;
  }

  async updateDisease(disease: Disease): Promise<Disease> {
    await this.db.put(STORE_NAMES.DISEASES, disease.toJSON());
    return disease;
  }

  async deleteDisease(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.DISEASES, id);
  }
}
