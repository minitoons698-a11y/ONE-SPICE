import { ArrowRight, Compass } from 'lucide-react';
import { Spice } from '../data/spices';

interface OriginsPageProps {
  spices: Spice[];
}

export function OriginsPage({ spices }: OriginsPageProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16 space-y-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5852]">
        <a href="#/" className="hover:text-[#171614] hover:underline underline-offset-4">
          Home
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-[#171614] font-medium">Origins &amp; Craft</span>
      </nav>

      {/* Editorial Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-12 border-b border-[#171614]/10">
        <div className="lg:col-span-6 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-[#8C1D2F]">
            <Compass className="w-4 h-4" />
            <span>Sourcing &amp; Milling Philosophy</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[#171614] text-balance">
            Every One Spice jar carries its harvest coordinates
          </h1>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-[#171614]">
              01. Single-Harvest Traceability
            </h2>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              Generic supermarket spices are blended across regions and stored for years. We buy one harvest lot per micro-region—from Pampore terraces to La Vera oak dryers—and print the lot code on every tin.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-[#171614]">
              02. Cold Stone Milling
            </h2>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              High-speed steel blades burn off fragile essential oils. We keep whole pods, quills, and berries intact until the week you order, milling small quantities cold at our counter.
            </p>
          </div>
        </div>
      </div>

      {/* Harvest Provenance Ledger Table */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-[#171614]">
              Active Harvest Ledger
            </h2>
            <p className="text-sm text-[#5C5852]">
              Select any spice row below to open its full sensory profile and culinary uses.
            </p>
          </div>
          <a
            href="#/spices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C1D2F] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            <span>Open Spice Shelf</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white rounded-xl border border-[#171614]/10 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#171614]/10 bg-[#EFECE6]/50 text-xs font-semibold text-[#5C5852]">
                <th className="py-3.5 px-5 whitespace-nowrap">Spice</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Origin &amp; Micro-Region</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Coordinates</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Elevation</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Lot Code</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171614]/8">
              {spices.map((spice) => (
                <tr key={spice.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="py-4 px-5">
                    <a
                      href={`#/spice/${spice.id}`}
                      className="font-display text-base font-medium text-[#171614] hover:text-[#8C1D2F] transition-colors"
                    >
                      {spice.name}
                    </a>
                    <div className="text-xs text-[#5C5852] italic">{spice.botanicalName}</div>
                  </td>
                  <td className="py-4 px-5 text-[#171614]">
                    <div>{spice.origin.region}</div>
                    <div className="text-xs text-[#5C5852]">{spice.origin.country}</div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-[#5C5852] tabular-nums whitespace-nowrap">
                    {spice.origin.coordinates}
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-[#171614] tabular-nums whitespace-nowrap">
                    {spice.origin.elevation}
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-[#5C5852] whitespace-nowrap">
                    {spice.lotCode}
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <a
                      href={`#/spice/${spice.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C1D2F] hover:underline underline-offset-4"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
