'use client';

import { FishingCategoryFilter } from '@/lib/fishing/recommendations';
import { Compass } from 'lucide-react';

interface SpeciesFilterBarProps {
  activeFilter: FishingCategoryFilter;
  onSelectFilter: (filter: FishingCategoryFilter) => void;
}

export default function SpeciesFilterBar({ activeFilter, onSelectFilter }: SpeciesFilterBarProps) {
  const options: { id: FishingCategoryFilter; label: string; emoji: string }[] = [
    { id: 'all', label: 'Sve vrste', emoji: '🐟' },
    { id: 'predator', label: 'Grabljivice', emoji: '🎯' },
    { id: 'coarse_carp', label: 'Mirna riba', emoji: '🌾' },
    { id: 'fly_trout', label: 'Mušičarenje', emoji: '🪰' },
    { id: 'trout', label: 'Pastrmka', emoji: '🏔️' },
    { id: 'carp', label: 'Šaran', emoji: '🎣' },
  ];

  return (
    <div className="panel-outdoors rounded-lg p-4 border border-[#1f3629] space-y-3">
      <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-serif">
          <Compass className="w-4 h-4 text-[#4ca778]" />
          Kategorija ribolova — &quot;Šta da lovim?&quot;
        </h3>
        <span className="text-xs text-[#8ea396] hidden sm:inline">Odaberi stil ribolova</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectFilter(opt.id)}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#274535] text-white border-[#4ca778] font-bold'
                  : 'bg-[#182820] hover:bg-[#1c3126] text-[#8ea396] hover:text-white border-[#274535]'
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
