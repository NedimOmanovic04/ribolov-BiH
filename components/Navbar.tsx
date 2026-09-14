'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Fish, Waves, Calendar, Compass, Shield } from 'lucide-react';
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
    <header className="bg-[#0e1712] border-b border-[#1f3629] text-[#f4f3ef] sticky top-0 z-40 shadow-lg">
      
      {/* Top Banner Notice */}
      <div className="bg-[#14231b] border-b border-[#1f3629] py-1.5 px-4 text-xs text-[#c49f6e] flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <span className="font-serif italic flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#2e7d58]" />
            Službene informacije o uslovima ribolova, vodama i zakonskim mjerama u BiH
          </span>
          <span className="hidden md:inline font-mono text-[11px] text-[#4ca778]">
            Verificirani podaci SRS BiH & FBiH
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Outdoor Serif Branding */}
          <a href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded bg-[#182820] border border-[#274535] flex items-center justify-center text-white shadow-md">
              <span className="text-xl">🎣</span>
            </div>
            <div>
              <span className="font-serif font-black text-xl text-white tracking-wide block">
                RIBOLOV <span className="text-[#c49f6e]">BiH</span>
              </span>
              <span className="text-[11px] text-[#8ea396] font-sans block tracking-wider uppercase">
                Portal i Prognoza na Vodama
              </span>
            </div>
          </a>

          {/* Location Search Bar & GPS Trigger */}
          <div className="flex-1 max-w-lg relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#4ca778]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsOpen(true)}
                placeholder="Pretraži vode ili grad (npr. Jablaničko jezero, Bihać, Drina)..."
                className="w-full pl-10 pr-28 py-2.5 text-xs font-medium bg-[#14231b] border border-[#274535] rounded-md text-white placeholder-[#8ea396] focus:outline-none focus:border-[#4ca778] transition-colors"
              />
              <button
                onClick={handleGeoClick}
                disabled={isLocating}
                className="absolute right-1 px-2.5 py-1.5 text-xs bg-[#1f3629] hover:bg-[#274535] text-[#f4f3ef] rounded font-medium flex items-center gap-1.5 transition-colors border border-[#345b46]"
                title="Koristi trenutnu GPS lokaciju"
              >
                <MapPin className="w-3.5 h-3.5 text-[#4ca778]" />
                <span className="hidden sm:inline">{isLocating ? 'Tražim...' : 'Moja lokacija'}</span>
              </button>
            </div>

            {/* Search Dropdown Results */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#14231b] border border-[#274535] rounded-md shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-[#1f3629]">
                {isSearching ? (
                  <div className="p-3 text-xs text-[#4ca778] text-center flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#4ca778] border-t-transparent rounded-full animate-spin"></div>
                    Pretraživanje...
                  </div>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left p-3 hover:bg-[#1c3126] transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#c49f6e] flex items-center gap-1.5 font-serif">
                          <span>{item.type === 'water' ? '🏞️' : '🏙️'}</span>
                          {item.name}
                        </div>
                        <div className="text-xs text-[#8ea396]">
                          {item.municipality ? `${item.municipality}, ` : ''}{item.region || item.country}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b120f] text-[#4ca778] border border-[#1f3629]">
                        {item.type === 'water' ? 'Voda' : 'Grad'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-[#8ea396] text-center">
                    Nije pronađena lokacija za "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            <a
              href="/"
              className="px-3.5 py-2 rounded hover:bg-[#182820] text-white transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#274535]"
            >
              <Compass className="w-4 h-4 text-[#c49f6e]" />
              Naslovna
            </a>
            <a
              href="/forecast"
              className="px-3.5 py-2 rounded hover:bg-[#182820] text-[#d5d1c3] hover:text-white transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#274535]"
            >
              <Calendar className="w-4 h-4 text-[#4ca778]" />
              Prognoza
            </a>
            <a
              href="/fish"
              className="px-3.5 py-2 rounded hover:bg-[#182820] text-[#d5d1c3] hover:text-white transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#274535]"
            >
              <Fish className="w-4 h-4 text-[#4ca778]" />
              Ribe BiH
            </a>
            <a
              href="/waters"
              className="px-3.5 py-2 rounded hover:bg-[#182820] text-[#d5d1c3] hover:text-white transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#274535]"
            >
              <Waves className="w-4 h-4 text-[#4ca778]" />
              Vode BiH
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}
