import fishData from '@/data/fish.json';
import relationsData from '@/data/relations.json';
import watersData from '@/data/waters.json';
import rulesData from '@/data/rules.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { formatLabel } from '@/lib/fishing/score';
import { notFound } from 'next/navigation';
import { ShieldCheck, Thermometer, Anchor, FileText, Waves, Clock } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return fishData.map((f) => ({ slug: f.slug }));
}

export default function FishDetailPage({ params }: Props) {
  const fish = fishData.find((f) => f.slug === params.slug);

  if (!fish) {
    notFound();
  }

  const rule = rulesData.find((r) => r.fish_id === fish.id);
  const source = sourcesData.find((s) => s.id === fish.source_id);

  const presentRelations = relationsData.filter((r) => r.fish_id === fish.id);
  const presentWaters = presentRelations.map((rel) => {
    const w = watersData.find((wat) => wat.id === rel.water_body_id);
    return { ...w, relation: rel };
  }).filter((item) => item.id !== undefined);

  const formattedBaits = fish.baits.map(formatLabel);
  const formattedMethods = fish.methods.map(formatLabel);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar currentLocationName={fish.name_bs} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Field Guide Card */}
        <div className="panel-outdoors rounded-lg p-6 space-y-3 border border-[#1f3629]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f3629] pb-3">
            <div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
                📖 TERENSKI PROFIL VRSTE
              </span>
              <h1 className="text-3xl font-serif font-black text-white">{fish.name_bs}</h1>
              <div className="text-sm italic text-[#8ea396] font-serif">{fish.scientific_name}</div>
            </div>
            <div className="px-3.5 py-1 rounded bg-[#14231b] text-emerald-300 border border-[#274535] font-bold text-xs uppercase font-serif">
              {fish.category === 'predator' ? 'Grabljivica' : fish.category === 'fly_trout' ? 'Mušičarska / Salmonid' : 'Mirna Riba'}
            </div>
          </div>

          <p className="text-sm text-[#d5d1c3] leading-relaxed font-sans">{fish.description}</p>
        </div>

        {/* Temperature & Bait Matrices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Temperature Matrix */}
          <div className="panel-outdoors rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-serif">
              <Thermometer className="w-4 h-4 text-[#4ca778]" /> Temperaturni Uslovi i Aktivnost
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-[#182820] p-2.5 rounded border border-[#274535]">
                <span className="text-[#8ea396]">Aktivni raspon vode:</span>
                <span className="font-bold text-white font-mono">{fish.temperature.min}°C – {fish.temperature.max}°C</span>
              </div>
              <div className="flex justify-between bg-[#182820] p-2.5 rounded border border-[#274535]">
                <span className="text-[#8ea396]">Optimalni raspon:</span>
                <span className="font-bold text-[#4ca778] font-mono">{fish.temperature.optimal_min}°C – {fish.temperature.optimal_max}°C</span>
              </div>
              <div className="text-[11px] text-[#8ea396] pt-1">
                * Ocjena ribolova automatski upoređuje ove parametre s atmosferskim pritisakom i trendom.
              </div>
            </div>
          </div>

          {/* Baits & Methods */}
          <div className="panel-outdoors rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-serif">
              <Anchor className="w-4 h-4 text-[#4ca778]" /> Preporučeni Mamci i Tehnike
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#8ea396] font-semibold block mb-1 font-serif">Preporučeni mamci:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formattedBaits.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#182820] text-white border border-[#274535] font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#8ea396] font-semibold block mb-1 font-serif">Tehnike ribolova:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formattedMethods.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#14231b] text-[#c49f6e] border border-[#274535] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Regulations */}
        {rule && (
          <div className="panel-outdoors-earth rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 font-serif">
              <FileText className="w-4 h-4 text-amber-400" /> Službeni Zakonski Propisi i Lovostaj (FBiH / RS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#1d1915] p-2.5 rounded border border-[#332a22]">
                <span className="text-[#8ea396] text-[11px] block">Minimalna dužina ulova:</span>
                <span className="font-bold text-amber-300 text-sm font-mono">{rule.min_length_cm} cm</span>
              </div>
              <div className="bg-[#1d1915] p-2.5 rounded border border-[#332a22]">
                <span className="text-[#8ea396] text-[11px] block">Period lovostaja (Zabrana):</span>
                <span className="font-bold text-amber-300 text-sm font-mono">{rule.closed_season}</span>
              </div>
              <div className="bg-[#1d1915] p-2.5 rounded border border-[#332a22]">
                <span className="text-[#8ea396] text-[11px] block">Dnevno ograničenje:</span>
                <span className="font-bold text-amber-300 text-sm font-mono">{rule.daily_limit}</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/80 pt-1 font-serif">{rule.notes}</p>
          </div>
        )}

        {/* Waters where species is present */}
        <div className="panel-outdoors rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-serif">
            <Waves className="w-4 h-4 text-[#4ca778]" /> Potvrđene Vode u BiH za Lov na {fish.name_bs}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presentWaters.map((w: any) => (
              <a
                key={w.id}
                href={`/waters/${w.slug}`}
                className="bg-[#182820] hover:bg-[#1c3126] p-3 rounded border border-[#274535] hover:border-[#4ca778] flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-bold text-white text-sm font-serif group-hover:text-[#c49f6e]">{w.name}</div>
                  <div className="text-[#8ea396]">{w.municipality} • {w.type === 'river' ? 'Rijeka' : 'Jezero'}</div>
                  <div className="text-[11px] text-[#d5d1c3] mt-1">{w.relation.notes}</div>
                </div>
                <span className="text-xs text-[#4ca778] font-bold shrink-0 font-serif">Vidi vodu ➔</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
