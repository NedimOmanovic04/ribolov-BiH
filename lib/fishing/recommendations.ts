import fishData from '@/data/fish.json';
import { calculateFishingScore, FishSpecies, FishingScoreResult } from './score';
import { WeatherData } from '../weather/open-meteo';
import { AstronomyData } from '../astronomy/moon';

export interface SpeciesRecommendation {
  species: FishSpecies;
  scoreResult: FishingScoreResult;
  rank: number;
}

export type FishingCategoryFilter = 'all' | 'predator' | 'coarse_carp' | 'fly_trout' | 'carp' | 'trout';

export function getRankedSpecies(
  weather: WeatherData,
  astronomy: AstronomyData,
  filterCategory: FishingCategoryFilter = 'all'
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
    const scoreResult = calculateFishingScore({
      species,
      weather,
      astronomy
    });
    return {
      species,
      scoreResult
    };
  });

  // Sort descending by totalScore
  evaluated.sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

  return evaluated.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
