import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryPhoto } from '@/src/data/gallery';
import { SmartImage } from './ui/SmartImage';

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function GalleryLightbox({
  photos,
  activeIndex,
  onClose,
  onChangeIndex,
}: GalleryLightboxProps) {
  const isOpen = activeIndex !== null && photos[activeIndex] !== undefined;
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + photos.length) % photos.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, activeIndex, photos.length, onClose, onChangeIndex]);

  return (
    <AnimatePresence>
      {isOpen && activePhoto && activeIndex !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery photo: ${activePhoto.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-black/8 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#666666]">
                <span className="font-bold uppercase tracking-wider text-[#CC0000]">
                  {activePhoto.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium">
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(photos.length).padStart(2, '0')}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Image Viewport */}
            <div className="relative bg-[#F5F5F5] aspect-[4/3] sm:aspect-[16/9] max-h-[60vh] sm:max-h-[68vh] w-full flex items-center justify-center overflow-hidden shrink-0">
              <SmartImage
                src={activePhoto.image}
                alt={activePhoto.alt}
                lazy={false}
                fallbackTitle={activePhoto.title}
                containerClassName="w-full h-full"
                className="w-full h-full object-contain bg-[#F5F5F5]"
              />

              {/* Prev / Next Overlay Controls */}
              <button
                type="button"
                onClick={() =>
                  onChangeIndex((activeIndex - 1 + photos.length) % photos.length)
                }
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#1A1A1A] hover:bg-[#CC0000] hover:text-white flex items-center justify-center shadow-md border border-black/8 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onChangeIndex((activeIndex + 1) % photos.length)}
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#1A1A1A] hover:bg-[#CC0000] hover:text-white flex items-center justify-center shadow-md border border-black/8 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Caption */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-5 bg-white overflow-y-auto">
              <h3 className="font-display text-base sm:text-lg font-bold text-[#1A1A1A] mb-1">
                {activePhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {activePhoto.caption}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
