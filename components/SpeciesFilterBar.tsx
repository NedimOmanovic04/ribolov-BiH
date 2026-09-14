'use client';

import { FishingCategoryFilter } from '@/lib/fishing/recommendations';
import { Compass } from 'lucide-react';

interface SpeciesFilterBarProps {
  activeFilter: FishingCategoryFilter;
  onSelectFilter: (filter: FishingCategoryFilter) => void;
}

export default function SpeciesFilterBar({ activeFilter, onSelectFilter }: SpeciesFilterBarProps) {
  const options: { id: FishingCategoryFilter; label: string; emoji: string }[] = [
    { id: 'all', label: 'Bilo šta', emoji: '🐟' },
    { id: 'predator', label: 'Predatorska riba', emoji: '🎯' },
    { id: 'coarse_carp', label: 'Mirna riba', emoji: '🌾' },
    { id: 'fly_trout', label: 'Mušičarenje', emoji: '🪰' },
    { id: 'trout', label: 'Pastrmka', emoji: '🐟' },
    { id: 'carp', label: 'Šaran', emoji: '🐟' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 border border-river-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-400" />
          Kategorija ribolova — "Šta da lovim?"
        </h3>
        <span className="text-xs text-emerald-400/70 hidden sm:inline">Odaberi stil ribolova</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectFilter(opt.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400'
                  : 'bg-river-900/80 hover:bg-river-800 text-emerald-200/80 border border-river-800'
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
