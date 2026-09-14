'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import watersData from '@/data/waters.json';
import { WaterBody } from '@/types';

// Custom MapPin icons using SVG data URIs
const riverIcon = L.divIcon({
  className: 'custom-river-marker',
  html: `<div style="background-color: #0ea5e9; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(14,165,233,0.6); color: white; font-size: 14px;">🌊</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const lakeIcon = L.divIcon({
  className: 'custom-lake-marker',
  html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(16,185,129,0.6); color: white; font-size: 14px;">🏞️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const activeUserIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(245,158,11,0.8); color: white; font-size: 16px;">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapViewController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface FishingMapClientProps {
  selectedLocation?: { lat: number; lng: number; name?: string };
  onSelectWater?: (water: any) => void;
}

export default function FishingMapClient({ selectedLocation, onSelectWater }: FishingMapClientProps) {
  const defaultCenter: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [44.1194, 17.85]; // Central BiH view

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapViewController center={defaultCenter} />

      {/* User's active selected location pin */}
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={activeUserIcon}>
          <Popup>
            <div className="text-sm font-semibold text-amber-400">📍 Odabrana lokacija</div>
            <div className="text-xs text-slate-300">{selectedLocation.name || 'Trenutna pozicija'}</div>
          </Popup>
        </Marker>
      )}

      {/* Water bodies markers */}
      {watersData.map((water) => {
        const isLake = water.type === 'lake' || water.type === 'reservoir';
        const icon = isLake ? lakeIcon : riverIcon;

        return (
          <Marker
            key={water.id}
            position={[water.latitude, water.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onSelectWater) onSelectWater(water);
              },
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                  <span>{isLake ? '🏞️' : '🌊'}</span> {water.name}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {water.type === 'river' ? 'Rijeka' : 'Jezero / Akumulacija'} • {water.municipality}
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{water.description}</div>
                <a
                  href={`/waters/${water.slug}`}
                  className="mt-2.5 inline-block w-full text-center py-1 px-2 rounded bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 text-xs font-medium transition-colors"
                >
                  Vidi uslove i vrste ➔
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
