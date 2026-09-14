'use client';

import { HourlyScoreItem } from '@/lib/fishing/score';
import { getWeatherDescription } from '@/lib/weather/open-meteo';
import { useState } from 'react';

interface HourlyGraphProps {
  hourlyScores: HourlyScoreItem[];
}

export default function HourlyGraph({ hourlyScores }: HourlyGraphProps) {
  const [activeHour, setActiveHour] = useState<HourlyScoreItem | null>(
    hourlyScores.find((h) => h.isPeak) || hourlyScores[6] || hourlyScores[0]
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-river-800/80 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-river-800/60 pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            📊 Prognoza po satima
          </div>
          <h3 className="text-base font-bold text-white">Satna Ocjena Ribolovnih Uslova (00 - 24h)</h3>
        </div>
        <div className="text-xs text-emerald-300 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Vrhunski sati (⭐)
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="pt-4 pb-2 px-1">
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-44 overflow-x-auto pb-2 scrollbar-thin">
          {hourlyScores.map((item) => {
            const isSelected = activeHour?.hour === item.hour;
            
            // Bar height % based on score (min 15%)
            const heightPct = Math.max(18, item.score);

            // Bar background color
            let barBg = 'bg-river-800 hover:bg-river-700 text-river-300';
            if (item.score >= 82) {
              barBg = isSelected
                ? 'bg-emerald-400 ring-2 ring-emerald-300 shadow-lg shadow-emerald-900/50'
                : 'bg-emerald-500 hover:bg-emerald-400';
            } else if (item.score >= 65) {
              barBg = isSelected
                ? 'bg-teal-400 ring-2 ring-teal-300 shadow-lg shadow-teal-900/50'
                : 'bg-teal-600 hover:bg-teal-500';
            } else {
              barBg = isSelected
                ? 'bg-slate-400 ring-2 ring-slate-200'
                : 'bg-river-800 hover:bg-river-700';
            }

            return (
              <button
                key={item.hour}
                onClick={() => setActiveHour(item)}
                className="flex-1 min-w-[28px] max-w-[40px] flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                {/* Score value above bar */}
                <span className={`text-[10px] font-bold ${item.isPeak ? 'text-amber-400' : 'text-emerald-400/80'}`}>
                  {item.isPeak ? '⭐' : `${item.score}`}
                </span>

                {/* Vertical Bar */}
                <div className="w-full bg-river-950/80 rounded-t-lg h-32 flex items-end p-0.5 border border-river-800/40">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${barBg}`}
                  />
                </div>

                {/* Hour Label */}
                <span className={`text-[10px] font-medium ${isSelected ? 'text-white font-bold underline' : 'text-emerald-400/60'}`}>
                  {item.hour.toString().padStart(2, '0')}h
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Footer Drawer */}
      {activeHour && (
        <div className="bg-river-900/90 rounded-xl p-3.5 border border-river-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white bg-river-800 px-2.5 py-1 rounded-lg border border-river-700">
              {activeHour.timeStr}
            </span>
            <div>
              <div className="font-bold text-emerald-200 flex items-center gap-1.5">
                <span>Ocjena: {activeHour.score} / 100</span>
                {activeHour.isPeak && <span className="text-amber-400 font-extrabold">⭐ Vrhunski Sat</span>}
              </div>
              <div className="text-emerald-400/70 text-[11px]">
                {getWeatherDescription(activeHour.weatherCode)} • Temp: {activeHour.temp}°C
              </div>
            </div>
          </div>

          <div className="text-right text-emerald-400/80 text-[11px]">
            {activeHour.score >= 82
              ? 'Najveća šansa za hranjenje i napad ribe'
              : activeHour.score >= 65
              ? 'Umjereno povoljni uslovi'
              : 'Period niže aktivnosti'}
          </div>
        </div>
      )}
    </div>
  );
}
