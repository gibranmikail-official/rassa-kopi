import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Star, X } from 'lucide-react';
import {
  MENU_CATEGORIES,
  isFavoriteMenuItem,
  type MenuCategory,
} from '@/src/data/menu';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';

interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullMenuModal({ isOpen, onClose }: FullMenuModalProps) {
  const { content } = useCms();
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileDropdownOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [mobileDropdownOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMobileDropdownOpen(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const items =
    selectedCategory === 'All'
      ? content.menuItems
      : content.menuItems.filter((item) => item.category === selectedCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Rassa Kopi Full Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-black/8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#CC0000]">
                    COMPLETE SELECTION
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                    Rassa Kopi Full Menu
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                  aria-label="Close full menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 min-w-0">
                {/* Mobile Dropdown (< 640px) */}
                <div ref={dropdownRef} className="sm:hidden relative w-full">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={mobileDropdownOpen}
                    onClick={() => setMobileDropdownOpen((prev) => !prev)}
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#F5F5F5] border border-black/8 flex items-center justify-between gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer"
                  >
                    <span className="truncate">Kategori: {selectedCategory}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#CC0000] shrink-0 transition-transform duration-200 ${
                        mobileDropdownOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {mobileDropdownOpen && (
                    <div
                      role="listbox"
                      aria-label="Pilih kategori full menu"
                      className="absolute left-0 right-0 z-30 mt-1.5 p-1.5 rounded-xl bg-white border border-black/10 shadow-xl space-y-0.5"
                    >
                      {MENU_CATEGORIES.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                          <button
                            key={category}
                            role="option"
                            type="button"
                            aria-selected={isActive}
                            onClick={() => {
                              setSelectedCategory(category);
                              setMobileDropdownOpen(false);
                            }}
                            className={`w-full min-h-[38px] px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-[#CC0000] text-white'
                                : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                            }`}
                          >
                            <span>{category}</span>
                            {isActive && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tablet / Desktop Pill Tabs */}
                <div className="hidden sm:block max-w-full overflow-x-auto no-scrollbar">
                  <div className="inline-flex flex-wrap gap-1 p-1 bg-[#F5F5F5] rounded-lg">
                    {MENU_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          selectedCategory === category
                            ? 'bg-white text-[#CC0000] shadow-xs'
                            : 'text-[#666666] hover:text-[#1A1A1A]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer shrink-0"
                  aria-label="Close full menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {items.map((item) => {
                const favorite = isFavoriteMenuItem(item);
                const extraNote =
                  item.note && !(favorite && item.note.trim() === '⭐ Menu Favorit')
                    ? item.note
                    : '';

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl border border-black/8 bg-white"
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#F5F5F5] shrink-0">
                      <SmartImage
                        src={item.image}
                        alt={item.imageAlt}
                        fallbackTitle={item.name}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-[#666666] truncate">
                            {item.category}
                          </span>
                          {favorite && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-[10px] font-bold text-amber-700 shrink-0">
                              <Star
                                className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                                aria-hidden="true"
                              />
                              <span>Favorit</span>
                            </span>
                          )}
                        </div>
                        <span className="font-display text-sm font-bold text-[#CC0000] tabular-nums shrink-0">
                          {item.priceLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-[#1A1A1A] truncate">
                          {item.name}
                        </h3>
                        {favorite && (
                          <Star
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0"
                            aria-label="Menu Favorit"
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#666666] line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                      {extraNote && (
                        <p className="text-[11px] font-semibold text-[#CC0000] mt-0.5 truncate">
                          {extraNote}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-black/8 bg-[#F5F5F5] text-xs text-[#666666] shrink-0">
              {content.menuHeader.footnote}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
