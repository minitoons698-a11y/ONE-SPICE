import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Compass,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { Spice, WeightTier, formatUGX } from '../data/spices';
import { SpiceImage } from './SpiceImage';

interface SpiceProfileProps {
  spice: Spice;
  allSpices: Spice[];
  direction: number;
  onAddToBag: (spice: Spice, tier: WeightTier, quantity: number) => void;
}

const SENSORY_AXES: Array<{ key: keyof Spice['tastingNotes']['sensory']; label: string }> = [
  { key: 'warmth', label: 'Warmth' },
  { key: 'aroma', label: 'Aromatic Lift' },
  { key: 'pungency', label: 'Peppery Bite' },
  { key: 'sweetness', label: 'Natural Sweetness' },
];

export function SpiceProfile({
  spice,
  allSpices,
  direction,
  onAddToBag,
}: SpiceProfileProps) {
  const currentIndex = allSpices.findIndex((item) => item.id === spice.id);
  const prevSpice = allSpices[(currentIndex - 1 + allSpices.length) % allSpices.length];
  const nextSpice = allSpices[(currentIndex + 1) % allSpices.length];

  const [selectedTierIndex, setSelectedTierIndex] = useState(1 < spice.weightTiers.length ? 1 : 0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setSelectedTierIndex(1 < spice.weightTiers.length ? 1 : 0);
    setQuantity(1);
    setAddedFeedback(false);
  }, [spice.id, spice.weightTiers.length]);

  const activeTier = spice.weightTiers[selectedTierIndex] ?? spice.weightTiers[0];

  const relatedSpices = spice.pairings
    .map((id) => allSpices.find((item) => item.id === id))
    .filter((item): item is Spice => Boolean(item))
    .slice(0, 3);

  const handleAdd = () => {
    onAddToBag(spice, activeTier, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 lg:py-12 space-y-12">
      {/* Top Profile Breadcrumbs, Prev/Next Links & Quick Switch Rail */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#171614]/10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5852]">
            <a href="#/" className="hover:text-[#171614] hover:underline underline-offset-4">
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a href="#/spices" className="hover:text-[#171614] hover:underline underline-offset-4">
              Spices
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-[#171614] font-medium truncate max-w-[200px]">{spice.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#5C5852] tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} / {String(allSpices.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={`#/spice/${prevSpice.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors whitespace-nowrap shrink-0"
                aria-label={`Previous spice: ${prevSpice.name}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </a>
              <a
                href={`#/spice/${nextSpice.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors whitespace-nowrap shrink-0"
                aria-label={`Next spice: ${nextSpice.name}`}
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Morphing Quick-Switch Hyperlink Rail across all spice profiles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {allSpices.map((item) => {
            const isCurrent = item.id === spice.id;
            return (
              <a
                key={item.id}
                href={`#/spice/${item.id}`}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isCurrent ? 'text-white' : 'text-[#5C5852] hover:text-[#171614] hover:bg-[#EFECE6]'
                }`}
              >
                {isCurrent && (
                  <motion.span
                    layoutId="active-profile-chip"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-[#171614] rounded-md"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Profile Layout with Smooth Morphing Transitions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Sticky Column: Macro Image + Origin Information */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`image-${spice.id}`}
              layoutId={`spice-image-${spice.id}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -24, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#EFECE6] border border-[#171614]/8"
            >
              <SpiceImage
                src={spice.image}
                alt={spice.imageAlt}
                title={spice.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Origin Information Panel */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.section
              key={`origin-${spice.id}`}
              aria-labelledby="origin-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#EFECE6]/75 rounded-xl p-6 border border-[#171614]/8 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#8C1D2F]" />
                  <h2 id="origin-heading" className="font-display text-xl font-medium text-[#171614]">
                    Origin &amp; Provenance
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5C5852] tabular-nums">
                  {spice.origin.coordinates}
                </span>
              </div>

              <p className="text-sm text-[#5C5852] leading-relaxed">{spice.origin.story}</p>

              <dl className="grid grid-cols-2 gap-4 pt-3 border-t border-[#171614]/10 text-sm">
                <div>
                  <dt className="text-xs text-[#5C5852]">Region</dt>
                  <dd className="font-medium text-[#171614] mt-0.5">
                    {spice.origin.region}, {spice.origin.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5852]">Elevation</dt>
                  <dd className="font-mono text-xs font-medium text-[#171614] mt-1 tabular-nums">
                    {spice.origin.elevation}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5852]">Harvest Window</dt>
                  <dd className="font-medium text-[#171614] mt-0.5">{spice.origin.harvestSeason}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5852]">Curing Method</dt>
                  <dd className="font-medium text-[#171614] mt-0.5">{spice.origin.curingMethod}</dd>
                </div>
              </dl>
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Right Column: Contiguous Purchase Module + Tasting Notes + Culinary Uses */}
        <div className="lg:col-span-6 space-y-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`purchase-${spice.id}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 pb-8 border-b border-[#171614]/10"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5852]">
                  <span className="uppercase tracking-wider font-semibold text-[#8C1D2F]">
                    {spice.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{spice.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{spice.lotCode}</span>
                </div>

                <motion.h1
                  layoutId={`spice-title-${spice.id}`}
                  className="font-display text-3xl sm:text-4xl font-medium text-[#171614] text-balance"
                >
                  {spice.name}
                </motion.h1>

                <p className="font-display italic text-sm text-[#5C5852]">
                  {spice.botanicalName}
                </p>

                <p className="text-base text-[#5C5852] leading-relaxed pt-1">
                  {spice.shortDescription}
                </p>
              </div>

              {/* Weight / Jar Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171614]">Select Weight &amp; Vessel</span>
                  <span className="text-[#5C5852]">
                    {spice.inStock ? 'In Stock — Freshly Packed' : 'Restocking Soon'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {spice.weightTiers.map((tier, idx) => {
                    const isSelected = idx === selectedTierIndex;
                    return (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() => setSelectedTierIndex(idx)}
                        className={`relative p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#8C1D2F] bg-white text-[#171614]'
                            : 'border-[#171614]/12 bg-[#EFECE6]/50 text-[#5C5852] hover:border-[#171614]/30'
                        }`}
                      >
                        <div className="text-xs font-medium truncate">{tier.label}</div>
                        <div className="text-sm font-semibold text-[#171614] mt-1 tabular-nums">
                          {formatUGX(tier.price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price, Quantity & Add to Bag */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="min-w-[120px]">
                  <div className="text-xs text-[#5C5852]">Total Price</div>
                  <div className="text-2xl font-semibold text-[#171614] tabular-nums">
                    {formatUGX(activeTier.price * quantity)}
                  </div>
                </div>

                <div className="inline-flex items-center border border-[#171614]/15 rounded-lg bg-white h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-10 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!spice.inStock}
                  className={`flex-1 min-w-[180px] h-11 inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                    addedFeedback ? 'bg-[#171614]' : 'bg-[#8C1D2F] hover:bg-[#731625]'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{spice.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tasting Notes Section + Morphing Sensory Bars */}
          <section aria-labelledby="tasting-heading" className="space-y-6 pb-8 border-b border-[#171614]/10">
            <h2 id="tasting-heading" className="font-display text-2xl font-medium text-[#171614]">
              Tasting Notes
            </h2>

            <AnimatePresence mode="wait">
              <motion.div
                key={`tasting-${spice.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                <p className="text-sm sm:text-base text-[#5C5852] leading-relaxed">
                  {spice.tastingNotes.summary}
                </p>

                <dl className="divide-y divide-[#171614]/8 border-y border-[#171614]/8 text-sm">
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <dt className="font-medium text-[#171614]">Primary Aroma</dt>
                    <dd className="sm:col-span-2 text-[#5C5852]">{spice.tastingNotes.aroma}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <dt className="font-medium text-[#171614]">Palate</dt>
                    <dd className="sm:col-span-2 text-[#5C5852]">{spice.tastingNotes.palate}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <dt className="font-medium text-[#171614]">Finish</dt>
                    <dd className="sm:col-span-2 text-[#5C5852]">{spice.tastingNotes.finish}</dd>
                  </div>
                </dl>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-3 pt-1">
              <div className="text-xs font-medium text-[#5C5852]">Sensory Intensity</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {SENSORY_AXES.map(({ key, label }) => {
                  const score = spice.tastingNotes.sensory[key];
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#171614]">{label}</span>
                        <span className="font-mono text-[#5C5852] tabular-nums">{score}/5</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#EFECE6] rounded-full overflow-hidden">
                        <motion.div
                          initial={false}
                          animate={{ scaleX: score / 5 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          style={{ transformOrigin: 'left' }}
                          className="h-full w-full bg-[#8C1D2F] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Suggested Culinary Uses Section */}
          <section aria-labelledby="culinary-heading" className="space-y-5">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[#8C1D2F]" />
              <h2 id="culinary-heading" className="font-display text-2xl font-medium text-[#171614]">
                Suggested Culinary Uses
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`uses-${spice.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {spice.culinaryUses.map((use, index) => (
                  <div
                    key={use.dish}
                    className="p-5 bg-white rounded-xl border border-[#171614]/8 space-y-2"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-medium text-[#171614]">
                        0{index + 1}. {use.dish}
                      </h3>
                      <span className="text-xs text-[#8C1D2F] font-medium">
                        Pairs with: {use.pairing}
                      </span>
                    </div>
                    <p className="text-sm text-[#5C5852] leading-relaxed">{use.technique}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Continue Exploring: Hyperlinked Complementary Spice Profiles */}
      {relatedSpices.length > 0 && (
        <section className="pt-12 border-t border-[#171614]/10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-medium text-[#171614]">
                Complementary Pairings
              </h2>
              <p className="text-sm text-[#5C5852]">
                Follow any link below to transition directly to a complementary spice profile.
              </p>
            </div>
            <a
              href="#/spices"
              className="text-xs font-semibold text-[#171614] hover:text-[#8C1D2F] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              View All Spices
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedSpices.map((rel) => (
              <a
                key={rel.id}
                href={`#/spice/${rel.id}`}
                className="group text-left bg-white rounded-xl border border-[#171614]/8 overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]">
                  <SpiceImage
                    src={rel.image}
                    alt={rel.imageAlt}
                    title={rel.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#5C5852]">
                    <span className="text-[#8C1D2F] font-medium uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">From {formatUGX(rel.weightTiers[0]?.price ?? 0)}</span>
                  </div>
                  <div className="font-display text-lg font-medium text-[#171614] group-hover:text-[#8C1D2F] transition-colors">
                    {rel.name}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
