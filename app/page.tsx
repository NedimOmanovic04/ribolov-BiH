'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import WeatherWidget from '@/components/WeatherWidget';
import FishingScoreSummary from '@/components/FishingScoreSummary';
import HourlyGraph from '@/components/HourlyGraph';
import SpeciesFilterBar from '@/components/SpeciesFilterBar';
import TopSpeciesList from '@/components/TopSpeciesList';
import FishingPlanner from '@/components/FishingPlanner';
import FishingMap from '@/components/map/FishingMap';
import NearbyWaters from '@/components/NearbyWaters';
import { fetchWeatherData, WeatherData } from '@/lib/weather/open-meteo';
import { getAstronomyData, AstronomyData } from '@/lib/astronomy/moon';
import { calculateFishingScore, FishingScoreResult } from '@/lib/fishing/score';
import { getRankedSpecies, FishingCategoryFilter, SpeciesRecommendation } from '@/lib/fishing/recommendations';
import { reverseGeocode } from '@/lib/geo/geocoding';
import { formatDateFull } from '@/lib/utils/dates';
import watersData from '@/data/waters.json';
import fishData from '@/data/fish.json';
import sourcesData from '@/data/sources.json';
import { WaterBody } from '@/types';
import { MapPin, Shield, ExternalLink, Clock, Calendar, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    waterId?: string;
    cityId?: string;
  }>({
    lat: 43.9889,
    lng: 18.1781,
    name: 'Rijeka Bosna (Visoko)',
    waterId: 'water-bosna',
    cityId: 'bosna-visoko',
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [nowStr, setNowStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  const [filterCategory, setFilterCategory] = useState<FishingCategoryFilter>('all');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('chub');

  // Live clock + date
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setNowStr(now.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDateStr(formatDateFull(now));
    };
    updateClock();
    const iv = setInterval(updateClock, 1000);
    return () => clearInterval(iv);
  }, []);

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
          (w) => Math.abs(w.latitude - lat) < 0.08 && Math.abs(w.longitude - lng) < 0.08
        );
        setSelectedLocation({
          lat,
          lng,
          name: matchedWater ? matchedWater.name : 'Odabrana lokacija',
          waterId: matchedWater?.id,
          cityId: matchedWater?.cities?.[0]?.id,
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
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        let placeName = await reverseGeocode(lat, lng);

        setSelectedLocation({
          lat,
          lng,
          name: `${placeName} (Moja GPS lokacija)`,
        });
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Neuspješno određivanje lokacije.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  let currentSpeciesScoreResult: FishingScoreResult | null = null;
  let rankedSpeciesList: SpeciesRecommendation[] = [];
  let topFeaturedSpeciesName = 'Klen';

  if (weather && astronomy) {
    rankedSpeciesList = getRankedSpecies(
      weather,
      astronomy,
      filterCategory,
      selectedLocation.waterId,
      selectedLocation.cityId
    );

    // Pick top species from ranked list for bulletin top featured species
    const topRecommendation = rankedSpeciesList.find((r) => !r.presence.isAbsent);
    if (topRecommendation) {
      topFeaturedSpeciesName = topRecommendation.species.name_bs;
    }

    const targetSpecies = fishData.find((f) => f.id === selectedSpeciesId) || fishData[0];
    currentSpeciesScoreResult = calculateFishingScore({
      species: targetSpecies as any,
      weather,
      astronomy,
    });
  }

  const selectedSpeciesName = fishData.find((f) => f.id === selectedSpeciesId)?.name_bs || 'Klen';

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
        
        {/* HERO SECTION WITH LIVE DATE & GPS */}
        <section className="bg-[#121c17] border border-[#1f3629] rounded-lg p-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1712] via-[#14231b] to-transparent opacity-95"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f3629] pb-4">
              <div>
                <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
                  🎣 RIBOLOV BIH • VODIČ NA TERENU
                </span>
                <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight mt-0.5">
                  Gdje da idem na ribolov danas?
                </h1>
                <p className="text-xs text-[#8ea396] font-sans mt-1">
                  Pronađite najbolje vrijeme za ribolov po rijekama, jezerima i mjestima u Bosni i Hercegovini.
                </p>
                {/* Live Date formatted as DD.MM.YYYY. (Dan) */}
                {nowStr && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1.5 text-[#d5d1c3]">
                      <Calendar className="w-3.5 h-3.5 text-[#4ca778]" />
                      <span className="capitalize font-mono">{dateStr}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#182820] border border-[#274535] px-2 py-0.5 rounded font-mono font-bold text-white">
                      <Clock className="w-3 h-3 text-[#4ca778]" />
                      {nowStr}
                    </span>
                  </div>
                )}
              </div>

              {/* GPS Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="px-4 py-2.5 bg-[#274535] hover:bg-[#2e7d58] text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors border border-[#345b46]"
                  title="Detektuj moju GPS lokaciju"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#4ca778]" />
                  <span>{isLocating ? 'Lociram...' : 'Moja lokacija'}</span>
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8ea396]">
              <div>
                Trenutna lokacija: <strong className="text-white font-serif">{selectedLocation.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4ca778] font-semibold">⭐ Top ulov danas: {topFeaturedSpeciesName}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRIMARY FEATURE: PLANER RIBOLOVA ON HOMEPAGE */}
        <section>
          <FishingPlanner
            onLocationChange={(lat, lng, name) => setSelectedLocation({ lat, lng, name })}
            onSpeciesChange={(id) => setSelectedSpeciesId(id)}
            initialWaterId={selectedLocation.waterId || 'water-bosna'}
            initialCityId={selectedLocation.cityId || 'bosna-visoko'}
            initialFishId={selectedSpeciesId}
          />
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
              onClick={() => setSelectedLocation({ lat: 43.9889, lng: 18.1781, name: 'Rijeka Bosna (Visoko)', waterId: 'water-bosna', cityId: 'bosna-visoko' })}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded"
            >
              Vrati na Rijeka Bosna (Visoko)
            </button>
          </div>
        )}

        {!loading && !error && weather && astronomy && currentSpeciesScoreResult && (
          <>
            {/* Top Grid: Weather Almanac + Bulletin featuring Top Species */}
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
                topSpeciesName={topFeaturedSpeciesName}
                isTopSpeciesFeatured={true}
              />
            </div>

            {/* Hourly Score Graph (00:00 - 23:00) */}
            <HourlyGraph hourlyScores={currentSpeciesScoreResult.hourlyScores} />

            {/* Category Filter & Ranked Species List with Spot Presence Status */}
            <div className="space-y-4">
              <SpeciesFilterBar
                activeFilter={filterCategory}
                onSelectFilter={(f) => setFilterCategory(f)}
              />
              <TopSpeciesList
                recommendations={rankedSpeciesList}
                onSelectSpecies={(id) => setSelectedSpeciesId(id)}
                locationName={selectedLocation.name}
              />
            </div>

            {/* Bottom Grid: Interactive BiH Map & Nearby Fishing Spots */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 panel-outdoors rounded-lg p-4 space-y-3 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
                      🗺️ Karta Voda i Lokacija Bosne i Hercegovine
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
                        waterId: w.id,
                        cityId: w.cities?.[0]?.id,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <NearbyWaters
                  currentLat={selectedLocation.lat}
                  currentLng={selectedLocation.lng}
                  onSelectWater={(w) =>
                    setSelectedLocation({
                      lat: w.latitude,
                      lng: w.longitude,
                      name: w.name,
                      waterId: w.id,
                      cityId: w.cities?.[0]?.id,
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
                <span className="text-xs text-[#8ea396]">SRS BiH & Pravilnici FBiH/RS</span>
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
