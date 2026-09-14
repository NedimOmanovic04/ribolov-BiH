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

  let TrendIcon = Minus;
  let trendColor = 'text-[#4ca778]';
  let trendText = 'Stabilan';

  if (trends.trend === 'rapidly_falling' || trends.trend === 'falling') {
    TrendIcon = ArrowDown;
    trendColor = 'text-amber-400 font-bold';
    trendText = `${trends.diff6h > 0 ? '+' : ''}${trends.diff6h} hPa / 6h (Pada)`;
  } else if (trends.trend === 'rapidly_rising' || trends.trend === 'rising') {
    TrendIcon = ArrowUp;
    trendColor = 'text-sky-400 font-bold';
    trendText = `+${trends.diff6h} hPa / 6h (Raste)`;
  }

  return (
    <div className="panel-outdoors rounded-lg p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f3629] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
            Vremenski Almanah na Vodama
          </span>
          <h2 className="text-xl font-bold text-white font-serif">{locationName}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#182820] text-white border border-[#274535] rounded font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-[#4ca778]" />
            <span>{timeStr || '18:12:00'}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#e8e5db]">{getWeatherDescription(current.weather_code)}</div>
            <div className="text-[11px] text-[#8ea396]">Oblačnost: {current.cloud_cover}%</div>
          </div>
        </div>
      </div>

      {/* Weather Metrics Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <div className="bg-[#182820] p-3 rounded border border-[#274535]">
          <div className="text-[#8ea396] font-semibold text-[11px] flex items-center justify-between">
            <span>Temperatura</span>
            <Thermometer className="w-3.5 h-3.5 text-[#4ca778]" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white font-serif">{Math.round(current.temperature_2m)}°C</span>
            <span className="text-[11px] text-[#8ea396] block">Osjećaj: {Math.round(current.apparent_temperature)}°C</span>
          </div>
        </div>

        <div className="bg-[#182820] p-3 rounded border border-[#274535]">
          <div className="text-[#8ea396] font-semibold text-[11px] flex items-center justify-between">
            <span>Atmosferski Pritisak</span>
            <Gauge className="w-3.5 h-3.5 text-[#4ca778]" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white font-serif">{Math.round(current.surface_pressure)} <span className="text-xs font-normal text-[#8ea396]">hPa</span></span>
            <div className={`mt-0.5 text-[11px] flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span>{trendText}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#182820] p-3 rounded border border-[#274535]">
          <div className="text-[#8ea396] font-semibold text-[11px] flex items-center justify-between">
            <span>Brzina Vjetra</span>
            <Wind className="w-3.5 h-3.5 text-[#4ca778]" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white font-serif">{Math.round(current.wind_speed_10m)} <span className="text-xs font-normal text-[#8ea396]">km/h</span></span>
            <span className="text-[11px] text-[#8ea396] block">Udari: {Math.round(current.wind_gusts_10m)} km/h</span>
          </div>
        </div>

        <div className="bg-[#182820] p-3 rounded border border-[#274535]">
          <div className="text-[#8ea396] font-semibold text-[11px] flex items-center justify-between">
            <span>Padavine</span>
            <CloudRain className="w-3.5 h-3.5 text-[#4ca778]" />
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-white font-serif">{current.precipitation} <span className="text-xs font-normal text-[#8ea396]">mm</span></span>
            <span className="text-[11px] text-[#8ea396] block">Vlažnost: {current.relative_humidity_2m}%</span>
          </div>
        </div>

      </div>

      {/* Sun & Moon Solunar Footer Bar */}
      <div className="bg-[#17251e] p-3 rounded border border-[#274535] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[#e8e5db]">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Sun className="w-4 h-4 text-amber-400" /> Izlazak: <strong className="text-white">{astronomy.sunrise}</strong> • Zalazak: <strong className="text-white">{astronomy.sunset}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#e8e5db]">
          <span className="flex items-center gap-1.5 text-sky-300">
            <Moon className="w-4 h-4 text-sky-400" /> Mjesec: <strong className="text-white">{astronomy.moonPhaseName} ({astronomy.illumination}%)</strong>
          </span>
        </div>

        <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold rounded">
          ⭐ {astronomy.solunarDescription}
        </div>
      </div>
    </div>
  );
}
