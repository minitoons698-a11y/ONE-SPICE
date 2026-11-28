import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, MapPin, ShoppingBag } from 'lucide-react';
import { HERO_IMAGE, SHOP_INFO, Spice, formatUGX } from '../data/spices';
import { SpiceImage } from './SpiceImage';

interface HomePageProps {
  spices: Spice[];
}

export function HomePage({ spices }: HomePageProps) {
  const featured = spices.slice(0, 3);

  return (
    <div>
      {/* Storefront Hero: 2-Column Editorial Split */}
      <section className="max-w-[1200px] mx-auto px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2 space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-medium tracking-wide uppercase text-[#8C1D2F]">
                One Spice · Curated by {SHOP_INFO.tiktokHandle}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] tracking-tight text-[#171614] text-balance">
                Whole spices, stone-milled at peak aroma
              </h1>
              <p className="text-base sm:text-lg text-[#5C5852] leading-relaxed max-w-xl">
                Welcome to One Spice. Fresh, fragrant whole and ground spices packed in small batches with live UGX pricing, pickup in Kampala, and online delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#/spices"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Browse All Spices</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#/contact"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Visit &amp; Contact</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden bg-[#EFECE6] border border-[#171614]/8">
              <SpiceImage
                src={HERO_IMAGE}
                alt="One Spice basalt bowls and brass tasting spoons on honed limestone"
                title="One Spice Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Shop Spec Strip */}
        <div className="mt-10 pt-8 border-t border-[#171614]/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-mono text-xs text-[#5C5852] tabular-nums">01 · Active Shelf</p>
            <p className="mt-1 text-sm font-semibold text-[#171614] tabular-nums">
              {spices.length} Fresh Spices
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-[#5C5852]">02 · Payment Options</p>
            <p className="mt-1 text-sm font-semibold text-[#171614]">
              MoMo, Airtel Pay &amp; Cash
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-[#5C5852]">03 · Milling Counter</p>
            <p className="mt-1 text-sm font-semibold text-[#171614]">
              Stone-Ground Daily to Order
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-[#5C5852]">04 · Shop Location</p>
            <a
              href={SHOP_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm font-semibold text-[#171614] hover:text-[#8C1D2F] underline-offset-4 hover:underline truncate"
            >
              {SHOP_INFO.addressLine1}
            </a>
          </div>
        </div>
      </section>

      {/* Featured Spices Preview */}
      <section className="py-14 lg:py-16 border-t border-[#171614]/10">
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="font-display text-3xl font-medium text-[#171614]">
                Featured Spices
              </h2>
              <p className="text-sm text-[#5C5852]">
                Explore signature jars on our shelf, or open the full catalog with live search and category filters.
              </p>
            </div>
            <a
              href="#/spices"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C1D2F] hover:text-[#731625] underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <span>View Full Spice Shelf ({spices.length})</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featured.map((spice) => {
              const basePrice = spice.weightTiers[0]?.price ?? 0;
              return (
                <a
                  key={spice.id}
                  href={`#/spice/${spice.id}`}
                  className="group bg-white rounded-xl border border-[#171614]/8 overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <motion.div
                    layoutId={`spice-image-${spice.id}`}
                    className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]"
                  >
                    <SpiceImage
                      src={spice.image}
                      alt={spice.imageAlt}
                      title={spice.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </motion.div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#5C5852]">
                        <span className="uppercase tracking-wider font-medium text-[#8C1D2F]">
                          {spice.category}
                        </span>
                      </div>
                      <motion.h3
                        layoutId={`spice-title-${spice.id}`}
                        className="font-display text-xl font-medium text-[#171614] group-hover:text-[#8C1D2F] transition-colors"
                      >
                        {spice.name}
                      </motion.h3>
                      <p className="text-sm text-[#5C5852] line-clamp-2 leading-relaxed">
                        {spice.shortDescription}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#171614]/8 flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#171614] tabular-nums">
                        From {formatUGX(basePrice)}
                      </span>
                      <span className="text-xs font-medium text-[#8C1D2F] group-hover:underline underline-offset-4">
                        View Spice
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hyperlinked Navigation Strip to Spices & Contact */}
      <section className="py-14 bg-[#EFECE6]/70 border-t border-[#171614]/10">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <a
            href="#/spices"
            className="group p-8 bg-white rounded-xl border border-[#171614]/8 space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C1D2F]">
                <ShoppingBag className="w-4 h-4" />
                <span>Live Spice Catalog</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#5C5852] group-hover:text-[#171614] transition-colors" />
            </div>
            <h3 className="font-display text-2xl font-medium text-[#171614]">
              Browse All Spices &amp; Jar Sizes
            </h3>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              Search spices in real time, compare weights and UGX pricing, and order with MTN MoMo, Airtel Pay, or Cash on Delivery.
            </p>
          </a>

          <a
            href="#/contact"
            className="group p-8 bg-white rounded-xl border border-[#171614]/8 space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C1D2F]">
                <MapPin className="w-4 h-4" />
                <span>Shop Location &amp; TikTok</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#5C5852] group-hover:text-[#171614] transition-colors" />
            </div>
            <h3 className="font-display text-2xl font-medium text-[#171614]">
              Visit {SHOP_INFO.addressLine1}
            </h3>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              Open our pinned map location, check counter hours, send a spice request, or follow us on TikTok {SHOP_INFO.tiktokHandle}.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
