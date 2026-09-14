export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  surface_pressure: number;
  time: string;
}

export interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  weather_code: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  surface_pressure: number[];
}

export interface WeatherDaily {
  time: string[];
  sunrise: string[];
  sunset: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: WeatherCurrent;
  hourly: WeatherHourly;
  daily: WeatherDaily;
  pressureTrends: {
    diff3h: number;  // pressure_now - pressure_3_hours_ago
    diff6h: number;  // pressure_now - pressure_6_hours_ago
    diff12h: number; // pressure_now - pressure_12_hours_ago
    trend: 'rapidly_rising' | 'rising' | 'stable' | 'falling' | 'rapidly_falling';
    description: string;
  };
}

export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

  const response = await fetch(url, {
    next: { revalidate: 900 } // cache for 15 minutes
  });

  if (!response.ok) {
    throw new Error(`Greška pri dohvaćanju vremenskih podataka: ${response.statusText}`);
  }

  const data = await response.json();
  const currentPressure = data.current?.surface_pressure || 1013.25;

  // Calculate pressure trends from hourly series
  const hourlyTimes: string[] = data.hourly?.time || [];
  const hourlyPressures: number[] = data.hourly?.surface_pressure || [];

  const nowIndex = hourlyTimes.findIndex((t) => new Date(t).getTime() >= Date.now()) || 0;
  const pNow = hourlyPressures[nowIndex] ?? currentPressure;
  const p3h = hourlyPressures[Math.max(0, nowIndex - 3)] ?? pNow;
  const p6h = hourlyPressures[Math.max(0, nowIndex - 6)] ?? pNow;
  const p12h = hourlyPressures[Math.max(0, nowIndex - 12)] ?? pNow;

  const diff3h = Number((pNow - p3h).toFixed(1));
  const diff6h = Number((pNow - p6h).toFixed(1));
  const diff12h = Number((pNow - p12h).toFixed(1));

  let trend: WeatherData['pressureTrends']['trend'] = 'stable';
  let description = 'Pritisak je stabilan (neutralno za ribolov)';

  if (diff6h >= 4) {
    trend = 'rapidly_rising';
    description = 'Pritisak brzo raste (riba slabije grize)';
  } else if (diff6h >= 1.5) {
    trend = 'rising';
    description = 'Pritisak umjereno raste';
  } else if (diff6h <= -4) {
    trend = 'rapidly_falling';
    description = 'Pritisak brzo pada (odlična aktivnost pred nevrijeme!)';
  } else if (diff6h <= -1.5) {
    trend = 'falling';
    description = 'Pritisak u padu (povećana aktivnost grabljivica)';
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: data.current,
    hourly: data.hourly,
    daily: data.daily,
    pressureTrends: {
      diff3h,
      diff6h,
      diff12h,
      trend,
      description
    }
  };
}

export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return 'Vedro i sunčano';
    case 1: return 'Pretežno vedro';
    case 2: return 'Djelomično oblačno';
    case 3: return 'Oblačno';
    case 45: case 48: return 'Magla / Mraz';
    case 51: case 53: case 55: return 'Sipinja rosa';
    case 61: case 63: return 'Kišovito';
    case 65: return 'Jaka kiša';
    case 71: case 73: case 75: return 'Snijeg';
    case 80: case 81: case 82: return 'Pljuskovi';
    case 95: case 96: case 99: return 'Grmljavinsko nevrijeme';
    default: return 'Umijereno vrijeme';
  }
}
