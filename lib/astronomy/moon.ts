import SunCalc from 'suncalc';

export interface AstronomyData {
  sunrise: string;
  sunset: string;
  dawn: string;
  dusk: string;
  moonrise: string;
  moonset: string;
  moonPhaseName: string;
  moonPhaseValue: number;
  illumination: number; // 0 - 100%
  solunarRating: 'low' | 'moderate' | 'high' | 'peak';
  solunarDescription: string;
}

export function getAstronomyData(date: Date = new Date(), lat: number = 44.1194, lng: number = 18.3656): AstronomyData {
  const times = SunCalc.getTimes(date, lat, lng);
  const moonIllum = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);

  const formatTime = (d?: Date) => {
    if (!d || isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const phaseVal = moonIllum.phase; // 0 to 1
  let moonPhaseName = 'Mladi mjesec';

  if (phaseVal > 0.03 && phaseVal < 0.22) {
    moonPhaseName = 'Rastući srp';
  } else if (phaseVal >= 0.22 && phaseVal <= 0.28) {
    moonPhaseName = 'Prva četvrt';
  } else if (phaseVal > 0.28 && phaseVal < 0.47) {
    moonPhaseName = 'Rastući mjesec';
  } else if (phaseVal >= 0.47 && phaseVal <= 0.53) {
    moonPhaseName = 'Pun mjesec';
  } else if (phaseVal > 0.53 && phaseVal < 0.72) {
    moonPhaseName = 'Opadajući mjesec';
  } else if (phaseVal >= 0.72 && phaseVal <= 0.78) {
    moonPhaseName = 'Posljednja četvrt';
  } else if (phaseVal > 0.78 && phaseVal < 0.97) {
    moonPhaseName = 'Opadajući srp';
  }

  const illuminationPct = Math.round(moonIllum.fraction * 100);

  // Determine solunar feeding activity rating based on moon phase & illumination
  let solunarRating: AstronomyData['solunarRating'] = 'moderate';
  let solunarDescription = 'Umjerena mjesečeva solunarna aktivnost';

  if (phaseVal >= 0.45 && phaseVal <= 0.55) {
    solunarRating = 'peak';
    solunarDescription = 'Vrlo visoka solunarna aktivnost oko punog mjeseca';
  } else if (phaseVal < 0.05 || phaseVal > 0.95) {
    solunarRating = 'high';
    solunarDescription = 'Povećana aktivnost tokom mladog mjeseca';
  } else if (phaseVal >= 0.20 && phaseVal <= 0.30) {
    solunarRating = 'high';
    solunarDescription = 'Dobra solunarna aktivnost uz prvu četvrt';
  }

  return {
    sunrise: formatTime(times.sunrise),
    sunset: formatTime(times.sunset),
    dawn: formatTime(times.dawn),
    dusk: formatTime(times.dusk),
    moonrise: formatTime(moonTimes.rise),
    moonset: formatTime(moonTimes.set),
    moonPhaseName,
    moonPhaseValue: phaseVal,
    illumination: illuminationPct,
    solunarRating,
    solunarDescription
  };
}
