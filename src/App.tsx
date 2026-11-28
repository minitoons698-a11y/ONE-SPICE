import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { AdminPage } from './components/AdminPage';
import { BagDrawer, BagItem } from './components/BagDrawer';
import { AppRoute, Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SpiceCatalog } from './components/SpiceCatalog';
import { SpiceProfile } from './components/SpiceProfile';
import { VisitContactSection } from './components/VisitContactSection';
import {
  CulinaryCategory,
  DEFAULT_PAYMENT_SETTINGS,
  PaymentSettings,
  SHOP_INFO,
  SPICES as DEFAULT_SPICES,
  Spice,
  WeightTier,
} from './data/spices';
import { OperationType, db, handleFirestoreError } from './lib/firebase';

interface ParsedRoute {
  route: AppRoute;
  spiceId: string | null;
}

function parseHashRoute(hash: string): ParsedRoute {
  const clean = hash.replace(/^#/, '');
  if (!clean || clean === '/') {
    return { route: 'home', spiceId: null };
  }
  if (clean === '/spices' || clean === '/origins') {
    return { route: 'spices', spiceId: null };
  }
  if (clean === '/contact') {
    return { route: 'contact', spiceId: null };
  }
  if (clean === '/admin') {
    return { route: 'admin', spiceId: null };
  }
  if (clean.startsWith('/spice/')) {
    return { route: 'spice', spiceId: clean.replace('/spice/', '').trim() };
  }
  if (clean.startsWith('spice/')) {
    return { route: 'spice', spiceId: clean.replace('spice/', '').trim() };
  }
  return { route: 'home', spiceId: null };
}

export default function App() {
  const [routeState, setRouteState] = useState<ParsedRoute>(() =>
    typeof window !== 'undefined' ? parseHashRoute(window.location.hash) : { route: 'home', spiceId: null }
  );
  const [profileDirection, setProfileDirection] = useState<number>(1);
  const prevSpiceIndexRef = useRef<number>(0);

  const [firestoreSpices, setFirestoreSpices] = useState<Spice[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All Spices' | CulinaryCategory>('All Spices');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);

  const allSpices = useMemo(() => {
    if (firestoreSpices.length === 0) return DEFAULT_SPICES;
    const byId = new Map<string, Spice>();
    for (const s of DEFAULT_SPICES) {
      byId.set(s.id, s);
    }
    for (const s of firestoreSpices) {
      byId.set(s.id, s);
    }
    return Array.from(byId.values());
  }, [firestoreSpices]);

  // Real-time public catalog subscription
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'spices'),
      (snapshot) => {
        const docs: Spice[] = snapshot.docs.map((d) => d.data() as Spice);
        setFirestoreSpices(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'spices');
      }
    );
    return () => unsub();
  }, []);

  // Real-time public +256 MoMo / Airtel payment settings subscription
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'payments'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPaymentSettings({
            momoNumber: String(data.momoNumber || DEFAULT_PAYMENT_SETTINGS.momoNumber),
            momoName: String(data.momoName || DEFAULT_PAYMENT_SETTINGS.momoName),
            airtelNumber: String(data.airtelNumber || DEFAULT_PAYMENT_SETTINGS.airtelNumber),
            airtelName: String(data.airtelName || DEFAULT_PAYMENT_SETTINGS.airtelName),
            updatedBy: String(data.updatedBy || ''),
          });
        }
      },
      () => undefined
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const next = parseHashRoute(window.location.hash);
      if (next.route === 'spice' && next.spiceId) {
        const nextIdx = allSpices.findIndex((s) => s.id === next.spiceId);
        if (nextIdx >= 0) {
          setProfileDirection(nextIdx >= prevSpiceIndexRef.current ? 1 : -1);
          prevSpiceIndexRef.current = nextIdx;
        }
      }
      setRouteState(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allSpices]);

  const filteredSpices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = allSpices.filter((spice) => {
      const matchesCategory =
        selectedCategory === 'All Spices' || spice.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      return (
        spice.name.toLowerCase().includes(normalizedQuery) ||
        spice.category.toLowerCase().includes(normalizedQuery) ||
        (spice.botanicalName ?? '').toLowerCase().includes(normalizedQuery) ||
        (spice.grade ?? '').toLowerCase().includes(normalizedQuery) ||
        spice.shortDescription.toLowerCase().includes(normalizedQuery)
      );
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort(
        (a, b) => (a.weightTiers[0]?.price ?? 0) - (b.weightTiers[0]?.price ?? 0)
      );
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort(
        (a, b) => (b.weightTiers[0]?.price ?? 0) - (a.weightTiers[0]?.price ?? 0)
      );
    }
    return filtered;
  }, [allSpices, searchQuery, selectedCategory, sortBy]);

  const activeSpice = useMemo(() => {
    if (routeState.route !== 'spice' || !routeState.spiceId) return null;
    return allSpices.find((s) => s.id === routeState.spiceId) ?? allSpices[0] ?? null;
  }, [routeState, allSpices]);

  const handleAddToBag = (spice: Spice, tier: WeightTier, quantity: number) => {
    setBagItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.spiceId === spice.id && item.weightLabel === tier.label
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          spiceId: spice.id,
          name: spice.name,
          image: spice.image,
          weightLabel: tier.label,
          unitPrice: tier.price,
          quantity,
        },
      ];
    });
  };

  const handleQuickAdd = (spice: Spice) => {
    const defaultTier = spice.weightTiers[1] ?? spice.weightTiers[0];
    if (defaultTier) {
      handleAddToBag(spice, defaultTier, 1);
    }
  };

  const handleUpdateQuantity = (spiceId: string, weightLabel: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.spiceId === spiceId && item.weightLabel === weightLabel
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (spiceId: string, weightLabel: string) => {
    setBagItems((prev) =>
      prev.filter((item) => !(item.spiceId === spiceId && item.weightLabel === weightLabel))
    );
  };

  const totalBagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#171614]">
          <Header
            currentRoute={routeState.route}
            bagCount={totalBagCount}
            onOpenBag={() => setIsBagOpen(true)}
          />

          <main className="flex-1 pt-[68px]">
            {routeState.route === 'home' && (
              <motion.div
                key="home-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <HomePage spices={allSpices} />
              </motion.div>
            )}

            {routeState.route === 'spices' && (
              <motion.div
                key="spices-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpiceCatalog
                  spices={filteredSpices}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onQuickAdd={handleQuickAdd}
                  totalSpiceCount={allSpices.length}
                />
              </motion.div>
            )}

            {routeState.route === 'spice' && activeSpice && (
              <motion.div
                key="spice-profile-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpiceProfile
                  spice={activeSpice}
                  allSpices={allSpices}
                  direction={profileDirection}
                  onAddToBag={handleAddToBag}
                />
              </motion.div>
            )}

            {routeState.route === 'contact' && (
              <motion.div
                key="contact-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <VisitContactSection />
              </motion.div>
            )}

            {routeState.route === 'admin' && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <AdminPage liveSpices={allSpices} paymentSettings={paymentSettings} />
              </motion.div>
            )}
          </main>

          <footer className="border-t border-[#171614]/10 bg-[#EFECE6]/50">
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5C5852]">
              <div className="flex flex-wrap items-center gap-3">
                <a href="#/" className="font-display text-sm font-medium text-[#171614] hover:text-[#8C1D2F]">
                  {SHOP_INFO.brand}
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={SHOP_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171614] hover:underline underline-offset-4"
                >
                  {SHOP_INFO.addressLine1}
                </a>
                <span aria-hidden="true">·</span>
                <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <a href="#/" className="hover:text-[#171614] transition-colors whitespace-nowrap">
                  Home
                </a>
                <a href="#/spices" className="hover:text-[#171614] transition-colors whitespace-nowrap">
                  Spices
                </a>
                <a href="#/contact" className="hover:text-[#171614] transition-colors whitespace-nowrap">
                  Visit &amp; Contact
                </a>
                <a
                  href={SHOP_INFO.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#171614] hover:text-[#8C1D2F] transition-colors whitespace-nowrap"
                >
                  TikTok {SHOP_INFO.tiktokHandle}
                </a>
                <a
                  href="#/admin"
                  className="font-medium text-[#5C5852] hover:text-[#8C1D2F] transition-colors whitespace-nowrap"
                >
                  Owner Admin
                </a>
              </div>
            </div>
          </footer>

          <BagDrawer
            isOpen={isBagOpen}
            items={bagItems}
            paymentSettings={paymentSettings}
            onClose={() => setIsBagOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearBag={() => setBagItems([])}
          />
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
