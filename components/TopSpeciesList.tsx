'use client';

import { SpeciesRecommendation } from '@/lib/fishing/recommendations';
import { formatLabel } from '@/lib/fishing/score';
import { ChevronRight, ShieldCheck, Fish } from 'lucide-react';
import sourcesData from '@/data/sources.json';

interface TopSpeciesListProps {
  recommendations: SpeciesRecommendation[];
  onSelectSpecies?: (speciesId: string) => void;
}

export default function TopSpeciesList({ recommendations, onSelectSpecies }: TopSpeciesListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="panel-outdoors p-6 text-center text-xs text-[#8ea396] rounded-lg">
        Nije pronađena nijedna riba za odabranu kategoriju.
      </div>
    );
  }

  return (
    <div className="panel-outdoors rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1f3629] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
            Preporuka za Ribolov Danas
          </span>
          <h3 className="text-base font-bold text-white font-serif">Najbolji izbor vrsta za trenutne uslove na vodi</h3>
        </div>
        <span className="text-xs text-[#8ea396] hidden sm:inline">Prilagođeno biologiji vrste</span>
      </div>

      {/* Editorial Table / Cards list */}
      <div className="space-y-3">
        {recommendations.slice(0, 8).map(({ species, scoreResult, rank }) => {
          let rankBadge = 'bg-[#182820] text-[#d5d1c3] border-[#274535]';
          if (rank === 1) rankBadge = 'bg-[#473d34] text-amber-300 border-[#c49f6e] font-black';
          else if (rank === 2) rankBadge = 'bg-[#1e3226] text-slate-200 border-[#345b46] font-bold';
          else if (rank === 3) rankBadge = 'bg-[#1c2a38] text-amber-400 border-[#2b536e] font-bold';

          const source = sourcesData.find((s) => s.id === species.source_id);
          const topPeriod = scoreResult.bestPeriods[0];
          const formattedBaits = species.baits.map(formatLabel);

          return (
            <div
              key={species.id}
              onClick={() => onSelectSpecies && onSelectSpecies(species.id)}
              className="bg-[#182820] hover:bg-[#1c3126] border border-[#274535] hover:border-[#4ca778] rounded-lg p-4 transition-colors cursor-pointer space-y-3 group"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-serif shadow ${rankBadge}`}>
                    #{rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base font-serif group-hover:text-[#c49f6e] transition-colors flex items-center gap-2">
                      {species.name_bs}
                      <span className="text-xs italic text-[#8ea396] font-normal font-serif">
                        ({species.scientific_name})
                      </span>
                    </h4>
                    <div className="text-xs text-[#8ea396] flex items-center gap-2 mt-0.5">
                      <span>Kategorija: {species.category === 'predator' ? 'Grabljivica' : species.category === 'fly_trout' ? 'Salmonid / Mušičarska' : 'Mirna / Šaranska'}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-white font-serif flex items-baseline justify-end gap-1">
                    {scoreResult.totalScore}
                    <span className="text-xs font-bold text-[#4ca778]">/100</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b120f] text-[#4ca778] border border-[#1f3629] font-semibold uppercase">
                    🟢 {scoreResult.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Hot period & Baits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1f3629]">
                <div className="bg-[#14231b] p-2.5 rounded border border-[#274535]">
                  <span className="text-[#8ea396] text-[11px] font-semibold block font-serif">🔥 Hot period za {species.name_bs}:</span>
                  <span className="text-white font-bold font-mono block">{topPeriod?.start} – {topPeriod?.end} ({topPeriod?.score}%)</span>
                  {topPeriod?.reason && (
                    <span className="text-[10px] text-[#c49f6e] font-medium block truncate mt-0.5 font-serif">
                      💡 {topPeriod.reason}
                    </span>
                  )}
                </div>

                <div className="bg-[#14231b] p-2.5 rounded border border-[#274535]">
                  <span className="text-[#8ea396] text-[11px] font-semibold block font-serif">Preporučeni mamci:</span>
                  <span className="text-[#e8e5db] truncate block font-medium">{formattedBaits.slice(0, 3).join(', ')}</span>
                </div>
              </div>

              {/* Source Verification Footer */}
              <div className="flex items-center justify-between text-[11px] text-[#8ea396] pt-1">
                <div className="flex items-center gap-1 text-[#4ca778]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4ca778]" />
                  <span>Izvor: {source ? source.title : 'Potvrđen registar SRS BiH'}</span>
                </div>
                <a
                  href={`/fish/${species.slug}`}
                  className="text-[#4ca778] group-hover:text-white font-semibold flex items-center gap-1 hover:underline"
                >
                  Profil vrste <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
