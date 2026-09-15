'use client';

import fishData from '@/data/fish.json';
import rulesData from '@/data/rules.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { formatLabel } from '@/lib/fishing/score';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function FishDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar currentLocationName="Enciklopedija Riba BiH" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="panel-outdoors rounded-lg p-6 space-y-2 border border-[#1f3629]">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
            📖 RIJEČNI I JEZERSKI TERENSKI VODIČ
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">Slatkovodne Vrste Riba u BiH</h1>
          <p className="text-xs text-[#8ea396] font-sans">
            Katalog autohtonih i unesenih vrsta s biologijom, fotografijama, temperaturnim rasponima, mamcima i važećim zakonskim mjerama.
          </p>
        </div>

        {/* Editorial Field Guide Grid with Fish Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fishData.map((fish) => {
            const rule = rulesData.find((r) => r.fish_id === fish.id);
            const formattedBaits = fish.baits.map(formatLabel);

            return (
              <a
                key={fish.id}
                href={`/fish/${fish.slug}`}
                className="panel-outdoors hover:bg-[#182820] rounded-lg p-5 space-y-3 transition-colors block border border-[#1f3629] hover:border-[#4ca778] group overflow-hidden"
              >
                {/* Fish Photo Banner */}
                {fish.image_url && (
                  <div className="w-full h-40 rounded border border-[#274535] overflow-hidden bg-[#0e1712]">
                    <img
                      src={fish.image_url}
                      alt={fish.name_bs}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg font-serif group-hover:text-[#c49f6e] transition-colors">
                      {fish.name_bs}
                    </h3>
                    <div className="text-xs italic text-[#8ea396] font-serif">{fish.scientific_name}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#14231b] text-[#4ca778] border border-[#274535] font-semibold uppercase">
                    {fish.category === 'predator' ? 'Grabljivica' : fish.category === 'fly_trout' ? 'Salmonid' : 'Mirna'}
                  </span>
                </div>

                <p className="text-xs text-[#d5d1c3] line-clamp-2 leading-relaxed">{fish.description}</p>

                <div className="space-y-1.5 text-xs pt-2 border-t border-[#1f3629]">
                  <div className="flex justify-between">
                    <span className="text-[#8ea396]">Optimalna temp:</span>
                    <span className="font-bold text-white font-mono">{fish.temperature.optimal_min}°C – {fish.temperature.optimal_max}°C</span>
                  </div>
                  {rule && (
                    <div className="flex justify-between">
                      <span className="text-[#8ea396]">Min. mjera / Lovostaj:</span>
                      <span className="font-bold text-amber-300 font-mono">{rule.min_length_cm} cm ({rule.closed_season})</span>
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="text-[#8ea396] text-[11px] block">Mamci:</span>
                    <span className="text-white text-xs truncate block font-medium">{formattedBaits.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8ea396] pt-2 border-t border-[#1f3629]">
                  <span className="flex items-center gap-1 text-[#4ca778]"><ShieldCheck className="w-3.5 h-3.5" /> Potvrđena biologija</span>
                  <span className="font-bold text-[#4ca778] group-hover:text-white flex items-center gap-1 font-serif">Vidi profil <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
