import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Spice, WeightTier, formatUGX } from '../data/spices';
import { SpiceImage } from './SpiceImage';

interface SpiceProfileProps {
  spice: Spice;
  allSpices: Spice[];
  direction: number;
  onAddToBag: (spice: Spice, tier: WeightTier, quantity: number) => void;
}

const SHOP_BENEFITS = [
  { icon: Sparkles, label: 'Stone-milled fresh' },
  { icon: PackageCheck, label: 'Airtight sealed jars' },
  { icon: Truck, label: 'Kampala delivery' },
  { icon: Smartphone, label: 'MoMo & Airtel Pay' },
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

  const [selectedTierIndex, setSelectedTierIndex] = useState(
    1 < spice.weightTiers.length ? 1 : 0
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);

  useEffect(() => {
    setSelectedTierIndex(1 < spice.weightTiers.length ? 1 : 0);
    setQuantity(1);
    setAddedFeedback(false);
  }, [spice.id, spice.weightTiers.length]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyTitle(window.scrollY > 220);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeTier = spice.weightTiers[selectedTierIndex] ?? spice.weightTiers[0];
  const lineTotal = activeTier.price * quantity;

  const paired = (spice.pairings ?? [])
    .map((id) => allSpices.find((item) => item.id === id))
    .filter((item): item is Spice => Boolean(item))
    .filter((item) => item.id !== spice.id);

  const oftenBoughtWith =
    paired.length >= 3
      ? paired.slice(0, 3)
      : [
          ...paired,
          ...allSpices.filter(
            (item) => item.id !== spice.id && !paired.some((p) => p.id === item.id)
          ),
        ].slice(0, 3);

  const handleAdd = () => {
    onAddToBag(spice, activeTier, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  const handleQuickAddRelated = (e: React.MouseEvent, item: Spice) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultTier = item.weightTiers[1] ?? item.weightTiers[0];
    if (!defaultTier || !item.inStock) return;
    onAddToBag(item, defaultTier, 1);
    setQuickAddedId(item.id);
    setTimeout(() => {
      setQuickAddedId((prev) => (prev === item.id ? null : prev));
    }, 1400);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${spice.name} · One Spice`,
          text: spice.shortDescription,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contextual Top Bar (desktop sticky, reveals title smoothly on scroll) */}
      <div className="hidden lg:block sticky top-16 z-30 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#171614]/8">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <a
              href="#/spices"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5852] hover:text-[#171614] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>All spices</span>
            </a>

            <span className="h-3.5 w-px bg-[#171614]/12 shrink-0" aria-hidden="true" />

            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`font-display text-sm font-medium text-[#171614] truncate transition-opacity duration-200 ${
                  showStickyTitle ? 'opacity-100' : 'opacity-75'
                }`}
              >
                {spice.name}
              </span>
              {showStickyTitle && (
                <span className="text-xs text-[#5C5852] tabular-nums whitespace-nowrap shrink-0">
                  · {formatUGX(activeTier.price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-[#5C5852] tabular-nums mr-1">
              {String(currentIndex + 1).padStart(2, '0')} / {String(allSpices.length).padStart(2, '0')}
            </span>
            <a
              href={`#/spice/${prevSpice.id}`}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-[#171614]/12 text-[#171614] hover:border-[#171614]/35 transition-colors"
              aria-label={`Previous spice: ${prevSpice.name}`}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            </a>
            <a
              href={`#/spice/${nextSpice.id}`}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-[#171614]/12 text-[#171614] hover:border-[#171614]/35 transition-colors"
              aria-label={`Next spice: ${nextSpice.name}`}
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 max-w-[1200px] w-full mx-auto lg:px-6 lg:py-10 md:space-y-10 lg:space-y-12">
        {/* Quick-Switch Hyperlink Rail (aligned to 24px grid) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto px-6 lg:px-0 pt-5 lg:pt-0 pb-1">
          {allSpices.map((item) => {
            const isCurrent = item.id === spice.id;
            return (
              <a
                key={item.id}
                href={`#/spice/${item.id}`}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isCurrent ? 'text-white' : 'text-[#5C5852] hover:text-[#171614] hover:bg-[#EFECE6]'
                }`}
              >
                {isCurrent && (
                  <motion.span
                    layoutId="active-profile-chip"
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-[#171614] rounded-lg"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </a>
            );
          })}
        </div>

        {/* Product Showcase + Elevated Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10 items-start">
          {/* Image Column (sticky on mobile behind overlapping card, sticky on desktop) */}
          <div className="lg:col-span-6 sticky top-16 lg:top-[128px] z-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`image-${spice.id}`}
                layoutId={`spice-image-${spice.id}`}
                custom={direction}
                initial={{ opacity: 0, x: direction * 20, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -20, scale: 0.985 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6] lg:rounded-2xl border-b lg:border border-[#171614]/8"
              >
                <SpiceImage
                  src={spice.image}
                  alt={spice.imageAlt}
                  title={spice.name}
                  className="w-full h-full object-cover"
                />

                {/* High-Contrast Floating Navigation Icons on Image */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <a
                    href="#/spices"
                    aria-label="Back to all spices"
                    className="pointer-events-auto lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-[#171614]/12 shadow-sm text-[#171614] hover:bg-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                  </a>

                  <div className="pointer-events-auto ml-auto flex items-center gap-2">
                    <a
                      href={`#/spice/${prevSpice.id}`}
                      aria-label={`Previous spice: ${prevSpice.name}`}
                      className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-[#171614]/12 shadow-sm text-[#171614] hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                    </a>
                    <a
                      href={`#/spice/${nextSpice.id}`}
                      aria-label={`Next spice: ${nextSpice.name}`}
                      className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-[#171614]/12 shadow-sm text-[#171614] hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                    </a>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share this spice"
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-[#171614]/12 shadow-sm text-[#171614] hover:bg-white transition-colors cursor-pointer"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-[#8C1D2F]" strokeWidth={2} />
                      ) : (
                        <Share2 className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Scrollable Overlapping Card on Mobile / Clean Surface Card on Desktop */}
          <div className="lg:col-span-6 relative z-10 -mt-5 lg:mt-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`purchase-${spice.id}`}
                custom={direction}
                initial={{ opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-t-2xl lg:rounded-2xl border border-[#171614]/8 p-6 sm:p-8 space-y-6"
              >
                {/* Group 1: Category · Stock + Title + Quality/Grade + Early Price */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-semibold">
                    <span className="text-[#8C1D2F]">{spice.category}</span>
                    <span className="text-[#171614]/25" aria-hidden="true">
                      ·
                    </span>
                    <span className={spice.inStock ? 'text-[#5C5852]' : 'text-[#8C1D2F]'}>
                      {spice.inStock ? 'In stock' : 'Restocking soon'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <motion.h1
                      layoutId={`spice-title-${spice.id}`}
                      className="font-display text-3xl sm:text-4xl font-medium text-[#171614] leading-[1.15] text-balance"
                    >
                      {spice.name}
                    </motion.h1>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[#5C5852]">
                      {spice.botanicalName && (
                        <span className="font-display italic">{spice.botanicalName}</span>
                      )}
                      {spice.botanicalName && spice.grade && (
                        <span aria-hidden="true">·</span>
                      )}
                      {spice.grade && <span>{spice.grade}</span>}
                    </div>
                  </div>

                  {/* Early Price Surface directly below Title & Grade (no redundant "Price:" label) */}
                  <div className="pt-1 flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-[1.75rem] font-semibold text-[#171614] tabular-nums tracking-tight">
                      {formatUGX(activeTier.price)}
                    </span>
                    <span className="text-xs font-medium text-[#5C5852]">
                      {activeTier.label}
                    </span>
                  </div>
                </div>

                {/* Soft Hairline Divider */}
                <div className="border-t border-[#171614]/8" />

                {/* Readable Description */}
                <p className="text-[15px] text-[#5C5852] leading-relaxed">
                  {spice.shortDescription}
                </p>

                {/* Consistent Subtle Benefits Strip (single stroke weight, restrained monochrome) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#171614]/8">
                  {SHOP_BENEFITS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#EFECE6] inline-flex items-center justify-center text-[#171614] shrink-0">
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                      <span className="text-xs font-medium text-[#5C5852] leading-snug">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Predefined Weight Options (1-tap selection cards) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171614]">Choose weight</span>
                    <span className="text-[#5C5852] tabular-nums">
                      {activeTier.grams}g selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {spice.weightTiers.map((tier, idx) => {
                      const isSelected = idx === selectedTierIndex;
                      return (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setSelectedTierIndex(idx)}
                          aria-pressed={isSelected}
                          className={`p-3.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'border-[#171614] bg-[#F8F7F4] text-[#171614]'
                              : 'border-[#171614]/12 bg-white text-[#5C5852] hover:border-[#171614]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#171614] tabular-nums">
                              {tier.grams}g
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#8C1D2F] inline-flex items-center justify-center text-white shrink-0">
                                <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#5C5852] truncate mt-0.5">
                            {tier.label.replace(new RegExp(`^${tier.grams}g\\s*`, 'i'), '')}
                          </div>
                          <div className="text-sm font-semibold text-[#171614] mt-2 tabular-nums">
                            {formatUGX(tier.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Inline Purchase Row (synced with sticky bottom bar on mobile & scroll) */}
                <div className="hidden lg:flex items-center gap-3 pt-2">
                  <div className="inline-flex items-center border border-[#171614]/15 rounded-xl bg-[#F8F7F4] h-12 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[#171614] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      className="w-11 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!spice.inStock}
                    className={`flex-1 h-12 inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                      addedFeedback ? 'bg-[#171614]' : 'bg-[#8C1D2F] hover:bg-[#731625]'
                    }`}
                  >
                    {addedFeedback ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={2} />
                        <span>Added to bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
                        <span className="tabular-nums">
                          {spice.inStock ? `Add to bag · ${formatUGX(lineTotal)}` : 'Out of stock'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Often Bought With / Complementary Spices Grid with Quick-Add Corner Buttons (desktop & tablet) */}
        {oftenBoughtWith.length > 0 && (
          <section className="hidden md:block px-6 lg:px-0 pt-8 pb-6 border-t border-[#171614]/8 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-medium text-[#171614]">
                  Often bought with
                </h2>
                <p className="text-sm text-[#5C5852]">
                  Tap the quick-add icon or open any spice to explore weight sizes.
                </p>
              </div>
              <a
                href="#/spices"
                className="text-xs font-semibold text-[#171614] hover:text-[#8C1D2F] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                View all spices
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {oftenBoughtWith.map((rel) => {
                const quickTier = rel.weightTiers[1] ?? rel.weightTiers[0];
                const isQuickAdded = quickAddedId === rel.id;

                return (
                  <a
                    key={rel.id}
                    href={`#/spice/${rel.id}`}
                    className="group bg-white rounded-xl border border-[#171614]/8 overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6]">
                      <SpiceImage
                        src={rel.image}
                        alt={rel.imageAlt}
                        title={rel.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />

                      {quickTier && rel.inStock && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickAddRelated(e, rel)}
                          aria-label={`Quick add ${rel.name} (${quickTier.label}) to bag`}
                          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full inline-flex items-center justify-center border shadow-sm transition-colors cursor-pointer ${
                            isQuickAdded
                              ? 'bg-[#8C1D2F] text-white border-[#8C1D2F]'
                              : 'bg-white/95 backdrop-blur-sm text-[#171614] border-[#171614]/12 hover:bg-[#171614] hover:text-white'
                          }`}
                        >
                          {isQuickAdded ? (
                            <Check className="w-4 h-4" strokeWidth={2} />
                          ) : (
                            <Plus className="w-4 h-4" strokeWidth={1.75} />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C1D2F]">
                        {rel.category}
                      </span>
                      <div className="font-display text-lg font-medium text-[#171614] group-hover:text-[#8C1D2F] transition-colors">
                        {rel.name}
                      </div>
                      <div className="flex items-center justify-between text-sm pt-1">
                        <span className="font-semibold text-[#171614] tabular-nums">
                          {formatUGX(quickTier?.price ?? 0)}
                        </span>
                        <span className="text-xs text-[#5C5852]">{quickTier?.label}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Purchase Bar (compact on mobile to stay within 15% sticky budget, synced everywhere) */}
      <div className="sticky bottom-0 z-30 lg:hidden bg-[#F8F7F4]/95 backdrop-blur-md border-t border-[#171614]/10 px-4 py-2.5">
        <div className="max-w-[1200px] mx-auto flex items-center gap-2.5">
          <div className="inline-flex items-center border border-[#171614]/15 rounded-xl bg-white h-11 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-[#171614] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-9 h-full inline-flex items-center justify-center text-[#5C5852] hover:text-[#171614] cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!spice.inStock}
            className={`flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
              addedFeedback ? 'bg-[#171614]' : 'bg-[#8C1D2F] hover:bg-[#731625]'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>Added to bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
                <span className="tabular-nums">
                  {spice.inStock ? `Add to bag · ${formatUGX(lineTotal)}` : 'Out of stock'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
