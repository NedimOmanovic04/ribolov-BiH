'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Fish, Clock, Target, AlertTriangle, Info, Layers, Droplets, CheckCircle2 } from 'lucide-react';
import watersData from '@/data/waters.json';
import fishData from '@/data/fish.json';
import { WaterBody, WaterCity, WaterClarity, BottomStructure } from '@/types';
import { fetchWeatherData, WeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData, AstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore, FishingScoreResult, formatLabel } from '@/lib/fishing/score';
import { getSpeciesPresenceForSpot, SpeciesSpotPresenceResult } from '@/lib/fishing/presence';
import { formatDateFull } from '@/lib/utils/dates';

interface FishingPlannerProps {
  onLocationChange?: (lat: number, lng: number, name: string) => void;
  onSpeciesChange?: (speciesId: string) => void;
  initialWaterId?: string;
  initialCityId?: string;
  initialFishId?: string;
}

export default function FishingPlanner({
  onLocationChange,
  onSpeciesChange,
  initialWaterId = 'water-bosna',
  initialCityId = 'bosna-visoko',
  initialFishId = 'chub',
}: FishingPlannerProps) {
  const [selectedWaterId, setSelectedWaterId] = useState<string>(initialWaterId);
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCityId);
  const [selectedFishId, setSelectedFishId] = useState<string>(initialFishId);
  const [planDateStr, setPlanDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [waterClarity, setWaterClarity] = useState<WaterClarity>('bistra');
  const [bottomStructure, setBottomStructure] = useState<BottomStructure>('kamen');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);
  const [scoreResult, setScoreResult] = useState<FishingScoreResult | null>(null);
  const [presenceResult, setPresenceResult] = useState<SpeciesSpotPresenceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const waters = watersData as WaterBody[];
  const selectedWater = waters.find((w) => w.id === selectedWaterId) || waters[0];
  const currentCities: WaterCity[] = selectedWater.cities || [];

  const handleWaterChange = (wId: string) => {
    setSelectedWaterId(wId);
    const newWater = waters.find((w) => w.id === wId);
    if (newWater && newWater.cities && newWater.cities.length > 0) {
      const firstCity = newWater.cities[0];
      setSelectedCityId(firstCity.id);
      if (onLocationChange) {
        onLocationChange(firstCity.latitude, firstCity.longitude, `${newWater.name} (${firstCity.name})`);
      }
    } else if (newWater) {
      setSelectedCityId('');
      if (onLocationChange) {
        onLocationChange(newWater.latitude, newWater.longitude, newWater.name);
      }
    }
  };

  const handleCityChange = (cId: string) => {
    setSelectedCityId(cId);
    const city = currentCities.find((c) => c.id === cId);
    if (city && onLocationChange) {
      onLocationChange(city.latitude, city.longitude, `${selectedWater.name} (${city.name})`);
    }
  };

  const handleFishChange = (fId: string) => {
    setSelectedFishId(fId);
    if (onSpeciesChange) {
      onSpeciesChange(fId);
    }
  };

  useEffect(() => {
    async function calculatePlan() {
      const city = currentCities.find((c) => c.id === selectedCityId) || currentCities[0];
      const lat = city ? city.latitude : selectedWater.latitude;
      const lng = city ? city.longitude : selectedWater.longitude;
      const targetFish = fishData.find((f) => f.id === selectedFishId) || fishData[0];

      setLoading(true);
      try {
        const wData = await fetchWeatherData(lat, lng);
        const planDateObj = new Date(planDateStr + 'T12:00:00');
        const aData = getAstronomyData(planDateObj, lat, lng);

        const presence = getSpeciesPresenceForSpot(selectedWater.id, city?.id, targetFish.id);
        const score = calculateFishingScore({
          species: targetFish as any,
          weather: wData,
          astronomy: aData,
          date: planDateObj,
          waterClarity,
          bottomStructure,
        });

        setWeather(wData);
        setAstronomy(aData);
        setPresenceResult(presence);
        setScoreResult(score);
      } catch (err) {
        console.error('Error calculating fishing plan:', err);
      } finally {
        setLoading(false);
      }
    }

    calculatePlan();
  }, [selectedWaterId, selectedCityId, selectedFishId, planDateStr, waterClarity, bottomStructure]);

  const selectedFishObj = fishData.find((f) => f.id === selectedFishId) || fishData[0];
  const selectedCityObj = currentCities.find((c) => c.id === selectedCityId) || currentCities[0];

  return (
    <div className="panel-outdoors rounded-lg border border-[#274535] overflow-hidden shadow-2xl space-y-0">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#14231b] via-[#182820] to-[#0e1712] p-5 border-b border-[#274535] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#4ca778]" />
            PLANER RIBOLOVA BIH
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-0.5">
            Prognoza i Taktički Vodič za Teren
          </h2>
          <p className="text-xs text-[#8ea396] font-sans mt-0.5">
            Odaberite vodu, grad ili mjesto, ciljnu vrstu te mutnoću vode i dno za procjenu uslova.
          </p>
        </div>

        {scoreResult && (
          <div className="flex items-center gap-3 bg-[#0e1712] border border-[#274535] px-4 py-2 rounded-lg">
            <div className="text-right">
              <div className="text-xs text-[#8ea396] font-serif uppercase">Indeks Ulova</div>
              <div className="text-2xl font-black text-white font-serif">
                {scoreResult.totalScore}<span className="text-xs text-[#4ca778]">/100</span>
              </div>
            </div>
            <div className="text-xs font-bold px-2.5 py-1 rounded bg-[#274535] text-[#4ca778] uppercase font-serif">
              {scoreResult.categoryLabel}
            </div>
          </div>
        )}
      </div>

      {/* Form Controls Grid */}
      <div className="p-5 bg-[#121c17] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4ca778]" /> Datum Izleta
            </label>
            <input
              type="date"
              value={planDateStr}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              onChange={(e) => setPlanDateStr(e.target.value)}
              className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] font-mono cursor-pointer"
            />
            <div className="text-[11px] text-[#4ca778] font-mono">
              {formatDateFull(new Date(planDateStr + 'T12:00:00'))}
            </div>
          </div>

          {/* 2. Waterbody Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4ca778]" /> Voda (Rijeka / Jezero)
            </label>
            <select
              value={selectedWaterId}
              onChange={(e) => handleWaterChange(e.target.value)}
              className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
            >
              {waters.map((w) => (
                <option key={w.id} value={w.id} className="bg-[#0e1712]">
                  {w.name}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-[#8ea396] font-serif truncate">
              Upravitelj: {selectedWater.manager}
            </div>
          </div>

          {/* 3. Cascading City / Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4ca778]" /> Grad / Mjesto
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
            >
              {currentCities.length > 0 ? (
                currentCities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0e1712]">
                    {c.name} ({c.municipality})
                  </option>
                ))
              ) : (
                <option value="" className="bg-[#0e1712]">
                  {selectedWater.city}
                </option>
              )}
            </select>
            <div className="text-[11px] text-[#4ca778] font-serif truncate">
              {selectedCityObj ? selectedCityObj.spot_description : selectedWater.description}
            </div>
          </div>

          {/* 4. Target Fish Species Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5 text-[#4ca778]" /> Ciljna Riba
            </label>
            <select
              value={selectedFishId}
              onChange={(e) => handleFishChange(e.target.value)}
              className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
            >
              {fishData.map((f) => {
                const presence = getSpeciesPresenceForSpot(selectedWaterId, selectedCityId, f.id);
                let badgeText = '[Česta]';
                if (presence.isAbsent) badgeText = '[Ne postoji]';
                else if (presence.isRare) badgeText = '[Rijetka]';

                return (
                  <option key={f.id} value={f.id} className="bg-[#0e1712]">
                    {f.name_bs} {badgeText}
                  </option>
                );
              })}
            </select>
            <div className="text-[11px] text-[#8ea396] font-serif truncate">
              Kategorija: {selectedFishObj.category === 'predator' ? 'Grabljivica' : selectedFishObj.category === 'fly_trout' ? 'Salmonid' : 'Mirna riba'}
            </div>
          </div>

        </div>

        {/* Tactical Parameters Row: Water Clarity & Bottom Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1f3629]">
          
          {/* Water Clarity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#2b87be]" /> Mutnoća i Prozirnost Vode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWaterClarity('bistra')}
                className={`py-2 px-2 text-xs rounded border text-center transition-colors font-medium ${
                  waterClarity === 'bistra'
                    ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Bistra
              </button>
              <button
                type="button"
                onClick={() => setWaterClarity('blago_zamucena')}
                className={`py-2 px-2 text-xs rounded border text-center transition-colors font-medium ${
                  waterClarity === 'blago_zamucena'
                    ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Blago zamućena
              </button>
              <button
                type="button"
                onClick={() => setWaterClarity('mutna')}
                className={`py-2 px-2 text-xs rounded border text-center transition-colors font-medium ${
                  waterClarity === 'mutna'
                    ? 'bg-[#473d34] text-amber-200 border-amber-500 font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Mutna / Visoka
              </button>
            </div>
          </div>

          {/* Bottom Structure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#c49f6e]" /> Struktura Dna Vode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setBottomStructure('kamen')}
                className={`py-2 px-1 text-[11px] rounded border text-center transition-colors font-medium ${
                  bottomStructure === 'kamen'
                    ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Kamen
              </button>
              <button
                type="button"
                onClick={() => setBottomStructure('mulj')}
                className={`py-2 px-1 text-[11px] rounded border text-center transition-colors font-medium ${
                  bottomStructure === 'mulj'
                    ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Mulj
              </button>
              <button
                type="button"
                onClick={() => setBottomStructure('trava')}
                className={`py-2 px-1 text-[11px] rounded border text-center transition-colors font-medium ${
                  bottomStructure === 'trava'
                    ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Trava
              </button>
              <button
                type="button"
                onClick={() => setBottomStructure('panjevi')}
                className={`py-2 px-1 text-[11px] rounded border text-center transition-colors font-medium ${
                  bottomStructure === 'panjevi'
                    ? 'bg-[#473d34] text-amber-200 border-amber-500 font-bold shadow'
                    : 'bg-[#182820] text-[#8ea396] border-[#274535] hover:text-white'
                }`}
              >
                Panjevi
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PLANNER RESULTS DISPLAY */}
      {loading ? (
        <div className="p-8 bg-[#0e1712] border-t border-[#1f3629] text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#4ca778] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#8ea396] font-serif">Očitavanje meteoroloških stanica i proračun uslova...</p>
        </div>
      ) : scoreResult && presenceResult && (
        <div className="p-5 bg-[#0e1712] border-t border-[#274535] space-y-4">
          
          {/* CRITICAL WARNING: If fish is ABSENT or RARE on this spot */}
          {presenceResult.isAbsent && (
            <div className="bg-[#3a1919] border border-rose-700 text-rose-100 p-4 rounded-lg flex items-start gap-3 text-xs shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-white font-serif">
                  Upozorenje o biološkoj prisutnosti vrste: {selectedFishObj.name_bs}
                </div>
                <p className="text-rose-200 leading-relaxed font-sans">
                  {presenceResult.warningText || `Na lokaciji ${selectedWater.name} (${selectedCityObj?.name}) nema ove vrste ribe ili se pojavljuje izuzetno rijetko.`}
                </p>
                <div className="text-[11px] text-amber-300 font-semibold pt-1">
                  Savjet: Odaberite neku od dominantnih vrsta na ovoj vodi (npr. Klen, Mrena, Škobalj, Som, Štuka).
                </div>
              </div>
            </div>
          )}

          {presenceResult.isRare && !presenceResult.isAbsent && (
            <div className="bg-[#473d34] border border-amber-600 text-amber-100 p-3.5 rounded-lg flex items-start gap-3 text-xs">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white font-serif">Rijetka vrsta na ovom dijelu vode</div>
                <p className="mt-0.5">{presenceResult.warningText}</p>
              </div>
            </div>
          )}

          {/* Results Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Score & Best Period Card */}
            <div className="bg-[#182820] p-4 rounded-lg border border-[#274535] space-y-3">
              <div className="text-xs font-serif font-bold uppercase text-[#c49f6e]">Ocjena Ulovnosti Za Cilj</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-white font-serif">{scoreResult.totalScore}<span className="text-xs text-[#4ca778]">/100</span></div>
                  <div className="text-xs font-bold text-[#4ca778] uppercase">{scoreResult.categoryLabel}</div>
                </div>
                {selectedFishObj.image_url && (
                  <img src={selectedFishObj.image_url} alt={selectedFishObj.name_bs} className="w-16 h-12 object-cover rounded border border-[#274535]" />
                )}
              </div>
              <div className="text-xs text-[#8ea396] pt-1 border-t border-[#1f3629]">
                Ciljna vrsta: <strong className="text-white">{selectedFishObj.name_bs}</strong> u <strong className="text-white">{selectedCityObj ? selectedCityObj.name : selectedWater.city}</strong>
              </div>
            </div>

            {/* Hot Intervals */}
            <div className="bg-[#182820] p-4 rounded-lg border border-[#274535] space-y-2 md:col-span-2">
              <div className="text-xs font-serif font-bold uppercase text-[#c49f6e] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#4ca778]" /> Najbolji Intervali Tokom Dana:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scoreResult.bestPeriods.map((period, idx) => (
                  <div key={idx} className="bg-[#121c17] p-2.5 rounded border border-[#274535] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono">{period.start} – {period.end}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#274535] text-[#4ca778] font-bold">
                        {period.score}%
                      </span>
                    </div>
                    {period.reason && (
                      <span className="text-[11px] text-[#c49f6e] font-serif mt-1">{period.reason}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Tactical Recommendations Grid: Clarity Tip & Bottom Rig Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            {/* Water Clarity Advice */}
            <div className="bg-[#14231b] p-3.5 rounded-lg border border-[#274535] space-y-1">
              <div className="font-bold text-[#c49f6e] font-serif flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#2b87be]" /> Savjet za prozirnost vode:
              </div>
              <p className="text-[#d5d1c3] leading-relaxed">{scoreResult.clarityTip}</p>
            </div>

            {/* Bottom Structure Advice */}
            <div className="bg-[#14231b] p-3.5 rounded-lg border border-[#274535] space-y-1">
              <div className="font-bold text-[#c49f6e] font-serif flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#c49f6e]" /> Montaža i varalica za dno vode:
              </div>
              <p className="text-[#d5d1c3] leading-relaxed">{scoreResult.bottomTip}</p>
            </div>

          </div>

          {/* General Baits & Methods Row */}
          <div className="bg-[#182820] p-3.5 rounded-lg border border-[#274535] space-y-2 text-xs">
            <div className="font-bold text-white font-serif">Preporučeni mamci i tehnike za {selectedFishObj.name_bs}:</div>
            <div className="flex flex-wrap gap-2">
              {selectedFishObj.baits.map((bait, idx) => (
                <span key={bait} className="px-2.5 py-1 bg-[#121c17] text-[#e8e5db] rounded border border-[#274535] font-medium text-[11px]">
                  {formatLabel(bait)}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-[#8ea396] font-serif pt-1">
              Tehnike: <span className="text-[#d5d1c3] font-semibold">{selectedFishObj.methods.map(formatLabel).join(', ')}</span>
            </div>
          </div>

          {/* FISHERMAN REALISM DISCLAIMER NOTICE */}
          <div className="bg-[#14231b] border border-[#274535] rounded-lg p-3.5 flex items-start gap-3 text-xs text-[#8ea396]">
            <Info className="w-5 h-5 text-[#4ca778] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white font-serif">Važna napomena za ribolovce: </span>
              {scoreResult.disclaimer} Stvarni uspjeh na vodi uveliko zavisi od tačne prozirnosti vode, mjesta zabacivanja, pravilne tehnike vođenja mamca, fine prezentacije predveza i iskustva na vodi.
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
