'use client';

import { useState, useEffect } from 'react';
import { WeatherData, getWeatherDescription } from '@/lib/weather/open-meteo';
import { AstronomyData } from '@/lib/astronomy/moon';
import { Thermometer, Wind, Gauge, CloudRain, Moon, Sun, ArrowDown, ArrowUp, Minus, Clock } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData;
  astronomy: AstronomyData;
  locationName: string;
}

export default function WeatherWidget({ weather, astronomy, locationName }: WeatherWidgetProps) {
  const current = weather.current;
  const trends = weather.pressureTrends;

  // Live Local Time Clock state
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('bs-BA', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pressure Trend Icon & Badge Color
  let TrendIcon = Minus;
  let trendColor = 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
  let trendText = 'Stabilan';

  if (trends.trend === 'rapidly_falling' || trends.trend === 'falling') {
    TrendIcon = ArrowDown;
    trendColor = 'text-amber-400 border-amber-800 bg-amber-950/60';
    trendText = `${trends.diff6h > 0 ? '+' : ''}${trends.diff6h} hPa / 6h (Pada)`;
  } else if (trends.trend === 'rapidly_rising' || trends.trend === 'rising') {
    TrendIcon = ArrowUp;
    trendColor = 'text-sky-400 border-sky-800 bg-sky-950/60';
    trendText = `+${trends.diff6h} hPa / 6h (Raste)`;
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-river-800/80 shadow-xl space-y-4">
      {/* Header Location, Current Sky & Live Clock */}
      <div className="flex items-center justify-between border-b border-river-800/60 pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            📍 Vremenski uslovi na vodi
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{locationName}</h2>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{timeStr || '18:12'}</span>
          </div>
          <div className="text-xs font-semibold text-emerald-200 mt-1">
            {getWeatherDescription(current.weather_code)}
          </div>
          <div className="text-[11px] text-emerald-400/60">Oblačnost: {current.cloud_cover}%</div>
        </div>
      </div>

      {/* Main Grid Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Air Temperature */}
        <div className="bg-river-900/80 rounded-xl p-3 border border-river-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400/70">
            <span>Temperatura</span>
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white">{Math.round(current.temperature_2m)}°C</span>
            <span className="text-[11px] text-emerald-400/60 block">Osjećaj: {Math.round(current.apparent_temperature)}°C</span>
          </div>
        </div>

        {/* Pressure & 6h Trend */}
        <div className="bg-river-900/80 rounded-xl p-3 border border-river-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400/70">
            <span>Atmosferski Pritisak</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white">{Math.round(current.surface_pressure)} <span className="text-xs font-normal text-emerald-300">hPa</span></span>
            <div className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${trendColor}`}>
              <TrendIcon className="w-2.5 h-2.5" />
              <span>{trendText}</span>
            </div>
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="bg-river-900/80 rounded-xl p-3 border border-river-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400/70">
            <span>Brzina vjetra</span>
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white">{Math.round(current.wind_speed_10m)} <span className="text-xs font-normal text-emerald-300">km/h</span></span>
            <span className="text-[11px] text-emerald-400/60 block">Udari: {Math.round(current.wind_gusts_10m)} km/h</span>
          </div>
        </div>

        {/* Rain & Precipitation */}
        <div className="bg-river-900/80 rounded-xl p-3 border border-river-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400/70">
            <span>Padavine</span>
            <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white">{current.precipitation} <span className="text-xs font-normal text-emerald-300">mm</span></span>
            <span className="text-[11px] text-emerald-400/60 block">Vlažnost: {current.relative_humidity_2m}%</span>
          </div>
        </div>

      </div>

      {/* Astronomy & Solunar Banner */}
      <div className="bg-gradient-to-r from-river-900 via-water-900 to-river-900 rounded-xl p-3.5 border border-river-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Sun periods */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Izlazak: <strong className="text-white">{astronomy.sunrise}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400/80">
            <span>Zalazak: <strong className="text-white">{astronomy.sunset}</strong></span>
          </div>
        </div>

        {/* Moon details */}
        <div className="flex items-center gap-3 border-l sm:border-l border-river-800 sm:pl-3">
          <div className="flex items-center gap-1.5 text-sky-300">
            <Moon className="w-4 h-4 text-sky-400" />
            <span>Mjesec: <strong className="text-white">{astronomy.moonPhaseName} ({astronomy.illumination}%)</strong></span>
          </div>
        </div>

        {/* Solunar badge */}
        <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1">
          <span>⭐ {astronomy.solunarDescription}</span>
        </div>

      </div>
    </div>
  );
}
