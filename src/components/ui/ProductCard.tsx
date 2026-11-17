import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { isFavoriteMenuItem, type MenuItem } from '@/src/data/menu';
import { SmartImage } from './SmartImage';

interface ProductCardProps {
  item: MenuItem;
  index?: number;
}

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProductCard({ item, index = 0 }: ProductCardProps) {
  const favorite = isFavoriteMenuItem(item);
  const displayNote =
    item.note && !(favorite && item.note.trim() === '⭐ Menu Favorit')
      ? item.note
      : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.55,
        delay: (index % 3) * 0.08,
        ease: SMOOTH_EASE,
      }}
      className="group flex flex-col bg-white rounded-2xl p-3.5 sm:p-5 border border-black/6 transition-transform duration-300 ease-out hover:-translate-y-1.5"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F5F5F5] mb-3.5 sm:mb-5">
        {favorite && (
          <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[#1A1A1A] border border-black/8 shadow-xs text-[11px] font-bold">
            <Star
              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            <span>Favorit</span>
          </span>
        )}
        <SmartImage
          src={item.image}
          alt={item.imageAlt}
          fallbackTitle={item.name}
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col items-center text-center px-1 pb-1 sm:pb-2">
        <div className="flex items-center flex-wrap justify-center gap-x-2 gap-y-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666] mb-1">
          <span>{item.category}</span>
          {displayNote && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#CC0000]">{displayNote}</span>
            </>
          )}
        </div>

        <span className="font-display text-base sm:text-lg font-extrabold text-[#CC0000] tabular-nums mb-1">
          {item.priceLabel}
        </span>

        <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1A1A1A] leading-tight mb-1.5 sm:mb-2">
          <span>{item.name}</span>
          {favorite && (
            <Star
              className="w-4 h-4 fill-amber-400 text-amber-400 inline-block shrink-0 ml-1.5 -mt-0.5"
              aria-label="Menu Favorit"
            />
          )}
        </h3>

        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}
