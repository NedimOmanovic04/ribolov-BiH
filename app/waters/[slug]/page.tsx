import watersData from '@/data/waters.json';
import relationsData from '@/data/relations.json';
import fishData from '@/data/fish.json';
import sourcesData from '@/data/sources.json';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { MapPin, ExternalLink, ShieldCheck, Fish } from 'lucide-react';

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

  const rels = relationsData.filter((r) => r.water_body_id === water.id);
  const presentFish = rels.map((rel) => {
    const f = fishData.find((fish) => fish.id === rel.fish_id);
    return { ...f, relation: rel };
  }).filter((item) => item.id !== undefined);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b120f] text-[#f4f3ef]">
      <Navbar currentLocationName={water.name} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title Spot Guide Header */}
        <div className="panel-outdoors rounded-lg p-6 space-y-3 border border-[#1f3629]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f3629] pb-3">
            <div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c49f6e] block">
                📍 VODIČ KROZ RIBOLOVNU VODU
              </span>
              <h1 className="text-3xl font-serif font-black text-white">{water.name}</h1>
              <div className="text-xs text-[#8ea396] flex items-center gap-1.5 mt-1 font-sans">
                <MapPin className="w-3.5 h-3.5 text-[#4ca778]" />
                {water.municipality} • {water.city} ({water.region})
              </div>
            </div>
            <a
              href={`/?lat=${water.latitude}&lng=${water.longitude}`}
              className="px-4 py-2 rounded bg-[#274535] hover:bg-[#2e7d58] text-white font-serif font-bold text-xs transition-colors shadow border border-[#345b46]"
            >
              Pogledaj uživo uslove na vodi ➔
            </a>
          </div>

          <p className="text-sm text-[#d5d1c3] leading-relaxed font-sans">{water.description}</p>
        </div>

        {/* Manager & Permits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="panel-outdoors rounded-lg p-5 space-y-2 border border-[#1f3629]">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#c49f6e] block">
              🏛️ Upravitelj Ribolovnog Područja
            </span>
            <div className="font-bold text-white text-base font-serif">{water.manager}</div>
            <div className="text-xs text-[#8ea396]">Nadležno udruženje i upravitelj vodotoka.</div>
          </div>

          <div className="panel-outdoors rounded-lg p-5 space-y-2 border border-[#1f3629]">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#c49f6e] block">
              📜 Dozvole i Pravila
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {water.permit_url && (
                <a
                  href={water.permit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-[#182820] hover:bg-[#1c3126] text-[#4ca778] text-xs font-bold border border-[#274535] inline-flex items-center gap-1.5 font-serif"
                >
                  Informacije o dozvolama <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {water.fishing_rules_url && (
                <a
                  href={water.fishing_rules_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-[#182820] hover:bg-[#1c3126] text-white text-xs font-bold border border-[#274535] inline-flex items-center gap-1.5 font-serif"
                >
                  Ribolovni pravilnik <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Species List for Water */}
        <div className="panel-outdoors rounded-lg p-5 space-y-4 border border-[#1f3629]">
          <div className="flex items-center justify-between border-b border-[#1f3629] pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
              <Fish className="w-4 h-4 text-[#4ca778]" /> Riblji Fond na Lokaciji {water.name}
            </h3>
            <span className="text-xs text-[#8ea396]">Zastupljenost</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presentFish.map((f: any) => (
              <a
                key={f.id}
                href={`/fish/${f.slug}`}
                className="bg-[#182820] hover:bg-[#1c3126] p-4 rounded border border-[#274535] hover:border-[#4ca778] space-y-1.5 transition-colors block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm font-serif group-hover:text-[#c49f6e]">{f.name_bs}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#14231b] text-[#4ca778] border border-[#274535] font-semibold uppercase">
                    {f.relation.presence_level === 'high' ? 'Visoka zastupljenost' : f.relation.presence_level === 'medium' ? 'Umjerena' : 'Rijetka'}
                  </span>
                </div>
                <div className="text-xs italic text-[#8ea396] font-serif">{f.scientific_name}</div>
                <p className="text-xs text-[#d5d1c3] line-clamp-2">{f.relation.notes}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Source info */}
        {source && (
          <div className="panel-outdoors rounded-lg p-4 border border-[#1f3629] flex items-center justify-between text-xs text-[#8ea396]">
            <span className="flex items-center gap-1.5 font-serif"><ShieldCheck className="w-4 h-4 text-[#4ca778]" /> Službeni izvor: {source.title}</span>
            <span className="font-mono">Verificirano: {source.verified_at}</span>
          </div>
        )}
      </main>
    </div>
  );
}
