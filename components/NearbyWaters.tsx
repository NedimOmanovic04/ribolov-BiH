'use client';

import { WaterBody } from '@/types';
import { calculateDistanceKm } from '@/lib/geo/geocoding';
import watersData from '@/data/waters.json';
import { MapPin, Waves, ChevronRight, Compass } from 'lucide-react';

interface NearbyWatersProps {
  currentLat: number;
  currentLng: number;
  onSelectWater?: (water: WaterBody) => void;
}

export default function NearbyWaters({ currentLat, currentLng, onSelectWater }: NearbyWatersProps) {
  // Compute distance to each water body
  const watersWithDistance = (watersData as WaterBody[]).map((w) => {
    const dist = calculateDistanceKm(currentLat, currentLng, w.latitude, w.longitude);
    return {
      ...w,
      distanceKm: dist,
      // Sample score heuristic based on location proximity
      estimatedScore: Math.min(95, Math.max(62, 88 - Math.round(dist * 0.15))),
    };
  });

  // Sort by distance (closest first)
  watersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  const topNearby = watersWithDistance.slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-river-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-river-800/60 pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            📍 Lokacijski radijus
          </div>
          <h3 className="text-base font-bold text-white">Najbolja mjesta za ribolov u blizini</h3>
        </div>
        <span className="text-xs text-emerald-400/60">Automatski proračun km</span>
      </div>

      <div className="space-y-2.5">
        {topNearby.map((water, idx) => (
          <div
            key={water.id}
            onClick={() => onSelectWater && onSelectWater(water)}
            className="bg-river-900/90 hover:bg-river-800/90 border border-river-800/70 hover:border-emerald-500/40 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-sm text-emerald-400 shrink-0">
                {water.type === 'river' ? '🌊' : '🏞️'}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                  {water.name}
                </h4>
                <div className="text-xs text-emerald-400/60 flex items-center gap-2">
                  <span>{water.municipality}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{water.distanceKm} km od vas</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-400 block">{water.estimatedScore}/100</span>
                <span className="text-[9px] text-emerald-300 uppercase font-semibold">Uslovi 🟢</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500/60 group-hover:text-emerald-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
