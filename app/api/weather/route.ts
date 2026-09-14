import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather/open-meteo';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat') || '43.6844'; // Default Jablaničko jezero
  const lngStr = searchParams.get('lng') || '17.8289';

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Nevažeće koordinate (lat/lng)' }, { status: 400 });
  }

  try {
    const data = await fetchWeatherData(lat, lng);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Neuspješno dohvaćanje vremenskih podataka' },
      { status: 500 }
    );
  }
}
