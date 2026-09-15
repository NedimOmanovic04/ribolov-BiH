import watersData from '@/data/waters.json';

export interface LocationSearchResult {
  id: string;
  name: string;
  type: 'city' | 'water';
  municipality?: string;
  region?: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const results: LocationSearchResult[] = [];
  const cleanQuery = query.toLowerCase().trim();

  // 1. Search local water bodies dataset
  const matchingWaters = watersData.filter((w) =>
    w.name.toLowerCase().includes(cleanQuery) ||
    w.municipality.toLowerCase().includes(cleanQuery) ||
    w.city.toLowerCase().includes(cleanQuery) ||
    w.description.toLowerCase().includes(cleanQuery)
  );

  matchingWaters.forEach((w) => {
    results.push({
      id: w.id,
      name: w.name,
      type: 'water',
      municipality: w.municipality,
      region: w.region,
      latitude: w.latitude,
      longitude: w.longitude,
      country: 'Bosna i Hercegovina'
    });
  });

  // 2. Query Open-Meteo Geocoding API for cities/settlements
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=bs&format=json`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((item: any) => {
          const isBiH = item.country_code === 'BA' || item.country === 'Bosnia and Herzegovina';
          results.push({
            id: `geo-${item.id}`,
            name: item.name,
            type: 'city',
            municipality: item.admin2 || item.admin1,
            region: isBiH ? (item.admin1 || 'BiH') : item.country,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country || 'BiH'
          });
        });
      }
    }
  } catch (err) {
    console.error('Open-Meteo Geocoding search error:', err);
  }

  return results.slice(0, 10);
}

// Reverse Geocode precise GPS coordinates to exact village / suburb / city name (e.g. Donje Moštre)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RibolovBiH-App/1.0',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.address) {
        const addr = data.address;
        const exactName =
          addr.village ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.hamlet ||
          addr.town ||
          addr.city ||
          addr.municipality ||
          addr.county;

        if (exactName) {
          return exactName;
        }
      }
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
  }

  // Fallback: check nearest known water body
  const nearestWater = watersData.reduce((prev, curr) => {
    const dPrev = calculateDistanceKm(lat, lng, prev.latitude, prev.longitude);
    const dCurr = calculateDistanceKm(lat, lng, curr.latitude, curr.longitude);
    return dCurr < dPrev ? curr : prev;
  });

  if (nearestWater && calculateDistanceKm(lat, lng, nearestWater.latitude, nearestWater.longitude) <= 15) {
    return nearestWater.name;
  }

  return 'Moja Lokacija';
}

// Calculate Haversine distance between two lat/lng points in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
