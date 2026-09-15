'use client';

import { FishingCategoryFilter } from '@/lib/fishing/recommendations';
import { Compass, Fish, Target, Waves, Feather, Mountain } from 'lucide-react';

interface SpeciesFilterBarProps {
  activeFilter: FishingCategoryFilter;
  onSelectFilter: (filter: FishingCategoryFilter) => void;
}

export default function SpeciesFilterBar({ activeFilter, onSelectFilter }: SpeciesFilterBarProps) {
  const options: { id: FishingCategoryFilter; label: string; icon: any }[] = [
    { id: 'all', label: 'Sve vrste', icon: Fish },
    { id: 'predator', label: 'Grabljivice', icon: Target },
    { id: 'coarse_carp', label: 'Mirna riba', icon: Waves },
    { id: 'fly_trout', label: 'Mušičarenje', icon: Feather },
    { id: 'trout', label: 'Pastrmka', icon: Mountain },
    { id: 'carp', label: 'Šaran', icon: Fish },
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
          const IconComp = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectFilter(opt.id)}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#274535] text-white border-[#4ca778] font-bold shadow'
                  : 'bg-[#182820] hover:bg-[#1c3126] text-[#8ea396] hover:text-white border-[#274535]'
              }`}
            >
              <IconComp className="w-4 h-4 text-[#4ca778]" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
