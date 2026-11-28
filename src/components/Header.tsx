import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { SHOP_INFO } from '../data/spices';

export type AppRoute = 'home' | 'spices' | 'spice' | 'contact' | 'admin';

interface HeaderProps {
  currentRoute: AppRoute;
  bagCount: number;
  onOpenBag: () => void;
}

export function Header({ currentRoute, bagCount, onOpenBag }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClass = (active: boolean) =>
    `transition-colors underline-offset-4 hover:underline whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C1D2F] ${
      active ? 'text-[#171614] underline font-semibold' : 'text-[#5C5852] hover:text-[#171614]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#171614]/10">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#/"
          onClick={() => setMobileMenuOpen(false)}
          className="font-display text-lg md:text-xl font-medium tracking-tight text-[#171614] hover:text-[#8C1D2F] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C1D2F]"
        >
          {SHOP_INFO.brand}
        </a>

        {/* Zone 2: Concise single-line hyperlinked navigation (desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <a href="#/" className={linkClass(currentRoute === 'home')}>
            Home
          </a>
          <a href="#/spices" className={linkClass(currentRoute === 'spices' || currentRoute === 'spice')}>
            Spices
          </a>
          <a href="#/contact" className={linkClass(currentRoute === 'contact')}>
            Visit &amp; Contact
          </a>
          <a
            href={SHOP_INFO.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass(false)}
          >
            TikTok {SHOP_INFO.tiktokHandle}
          </a>
        </nav>

        {/* Zone 3: Primary action + Mobile 3-line stacked hamburger button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C1D2F]"
            aria-label={`Open shopping bag with ${bagCount} items`}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Bag</span>
            <span className="tabular-nums">({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg border border-[#171614]/15 bg-white text-[#171614] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer triggered by 3-line stacked menu button */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[#171614]/10 bg-[#F8F7F4] px-6 py-4 space-y-1 shadow-lg"
          >
            <a
              href="#/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 text-sm font-medium border-b border-[#171614]/8 ${
                currentRoute === 'home' ? 'text-[#8C1D2F] font-semibold' : 'text-[#171614]'
              }`}
            >
              Home
            </a>
            <a
              href="#/spices"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 text-sm font-medium border-b border-[#171614]/8 ${
                currentRoute === 'spices' || currentRoute === 'spice'
                  ? 'text-[#8C1D2F] font-semibold'
                  : 'text-[#171614]'
              }`}
            >
              Spices
            </a>
            <a
              href="#/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 text-sm font-medium border-b border-[#171614]/8 ${
                currentRoute === 'contact' ? 'text-[#8C1D2F] font-semibold' : 'text-[#171614]'
              }`}
            >
              Visit &amp; Contact
            </a>
            <a
              href={SHOP_INFO.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-medium border-b border-[#171614]/8 text-[#171614]"
            >
              TikTok {SHOP_INFO.tiktokHandle}
            </a>
            <a
              href="#/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 text-sm font-medium ${
                currentRoute === 'admin' ? 'text-[#8C1D2F] font-semibold' : 'text-[#5C5852]'
              }`}
            >
              Owner Admin
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
