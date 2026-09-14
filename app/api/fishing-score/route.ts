import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore, FishSpecies } from '@/lib/fishing/score';
import fishData from '@/data/fish.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '43.6844');
  const lng = parseFloat(searchParams.get('lng') || '17.8289');
  const speciesId = searchParams.get('speciesId') || 'common-carp';

  try {
    const weather = await fetchWeatherData(lat, lng);
    const astronomy = getAstronomyData(new Date(), lat, lng);
    const species = (fishData as FishSpecies[]).find((f) => f.id === speciesId) || fishData[0];

    const result = calculateFishingScore({
      species: species as FishSpecies,
      weather,
      astronomy
    });

    return NextResponse.json({
      species,
      weather,
      astronomy,
      scoreResult: result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
