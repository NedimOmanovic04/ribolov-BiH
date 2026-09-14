import watersData from '@/data/waters.json';
import relationsData from '@/data/relations.json';
import fishData from '@/data/fish.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { Waves, MapPin, ExternalLink, ShieldCheck, Fish, Compass } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return watersData.map((w) => ({ slug: w.slug }));
}

export default function WaterDetailPage({ params }: Props) {
  const water = watersData.find((w) => w.slug === params.slug);

  if (!water) {
    notFound();
  }

  const source = sourcesData.find((s) => s.id === water.source_id);

  // Find species present in this water
  const rels = relationsData.filter((r) => r.water_body_id === water.id);
  const presentFish = rels.map((rel) => {
    const f = fishData.find((fish) => fish.id === rel.fish_id);
    return { ...f, relation: rel };
  }).filter((item) => item.id !== undefined);

  return (
    <div className="min-h-screen flex flex-col bg-river-950 text-emerald-50">
      <Navbar currentLocationName={water.name} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title Header */}
        <div className="glass-panel rounded-2xl p-6 border border-river-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-river-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                📍 {water.type === 'river' ? 'Rijeka' : 'Jezero / Akumulacija'}
              </span>
              <h1 className="text-3xl font-black text-white">{water.name}</h1>
              <div className="text-xs text-emerald-400/80 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {water.municipality} • {water.city} ({water.region})
              </div>
            </div>
            <a
              href={`/?lat=${water.latitude}&lng=${water.longitude}`}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
            >
              Učitaj uživo prognozu ➔
            </a>
          </div>

          <p className="text-sm text-river-200 leading-relaxed">{water.description}</p>
        </div>

        {/* Info Grid: Manager & Permits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              🏛️ Upravitelj Ribolovnog Područja
            </span>
            <div className="font-bold text-white text-base">{water.manager}</div>
            <div className="text-xs text-river-300">Nadležno udruženje i upravitelj voda.</div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              📜 Dozvole i Pravila
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {water.permit_url && (
                <a
                  href={water.permit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800 inline-flex items-center gap-1.5"
                >
                  Informacije o dozvolama <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {water.fishing_rules_url && (
                <a
                  href={water.fishing_rules_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-river-900 hover:bg-river-800 text-river-200 text-xs font-bold border border-river-800 inline-flex items-center gap-1.5"
                >
                  Ribolovni pravilnik <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Species Available in Water */}
        <div className="glass-panel rounded-2xl p-5 border border-river-800 space-y-4">
          <div className="flex items-center justify-between border-b border-river-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fish className="w-4 h-4 text-emerald-400" /> Riblji Fond na Lokaciji {water.name}
            </h3>
            <span className="text-xs text-emerald-400/60">Verificirani zapisi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presentFish.map((f: any) => (
              <a
                key={f.id}
                href={`/fish/${f.slug}`}
                className="bg-river-900/90 hover:bg-river-800 p-4 rounded-xl border border-river-800 hover:border-emerald-500/50 space-y-1.5 transition-colors block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm group-hover:text-emerald-300">{f.name_bs}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold uppercase">
                    Zastupljenost: {f.relation.presence_level === 'high' ? 'Visoka' : f.relation.presence_level === 'medium' ? 'Umjerena' : 'Rijetka'}
                  </span>
                </div>
                <div className="text-xs italic text-emerald-400/60 font-serif">{f.scientific_name}</div>
                <p className="text-xs text-river-300/90 line-clamp-2">{f.relation.notes}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Source info */}
        {source && (
          <div className="glass-panel rounded-2xl p-4 border border-river-800/60 flex items-center justify-between text-xs text-emerald-400/70">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Službeni izvor: {source.title}</span>
            <span>Ažurirano: {source.verified_at}</span>
          </div>
        )}
      </main>
    </div>
  );
}
