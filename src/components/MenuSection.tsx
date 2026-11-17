import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import {
  MENU_CATEGORIES,
  isFavoriteMenuItem,
  type MenuCategory,
} from '@/src/data/menu';
import { useCms } from '@/src/context/CmsContext';
import { ProductCard } from './ui/ProductCard';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

interface MenuSectionProps {
  activeCategory: 'All' | MenuCategory;
  onChangeCategory: (category: 'All' | MenuCategory) => void;
  onViewFullMenu: () => void;
}

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MenuSection({
  activeCategory,
  onChangeCategory,
  onViewFullMenu,
}: MenuSectionProps) {
  const { content } = useCms();
  const { menuHeader, menuItems } = content;
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 639px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const favoriteItems = menuItems.filter((item) => isFavoriteMenuItem(item));
  const mobileFavoriteItems =
    favoriteItems.length > 0
      ? favoriteItems.slice(0, 4)
      : menuItems.filter((item) => item.featured).slice(0, 4);

  const displayedItems = isMobile
    ? mobileFavoriteItems
    : activeCategory === 'All'
      ? menuItems.filter((item) => item.featured)
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section
      id="menu"
      className="relative bg-white text-[#1A1A1A] pt-10 sm:pt-16 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="right">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-7 sm:mb-10">
            <div className="max-w-2xl">
              <span className="block text-xs font-bold tracking-[0.2em] text-[#CC0000] uppercase mb-2 sm:mb-3">
                {menuHeader.eyebrow}
              </span>
              <h2 className="font-display text-[clamp(2.1rem,8.5vw,2.8rem)] sm:text-[clamp(2.4rem,5vw,4rem)] font-extrabold text-[#1A1A1A] leading-[0.98] uppercase tracking-tight mb-2.5 sm:mb-3">
                {menuHeader.title}
              </h2>
              <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-xl">
                {menuHeader.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onViewFullMenu}
              className="group self-start lg:self-auto inline-flex items-center gap-3 pl-5 pr-2 py-1.5 min-h-[46px] rounded-full bg-white text-[#CC0000] border border-[#CC0000] hover:bg-[#CC0000] hover:text-white text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[#CC0000]"
            >
              <span>{menuHeader.ctaLabel}</span>
              <span className="w-8 h-8 rounded-full bg-[#CC0000] text-white group-hover:bg-white group-hover:text-[#CC0000] inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Tablet / Desktop View: Pill Category Filter Tabs */}
          <div className="hidden sm:block mb-10">
            <div
              role="tablist"
              aria-label="Menu categories"
              className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F5F5F5] rounded-full border border-black/6"
            >
              {MENU_CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => onChangeCategory(category)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#CC0000] ${
                      isActive
                        ? 'bg-[#CC0000] text-white shadow-sm'
                        : 'text-[#666666] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <motion.div
            key={isMobile ? 'mobile-favorites' : activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: SMOOTH_EASE }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7"
          >
            {displayedItems.map((item, idx) => (
              <ProductCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>

          <p className="mt-8 text-xs text-[#777777]">
            {menuHeader.footnote}
          </p>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to Primary Red Why Rassa Section */}
      <TornEdge fillColor="#CC0000" position="bottom" variant="a" />
    </section>
  );
}
