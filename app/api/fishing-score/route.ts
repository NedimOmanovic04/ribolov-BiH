import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore } from '@/lib/fishing/score';
import { getSpeciesPresenceForSpot } from '@/lib/fishing/presence';
import fishData from '@/data/fish.json';
import { FishSpecies, WaterClarity, BottomStructure } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '43.9889');
  const lng = parseFloat(searchParams.get('lng') || '18.1781');
  const waterId = searchParams.get('waterId') || 'water-bosna';
  const cityId = searchParams.get('cityId') || 'bosna-visoko';
  const speciesId = searchParams.get('speciesId') || 'chub';
  const clarity = (searchParams.get('clarity') || 'bistra') as WaterClarity;
  const bottom = (searchParams.get('bottom') || 'kamen') as BottomStructure;

  try {
    const weather = await fetchWeatherData(lat, lng);
    const astronomy = getAstronomyData(new Date(), lat, lng);
    const species = (fishData as FishSpecies[]).find((f) => f.id === speciesId) || (fishData[0] as FishSpecies);
    const presence = getSpeciesPresenceForSpot(waterId, cityId, species.id);

    const scoreResult = calculateFishingScore({
      species,
      weather,
      astronomy,
      waterClarity: clarity,
      bottomStructure: bottom,
    });

    return NextResponse.json({
      species,
      weather,
      astronomy,
      presence,
      scoreResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
