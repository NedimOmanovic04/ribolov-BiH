'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Fish, Waves, Calendar } from 'lucide-react';
import { searchLocations, LocationSearchResult } from '@/lib/geo/geocoding';

interface NavbarProps {
  currentLocationName: string;
  onSelectLocation?: (loc: { lat: number; lng: number; name: string }) => void;
  onUseMyLocation?: () => void;
  isLocating?: boolean;
}

export default function Navbar({
  currentLocationName,
  onSelectLocation,
  onUseMyLocation,
  isLocating,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const searchRes = await searchLocations(searchQuery);
      setResults(searchRes);
      setIsSearching(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: LocationSearchResult) => {
    if (onSelectLocation) {
      onSelectLocation({
        lat: item.latitude,
        lng: item.longitude,
        name: item.name,
      });
    } else {
      window.location.href = `/?lat=${item.latitude}&lng=${item.longitude}`;
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleGeoClick = () => {
    if (onUseMyLocation) {
      onUseMyLocation();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-river-950/90 backdrop-blur-md border-b border-river-800 text-river-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Branding */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform border border-emerald-500/30">
              <Fish className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1">
                RIBOLOV <span className="text-emerald-400">BiH</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 block uppercase tracking-widest font-semibold">
                Prognoza & Vode
              </span>
            </div>
          </a>

          {/* Center Search Bar & Geolocation Button */}
          <div className="flex-1 max-w-lg relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-emerald-500/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsOpen(true)}
                placeholder="Pretraži rijeku, jezero ili grad (npr. Jablaničko jezero, Bihać, Drina)..."
                className="w-full pl-9 pr-24 py-2 text-sm bg-river-900/90 border border-river-800 rounded-xl text-emerald-100 placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <button
                onClick={handleGeoClick}
                disabled={isLocating}
                className="absolute right-1.5 px-2.5 py-1 text-xs bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 rounded-lg flex items-center gap-1 transition-colors border border-emerald-600/40"
                title="Koristi trenutnu GPS lokaciju"
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">{isLocating ? 'Tražim...' : 'Lokacija'}</span>
              </button>
            </div>

            {/* Search Dropdown Results */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-river-900 border border-river-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-river-800/50">
                {isSearching ? (
                  <div className="p-3 text-xs text-emerald-400/70 text-center flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    Pretraživanje geolocijskog registra...
                  </div>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left p-3 hover:bg-river-800/60 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-emerald-100 group-hover:text-emerald-300 flex items-center gap-1.5">
                          <span>{item.type === 'water' ? '🏞️' : '🏙️'}</span>
                          {item.name}
                        </div>
                        <div className="text-xs text-emerald-400/60">
                          {item.municipality ? `${item.municipality}, ` : ''}{item.region || item.country}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {item.type === 'water' ? 'Voda' : 'Grad'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-emerald-400/60 text-center">
                    Nije pronađena nijedna lokacija za "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <a
              href="/forecast"
              className="px-3 py-2 rounded-lg hover:bg-river-900 text-emerald-200/80 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Prognoza
            </a>
            <a
              href="/fish"
              className="px-3 py-2 rounded-lg hover:bg-river-900 text-emerald-200/80 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Fish className="w-3.5 h-3.5 text-emerald-400" />
              Ribe BiH
            </a>
            <a
              href="/waters"
              className="px-3 py-2 rounded-lg hover:bg-river-900 text-emerald-200/80 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5 text-emerald-400" />
              Vode BiH
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}
