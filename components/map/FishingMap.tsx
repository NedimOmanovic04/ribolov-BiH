'use client';

import dynamic from 'next/dynamic';

const FishingMapClient = dynamic(() => import('./FishingMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-water-900/60 rounded-xl animate-pulse flex flex-col items-center justify-center border border-water-800 text-water-300 gap-2">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium">Učitavanje interaktivne karte BiH...</span>
    </div>
  ),
});

interface FishingMapProps {
  selectedLocation?: { lat: number; lng: number; name?: string };
  onSelectWater?: (water: any) => void;
}

export default function FishingMap(props: FishingMapProps) {
  return <FishingMapClient {...props} />;
}
