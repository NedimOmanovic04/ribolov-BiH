'use client';

import { FishingScoreResult } from '@/lib/fishing/score';
import { Clock, Info, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface FishingScoreSummaryProps {
  scoreResult: FishingScoreResult;
  locationName: string;
  selectedSpeciesName?: string;
}

export default function FishingScoreSummary({
  scoreResult,
  locationName,
  selectedSpeciesName,
}: FishingScoreSummaryProps) {
  const { totalScore, categoryLabel, category, factors, bestPeriods, disclaimer } = scoreResult;

  // Rating color theme
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let gaugeColor = 'from-emerald-600 to-teal-400';

  if (category === 'excellent') {
    badgeBg = 'bg-emerald-500/30 text-emerald-200 border-emerald-400';
    gaugeColor = 'from-emerald-500 to-green-400';
  } else if (category === 'very_good') {
    badgeBg = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    gaugeColor = 'from-teal-600 to-emerald-400';
  } else if (category === 'good') {
    badgeBg = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    gaugeColor = 'from-sky-600 to-teal-400';
  } else if (category === 'fair') {
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    gaugeColor = 'from-amber-600 to-yellow-400';
  } else {
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    gaugeColor = 'from-rose-600 to-amber-500';
  }

  return (
    <div className="glass-panel-water rounded-2xl p-5 border border-water-800/80 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-water-800/60 pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-water-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-water-400" />
            Ribolovni Uslovi {selectedSpeciesName ? `za: ${selectedSpeciesName}` : 'Općenito'}
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{locationName}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeBg}`}>
          🟢 {categoryLabel}
        </div>
      </div>

      {/* Main Score Display & Best Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Big 0-100 Score Gauge */}
        <div className="bg-water-900/90 rounded-xl p-4 border border-water-800/80 flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-water-950 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-current text-emerald-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${totalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{totalScore}</span>
              <span className="text-[9px] text-water-400 uppercase font-semibold">/ 100</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-water-300 font-semibold block">Ribolovni Indeks</span>
            <div className="text-xs text-water-400/80 mt-0.5">
              {totalScore >= 80 ? 'Izvanredni uslovi za ulazak na vodu' : totalScore >= 65 ? 'Povoljno vrijeme i pritisak' : 'Preporučuje se prilagođavanje mamca'}
            </div>
          </div>
        </div>

        {/* Best Hours Window Card */}
        <div className="md:col-span-2 bg-water-900/90 rounded-xl p-4 border border-water-800/80 space-y-2">
          <div className="text-xs font-semibold text-water-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Najbolji intervali danas za aktivnost ribe:
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {bestPeriods.map((period, idx) => (
              <div
                key={idx}
                className="bg-river-900/90 border border-emerald-500/40 rounded-lg px-3 py-1.5 flex items-center gap-2"
              >
                <span className="text-xs font-bold text-white">{period.start} – {period.end}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {period.score}% ⭐
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Factor Breakdown Grid */}
      <div className="bg-water-950/60 rounded-xl p-4 border border-water-800/60 space-y-2.5">
        <div className="text-xs font-semibold text-water-300 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-water-400" />
          Faktori ribolovne ocjene:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          
          <div className="bg-water-900/80 p-2 rounded-lg border border-water-800/60">
            <div className="text-water-400 text-[11px]">Temperatura</div>
            <div className="font-bold text-white mt-0.5">{factors.temperature} / 20</div>
          </div>

          <div className="bg-water-900/80 p-2 rounded-lg border border-water-800/60">
            <div className="text-water-400 text-[11px]">Pritisak & Trend</div>
            <div className="font-bold text-white mt-0.5">{factors.pressure + factors.pressureTrend} / 25</div>
          </div>

          <div className="bg-water-900/80 p-2 rounded-lg border border-water-800/60">
            <div className="text-water-400 text-[11px]">Dio Dana</div>
            <div className="font-bold text-white mt-0.5">{factors.timeOfDay} / 15</div>
          </div>

          <div className="bg-water-900/80 p-2 rounded-lg border border-water-800/60">
            <div className="text-water-400 text-[11px]">Vjetar & Oblaci</div>
            <div className="font-bold text-white mt-0.5">{factors.wind + factors.cloudCover} / 20</div>
          </div>

        </div>
      </div>

      {/* Explicit User Requirements Disclaimer */}
      <div className="bg-river-950/80 border border-river-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-river-300/80">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-300">Procjena ribolovnih uslova: </span>
          {disclaimer} Ova ocjena predstavlja procjenu ponašanja ribe na osnovu vremenskih varijabli i ne garantuje ulov.
        </div>
      </div>
    </div>
  );
}
