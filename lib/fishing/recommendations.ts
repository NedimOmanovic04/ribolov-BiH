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

  const evaluated = filtered.map((species) => {
    const presence = getSpeciesPresenceForSpot(waterId || '', cityId, species.id);
    const scoreResult = calculateFishingScore({
      species,
      weather,
      astronomy,
      waterClarity,
      bottomStructure,
    });

    // If species is absent at this spot, heavily penalize its display score for ranking
    let effectiveScore = scoreResult.totalScore;
    if (presence.isAbsent) {
      effectiveScore = -100; // Push absent species to the very bottom
    } else if (presence.isRare) {
      effectiveScore -= 15;
    }

    return {
      species,
      scoreResult,
      presence,
      effectiveScore,
    };
  });

  // Sort descending by effectiveScore
  evaluated.sort((a, b) => b.effectiveScore - a.effectiveScore);

  return evaluated.map((item, index) => ({
    species: item.species,
    scoreResult: item.scoreResult,
    presence: item.presence,
    rank: index + 1,
  }));
}
