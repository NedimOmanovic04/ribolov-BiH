import fishData from '@/data/fish.json';
import { calculateFishingScore, FishSpecies, FishingScoreResult } from './score';
import { getSpeciesPresenceForSpot, SpeciesSpotPresenceResult } from './presence';
import { WeatherData } from '../weather/open-meteo';
import { AstronomyData } from '../astronomy/moon';
import { WaterClarity, BottomStructure } from '@/types';

export interface SpeciesRecommendation {
  species: FishSpecies;
  scoreResult: FishingScoreResult;
  presence: SpeciesSpotPresenceResult;
  rank: number;
}

export type FishingCategoryFilter = 'all' | 'predator' | 'coarse_carp' | 'fly_trout' | 'carp' | 'trout';

export function getRankedSpecies(
  weather: WeatherData,
  astronomy: AstronomyData,
  filterCategory: FishingCategoryFilter = 'all',
  waterId?: string,
  cityId?: string,
  waterClarity: WaterClarity = 'bistra',
  bottomStructure: BottomStructure = 'kamen'
): SpeciesRecommendation[] {
  const allSpecies = fishData as FishSpecies[];

  let filtered = allSpecies;
  if (filterCategory === 'predator') {
    filtered = allSpecies.filter((s) => s.category === 'predator');
  } else if (filterCategory === 'coarse_carp' || filterCategory === 'carp') {
    filtered = allSpecies.filter((s) => s.category === 'coarse_carp');
  } else if (filterCategory === 'fly_trout' || filterCategory === 'trout') {
    filtered = allSpecies.filter((s) => s.category === 'fly_trout');
  }

  const evaluated: {
    species: FishSpecies;
    scoreResult: FishingScoreResult;
    presence: SpeciesSpotPresenceResult;
    effectiveScore: number;
  }[] = [];

  for (const species of filtered) {
    const presence = getSpeciesPresenceForSpot(waterId || '', cityId, species.id);

    // CRITICAL FIX: If species DOES NOT exist at this water & city, EXCLUDE it completely from recommendations!
    if (presence.isAbsent) {
      continue;
    }

    const scoreResult = calculateFishingScore({
      species,
      weather,
      astronomy,
      waterClarity,
      bottomStructure,
    });

    let effectiveScore = scoreResult.totalScore;
    if (presence.isRare) {
      effectiveScore -= 15;
    }

    evaluated.push({
      species,
      scoreResult,
      presence,
      effectiveScore,
    });
  }

  // Sort descending by effectiveScore
  evaluated.sort((a, b) => b.effectiveScore - a.effectiveScore);

  return evaluated.map((item, index) => ({
    species: item.species,
    scoreResult: item.scoreResult,
    presence: item.presence,
    rank: index + 1,
  }));
}
