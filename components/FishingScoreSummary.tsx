'use client';

import { FishingScoreResult } from '@/lib/fishing/score';
import { Clock, Info, TrendingUp, Award } from 'lucide-react';

interface FishingScoreSummaryProps {
  scoreResult: FishingScoreResult;
  locationName: string;
  selectedSpeciesName?: string;
  topSpeciesName?: string;
  isTopSpeciesFeatured?: boolean;
}

export default function FishingScoreSummary({
  scoreResult,
  locationName,
  selectedSpeciesName,
  topSpeciesName,
  isTopSpeciesFeatured = false,
}: FishingScoreSummaryProps) {
  const { totalScore, categoryLabel, category, factors, bestPeriods, disclaimer, clarityTip, bottomTip } = scoreResult;

  let badgeColor = 'bg-[#2e7d58] text-white border-[#4ca778]';
  if (totalScore >= 85) badgeColor = 'bg-[#2e7d58] text-white border-emerald-400 font-black';
  else if (totalScore >= 75) badgeColor = 'bg-[#27523e] text-emerald-200 border-[#346d53]';
  else if (totalScore >= 60) badgeColor = 'bg-[#1e435f] text-sky-200 border-[#2b536e]';
  else if (totalScore >= 45) badgeColor = 'bg-[#473d34] text-amber-200 border-[#755c43]';
  else badgeColor = 'bg-[#4a2222] text-rose-200 border-rose-800';

  const featuredTitle = topSpeciesName
    ? `Top Vrsta sa Najboljim Uslovima: ${topSpeciesName}`
    : selectedSpeciesName
    ? `Uslovi za: ${selectedSpeciesName}`
    : 'Opšti Uslovi na Vodi';

  return (
    <div className="panel-outdoors-water rounded-lg p-5 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a354c] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0284c7] block font-serif flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#2b87be]" />
            BILTEN RIBOLOVNIH USLOVA • {locationName}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white font-serif flex items-center gap-2 mt-0.5">
            {featuredTitle}
            {isTopSpeciesFeatured && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#2e7d58]/40 text-emerald-300 font-sans border border-[#2e7d58]">
                Najbolji Izbor Danas
              </span>
            )}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
          {categoryLabel}
        </div>
      </div>

      {/* Main Score & Best Intervals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Score Dial */}
        <div className="bg-[#122536] p-4 rounded-lg border border-[#1a354c] flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#0d1a26] border border-[#244866] flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="text-2xl font-black text-white font-serif">{totalScore}</span>
            <span className="text-[9px] text-[#2b87be] uppercase font-bold">/ 100</span>
          </div>
          <div>
            <span className="text-xs text-[#d5d1c3] font-bold block font-serif">Indeks Aktivnosti</span>
            <span className="text-xs text-[#8ea396] block mt-0.5 leading-snug">
              {totalScore >= 80
                ? 'Povoljan pritisak i solunarni tajming'
                : totalScore >= 65
                ? 'Dobre šanse u rano jutro i predvečerje'
                : 'Potrebna precizna prezentacija na terenu'}
            </span>
          </div>
        </div>

        {/* Hot Intervals for Featured Species */}
        <div className="md:col-span-2 bg-[#122536] p-4 rounded-lg border border-[#1a354c] space-y-2">
          <div className="text-xs font-bold text-[#e8e5db] flex items-center gap-1.5 font-serif">
            <Clock className="w-4 h-4 text-[#2b87be]" />
            Najbolji intervali danas za aktivnost ribe:
          </div>
          <div className="flex flex-wrap gap-2.5 pt-0.5">
            {bestPeriods.map((period, idx) => (
              <div
                key={idx}
                className="bg-[#0d1a26] border border-[#2e7d58] rounded px-3 py-1.5 flex flex-col gap-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">{period.start} – {period.end}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2e7d58]/30 text-emerald-300 font-bold border border-[#2e7d58]">
                    {period.score}%
                  </span>
                </div>
                {period.reason && (
                  <span className="text-[10px] text-[#c49f6e] font-medium truncate font-serif">
                    {period.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Factor Breakdown */}
      <div className="bg-[#0d1a26] p-3 rounded-lg border border-[#1a354c] space-y-2 text-xs">
        <div className="text-xs font-bold text-[#c49f6e] flex items-center gap-1.5 font-serif">
          <TrendingUp className="w-3.5 h-3.5 text-[#c49f6e]" />
          Razrada meteoroloških i solunarnih faktora:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#122536] p-2 rounded border border-[#1a354c]">
            <div className="text-[#8ea396] text-[11px]">Temperatura</div>
            <div className="font-bold text-white mt-0.5 font-mono">{factors.temperature} / 20</div>
          </div>
          <div className="bg-[#122536] p-2 rounded border border-[#1a354c]">
            <div className="text-[#8ea396] text-[11px]">Pritisak & Trend</div>
            <div className="font-bold text-white mt-0.5 font-mono">{factors.pressure + factors.pressureTrend} / 25</div>
          </div>
          <div className="bg-[#122536] p-2 rounded border border-[#1a354c]">
            <div className="text-[#8ea396] text-[11px]">Dio Dana</div>
            <div className="font-bold text-white mt-0.5 font-mono">{factors.timeOfDay} / 15</div>
          </div>
          <div className="bg-[#122536] p-2 rounded border border-[#1a354c]">
            <div className="text-[#8ea396] text-[11px]">Vjetar & Oblaci</div>
            <div className="font-bold text-white mt-0.5 font-mono">{factors.wind + factors.cloudCover} / 20</div>
          </div>
        </div>
      </div>

      {/* Dynamic Tactical Tip */}
      {clarityTip && (
        <div className="bg-[#122536] border border-[#1a354c] p-3 rounded-lg text-xs text-[#d5d1c3]">
          {clarityTip}
        </div>
      )}

      {/* FISHERMAN'S REALISM DISCLAIMER */}
      <div className="bg-[#0b120f] border border-[#1f3629] rounded-lg p-3.5 flex items-start gap-3 text-xs text-[#8ea396]">
        <Info className="w-4 h-4 text-[#4ca778] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#e8e5db] font-serif block">Odricanje odgovornosti i napomena za ribolovce:</span>
          <p className="leading-relaxed">
            {disclaimer} Ova procjena ne garantuje ulov ribe 100%. Uspjeh u ribolovu zavisi od mnoštva faktora na terenu: prozirnosti vode, vodenog dna (kamen, mulj, trava), izbora tačnog mjesta i zabacivanja, pravilne vožnje plovka ili vođenja varalice, adekvatnog mamca i debljine predveza.
          </p>
        </div>
      </div>

    </div>
  );
}
