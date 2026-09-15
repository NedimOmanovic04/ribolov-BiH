import watersData from '@/data/waters.json';
import fishData from '@/data/fish.json';
import { WaterBody, FishPresenceLevel } from '@/types';

export interface SpeciesSpotPresenceResult {
  level: FishPresenceLevel;
  note?: string;
  isAbsent: boolean;
  isRare: boolean;
  isCommon: boolean;
  warningText?: string;
}

/**
 * Check if a fish species exists at a specific waterbody and city/spot.
 */
export function getSpeciesPresenceForSpot(
  waterId: string,
  cityId: string | undefined,
  fishId: string
): SpeciesSpotPresenceResult {
  const water = (watersData as WaterBody[]).find((w) => w.id === waterId || w.slug === waterId);
  const fish = fishData.find((f) => f.id === fishId || f.slug === fishId);

  if (!water) {
    return { level: 'common', isAbsent: false, isRare: false, isCommon: true };
  }

  // Find selected city inside water, or fallback to first city
  let city = water.cities?.find((c) => c.id === cityId || c.name === cityId);
  if (!city && water.cities && water.cities.length > 0) {
    city = water.cities[0];
  }

  const presenceItem = city?.fish_presence?.find((fp) => fp.fish_id === fishId);

  let level: FishPresenceLevel = presenceItem ? presenceItem.level : 'common';
  let note = presenceItem?.note;

  // Strict fallback rules for salmonids (Mladica, Lipljen, Pastrmke) in non-salmonid waters like Bosna
  if (!presenceItem) {
    if (fishId === 'huchen') {
      if (['water-bosna', 'water-neretva', 'water-jablanicko-lake', 'water-busko-lake', 'water-modrac', 'water-bilecko-lake', 'water-ramsko-lake', 'water-boracko-lake', 'water-trebisnjica'].includes(water.id)) {
        level = 'absent';
        note = `Mladica ne obitava u vodi ${water.name}.`;
      }
    } else if (['brown-trout', 'grayling', 'rainbow-trout', 'softmouth-trout', 'marble-trout-glavatica', 'lake-trout'].includes(fishId)) {
      if (water.id === 'water-bosna' && city?.id !== 'bosna-sarajevo') {
        level = 'absent';
        note = `Potočna pastrmka i lipljen ne obitavaju u tolim mrenskim vodama rijeke Bosne kod mjesta ${city?.name || 'ovdje'}. Dominantne vrste su Klen, Mrena, Škobalj, Som i Štuka.`;
      } else if (['water-busko-lake', 'water-modrac', 'water-bilecko-lake'].includes(water.id)) {
        level = 'absent';
        note = `Pastrmka i lipljen ne obitavaju u jezeru ${water.name}. Ovo je šaransko/smuđarsko stanište.`;
      }
    }
  }

  const isAbsent = level === 'absent';
  const isRare = level === 'rare';
  const isCommon = level === 'common';

  let warningText: string | undefined;
  const fishName = fish ? fish.name_bs : 'Ova vrsta';
  const spotName = city ? `${water.name} (${city.name})` : water.name;

  if (isAbsent) {
    warningText = note
      ? `${fishName}: ${note}`
      : `${fishName} ne postoji na lokaciji ${spotName}. Preporučujemo odabir dominantnih vrsta poput Klena, Mrene, Škobalja ili Soma.`;
  } else if (isRare) {
    warningText = note
      ? `${fishName}: ${note}`
      : `${fishName} je rijetka vrsta na lokaciji ${spotName}. Šanse za ulov su smanjene.`;
  }

  return {
    level,
    note,
    isAbsent,
    isRare,
    isCommon,
    warningText,
  };
}
