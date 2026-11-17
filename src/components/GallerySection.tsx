import { motion } from 'motion/react';
import { Expand } from 'lucide-react';
import type { GalleryPhoto } from '@/src/data/gallery';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

interface GallerySectionProps {
  onSelectPhoto: (index: number) => void;
}

interface GalleryTileProps {
  photo: GalleryPhoto;
  index: number;
  heightClass: string;
  onSelect: (index: number) => void;
}

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function GalleryTile({ photo, index, heightClass, onSelect }: GalleryTileProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.55,
        delay: (index % 3) * 0.08,
        ease: SMOOTH_EASE,
      }}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: SMOOTH_EASE } }}
      className={`group relative w-full ${heightClass} rounded-2xl overflow-hidden bg-white border border-black/8 shadow-xs hover:shadow-md text-left cursor-pointer flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000] transition-shadow duration-300`}
      aria-label={`View gallery photo: ${photo.title}`}
    >
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#F5F5F5]">
        <SmartImage
          src={photo.image}
          alt={photo.alt}
          fallbackTitle={photo.title}
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-[#1A1A1A] group-hover:bg-[#CC0000] group-hover:text-white shadow-sm border border-black/8 flex items-center justify-center opacity-90 lg:opacity-0 lg:group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300">
          <Expand className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>

      <div className="px-4 py-3 sm:py-3.5 bg-white border-t border-black/6 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#CC0000] truncate">
          {photo.category}
        </p>
        <h3 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wide text-[#1A1A1A] leading-snug truncate mt-0.5">
          {photo.title}
        </h3>
        {photo.caption && (
          <p className="text-xs text-[#666666] line-clamp-1 mt-0.5">
            {photo.caption}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function GallerySection({ onSelectPhoto }: GallerySectionProps) {
  const { content } = useCms();
  const { galleryHeader, galleryItems } = content;

  const col1 = galleryItems
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => index % 3 === 0);
  const col2 = galleryItems
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => index % 3 === 1);
  const col3 = galleryItems
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => index % 3 === 2);

  return (
    <section
      id="gallery"
      className="relative bg-white text-[#1A1A1A] pt-10 sm:pt-16 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="right">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div className="max-w-xl">
              <span className="block text-xs font-bold tracking-[0.2em] text-[#CC0000] uppercase mb-2">
                {galleryHeader.eyebrow}
              </span>
              <h2 className="font-display text-[clamp(2.1rem,8.5vw,2.8rem)] sm:text-[clamp(2.4rem,5vw,4rem)] font-extrabold text-[#1A1A1A] leading-[0.98] uppercase tracking-tight">
                {galleryHeader.title}
              </h2>
            </div>
            <p className="text-sm text-[#666666] max-w-xs">
              {galleryHeader.description}
            </p>
          </div>

          {/* 3-Column Asymmetrical Staggered Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="flex flex-col gap-4 sm:gap-5">
              {col1.map(({ photo, index }, pos) => (
                <GalleryTile
                  key={photo.id}
                  photo={photo}
                  index={index}
                  heightClass={
                    pos % 2 === 0
                      ? 'h-[275px] sm:h-[300px] lg:h-[290px]'
                      : 'h-[275px] sm:h-[300px] lg:h-[380px]'
                  }
                  onSelect={onSelectPhoto}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:gap-5">
              {col2.map(({ photo, index }, pos) => (
                <GalleryTile
                  key={photo.id}
                  photo={photo}
                  index={index}
                  heightClass={
                    pos % 2 === 0
                      ? 'h-[275px] sm:h-[300px] lg:h-[380px]'
                      : 'h-[275px] sm:h-[300px] lg:h-[290px]'
                  }
                  onSelect={onSelectPhoto}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row lg:flex-col md:col-span-2 lg:col-span-1 gap-4 sm:gap-5">
              {col3.map(({ photo, index }, pos) => (
                <GalleryTile
                  key={photo.id}
                  photo={photo}
                  index={index}
                  heightClass={
                    pos % 2 === 0
                      ? 'h-[275px] sm:h-[300px] lg:h-[290px]'
                      : 'h-[275px] sm:h-[300px] lg:h-[380px]'
                  }
                  onSelect={onSelectPhoto}
                />
              ))}
            </div>
          </div>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to Soft Gray Visit Us Section */}
      <TornEdge fillColor="#F5F5F5" position="bottom" variant="a" />
    </section>
  );
}
