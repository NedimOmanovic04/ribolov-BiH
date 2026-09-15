export interface FishSpecies {
  id: string;
  slug: string;
  name_bs: string;
  scientific_name: string;
  category: 'predator' | 'fly_trout' | 'coarse_carp';
  image_url?: string;
  description: string;
  habitat: string[];
  temperature: {
    min: number;
    optimal_min: number;
    optimal_max: number;
    max: number;
  };
  best_times: string[];
  seasons: string[];
  weather_preferences: {
    cloud_cover: string;
    rain: string;
    wind: string;
    pressure?: string;
  };
  baits: string[];
  methods: string[];
  source_id?: string;
  confidence?: string;
  last_verified?: string;
}

export type FishPresenceLevel = 'common' | 'rare' | 'absent';

export interface CityFishPresence {
  fish_id: string;
  level: FishPresenceLevel;
  note?: string;
}

export interface WaterCity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  municipality: string;
  region?: string;
  spot_description?: string;
  fish_presence?: CityFishPresence[];
}

export interface WaterBody {
  id: string;
  slug: string;
  name: string;
  type: 'river' | 'lake' | 'reservoir';
  municipality: string;
  city: string; // Default primary city name
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  manager: string;
  fishing_rules_url: string;
  permit_url: string;
  source_id: string;
  cities?: WaterCity[]; // List of specific cities/spots along this waterbody
}

export type WaterClarity = 'bistra' | 'blago_zamucena' | 'mutna';
export type BottomStructure = 'kamen' | 'mulj' | 'trava' | 'panjevi';

export interface FishWaterRelation {
  fish_id: string;
  water_body_id: string;
  presence_level: 'low' | 'medium' | 'high' | 'absent';
  confidence: 'low' | 'medium' | 'high';
  source_id: string;
  notes: string;
}

export interface DataSource {
  id: string;
  title: string;
  type: string;
  publisher: string;
  url: string;
  verified_at: string;
  confidence: string;
  notes: string;
}

export interface FishingRule {
  fish_id: string;
  min_length_cm: number;
  closed_season: string;
  daily_limit: string;
  source_id: string;
  notes: string;
}
