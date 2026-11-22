import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Plus, Search, X } from 'lucide-react';
import { CATEGORIES, CulinaryCategory, Spice, formatUGX } from '../data/spices';
import { SpiceImage } from './SpiceImage';

interface SpiceCatalogProps {
  spices: Spice[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: 'All Spices' | CulinaryCategory;
  onSelectCategory: (category: 'All Spices' | CulinaryCategory) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc') => void;
  onQuickAdd: (spice: Spice) => void;
  totalSpiceCount: number;
}

export function SpiceCatalog({
  spices,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onQuickAdd,
  totalSpiceCount,
}: SpiceCatalogProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleQuickAddClick = (e: React.MouseEvent, spice: Spice) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd(spice);
    setRecentlyAddedId(spice.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === spice.id ? null : prev));
    }, 1200);
  };

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-[1200px] mx-auto px-6 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5852]">
          <a href="#/" className="hover:text-[#171614] hover:underline underline-offset-4">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-[#171614] font-medium">Spices</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl md:text-4xl font-medium text-[#171614]">
              One Spice Collection
            </h1>
            <p className="text-sm text-[#5C5852]">
              Filter by culinary category or search in real time to open any spice’s full tasting and origin profile.
            </p>
          </div>
          <p className="text-xs font-mono text-[#5C5852] tabular-nums">
            Showing {spices.length} of {totalSpiceCount} spices
          </p>
        </div>

        {/* Search Bar + Category Filter Bar + Price Sort */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search
                className="w-4 h-4 text-[#5C5852] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search spices by name or culinary category (e.g. Saffron, Heat & Smoke)..."
                aria-label="Search spices by name or culinary category"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg text-[#171614] placeholder:text-[#5C5852]/70 focus:outline-none focus:border-[#8C1D2F] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-[#5C5852] hover:text-[#171614] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="spice-sort" className="text-xs font-medium text-[#5C5852] whitespace-nowrap">
                Sort by
              </label>
              <select
                id="spice-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
                className="px-3.5 py-2.5 text-xs font-medium bg-white border border-[#171614]/15 rounded-lg text-[#171614] focus:outline-none focus:border-[#8C1D2F] cursor-pointer"
              >
                <option value="featured">Featured Harvests</option>
                <option value="price-asc">Price: Low to High (UGX)</option>
                <option value="price-desc">Price: High to Low (UGX)</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Segmented Filter Bar */}
          <div
            role="tablist"
            aria-label="Filter by culinary category"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EFECE6] rounded-lg w-fit max-w-full"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectCategory(category)}
                  className={`relative px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive ? 'text-[#171614]' : 'text-[#5C5852] hover:text-[#171614]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="category-active-bg"
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 bg-white rounded-md shadow-xs"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Morphing Product Grid with Hyperlinked Cards */}
        {spices.length === 0 ? (
          <div className="py-16 px-6 text-center bg-[#EFECE6]/60 rounded-xl border border-[#171614]/8 space-y-4">
            <p className="font-display text-2xl text-[#171614]">
              No spices match &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-sm text-[#5C5852] max-w-md mx-auto">
              Try searching by a spice name like Saffron, Sumac, or Cardamom, or choose a culinary category above.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('All Spices');
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
          >
            <AnimatePresence mode="popLayout">
              {spices.map((spice) => {
                const basePrice = spice.weightTiers[0]?.price ?? 0;
                const jarPrice = spice.weightTiers[1]?.price ?? basePrice;
                const isAdded = recentlyAddedId === spice.id;

                return (
                  <motion.article
                    key={spice.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="group bg-white rounded-xl border border-[#171614]/8 overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <a href={`#/spice/${spice.id}`} className="block">
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
                    </a>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <a href={`#/spice/${spice.id}`} className="block space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#5C5852]">
                          <span className="uppercase tracking-wider font-medium text-[#8C1D2F]">
                            {spice.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{spice.origin.country}</span>
                        </div>

                        <motion.h2
                          layoutId={`spice-title-${spice.id}`}
                          className="font-display text-xl font-medium text-[#171614] group-hover:text-[#8C1D2F] transition-colors"
                        >
                          {spice.name}
                        </motion.h2>

                        <p className="text-sm text-[#5C5852] line-clamp-2 leading-relaxed">
                          {spice.shortDescription}
                        </p>
                      </a>

                      <div className="pt-4 border-t border-[#171614]/8 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-[#171614] tabular-nums">
                            From {formatUGX(basePrice)}
                          </p>
                          <p className="text-xs text-[#5C5852] tabular-nums">
                            {spice.weightTiers[1]?.label ?? spice.weightTiers[0]?.label} · {formatUGX(jarPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAddClick(e, spice)}
                          aria-label={`Quick add ${spice.name} to bag`}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isAdded
                              ? 'bg-[#8C1D2F] text-white border-[#8C1D2F]'
                              : 'bg-[#F8F7F4] text-[#171614] border-[#171614]/15 hover:border-[#171614]/40'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Jar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
