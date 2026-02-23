// Types
export interface SymptomReport {
  text: string;
}

export interface Prediction {
  label: string;
  confidence: number;
}

export interface Recommendation {
  actionText: string;
  category: 'watering' | 'light' | 'soil' | 'fertilizing' | 'pest' | 'general';
}

export interface Reminder {
  reminderId: string;
  reminderType: string;
  schedule: string;
  nextDue: string;
  enabled: boolean;
}

export interface Feedback {
  helpful: boolean;
  correct: boolean;
  comment: string;
  submittedAt: string;
}

export interface Assessment {
  assessmentId: string;
  timestamp: string;
  photoBase64?: string;
  symptomReport: SymptomReport | null;
  prediction: Prediction | null;
  recommendations: Recommendation[];
  rawAnalysis: string;
  healthScore: number; // 0-100
  clarifyingQuestions: string[];
  answers: { question: string; answer: string }[];
  feedback: Feedback | null;
}

export interface EnvironmentalDetails {
  lightLevel: 'low' | 'medium' | 'bright-indirect' | 'direct';
  placement: 'indoor' | 'outdoor';
  soilType: string;
  potSize: string;
  humidity: 'low' | 'medium' | 'high';
}

export interface Plant {
  plantId: string;
  nickname: string;
  species: string;
  createdAt: string;
  photoBase64?: string;
  reminders: Reminder[];
  assessments: Assessment[];
  environmentalDetails: EnvironmentalDetails | null;
}

// Storage helpers
const STORAGE_KEY = 'ai_plant_care_plants';

export function getPlants(): Plant[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlants(plants: Plant[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

export function getPlantById(id: string): Plant | null {
  const plants = getPlants();
  return plants.find(p => p.plantId === id) ?? null;
}

export function upsertPlant(plant: Plant): void {
  const plants = getPlants();
  const idx = plants.findIndex(p => p.plantId === plant.plantId);
  if (idx >= 0) {
    plants[idx] = plant;
  } else {
    plants.unshift(plant);
  }
  savePlants(plants);
}

export function deletePlant(id: string): void {
  const plants = getPlants().filter(p => p.plantId !== id);
  savePlants(plants);
}

export function getHealthColor(score: number): string {
  if (score >= 75) return '#3d6b3f';
  if (score >= 50) return '#8faa8b';
  if (score >= 25) return '#c4714a';
  return '#a85c37';
}

export function getHealthLabel(score: number): string {
  if (score >= 75) return 'Thriving';
  if (score >= 50) return 'Needs Attention';
  if (score >= 25) return 'Struggling';
  return 'Critical';
}
