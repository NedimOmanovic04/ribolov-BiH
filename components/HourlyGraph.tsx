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
    <div className="panel-outdoors rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f3629] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
            Satni Almanah Ribolova
          </span>
          <h3 className="text-base font-bold text-white font-serif">Prognoza Povoljnosti Uslova po Satima (00 - 24h)</h3>
        </div>
        <div className="text-xs text-[#4ca778] flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 bg-[#2e7d58] rounded-sm inline-block"></span> Vrhunski sati (⭐)
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="pt-3 pb-2 px-1">
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-44 overflow-x-auto pb-2 scrollbar-thin">
          {hourlyScores.map((item) => {
            const isSelected = activeHour?.hour === item.hour;
            const heightPct = Math.max(18, item.score);

            let barBg = 'bg-[#182820] hover:bg-[#274535] text-[#8ea396]';
            if (item.score >= 80) {
              barBg = isSelected
                ? 'bg-[#2e7d58] ring-2 ring-[#4ca778]'
                : 'bg-[#274535] hover:bg-[#2e7d58]';
            } else if (item.score >= 65) {
              barBg = isSelected
                ? 'bg-[#1e435f] ring-2 ring-[#2b87be]'
                : 'bg-[#122536] hover:bg-[#1e435f]';
            } else {
              barBg = isSelected
                ? 'bg-[#332a22] ring-2 ring-[#c49f6e]'
                : 'bg-[#182820] hover:bg-[#274535]';
            }

            return (
              <button
                key={item.hour}
                onClick={() => setActiveHour(item)}
                className="flex-1 min-w-[28px] max-w-[40px] flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className={`text-[10px] font-bold ${item.isPeak ? 'text-amber-400' : 'text-[#8ea396]'}`}>
                  {item.isPeak ? '⭐' : `${item.score}`}
                </span>

                <div className="w-full bg-[#0e1712] rounded-t h-32 flex items-end p-0.5 border border-[#1f3629]">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all duration-200 ${barBg}`}
                  />
                </div>

                <span className={`text-[10px] font-mono ${isSelected ? 'text-white font-bold underline' : 'text-[#8ea396]'}`}>
                  {item.hour.toString().padStart(2, '0')}h
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Drawer */}
      {activeHour && (
        <div className="bg-[#182820] p-3.5 rounded border border-[#274535] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white font-mono bg-[#14231b] px-3 py-1 rounded border border-[#274535]">
              {activeHour.timeStr}
            </span>
            <div>
              <div className="font-bold text-white flex items-center gap-2 font-serif">
                <span>Indeks: {activeHour.score} / 100</span>
                {activeHour.isPeak && <span className="text-amber-400 font-bold text-xs">⭐ Vrhunski sat</span>}
              </div>
              <div className="text-[#8ea396] text-[11px]">
                {getWeatherDescription(activeHour.weatherCode)} • Temp: {activeHour.temp}°C
              </div>
            </div>
          </div>

          <div className="text-right text-[#c49f6e] text-[11px] font-medium font-serif">
            {activeHour.score >= 80
              ? 'Maksimalna aktivnost uzimanja mamca'
              : activeHour.score >= 65
              ? 'Umjereno povoljni uslovi na vodi'
              : 'Period mirovanja ribe'}
          </div>
        </div>
      )}
    </div>
  );
}
