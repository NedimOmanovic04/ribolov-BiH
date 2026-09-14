'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { fetchWeatherData, WeatherData, getWeatherDescription } from '@/lib/weather/open-meteo';
import { getAstronomyData, AstronomyData } from '@/lib/astronomy/moon';
import { Calendar, Sun, Moon, Wind, Thermometer, CloudRain } from 'lucide-react';

export default function ForecastPage() {
  const [location, setLocation] = useState({ lat: 43.6844, lng: 17.8289, name: 'Jablaničko jezero' });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar
        currentLocationName={location.name}
        onSelectLocation={(loc) => setLocation(loc)}
        onUseMyLocation={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="panel-outdoors rounded-lg p-6 space-y-2 border border-[#1f3629]">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
            📅 SOLUNARNI I VREMENSKI ALMANAH
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">7-Dnevna Prognoza na Vodama</h1>
          <p className="text-xs text-[#8ea396] font-sans">
            Lokacija: <strong className="text-white font-serif">{location.name}</strong>
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#4ca778] font-serif">Očitavanje višednevnog almanaha...</div>
        ) : weather && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weather.daily.time.map((dateStr, idx) => {
              const d = new Date(dateStr);
              const dayName = d.toLocaleDateString('bs-BA', { weekday: 'long', day: 'numeric', month: 'numeric' });
              const astro = getAstronomyData(d, location.lat, location.lng);
              const maxTemp = Math.round(weather.daily.temperature_2m_max[idx]);
              const minTemp = Math.round(weather.daily.temperature_2m_min[idx]);
              const rainProb = weather.daily.precipitation_probability_max[idx] || 0;
              const rainSum = weather.daily.precipitation_sum[idx] || 0;
              const windMax = Math.round(weather.daily.wind_speed_10m_max[idx]);

              return (
                <div key={dateStr} className="panel-outdoors rounded-lg p-5 space-y-3 border border-[#1f3629]">
                  <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                    <span className="font-bold text-white text-base capitalize font-serif">{dayName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#14231b] text-emerald-300 border border-[#274535] font-bold">
                      ⭐ {astro.solunarRating.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8ea396] flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-[#4ca778]" /> Temperatura:</span>
                      <span className="font-bold text-white font-mono">{minTemp}°C → {maxTemp}°C</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8ea396] flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-[#4ca778]" /> Padavine:</span>
                      <span className="font-bold text-white font-mono">{rainProb}% ({rainSum} mm)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8ea396] flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-[#4ca778]" /> Vjetar max:</span>
                      <span className="font-bold text-white font-mono">{windMax} km/h</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1f3629]">
                      <span className="text-amber-300 flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Sunce:</span>
                      <span className="text-white font-mono">{astro.sunrise} - {astro.sunset}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sky-300 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-sky-400" /> Mjesec:</span>
                      <span className="text-white font-mono">{astro.moonPhaseName} ({astro.illumination}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
