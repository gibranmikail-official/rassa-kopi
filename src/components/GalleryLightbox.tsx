import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { getGalleryAlbumPhotos, type GalleryPhoto } from '@/src/data/gallery';
import { SmartImage } from './ui/SmartImage';

interface GalleryLightboxProps {
  albums: GalleryPhoto[];
  activeAlbumIndex: number | null;
  onClose: () => void;
}

export function GalleryLightbox({
  albums,
  activeAlbumIndex,
  onClose,
}: GalleryLightboxProps) {
  const activeAlbum =
    activeAlbumIndex !== null ? albums[activeAlbumIndex] ?? null : null;
  const isOpen = activeAlbum !== null;
  const albumPhotos = activeAlbum ? getGalleryAlbumPhotos(activeAlbum) : [];

  const [pageIndex, setPageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setPageIndex(0);
  }, [activeAlbumIndex]);

  const totalPages = Math.max(1, albumPhotos.length);
  const safePage = Math.min(pageIndex, totalPages - 1);
  const activePhoto = albumPhotos[safePage] ?? null;

  const goNext = () => {
    if (totalPages <= 1) return;
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  const goPrev = () => {
    if (totalPages <= 1) return;
    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && totalPages > 1) {
        setPageIndex((prev) => (prev + 1) % totalPages);
      } else if (e.key === 'ArrowLeft' && totalPages > 1) {
        setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, totalPages, onClose]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || totalPages <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -45) goNext();
    if (delta > 45) goPrev();
  };

  return (
    <AnimatePresence>
      {isOpen && activeAlbum && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery album: ${activeAlbum.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-[#1A1A1A]/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 lg:p-10"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div
            className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 min-w-0">
              <span className="font-bold uppercase tracking-wider text-[#FF4D4D] shrink-0">
                {activeAlbum.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-white truncate">
                {activeAlbum.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-white/70 shrink-0">
                {albumPhotos.length} Foto
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white shrink-0"
              aria-label="Close album preview"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Single Centered Photo in Original Aspect Ratio */}
          {activePhoto && (
            <motion.div
              key={`${activeAlbum.id}-${safePage}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto w-full max-w-4xl my-auto py-3 flex items-center justify-center"
            >
              {(() => {
                const albumTitle = activeAlbum.title;
                const albumDescription = activeAlbum.caption?.trim();
                return (
                  <figure className="inline-flex flex-col w-fit max-w-full bg-white p-2 sm:p-3 rounded-[4px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-black/10">
                    <div className="bg-[#1F1F1F] overflow-hidden flex items-center justify-center">
                      <SmartImage
                        src={activePhoto.image}
                        alt={activePhoto.alt || albumTitle}
                        lazy={false}
                        fallbackTitle={albumTitle}
                        containerClassName="w-64 h-64 sm:w-80 sm:h-72"
                        className="block w-auto max-w-full h-auto max-h-[56vh] md:max-h-[62vh] object-contain"
                      />
                    </div>

                    <figcaption className="w-0 min-w-full pt-2.5 sm:pt-3 pb-0.5 px-1">
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#CC0000] truncate">
                        {activeAlbum.category}
                      </p>
                      <p className="font-display text-base sm:text-xl font-extrabold uppercase tracking-tight text-[#1A1A1A] leading-tight truncate mt-0.5">
                        {albumTitle}
                      </p>
                      {albumDescription && (
                        <p className="text-[11px] sm:text-xs text-[#666666] line-clamp-2 mt-0.5 leading-snug">
                          {albumDescription}
                        </p>
                      )}
                    </figcaption>
                  </figure>
                );
              })()}
            </motion.div>
          )}

          {/* Bottom Controls */}
          <div
            className="mx-auto w-full max-w-4xl flex items-center justify-center gap-6 sm:gap-12 shrink-0 pb-1 min-h-[44px]"
            onClick={(e) => e.stopPropagation()}
          >
            {totalPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex items-center gap-2 min-h-[44px] px-3 font-display text-base sm:text-xl font-extrabold uppercase tracking-wider text-white hover:text-[#FF4D4D] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Sebelumnya</span>
                </button>

                <span className="text-xs sm:text-sm font-medium tabular-nums text-white/75 whitespace-nowrap">
                  {String(safePage + 1).padStart(2, '0')} /{' '}
                  {String(totalPages).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 min-h-[44px] px-3 font-display text-base sm:text-xl font-extrabold uppercase tracking-wider text-white hover:text-[#FF4D4D] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
