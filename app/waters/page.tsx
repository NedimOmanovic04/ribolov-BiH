'use client';

import watersData from '@/data/waters.json';
import relationsData from '@/data/relations.json';
import fishData from '@/data/fish.json';
import Navbar from '@/components/Navbar';
import { MapPin, ChevronRight } from 'lucide-react';

export default function WatersDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar currentLocationName="Baza Voda BiH" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="panel-outdoors rounded-lg p-6 space-y-2 border border-[#1f3629]">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
            🏞️ REGISTAR VODA I REVIRA BIH
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">Rijeke, Jezera i Akumulacije</h1>
          <p className="text-xs text-[#8ea396] font-sans">
            Vodič kroz najznačajnije ribolovne lokacije sa opštim podacima, upraviteljima, dozvolama i pristupačnim ribljim fondom.
          </p>
        </div>

        {/* Spot Directory Grid */}
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
                className="panel-outdoors hover:bg-[#182820] rounded-lg p-5 space-y-3 transition-colors block border border-[#1f3629] hover:border-[#4ca778] group"
              >
                <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
                  <h3 className="font-bold text-white text-lg font-serif group-hover:text-[#c49f6e] transition-colors flex items-center gap-2">
                    <span>{water.type === 'river' ? '🌊' : '🏞️'}</span>
                    {water.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#14231b] text-[#4ca778] border border-[#274535] font-semibold">
                    {water.type === 'river' ? 'Rijeka' : 'Jezero'}
                  </span>
                </div>

                <div className="text-xs text-[#8ea396] flex items-center gap-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-[#4ca778]" />
                  {water.municipality} ({water.region})
                </div>

                <p className="text-xs text-[#d5d1c3] line-clamp-2 leading-relaxed">{water.description}</p>

                <div className="space-y-1.5 text-xs pt-2 border-t border-[#1f3629]">
                  <div className="text-[#8ea396] text-[11px] font-semibold font-serif">Glavne vrste:</div>
                  <div className="flex flex-wrap gap-1">
                    {speciesNames.map((sName, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#14231b] text-[#e8e5db] text-[11px] border border-[#274535]">
                        {sName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8ea396] pt-2 border-t border-[#1f3629]">
                  <span>Upravitelj: {water.manager}</span>
                  <span className="font-bold text-[#4ca778] group-hover:text-white flex items-center gap-1 font-serif">Detalji vode <ChevronRight className="w-3 h-3" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
