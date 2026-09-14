'use client';

import fishData from '@/data/fish.json';
import rulesData from '@/data/rules.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { Fish, ShieldCheck, Thermometer, ChevronRight } from 'lucide-react';

export default function FishDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-river-950 text-emerald-50">
      <Navbar currentLocationName="Enciklopedija Riba BiH" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-river-800/80 space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            🐟 Baza Slatkovodnih Riba BiH
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sve Riječne i Jezerske Vrste Riba</h1>
          <p className="text-xs text-emerald-400/70">
            Katalog autohtonih i unesenih vrsta u vodotocima Bosne i Hercegovine sa optimalnim temperaturama, mamcima i zakonskim mjerama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fishData.map((fish) => {
            const rule = rulesData.find((r) => r.fish_id === fish.id);
            const source = sourcesData.find((s) => s.id === fish.source_id);

            return (
              <a
                key={fish.id}
                href={`/fish/${fish.slug}`}
                className="glass-panel hover:bg-river-900/90 rounded-2xl p-5 border border-river-800 hover:border-emerald-500/50 transition-all space-y-3 group block"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">
                    {fish.name_bs}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    {fish.category === 'predator' ? 'Grabljivica' : fish.category === 'fly_trout' ? 'Salmonid' : 'Mirna'}
                  </span>
                </div>

                <div className="text-xs italic text-emerald-400/60 font-serif">{fish.scientific_name}</div>
                <p className="text-xs text-river-300 line-clamp-2">{fish.description}</p>

                <div className="space-y-1.5 text-xs pt-2 border-t border-river-800/50">
                  <div className="flex justify-between">
                    <span className="text-emerald-400/70">Optimalna temp:</span>
                    <span className="font-bold text-white">{fish.temperature.optimal_min}°C – {fish.temperature.optimal_max}°C</span>
                  </div>
                  {rule && (
                    <div className="flex justify-between">
                      <span className="text-emerald-400/70">Min. mjera / Lovostaj:</span>
                      <span className="font-bold text-amber-400">{rule.min_length_cm} cm ({rule.closed_season})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-400/60 pt-2 border-t border-river-800/30">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Potvrđen izvor</span>
                  <span className="font-bold text-emerald-400 group-hover:text-emerald-200 flex items-center gap-1">Vidi profil <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
