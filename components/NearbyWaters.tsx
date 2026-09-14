'use client';

import { WaterBody } from '@/types';
import { calculateDistanceKm } from '@/lib/geo/geocoding';
import watersData from '@/data/waters.json';
import { MapPin, ChevronRight } from 'lucide-react';

interface NearbyWatersProps {
  currentLat: number;
  currentLng: number;
  onSelectWater?: (water: WaterBody) => void;
}

export default function NearbyWaters({ currentLat, currentLng, onSelectWater }: NearbyWatersProps) {
  const watersWithDistance = (watersData as WaterBody[]).map((w) => {
    const dist = calculateDistanceKm(currentLat, currentLng, w.latitude, w.longitude);
    return {
      ...w,
      distanceKm: dist,
      estimatedScore: Math.min(95, Math.max(62, 88 - Math.round(dist * 0.15))),
    };
  });

  watersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const topNearby = watersWithDistance.slice(0, 5);

  return (
    <div className="panel-outdoors rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1f3629] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c49f6e] block font-serif">
            Lokacijski Radijus
          </span>
          <h3 className="text-base font-bold text-white font-serif">Najbliže Vode i Reviri</h3>
        </div>
        <span className="text-xs text-[#8ea396] font-mono">Proračun km</span>
      </div>

      <div className="space-y-2.5">
        {topNearby.map((water) => (
          <div
            key={water.id}
            onClick={() => onSelectWater && onSelectWater(water)}
            className="bg-[#182820] hover:bg-[#1c3126] border border-[#274535] hover:border-[#4ca778] rounded p-3 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#14231b] border border-[#274535] flex items-center justify-center text-sm shrink-0">
                {water.type === 'river' ? '🌊' : '🏞️'}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm font-serif group-hover:text-[#c49f6e] transition-colors">
                  {water.name}
                </h4>
                <div className="text-xs text-[#8ea396] flex items-center gap-2">
                  <span>{water.municipality}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold font-mono">{water.distanceKm} km</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#4ca778] block font-mono">{water.estimatedScore}/100</span>
                <span className="text-[9px] text-[#8ea396] uppercase font-semibold">Uslovi 🟢</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8ea396] group-hover:text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
