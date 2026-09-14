'use client';

import { SpeciesRecommendation } from '@/lib/fishing/recommendations';
import { formatLabel } from '@/lib/fishing/score';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import sourcesData from '@/data/sources.json';

interface TopSpeciesListProps {
  recommendations: SpeciesRecommendation[];
  onSelectSpecies?: (speciesId: string) => void;
}

export default function TopSpeciesList({ recommendations, onSelectSpecies }: TopSpeciesListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="glass-panel p-6 text-center text-xs text-emerald-400/60 rounded-2xl">
        Nije pronađena nijedna riba za odabranu kategoriju.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 border border-river-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-river-800/60 pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            🎯 Ribolov Danas
          </div>
          <h3 className="text-base font-bold text-white">Najbolji izbor za trenutne uslove na vodi</h3>
        </div>
        <span className="text-xs text-emerald-400/60">Prilagođeno biološkom profilu vrste</span>
      </div>

      {/* List of top species cards */}
      <div className="space-y-3">
        {recommendations.slice(0, 8).map(({ species, scoreResult, rank }) => {
          let medalEmoji = '🥉';
          let rankColor = 'bg-river-800 text-river-300 border-river-700';

          if (rank === 1) {
            medalEmoji = '🥇';
            rankColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black';
          } else if (rank === 2) {
            medalEmoji = '🥈';
            rankColor = 'bg-slate-400/20 text-slate-200 border-slate-400/40 font-bold';
          } else if (rank === 3) {
            medalEmoji = '🥉';
            rankColor = 'bg-amber-700/20 text-amber-400 border-amber-700/40 font-bold';
          }

          const source = sourcesData.find((s) => s.id === species.source_id);
          const topPeriod = scoreResult.bestPeriods[0];
          const formattedBaits = species.baits.map(formatLabel);

          return (
            <div
              key={species.id}
              onClick={() => onSelectSpecies && onSelectSpecies(species.id)}
              className="bg-river-900/90 hover:bg-river-800/90 border border-river-800/80 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer group space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm shadow ${rankColor}`}>
                    {medalEmoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      {species.name_bs}
                      <span className="text-xs italic text-emerald-400/60 font-normal">
                        ({species.scientific_name})
                      </span>
                    </h4>
                    <div className="text-xs text-emerald-400/60 flex items-center gap-2">
                      <span>Kategorija: {species.category === 'predator' ? 'Grabljivica' : species.category === 'fly_trout' ? 'Salmonid / Mušičarska' : 'Mirna / Šaranska'}</span>
                    </div>
                  </div>
                </div>

                {/* Score Dial Badge */}
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-emerald-400 flex items-baseline justify-end gap-1">
                    {scoreResult.totalScore}
                    <span className="text-xs font-bold text-emerald-400/70">/100</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold uppercase">
                    🟢 {scoreResult.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Best periods & Recommended baits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-river-800/40">
                <div className="bg-river-950/60 p-2.5 rounded-lg border border-river-800/40">
                  <span className="text-emerald-400/70 text-[11px] block font-semibold">🔥 Hot period za {species.name_bs}:</span>
                  <span className="text-white font-bold block">{topPeriod?.start} – {topPeriod?.end} ({topPeriod?.score}%)</span>
                  {topPeriod?.reason && (
                    <span className="text-[10px] text-amber-300 font-medium block truncate mt-0.5">
                      💡 {topPeriod.reason}
                    </span>
                  )}
                </div>

                <div className="bg-river-950/60 p-2.5 rounded-lg border border-river-800/40">
                  <span className="text-emerald-400/70 text-[11px] block font-semibold">Preporučeni mamci:</span>
                  <span className="text-white truncate block">{formattedBaits.slice(0, 3).join(', ')}</span>
                </div>
              </div>

              {/* Verified Source Badge Footer */}
              <div className="flex items-center justify-between text-[11px] text-emerald-400/60 pt-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Izvor: {source ? source.title : 'Potvrđen registar SRS BiH'}</span>
                </div>
                <a
                  href={`/fish/${species.slug}`}
                  className="text-emerald-400 group-hover:text-emerald-200 font-semibold flex items-center gap-1 hover:underline"
                >
                  Detaljno o vrsti <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
