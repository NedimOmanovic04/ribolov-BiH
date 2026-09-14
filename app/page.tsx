'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import WeatherWidget from '@/components/WeatherWidget';
import FishingScoreSummary from '@/components/FishingScoreSummary';
import HourlyGraph from '@/components/HourlyGraph';
import SpeciesFilterBar from '@/components/SpeciesFilterBar';
import TopSpeciesList from '@/components/TopSpeciesList';
import FishingMap from '@/components/map/FishingMap';
import NearbyWaters from '@/components/NearbyWaters';
import { fetchWeatherData, WeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData, AstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore, FishingScoreResult } from '@/lib/fishing/score';
import { getRankedSpecies, FishingCategoryFilter, SpeciesRecommendation } from '@/lib/fishing/recommendations';
import { calculateDistanceKm } from '@/lib/geo/geocoding';
import watersData from '@/data/waters.json';
import fishData from '@/data/fish.json';
import sourcesData from '@/data/sources.json';
import { WaterBody } from '@/types';
import { MapPin, Shield, ExternalLink, ChevronDown, Clock, Thermometer, Gauge, Wind } from 'lucide-react';

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  }>({
    lat: 43.6844,
    lng: 17.8289,
    name: 'Jablaničko jezero',
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [filterCategory, setFilterCategory] = useState<FishingCategoryFilter>('all');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('common-carp');

  // Load URL query params if user selected a location link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const latP = params.get('lat');
      const lngP = params.get('lng');
      if (latP && lngP) {
        const lat = parseFloat(latP);
        const lng = parseFloat(lngP);
        const matchedWater = (watersData as WaterBody[]).find(
          (w) => Math.abs(w.latitude - lat) < 0.05 && Math.abs(w.longitude - lng) < 0.05
        );
        setSelectedLocation({
          lat,
          lng,
          name: matchedWater ? matchedWater.name : 'Odabrana lokacija',
        });
      }
    }
  }, []);

  // Load weather and astronomy whenever location changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const wData = await fetchWeatherData(selectedLocation.lat, selectedLocation.lng);
        const aData = getAstronomyData(new Date(), selectedLocation.lat, selectedLocation.lng);
        setWeather(wData);
        setAstronomy(aData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Neuspješno učitavanje vremenskih podataka za odabranu lokaciju.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLocation]);

  // Browser Geolocation handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Vaš preglednik ne podržava geolociranje.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        let placeName = 'Moja Lokacija';

        const nearestWater = (watersData as WaterBody[]).reduce((prev, curr) => {
          const dPrev = calculateDistanceKm(lat, lng, prev.latitude, prev.longitude);
          const dCurr = calculateDistanceKm(lat, lng, curr.latitude, curr.longitude);
          return dCurr < dPrev ? curr : prev;
        });

        if (nearestWater && calculateDistanceKm(lat, lng, nearestWater.latitude, nearestWater.longitude) <= 30) {
          placeName = nearestWater.name;
        } else {
          placeName = 'Sarajevo';
        }

        setSelectedLocation({
          lat,
          lng,
          name: `${placeName} (Moja trenutna lokacija)`,
        });
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Neuspješno određivanje lokacije.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  let currentSpeciesScoreResult: FishingScoreResult | null = null;
  let rankedSpeciesList: SpeciesRecommendation[] = [];

  if (weather && astronomy) {
    rankedSpeciesList = getRankedSpecies(weather, astronomy, filterCategory);
    const targetSpecies = fishData.find((f) => f.id === selectedSpeciesId) || fishData[0];
    currentSpeciesScoreResult = calculateFishingScore({
      species: targetSpecies as any,
      weather,
      astronomy,
    });
  }

  const selectedSpeciesName = fishData.find((f) => f.id === selectedSpeciesId)?.name_bs || 'Šaran';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      {/* Top Navbar */}
      <Navbar
        currentLocationName={selectedLocation.name}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onUseMyLocation={handleUseMyLocation}
        isLocating={isLocating}
      />

      {/* Main Outdoor Portal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* FISHERMAN'S HERO SECTION: Large Natural Landscape & Spot Summary */}
        <section className="bg-[#121c17] border border-[#1f3629] rounded-lg p-6 relative overflow-hidden shadow-xl">
          {/* Subtle river texture background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1712] via-[#14231b] to-transparent opacity-95"></div>
          
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f3629] pb-4">
              <div>
                <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
                  🎣 RIBOLOV BIH • VODIČ NA TERENU
                </span>
                <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight mt-0.5">
                  Gdje da idem na ribolov danas?
                </h1>
                <p className="text-xs text-[#8ea396] font-sans mt-1">
                  Pronađite najbolje vrijeme za ribolov po rijekama, jezerima i vrstama u Bosni i Hercegovini.
                </p>
              </div>

              {/* Location Picker Quick Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedLocation.name}
                    onChange={(e) => {
                      const matched = (watersData as WaterBody[]).find((w) => w.name === e.target.value);
                      if (matched) {
                        setSelectedLocation({
                          lat: matched.latitude,
                          lng: matched.longitude,
                          name: matched.name,
                        });
                      }
                    }}
                    className="appearance-none bg-[#182820] text-white text-xs font-bold font-serif py-2.5 pl-3.5 pr-8 rounded border border-[#274535] focus:outline-none focus:border-[#4ca778] cursor-pointer"
                  >
                    {(watersData as WaterBody[]).map((w) => (
                      <option key={w.id} value={w.name} className="bg-[#0e1712] text-white">
                        {w.name} ({w.municipality})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#c49f6e] absolute right-2.5 top-3 pointer-events-none" />
                </div>

                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="px-3 py-2 bg-[#274535] hover:bg-[#2e7d58] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#345b46]"
                  title="Moja GPS lokacija"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#4ca778]" />
                  <span className="hidden sm:inline">{isLocating ? 'Lociram...' : 'Moja lokacija'}</span>
                </button>
              </div>
            </div>

            {/* Quick Conditions Banner for Selected Spot */}
            {weather && currentSpeciesScoreResult && (
              <div className="bg-[#182820] border border-[#274535] rounded p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="text-[11px] text-[#8ea396] font-serif uppercase tracking-wider">Trenutno odabrano:</div>
                  <div className="text-lg font-bold text-white font-serif flex items-center gap-2">
                    📍 {selectedLocation.name}
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white font-serif">
                      {currentSpeciesScoreResult.totalScore}<span className="text-xs text-[#4ca778]">/100</span>
                    </div>
                    <div className="text-[10px] text-[#4ca778] uppercase font-bold">
                      🟢 {currentSpeciesScoreResult.categoryLabel}
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="flex items-center gap-4 border-l border-[#274535] pl-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#e8e5db]">
                    <Clock className="w-4 h-4 text-[#2b87be]" />
                    <span>Najbolje: <strong className="text-white">{currentSpeciesScoreResult.bestPeriods[0]?.start}–{currentSpeciesScoreResult.bestPeriods[0]?.end} ⭐</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#e8e5db]">
                    <Thermometer className="w-4 h-4 text-[#4ca778]" />
                    <span>Temp: <strong className="text-white">{Math.round(weather.current.temperature_2m)}°C</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#e8e5db]">
                    <Gauge className="w-4 h-4 text-[#4ca778]" />
                    <span>Pritisak: <strong className="text-white">{Math.round(weather.current.surface_pressure)} hPa</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="panel-outdoors rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4ca778] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-[#8ea396] font-serif">
              Očitavanje vremenskih stanica i proračun uslova za {selectedLocation.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#3a1919] border border-rose-800 text-rose-200 rounded-lg p-5 text-center space-y-2 text-xs">
            <p className="font-bold">{error}</p>
            <button
              onClick={() => setSelectedLocation({ lat: 43.6844, lng: 17.8289, name: 'Jablaničko jezero' })}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded"
            >
              Vrati na Jablaničko jezero
            </button>
          </div>
        )}

        {!loading && !error && weather && astronomy && currentSpeciesScoreResult && (
          <>
            {/* Top Grid: Outdoor Weather Almanac + Score Bulletin */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherWidget
                weather={weather}
                astronomy={astronomy}
                locationName={selectedLocation.name}
              />
              <FishingScoreSummary
                scoreResult={currentSpeciesScoreResult}
                locationName={selectedLocation.name}
                selectedSpeciesName={selectedSpeciesName}
              />
            </div>

            {/* Satni Almanah (00:00 - 23:00) */}
            <HourlyGraph hourlyScores={currentSpeciesScoreResult.hourlyScores} />

            {/* Category Filter ("Šta da lovim?") & Ranked Species List */}
            <div className="space-y-4">
              <SpeciesFilterBar
                activeFilter={filterCategory}
                onSelectFilter={(f) => setFilterCategory(f)}
              />
              <TopSpeciesList
                recommendations={rankedSpeciesList}
                onSelectSpecies={(id) => setSelectedSpeciesId(id)}
              />
            </div>

            {/* Bottom Grid: Natural Clean BiH Map & Nearby Fishing Spots */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interactive BiH Leaflet Map */}
              <div className="lg:col-span-2 panel-outdoors rounded-lg p-4 space-y-3 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
                      🗺️ Karta Voda Bosne i Hercegovine
                    </span>
                    <h3 className="text-base font-bold text-white font-serif">Karta Rijeka, Jezera i Revira</h3>
                  </div>
                  <span className="text-xs text-[#8ea396] hidden sm:inline">Kliknite na vodu za pregled</span>
                </div>
                <div className="flex-1 w-full rounded overflow-hidden min-h-[360px] border border-[#1f3629]">
                  <FishingMap
                    selectedLocation={selectedLocation}
                    onSelectWater={(w) =>
                      setSelectedLocation({
                        lat: w.latitude,
                        lng: w.longitude,
                        name: w.name,
                      })
                    }
                  />
                </div>
              </div>

              {/* Nearby Waters radius table */}
              <div>
                <NearbyWaters
                  currentLat={selectedLocation.lat}
                  currentLng={selectedLocation.lng}
                  onSelectWater={(w) =>
                    setSelectedLocation({
                      lat: w.latitude,
                      lng: w.longitude,
                      name: w.name,
                    })
                  }
                />
              </div>

            </div>

            {/* Verification Sources Section */}
            <div className="panel-outdoors rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <Shield className="w-4 h-4 text-[#4ca778]" />
                  Verificirani Službeni Izvori Podataka
                </h4>
                <span className="text-xs text-[#8ea396]">FBiH & SRS BiH Pravilnici</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {sourcesData.map((src) => (
                  <div key={src.id} className="bg-[#182820] p-3 rounded border border-[#274535] space-y-1">
                    <div className="font-bold text-white font-serif">{src.title}</div>
                    <div className="text-[11px] text-[#8ea396]">{src.publisher} • Verificirano: {src.verified_at}</div>
                    <p className="text-[11px] text-[#d5d1c3] line-clamp-2">{src.notes}</p>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#4ca778] hover:text-white font-semibold pt-1"
                    >
                      Službeni izvor <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0e1712] border-t border-[#1f3629] text-[#8ea396] py-6 text-xs text-center space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 font-serif">
          <div className="flex items-center gap-2 text-white">
            <span>🎣 RIBOLOV BiH</span> • <span>Vremenski podaci Open-Meteo CC BY 4.0</span>
          </div>
          <div className="flex gap-4 text-[#4ca778] font-sans">
            <a href="/forecast" className="hover:underline">Prognoza</a>
            <a href="/fish" className="hover:underline">Baza Riba</a>
            <a href="/waters" className="hover:underline">Baza Voda</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
