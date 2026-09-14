import fishData from '@/data/fish.json';
import relationsData from '@/data/relations.json';
import watersData from '@/data/waters.json';
import rulesData from '@/data/rules.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { formatLabel } from '@/lib/fishing/score';
import { notFound } from 'next/navigation';
import { ShieldCheck, Thermometer, Clock, Waves, Anchor, FileText } from 'lucide-react';

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

  // Find waters where this fish is present
  const presentRelations = relationsData.filter((r) => r.fish_id === fish.id);
  const presentWaters = presentRelations.map((rel) => {
    const w = watersData.find((wat) => wat.id === rel.water_body_id);
    return { ...w, relation: rel };
  }).filter((item) => item.id !== undefined);

  const formattedBaits = fish.baits.map(formatLabel);
  const formattedMethods = fish.methods.map(formatLabel);

  return (
    <div className="min-h-screen flex flex-col bg-river-950 text-emerald-50">
      <Navbar currentLocationName={fish.name_bs} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Card */}
        <div className="glass-panel rounded-2xl p-6 border border-river-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-river-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                🐟 Profil Vrste Riba
              </span>
              <h1 className="text-3xl font-black text-white">{fish.name_bs}</h1>
              <div className="text-sm italic text-emerald-400/80 font-serif">{fish.scientific_name}</div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs uppercase">
              {fish.category === 'predator' ? 'Grabljivica' : fish.category === 'fly_trout' ? 'Mušičarska / Salmonid' : 'Mirna Riba'}
            </div>
          </div>

          <p className="text-sm text-river-200 leading-relaxed">{fish.description}</p>
        </div>

        {/* Temperature & Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-emerald-400" /> Temperaturne Preferencije
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-river-900/80 p-2.5 rounded-lg border border-river-800">
                <span className="text-emerald-400/70">Aktivni raspon:</span>
                <span className="font-bold text-white">{fish.temperature.min}°C – {fish.temperature.max}°C</span>
              </div>
              <div className="flex justify-between bg-river-900/80 p-2.5 rounded-lg border border-river-800">
                <span className="text-emerald-400/70">Optimalni raspon:</span>
                <span className="font-bold text-emerald-300">{fish.temperature.optimal_min}°C – {fish.temperature.optimal_max}°C</span>
              </div>
              <div className="text-[11px] text-emerald-400/60 pt-1">
                * Napomena: Algoritam proračunava temperaturu vode na osnovu atmosferskih trendova.
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-emerald-400" /> Preporučeni Mamci i Tehnike
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-emerald-400/70 font-semibold block mb-1">Preporučeni mamci:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formattedBaits.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-emerald-400/70 font-semibold block mb-1">Tehnike ribolova:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formattedMethods.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-river-900 text-river-200 border border-river-800 font-medium">
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
          <div className="glass-panel rounded-2xl p-5 border border-amber-800/60 bg-amber-950/20 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Zakonski Propisi i Lovostaj (FBiH / RS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-river-900/90 p-2.5 rounded-xl border border-river-800">
                <span className="text-emerald-400/70 text-[11px] block">Minimalna dužina:</span>
                <span className="font-extrabold text-amber-300 text-sm">{rule.min_length_cm} cm</span>
              </div>
              <div className="bg-river-900/90 p-2.5 rounded-xl border border-river-800">
                <span className="text-emerald-400/70 text-[11px] block">Zabrana lova (Lovostaj):</span>
                <span className="font-extrabold text-amber-300 text-sm">{rule.closed_season}</span>
              </div>
              <div className="bg-river-900/90 p-2.5 rounded-xl border border-river-800">
                <span className="text-emerald-400/70 text-[11px] block">Dnevni ulov:</span>
                <span className="font-extrabold text-amber-300 text-sm">{rule.daily_limit}</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/80 pt-1">{rule.notes}</p>
          </div>
        )}

        {/* Waters where species is present */}
        <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-emerald-400" /> Potvrđene Vode u BiH za Lov na {fish.name_bs}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presentWaters.map((w: any) => (
              <a
                key={w.id}
                href={`/waters/${w.slug}`}
                className="bg-river-900/90 hover:bg-river-800 p-3 rounded-xl border border-river-800 hover:border-emerald-500/50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">{w.name}</div>
                  <div className="text-emerald-400/60">{w.municipality} • {w.type === 'river' ? 'Rijeka' : 'Jezero'}</div>
                  <div className="text-[11px] text-river-300/80 mt-1">{w.relation.notes}</div>
                </div>
                <span className="text-xs text-emerald-400 font-bold shrink-0">Vidi vodu ➔</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
