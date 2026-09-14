'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { fetchWeatherData, WeatherData, getWeatherDescription } from '@/lib/weather/open-meteo';
import { getAstronomyData, AstronomyData } from '@/lib/astronomy/moon';
import { Calendar, Sun, Moon, Gauge, Wind, Thermometer, CloudRain } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-river-950 text-emerald-50">
      <Navbar
        currentLocationName={location.name}
        onSelectLocation={(loc) => setLocation(loc)}
        onUseMyLocation={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-river-800/80 space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            📅 Višednevna prognoza ribolova
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">7-Dnevni Vremenski i Solunarni Pregled</h1>
          <p className="text-xs text-emerald-400/70">Lokacija: <strong className="text-white">{location.name}</strong></p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-emerald-400">Učitavanje višednevne prognoze...</div>
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
                <div key={dateStr} className="glass-panel rounded-2xl p-5 border border-river-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-river-800 pb-2">
                    <span className="font-extrabold text-white text-base capitalize">{dayName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      ⭐ {astro.solunarRating.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400/70 flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-emerald-400" /> Temperatura:</span>
                      <span className="font-bold text-white">{minTemp}°C → {maxTemp}°C</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400/70 flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-emerald-400" /> Padavine:</span>
                      <span className="font-bold text-white">{rainProb}% ({rainSum} mm)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400/70 flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-emerald-400" /> Vjetar max:</span>
                      <span className="font-bold text-white">{windMax} km/h</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-river-800/50">
                      <span className="text-amber-300 flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Sunce:</span>
                      <span className="text-white">{astro.sunrise} - {astro.sunset}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sky-300 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-sky-400" /> Mjesec:</span>
                      <span className="text-white">{astro.moonPhaseName} ({astro.illumination}%)</span>
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
