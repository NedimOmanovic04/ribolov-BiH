import { WeatherData } from '../weather/open-meteo';
import { AstronomyData } from '../astronomy/moon';

export interface FishSpecies {
  id: string;
  slug: string;
  name_bs: string;
  scientific_name: string;
  category: 'predator' | 'fly_trout' | 'coarse_carp';
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

export interface FactorBreakdown {
  temperature: number;      // 0 - 20
  pressure: number;         // 0 - 15
  pressureTrend: number;    // 0 - 10
  wind: number;             // 0 - 10
  precipitation: number;    // 0 - 5
  cloudCover: number;       // 0 - 10
  timeOfDay: number;        // 0 - 15
  season: number;           // 0 - 10
  moon: number;             // 0 - 5
}

export interface BestPeriod {
  start: string;
  end: string;
  score: number;
  reason?: string;
}

export interface HourlyScoreItem {
  hour: number;
  timeStr: string;
  score: number;
  isPeak: boolean;
  temp: number;
  weatherCode: number;
}

export interface FishingScoreResult {
  totalScore: number; // 0 - 100
  category: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  categoryLabel: string; // e.g. "VRLO DOBRI USLOVI"
  factors: FactorBreakdown;
  bestPeriods: BestPeriod[];
  hourlyScores: HourlyScoreItem[];
  recommendations: string[];
  disclaimer: string;
}

export interface CalculateScoreParams {
  species: FishSpecies;
  weather: WeatherData;
  astronomy: AstronomyData;
  date?: Date;
  location?: { lat: number; lng: number; name?: string };
}

// Helper to format bait & method strings cleanly (removes underscores and capitalizes words)
export function formatLabel(text: string): string {
  if (!text) return '';
  return text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function calculateFishingScore({
  species,
  weather,
  astronomy,
  date = new Date(),
}: CalculateScoreParams): FishingScoreResult {
  const currentTemp = weather.current.temperature_2m;
  const currentCloud = weather.current.cloud_cover;
  const currentWind = weather.current.wind_speed_10m;
  const currentRain = weather.current.precipitation;
  const currentPressure = weather.current.surface_pressure;
  const diff6h = weather.pressureTrends.diff6h;
  const moonPhaseVal = astronomy.moonPhaseValue; // 0 to 1 (0.5 = full moon)
  const isFullMoon = moonPhaseVal >= 0.44 && moonPhaseVal <= 0.56;
  const isNewMoon = moonPhaseVal <= 0.06 || moonPhaseVal >= 0.94;

  // --- 1. Temperature Score (Max 20 pts) ---
  let tempScore = 10;
  const optMin = species.temperature.optimal_min;
  const optMax = species.temperature.optimal_max;
  const minTemp = species.temperature.min;
  const maxTemp = species.temperature.max;

  if (currentTemp >= optMin && currentTemp <= optMax) {
    tempScore = 20;
  } else if (currentTemp >= minTemp && currentTemp <= maxTemp) {
    const dist = Math.min(Math.abs(currentTemp - optMin), Math.abs(currentTemp - optMax));
    tempScore = Math.max(8, Math.round(20 - dist * 1.5));
  } else {
    tempScore = 4;
  }

  // --- 2. Barometric Pressure Baseline Score (Max 15 pts) ---
  let pressureScore = 10;
  if (currentPressure >= 1010 && currentPressure <= 1020) {
    pressureScore = 15;
  } else if (currentPressure > 1020) {
    pressureScore = species.category === 'fly_trout' ? 14 : 11;
  } else {
    pressureScore = species.category === 'predator' ? 14 : 9;
  }

  // --- 3. Pressure Trend Score per Species (Max 10 pts) ---
  let trendScore = 6;
  if (diff6h <= -3) {
    // Rapidly falling pressure
    if (['common-carp', 'wels-catfish', 'pike', 'zander'].includes(species.id)) {
      trendScore = 10; // Carp, Catfish, Pike feed aggressively on sharp pressure drops!
    } else {
      trendScore = 7;
    }
  } else if (diff6h <= -1) {
    // Slightly falling pressure -> Excellent for Carp & Predators
    if (['common-carp', 'wels-catfish', 'zander', 'pike', 'barbel'].includes(species.id)) {
      trendScore = 10;
    } else {
      trendScore = 8;
    }
  } else if (Math.abs(diff6h) < 1) {
    // Stable pressure -> Ideal for Grayling & Chub
    trendScore = species.category === 'fly_trout' ? 10 : 8;
  } else if (diff6h >= 3) {
    // Rapidly rising pressure
    trendScore = 3;
  }

  // --- 4. Wind Score (Max 10 pts) ---
  let windScore = 7;
  if (currentWind <= 5) {
    windScore = species.category === 'fly_trout' ? 10 : 7;
  } else if (currentWind <= 15) {
    windScore = species.category === 'predator' || species.id === 'common-carp' ? 10 : 8;
  } else if (currentWind <= 25) {
    windScore = 5;
  } else {
    windScore = 2;
  }

  // --- 5. Precipitation Score (Max 5 pts) ---
  let rainScore = 3;
  if (currentRain === 0) {
    rainScore = 4;
  } else if (currentRain > 0 && currentRain <= 2.5) {
    rainScore = 5; // Light rain boosts oxygen & feeding
  } else {
    rainScore = 2;
  }

  // --- 6. Cloud Cover Score (Max 10 pts) ---
  let cloudScore = 5;
  if (species.weather_preferences.cloud_cover.includes('high') || species.category === 'predator') {
    cloudScore = currentCloud >= 50 ? 10 : 6;
  } else if (species.weather_preferences.cloud_cover.includes('light')) {
    cloudScore = currentCloud <= 40 ? 10 : 6;
  } else {
    cloudScore = 8;
  }

  // --- 7. Time of Day Score (Max 15 pts) ---
  const currentHour = date.getHours();
  let timeScore = 8;

  const isDawnOrDusk = (currentHour >= 5 && currentHour <= 8) || (currentHour >= 18 && currentHour <= 21);
  const isNight = currentHour >= 22 || currentHour <= 4;

  if (isDawnOrDusk) {
    timeScore = 15;
  } else if (isNight) {
    if (['zander', 'wels-catfish', 'huchen', 'common-carp'].includes(species.id)) {
      timeScore = 14;
    } else {
      timeScore = 4;
    }
  } else {
    if (['grayling', 'chub', 'grass-carp'].includes(species.id)) {
      timeScore = 12;
    } else {
      timeScore = 8;
    }
  }

  // --- 8. Season Score (Max 10 pts) ---
  const month = date.getMonth();
  let seasonName = 'winter';
  if (month >= 2 && month <= 4) seasonName = 'spring';
  else if (month >= 5 && month <= 7) seasonName = 'summer';
  else if (month >= 8 && month <= 10) seasonName = 'autumn';

  const seasonScore = species.seasons.includes(seasonName) ? 10 : 5;

  // --- 9. Moon Score per Species (Max 5 pts) ---
  let moonScore = 3;
  if (species.id === 'common-carp' || species.id === 'wels-catfish' || species.id === 'zander') {
    // Carp, Catfish, Zander feed heavily during Full Moon & New Moon
    if (isFullMoon) moonScore = 5;
    else if (isNewMoon) moonScore = 4;
    else if (astronomy.solunarRating === 'peak') moonScore = 5;
  } else {
    if (astronomy.solunarRating === 'peak') moonScore = 5;
    else if (astronomy.solunarRating === 'high') moonScore = 4;
  }

  // --- Total Score Sum ---
  const factors: FactorBreakdown = {
    temperature: tempScore,
    pressure: pressureScore,
    pressureTrend: trendScore,
    wind: windScore,
    precipitation: rainScore,
    cloudCover: cloudScore,
    timeOfDay: timeScore,
    season: seasonScore,
    moon: moonScore,
  };

  const totalScore = Math.min(
    100,
    Math.max(
      10,
      tempScore + pressureScore + trendScore + windScore + rainScore + cloudScore + timeScore + seasonScore + moonScore
    )
  );

  let category: FishingScoreResult['category'] = 'good';
  let categoryLabel = 'DOBRI USLOVI';

  if (totalScore >= 85) {
    category = 'excellent';
    categoryLabel = 'IZVRSNI USLOVI';
  } else if (totalScore >= 75) {
    category = 'very_good';
    categoryLabel = 'VRLO DOBRI USLOVI';
  } else if (totalScore >= 60) {
    category = 'good';
    categoryLabel = 'DOBRI USLOVI';
  } else if (totalScore >= 45) {
    category = 'fair';
    categoryLabel = 'OSREDNJI USLOVI';
  } else {
    category = 'poor';
    categoryLabel = 'SLABI USLOVI';
  }

  // --- Calculate Hourly Scores Series tailored specifically to THIS species (00:00 - 23:00) ---
  const hourlyScores: HourlyScoreItem[] = [];
  const hourlyTimes = weather.hourly.time || [];
  const hourlyTemps = weather.hourly.temperature_2m || [];
  const hourlyCodes = weather.hourly.weather_code || [];

  for (let h = 0; h < 24; h++) {
    const idx = Math.min(h, hourlyTimes.length - 1);
    const hTemp = hourlyTemps[idx] ?? currentTemp;

    // Time of day multiplier tailored per species!
    let hTimeFactor = 8;
    const isHDawn = h >= 5 && h <= 8;
    const isHDusk = h >= 18 && h <= 21;
    const isHNight = h >= 22 || h <= 4;
    const isHMidday = h >= 11 && h <= 15;

    if (species.best_times.includes('early_morning') && isHDawn) hTimeFactor = 15;
    else if (species.best_times.includes('dusk') && isHDusk) hTimeFactor = 15;
    else if (species.best_times.includes('night') && isHNight) hTimeFactor = 15;
    else if (species.best_times.includes('midday') && isHMidday) hTimeFactor = 14;
    else if (isHDawn || isHDusk) hTimeFactor = 13;
    else if (isHNight && ['zander', 'wels-catfish', 'huchen', 'common-carp'].includes(species.id)) {
      hTimeFactor = 14;
    }

    // Extra bonus if Carp + Full Moon + Night/Dusk
    let hMoonBonus = moonScore;
    if (species.id === 'common-carp' && isFullMoon && (isHDusk || isHNight)) {
      hMoonBonus = 5;
      hTimeFactor = Math.max(hTimeFactor, 15);
    }

    let hTempFactor = 10;
    if (hTemp >= optMin && hTemp <= optMax) hTempFactor = 20;

    const hScore = Math.min(
      100,
      Math.max(
        15,
        hTempFactor + pressureScore + trendScore + windScore + rainScore + cloudScore + hTimeFactor + seasonScore + hMoonBonus
      )
    );

    hourlyScores.push({
      hour: h,
      timeStr: `${h.toString().padStart(2, '0')}:00`,
      score: hScore,
      isPeak: hScore >= 80,
      temp: Math.round(hTemp),
      weatherCode: hourlyCodes[idx] || 0,
    });
  }

  // --- DYNAMIC BEST PERIODS CALCULATION FOR THIS SPECIFIC SPECIES ---
  // Find top contiguous 2-hour or 3-hour windows in the 24-hour cycle
  const periodCandidates: { startHour: number; endHour: number; avgScore: number; reason: string }[] = [];

  for (let h = 0; h < 24; h++) {
    const h1 = hourlyScores[h];
    const h2 = hourlyScores[(h + 1) % 24];
    const h3 = hourlyScores[(h + 2) % 24];
    const avgScore = Math.round((h1.score + h2.score + h3.score) / 3);

    let reason = 'Optimalni vremenski uslovi';
    if (species.id === 'common-carp' && isFullMoon) {
      reason = 'Pun mjesec + noćna aktivnost šarana';
    } else if (species.id === 'common-carp' && diff6h <= -1) {
      reason = 'Pritisak u blagom padu (Šaran intenzivno uzima)';
    } else if (species.category === 'predator' && diff6h <= -2) {
      reason = 'Pad pritiska stimulira agresivni napad grabljivica';
    } else if (species.category === 'fly_trout' && (h >= 5 && h <= 8)) {
      reason = 'Jutarnji izlazak insekata (Suha muha)';
    } else if (['zander', 'wels-catfish'].includes(species.id) && (h >= 19 || h <= 4)) {
      reason = 'Noćni lov uz obalu';
    }

    periodCandidates.push({
      startHour: h,
      endHour: (h + 3) % 24,
      avgScore,
      reason,
    });
  }

  // Sort candidates by score descending and select top 2 non-overlapping windows
  periodCandidates.sort((a, b) => b.avgScore - a.avgScore);

  const bestPeriods: BestPeriod[] = [];
  if (periodCandidates.length > 0) {
    const p1 = periodCandidates[0];
    bestPeriods.push({
      start: `${p1.startHour.toString().padStart(2, '0')}:00`,
      end: `${p1.endHour.toString().padStart(2, '0')}:00`,
      score: p1.avgScore,
      reason: p1.reason,
    });

    // Find second non-overlapping window
    const p2 = periodCandidates.find(
      (p) => Math.abs(p.startHour - p1.startHour) >= 4 && Math.abs(p.startHour - p1.startHour) <= 20
    );
    if (p2) {
      bestPeriods.push({
        start: `${p2.startHour.toString().padStart(2, '0')}:00`,
        end: `${p2.endHour.toString().padStart(2, '0')}:00`,
        score: p2.avgScore,
        reason: p2.reason,
      });
    }
  }

  // Tactical Recommendations
  const formattedBaits = species.baits.map(formatLabel);
  const formattedMethods = species.methods.map(formatLabel);

  const recommendations: string[] = [];
  if (formattedBaits.length > 0) {
    recommendations.push(`Preporučeni mamci: ${formattedBaits.slice(0, 4).join(', ')}.`);
  }
  if (formattedMethods.length > 0) {
    recommendations.push(`Preporučene tehnike: ${formattedMethods.slice(0, 3).join(', ')}.`);
  }
  if (species.id === 'common-carp') {
    if (isFullMoon && diff6h <= -0.5) {
      recommendations.push('🔥 ŠARAN HOT PERIOD: Pun mjesec i pritisak u blagom padu – vrhunski tajming!');
    } else if (diff6h <= -1) {
      recommendations.push('Pritisak je u padu – šaran napušta dubinu i aktivno traži hranu.');
    }
  } else if (species.category === 'predator' && diff6h <= -2) {
    recommendations.push('Nagli pad pritiska – pojačajte agresivnost prezentacije voblera ili gume!');
  } else if (currentCloud >= 60) {
    recommendations.push('Oblačno vrijeme pruža idealan zaklon za napad grabljivica u plićaku.');
  }

  return {
    totalScore,
    category,
    categoryLabel,
    factors,
    bestPeriods,
    hourlyScores,
    recommendations,
    disclaimer:
      'Procjena ribolovnih uslova bazirana je na atmosferskim i solunarnim algoritmima. Temperatura zraka se razlikuje od temperature vode.',
  };
}
