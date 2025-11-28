import { DiseaseRepository } from '@/repositories/DiseaseRepository';
import { Disease } from '@/models/Disease';
import { DiseaseSeverity } from '@/types';

export class DiseaseService {
  constructor(private readonly diseaseRepository: DiseaseRepository) {}

  async getAllDiseases(): Promise<Disease[]> {
    return this.diseaseRepository.getAllDiseases();
  }

  async getDiseaseById(id: string): Promise<Disease | null> {
    return this.diseaseRepository.getDiseaseById(id);
  }

  async searchDiseases(query: string): Promise<Disease[]> {
    if (!query.trim()) {
      return this.getAllDiseases();
    }
    return this.diseaseRepository.searchDiseases(query);
  }

  async getDiseasesByPlant(plant: string): Promise<Disease[]> {
    return this.diseaseRepository.getDiseasesByPlant(plant);
  }

  async getDiseasesBySeverity(severity: DiseaseSeverity): Promise<Disease[]> {
    return this.diseaseRepository.getDiseasesBySeverity(severity);
  }

  async getAffectedPlants(): Promise<string[]> {
    const diseases = await this.getAllDiseases();
    const plantsSet = new Set<string>();
    for (const disease of diseases) {
      for (const plant of disease.plants) {
        plantsSet.add(plant);
      }
    }
    return Array.from(plantsSet).sort((a, b) => a.localeCompare(b));
  }
}
