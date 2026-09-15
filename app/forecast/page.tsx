'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { fetchWeatherData, WeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore, formatLabel } from '@/lib/fishing/score';
import { getSpeciesPresenceForSpot } from '@/lib/fishing/presence';
import { Calendar, Sun, Moon, Wind, Thermometer, CloudRain, MapPin, Fish, Clock, ChevronDown, Target, AlertTriangle, Droplets, Layers } from 'lucide-react';
import watersData from '@/data/waters.json';
import fishData from '@/data/fish.json';
import { WaterBody, WaterCity, WaterClarity, BottomStructure } from '@/types';
import { formatDateFull, formatDateShort } from '@/lib/utils/dates';

function getSolunarLabel(rating: string): { label: string; color: string } {
  switch (rating) {
    case 'peak': return { label: 'VRHUNSKI', color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' };
    case 'high': return { label: 'VISOK', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' };
    case 'medium': return { label: 'SREDNJI', color: 'text-sky-300 border-sky-500/40 bg-sky-500/10' };
    default: return { label: 'NIZAK', color: 'text-[#8ea396] border-[#274535] bg-[#182820]' };
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-amber-400';
  if (score >= 65) return 'text-emerald-400';
  if (score >= 50) return 'text-sky-400';
  return 'text-[#8ea396]';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'IZVRSNI USLOVI';
  if (score >= 75) return 'VRLO DOBRI';
  if (score >= 60) return 'DOBRI USLOVI';
  if (score >= 45) return 'OSREDNJI';
  return 'SLABI USLOVI';
}

export default function ForecastPage() {
  const [location, setLocation] = useState({
    lat: 43.9889,
    lng: 18.1781,
    name: 'Rijeka Bosna (Visoko)',
    waterId: 'water-bosna',
    cityId: 'bosna-visoko',
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState('');

  // Forecast planner state
  const [plannerOpen, setPlannerOpen] = useState(true);
  const [planDate, setPlanDate] = useState<string>('');
  const [planWaterId, setPlanWaterId] = useState<string>('water-bosna');
  const [planCityId, setPlanCityId] = useState<string>('bosna-visoko');
  const [planFishId, setPlanFishId] = useState<string>('chub');
  const [waterClarity, setWaterClarity] = useState<WaterClarity>('bistra');
  const [bottomStructure, setBottomStructure] = useState<BottomStructure>('kamen');

  const [planResult, setPlanResult] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const waters = watersData as WaterBody[];
  const selectedPlanWater = waters.find((w) => w.id === planWaterId) || waters[0];
  const currentPlanCities: WaterCity[] = selectedPlanWater.cities || [];

  useEffect(() => {
    const now = new Date();
    setTodayStr(formatDateFull(now));

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPlanDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchWeatherData(location.lat, location.lng);
        setWeather(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location]);

  const handleWaterSelectChange = (wId: string) => {
    setPlanWaterId(wId);
    const newWater = waters.find((w) => w.id === wId);
    if (newWater && newWater.cities && newWater.cities.length > 0) {
      setPlanCityId(newWater.cities[0].id);
    } else {
      setPlanCityId('');
    }
  };

  const runPlanner = async () => {
    if (!planDate || !planWaterId || !planFishId) return;
    setPlanLoading(true);
    setPlanResult(null);

    const water = waters.find((w) => w.id === planWaterId);
    const city = water?.cities?.find((c) => c.id === planCityId) || water?.cities?.[0];
    const fish = fishData.find((f) => f.id === planFishId);

    if (!water || !fish) { setPlanLoading(false); return; }

    const lat = city ? city.latitude : water.latitude;
    const lng = city ? city.longitude : water.longitude;
    const spotName = city ? `${water.name} (${city.name})` : water.name;

    try {
      const wData = await fetchWeatherData(lat, lng);
      const planDateObj = new Date(planDate + 'T12:00:00');
      const astro = getAstronomyData(planDateObj, lat, lng);
      const presence = getSpeciesPresenceForSpot(water.id, city?.id, fish.id);
      const score = calculateFishingScore({
        species: fish as any,
        weather: wData,
        astronomy: astro,
        date: planDateObj,
        waterClarity,
        bottomStructure,
      });

      setPlanResult({ water, city, spotName, fish, score, presence, astro, wData, planDateObj });
    } catch (err) {
      console.error(err);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar
        currentLocationName={location.name}
        onSelectLocation={(loc) => setLocation({ ...location, lat: loc.lat, lng: loc.lng, name: loc.name })}
        onUseMyLocation={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="panel-outdoors rounded-lg p-6 border border-[#1f3629] space-y-2">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
            SOLUNARNI I VREMENSKI ALMANAH BIH
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">7-Dnevna Prognoza i Planer Izleta</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <span className="text-xs text-[#8ea396]">
              Lokacija: <strong className="text-white font-serif">{location.name}</strong>
            </span>
            {todayStr && (
              <span className="text-xs text-[#d5d1c3] flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#4ca778]" />
                {todayStr}
              </span>
            )}
          </div>
        </div>

        {/* ======== FISHING TRIP PLANNER WITH CASCADING DROPDOWNS ======== */}
        <div className="panel-outdoors rounded-lg border border-[#1f3629] overflow-hidden shadow-xl">
          <button
            onClick={() => setPlannerOpen(!plannerOpen)}
            className="w-full flex items-center justify-between p-5 hover:bg-[#182820] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#274535] border border-[#345b46] flex items-center justify-center">
                <Target className="w-5 h-5 text-[#4ca778]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white font-serif">Planer Ribolovnog Izleta Po Mjestima</div>
                <div className="text-xs text-[#8ea396]">Odaberi datum, vodu, grad/mjesto, vrstu, mutnoću i dno vode za rezultat i preporuke</div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#4ca778] transition-transform ${plannerOpen ? 'rotate-180' : ''}`} />
          </button>

          {plannerOpen && (
            <div className="p-5 border-t border-[#1f3629] space-y-5 bg-[#121c17]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Date picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Datum izleta
                  </label>
                  <input
                    type="date"
                    value={planDate}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] font-mono cursor-pointer"
                  />
                  {planDate && (
                    <div className="text-[11px] text-[#4ca778] font-mono">
                      {formatDateFull(new Date(planDate + 'T12:00:00'))}
                    </div>
                  )}
                </div>

                {/* Water picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Voda (Rijeka / Jezero)
                  </label>
                  <select
                    value={planWaterId}
                    onChange={(e) => handleWaterSelectChange(e.target.value)}
                    className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
                  >
                    {waters.map((w) => (
                      <option key={w.id} value={w.id} className="bg-[#0e1712]">
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Grad / Mjesto
                  </label>
                  <select
                    value={planCityId}
                    onChange={(e) => setPlanCityId(e.target.value)}
                    className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
                  >
                    {currentPlanCities.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0e1712]">
                        {c.name} ({c.municipality})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fish species picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif flex items-center gap-1.5">
                    <Fish className="w-3.5 h-3.5" /> Ciljna vrsta
                  </label>
                  <select
                    value={planFishId}
                    onChange={(e) => setPlanFishId(e.target.value)}
                    className="w-full bg-[#182820] text-white text-xs py-2.5 px-3 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
                  >
                    {fishData.map((f) => {
                      const presence = getSpeciesPresenceForSpot(planWaterId, planCityId, f.id);
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
                </div>

              </div>

              {/* Water Clarity & Bottom structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1f3629]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] font-serif flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#2b87be]" /> Mutnoća vode:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button type="button" onClick={() => setWaterClarity('bistra')} className={`py-1.5 rounded border text-center font-medium ${waterClarity === 'bistra' ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Bistra</button>
                    <button type="button" onClick={() => setWaterClarity('blago_zamucena')} className={`py-1.5 rounded border text-center font-medium ${waterClarity === 'blago_zamucena' ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Blago zamućena</button>
                    <button type="button" onClick={() => setWaterClarity('mutna')} className={`py-1.5 rounded border text-center font-medium ${waterClarity === 'mutna' ? 'bg-[#473d34] text-amber-200 border-amber-500 font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Mutna/Visoka</button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c49f6e] font-serif flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c49f6e]" /> Dno vode:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    <button type="button" onClick={() => setBottomStructure('kamen')} className={`py-1.5 rounded border text-center font-medium ${bottomStructure === 'kamen' ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Kamen</button>
                    <button type="button" onClick={() => setBottomStructure('mulj')} className={`py-1.5 rounded border text-center font-medium ${bottomStructure === 'mulj' ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Mulj</button>
                    <button type="button" onClick={() => setBottomStructure('trava')} className={`py-1.5 rounded border text-center font-medium ${bottomStructure === 'trava' ? 'bg-[#1c3528] text-white border-[#4ca778] font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Trava</button>
                    <button type="button" onClick={() => setBottomStructure('panjevi')} className={`py-1.5 rounded border text-center font-medium ${bottomStructure === 'panjevi' ? 'bg-[#473d34] text-amber-200 border-amber-500 font-bold' : 'bg-[#182820] text-[#8ea396] border-[#274535]'}`}>Panjevi</button>
                  </div>
                </div>
              </div>

              <button
                onClick={runPlanner}
                disabled={!planDate || !planWaterId || !planFishId || planLoading}
                className="px-6 py-3 bg-[#274535] hover:bg-[#2e7d58] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded border border-[#4ca778] transition-colors flex items-center gap-2"
              >
                {planLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Računam...</>
                ) : (
                  <><Target className="w-4 h-4 text-[#4ca778]" /> Procijeni ribolovne uslove</>
                )}
              </button>

              {/* Planner Result */}
              {planResult && (
                <div className="bg-[#0e1712] border border-[#274535] rounded-lg p-5 space-y-4 mt-2 shadow-2xl">
                  
                  {planResult.presence?.isAbsent && (
                    <div className="bg-[#3a1919] border border-rose-800 text-rose-100 p-3.5 rounded text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white font-serif">Biološka prisutnost: </span>
                        {planResult.presence.warningText || `Riba ${planResult.fish.name_bs} ne obitava na lokaciji ${planResult.spotName}.`}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f3629] pb-3">
                    <div>
                      <div className="text-xs text-[#c49f6e] font-serif uppercase tracking-wider font-bold">Rezultat procjene</div>
                      <div className="text-lg font-black text-white font-serif mt-0.5">
                        {planResult.fish.name_bs} • {planResult.spotName}
                      </div>
                      <div className="text-xs text-[#8ea396] mt-0.5 font-mono">
                        {formatDateFull(planResult.planDateObj)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-black font-serif ${getScoreColor(planResult.score.totalScore)}`}>
                        {planResult.presence?.isAbsent ? '—' : planResult.score.totalScore}
                        {!planResult.presence?.isAbsent && <span className="text-sm font-normal text-[#8ea396]">/100</span>}
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${getScoreColor(planResult.score.totalScore)}`}>
                        {planResult.presence?.isAbsent ? 'NE OBTIBAVA TU' : getScoreLabel(planResult.score.totalScore)}
                      </div>
                    </div>
                  </div>

                  {planResult.score.bestPeriods.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif">Najbolji periodi za pecanje:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {planResult.score.bestPeriods.map((p: any, i: number) => (
                          <div key={i} className="bg-[#182820] border border-[#274535] rounded p-3">
                            <div className="flex items-center gap-2 text-white font-bold font-mono text-base">
                              <Clock className="w-4 h-4 text-[#4ca778]" />
                              {p.start} – {p.end}
                              <span className="text-xs text-[#4ca778] font-normal ml-1">({p.score}%)</span>
                            </div>
                            {p.reason && (
                              <div className="text-[11px] text-[#c49f6e] mt-1 font-serif">{p.reason}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tactics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#182820] p-3 rounded border border-[#274535]">
                      <div className="font-bold text-[#c49f6e] font-serif">Prozirnost vode:</div>
                      <p className="text-[#d5d1c3] mt-0.5">{planResult.score.clarityTip}</p>
                    </div>
                    <div className="bg-[#182820] p-3 rounded border border-[#274535]">
                      <div className="font-bold text-[#c49f6e] font-serif">Dno i montaža:</div>
                      <p className="text-[#d5d1c3] mt-0.5">{planResult.score.bottomTip}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-xs font-semibold text-[#c49f6e] uppercase tracking-wider font-serif">Preporučeni mamci:</div>
                    <div className="flex flex-wrap gap-2">
                      {planResult.fish.baits.map((bait: string, i: number) => (
                        <span key={bait} className="text-xs px-2.5 py-1 rounded bg-[#182820] border border-[#345b46] text-[#d5d1c3]">
                          {formatLabel(bait)}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* ======== 7-DAY ALMANAC ======== */}
        {loading ? (
          <div className="p-12 text-center text-[#4ca778] font-serif">Očitavanje višednevnog almanaha...</div>
        ) : weather && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1f3629] pb-3">
              <Calendar className="w-4 h-4 text-[#c49f6e]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
                Sedmični vremenski almanah — {location.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weather.daily.time.map((dateIso, idx) => {
                const d = new Date(dateIso + 'T12:00:00');
                const formattedFull = formatDateFull(d);
                const astro = getAstronomyData(d, location.lat, location.lng);
                const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
                const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
                const rainProb = weather.daily.precipitation_probability_max[idx] || 0;
                const rainSum = weather.daily.precipitation_sum[idx] || 0;
                const windMax = Math.round(weather.daily.wind_speed_10m_max[idx]);
                const sol = getSolunarLabel(astro.solunarRating);
                const isToday = idx === 0;

                return (
                  <div
                    key={dateIso}
                    className={`panel-outdoors rounded-lg p-4 space-y-3 border ${
                      isToday ? 'border-[#4ca778]' : 'border-[#1f3629]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                      <div>
                        <div className="font-bold text-white text-xs font-mono">{formattedFull}</div>
                        {isToday && <div className="text-[10px] text-[#4ca778] font-bold uppercase tracking-wide mt-0.5">Danas</div>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${sol.color}`}>
                        {sol.label}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8ea396] flex items-center gap-1"><Thermometer className="w-3 h-3 text-[#4ca778]" /> Temp:</span>
                        <span className="font-bold text-white font-mono">{minTemp}° → {maxTemp}°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8ea396] flex items-center gap-1"><CloudRain className="w-3 h-3 text-[#4ca778]" /> Kiša:</span>
                        <span className="font-bold text-white font-mono">{rainProb}% / {rainSum}mm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8ea396] flex items-center gap-1"><Wind className="w-3 h-3 text-[#4ca778]" /> Vjetar:</span>
                        <span className="font-bold text-white font-mono">{windMax} km/h</span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#1f3629]">
                        <span className="text-amber-300 flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Sunce:</span>
                        <span className="text-white font-mono">{astro.sunrise} – {astro.sunset}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sky-300 flex items-center gap-1"><Moon className="w-3 h-3 text-sky-400" /> Mjesec:</span>
                        <span className="text-white font-mono">{astro.moonPhaseName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPlanDate(dateIso);
                        setPlannerOpen(true);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className="w-full py-1.5 text-[11px] font-semibold text-[#4ca778] hover:text-white border border-[#274535] hover:border-[#4ca778] hover:bg-[#182820] rounded transition-colors"
                    >
                      Planiraj izlet →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
