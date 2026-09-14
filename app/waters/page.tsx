'use client';

import watersData from '@/data/waters.json';
import relationsData from '@/data/relations.json';
import fishData from '@/data/fish.json';
import Navbar from '@/components/Navbar';
import { Waves, MapPin, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react';

export default function WatersDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-river-950 text-emerald-50">
      <Navbar currentLocationName="Baza Voda BiH" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-river-800/80 space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            🌊 Registar Rijeka i Jezera BiH
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Ribolovne Vode u Bosni i Hercegovini</h1>
          <p className="text-xs text-emerald-400/70">
            Pregled rijeka, prirodnih jezera i akumulacija sa upraviteljima voda, dozvolama i pristupačnim ribljim fondom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watersData.map((water) => {
            const rels = relationsData.filter((r) => r.water_body_id === water.id);
            const speciesNames = rels.map((r) => {
              const f = fishData.find((fish) => fish.id === r.fish_id);
              return f ? f.name_bs : '';
            }).filter(Boolean);

            return (
              <a
                key={water.id}
                href={`/waters/${water.slug}`}
                className="glass-panel hover:bg-river-900/90 rounded-2xl p-5 border border-river-800 hover:border-emerald-500/50 transition-all space-y-3 group block"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>{water.type === 'river' ? '🌊' : '🏞️'}</span>
                    {water.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    {water.type === 'river' ? 'Rijeka' : 'Jezero / Akumulacija'}
                  </span>
                </div>

                <div className="text-xs text-emerald-400/70 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {water.municipality} ({water.region})
                </div>

                <p className="text-xs text-river-300 line-clamp-2">{water.description}</p>

                <div className="space-y-1.5 text-xs pt-2 border-t border-river-800/50">
                  <div className="text-emerald-400/70 text-[11px] font-semibold">Glavne riblje vrste:</div>
                  <div className="flex flex-wrap gap-1">
                    {speciesNames.map((sName, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-river-900 text-emerald-200 text-[11px] border border-river-800">
                        {sName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-400/60 pt-2 border-t border-river-800/30">
                  <span>Upravitelj: {water.manager}</span>
                  <span className="font-bold text-emerald-400 group-hover:text-emerald-200 flex items-center gap-1">Detalji <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
