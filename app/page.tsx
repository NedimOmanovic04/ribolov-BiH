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
import { MapPin, Sparkles, Shield, Info, ExternalLink, Calendar, Waves, Fish } from 'lucide-react';

export default function HomePage() {
  // Location state (Default: Jablaničko jezero)
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

  // Category filter state ("Šta da lovim?")
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

  // Browser Geolocation handler with place name formatting
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

        // Find nearest known water body or city
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
        alert('Neuspješno određivanje lokacije. Provjerite dozvole preglednika.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Calculate current rankings and active species score
  let currentSpeciesScoreResult: FishingScoreResult | null = null;
  let rankedSpeciesList: SpeciesRecommendation[] = [];

  if (weather && astronomy) {
    rankedSpeciesList = getRankedSpecies(weather, astronomy, filterCategory);
    
    // Selected species score
    const targetSpecies = fishData.find((f) => f.id === selectedSpeciesId) || fishData[0];
    currentSpeciesScoreResult = calculateFishingScore({
      species: targetSpecies as any,
      weather,
      astronomy,
    });
  }

  const selectedSpeciesName = fishData.find((f) => f.id === selectedSpeciesId)?.name_bs || 'Šaran';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentLocationName={selectedLocation.name}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onUseMyLocation={handleUseMyLocation}
        isLocating={isLocating}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Location Banner Bar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-river-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 text-lg shadow-inner">
              📍
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
                Odabrana Lokacija Ribolova
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {selectedLocation.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md border border-emerald-500/30"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>{isLocating ? 'Određujem lokaciju...' : '📍 Koristi moju lokaciju'}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-emerald-300">
              Proračunavanje ribolovnih uslova za {selectedLocation.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl p-6 text-center space-y-2">
            <p className="font-bold text-base">{error}</p>
            <button
              onClick={() => setSelectedLocation({ lat: 43.6844, lng: 17.8289, name: 'Jablaničko jezero' })}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Vrati na Jablaničko jezero
            </button>
          </div>
        )}

        {!loading && !error && weather && astronomy && currentSpeciesScoreResult && (
          <>
            {/* Top Grid: Weather Card + Main Fishing Score Gauge */}
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

            {/* Hourly Score Graph (00:00 - 23:00) */}
            <HourlyGraph hourlyScores={currentSpeciesScoreResult.hourlyScores} />

            {/* Middle Section: "Šta da lovim?" Filter & Ranked Species List */}
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

            {/* Bottom Grid: Interactive BiH Map & Nearby Waters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* BiH Leaflet Interactive Map */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-river-800/80 space-y-3 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      🗺️ Karta Bosne i Hercegovine
                    </span>
                    <h3 className="text-base font-bold text-white">Ribolovne vode, rijeke i jezera</h3>
                  </div>
                  <span className="text-xs text-emerald-400/60 hidden sm:inline">Kliknite marker za detalje</span>
                </div>
                <div className="flex-1 w-full rounded-xl overflow-hidden min-h-[360px] border border-river-800">
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

              {/* Nearby Waters radius list */}
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

            {/* Authentic Data Sources Footer Section */}
            <div className="glass-panel rounded-2xl p-5 border border-river-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-river-800/60 pb-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Verificirani Izvori Podataka (Bez generisanih neistina)
                </h4>
                <span className="text-xs text-emerald-400/70">Zakon FBiH & SRS BiH</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {sourcesData.map((src) => (
                  <div key={src.id} className="bg-river-900/90 p-3 rounded-xl border border-river-800/80 space-y-1">
                    <div className="font-bold text-white">{src.title}</div>
                    <div className="text-[11px] text-emerald-400/70">{src.publisher} • Verificirano: {src.verified_at}</div>
                    <p className="text-[11px] text-river-300/80 line-clamp-2">{src.notes}</p>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-200 font-semibold pt-1"
                    >
                      Službeni link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-river-950 border-t border-river-800 text-river-400/80 py-6 text-xs text-center space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span>🎣 Ribolov BiH</span> • <span>Svi podaci vremenske prognoze CC BY 4.0 Open-Meteo</span>
          </div>
          <div className="flex gap-4 text-emerald-400/70">
            <a href="/forecast" className="hover:underline">Prognoza</a>
            <a href="/fish" className="hover:underline">Baza Riba</a>
            <a href="/waters" className="hover:underline">Baza Voda</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
