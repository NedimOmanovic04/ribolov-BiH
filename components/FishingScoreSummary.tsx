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

  let badgeColor = 'bg-[#2e7d58] text-white border-[#4ca778]';
  if (totalScore >= 85) badgeColor = 'bg-[#2e7d58] text-white border-emerald-400 font-black';
  else if (totalScore >= 75) badgeColor = 'bg-[#27523e] text-emerald-200 border-[#346d53]';
  else if (totalScore >= 60) badgeColor = 'bg-[#1e435f] text-sky-200 border-[#2b536e]';
  else if (totalScore >= 45) badgeColor = 'bg-[#473d34] text-amber-200 border-[#755c43]';
  else badgeColor = 'bg-[#4a2222] text-rose-200 border-rose-800';

  return (
    <div className="panel-outdoors-water rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a354c] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0284c7] block font-serif">
            Bilten Ribolovnih Uslova
          </span>
          <h3 className="text-xl font-bold text-white font-serif">
            {selectedSpeciesName ? `Uslovi za: ${selectedSpeciesName}` : 'Opšti Uslovi na Vodi'}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
          🟢 {categoryLabel}
        </div>
      </div>

      {/* Main Score & Best Intervals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Score Dial */}
        <div className="bg-[#122536] p-4 rounded border border-[#1a354c] flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-[#0d1a26] border border-[#244866] flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black text-white font-serif">{totalScore}</span>
            <span className="text-[9px] text-[#2b87be] uppercase font-bold">/ 100</span>
          </div>
          <div>
            <span className="text-xs text-[#d5d1c3] font-bold block">Indeks Ulova</span>
            <span className="text-xs text-[#8ea396] block mt-0.5">
              {totalScore >= 80 ? 'Vrlo povoljan pritisak i temperatura' : totalScore >= 65 ? 'Dobre šanse u rano jutro' : 'Potrebna precizna prezentacija'}
            </span>
          </div>
        </div>

        {/* Hot Intervals for Species */}
        <div className="md:col-span-2 bg-[#122536] p-4 rounded border border-[#1a354c] space-y-2">
          <div className="text-xs font-bold text-[#e8e5db] flex items-center gap-1.5 font-serif">
            <Clock className="w-4 h-4 text-[#2b87be]" />
            Najbolji intervali danas za aktivnost ribe:
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {bestPeriods.map((period, idx) => (
              <div
                key={idx}
                className="bg-[#0d1a26] border border-[#2e7d58] rounded px-3 py-1.5 flex flex-col gap-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-serif">{period.start} – {period.end}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2e7d58]/30 text-emerald-300 font-bold border border-[#2e7d58]">
                    {period.score}% ⭐
                  </span>
                </div>
                {period.reason && (
                  <span className="text-[10px] text-[#c49f6e] font-medium truncate">
                    💡 {period.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Factor Matrix */}
      <div className="bg-[#0d1a26] p-3 rounded border border-[#1a354c] space-y-2">
        <div className="text-xs font-bold text-[#c49f6e] flex items-center gap-1.5 font-serif">
          <TrendingUp className="w-3.5 h-3.5 text-[#c49f6e]" />
          Razrada faktora ocjene:
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

      {/* Fisherman's Disclaimer Notice */}
      <div className="bg-[#0b120f] border border-[#1f3629] rounded p-3 flex items-start gap-2.5 text-xs text-[#8ea396]">
        <Info className="w-4 h-4 text-[#4ca778] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#e8e5db]">Napomena za ribolovce: </span>
          {disclaimer} Ocjena ne predstavlja garantovan ulov, već proračun povoljnosti uslova na terenu.
        </div>
      </div>
    </div>
  );
}
