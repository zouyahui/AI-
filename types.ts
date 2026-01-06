export enum GardenStyle {
  COTTAGE = 'English Cottage',
  ZEN = 'Japanese Zen',
  MODERN = 'Modern Minimalist',
  TROPICAL = 'Lush Tropical',
  DESERT = 'Desert Xeriscape',
  MEDITERRANEAN = 'Mediterranean',
}

export interface GardenPreferences {
  style: GardenStyle;
  size: string; // e.g., "Small backyard", "Large estate"
  climate: string; // e.g., "Sunny", "Shady", "Zone 9"
  features: string[]; // e.g., ["Pond", "Bench", "Vegetable patch"]
  description: string;
}

export interface Plant {
  name: string;
  scientificName: string;
  description: string;
  careLevel: 'Easy' | 'Moderate' | 'Expert';
}

export interface GardenPlan {
  title: string;
  layoutDescription: string;
  plants: Plant[];
  maintenanceTips: string[];
}

export interface GeneratedImage {
  data: string; // Base64
  mimeType: string;
}
