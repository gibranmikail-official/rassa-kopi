import { motion } from 'motion/react';
import { getGalleryAlbumPhotos, type GalleryPhoto } from '@/src/data/gallery';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

interface GallerySectionProps {
  onSelectPhoto: (index: number) => void;
}

interface PolaroidCardProps {
  photo: GalleryPhoto;
  index: number;
  onSelect: (index: number) => void;
}

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const POLAROID_SCATTER = [
  {
    rotate: '-rotate-[3.5deg]',
    offset: 'translate-y-0 lg:translate-y-0',
    zIndex: 'z-10',
  },
  {
    rotate: 'rotate-[2.5deg]',
    offset: 'translate-y-5 sm:translate-y-4 lg:translate-y-6',
    zIndex: 'z-20',
  },
  {
    rotate: '-rotate-[2deg]',
    offset: 'translate-y-1 sm:-translate-y-1 lg:-translate-y-2',
    zIndex: 'z-10',
  },
  {
    rotate: 'rotate-[3.2deg]',
    offset: 'translate-y-6 sm:translate-y-5 lg:translate-y-9',
    zIndex: 'z-20',
  },
  {
    rotate: '-rotate-[2.8deg]',
    offset: 'translate-y-0 sm:translate-y-2 lg:translate-y-1',
    zIndex: 'z-10',
  },
  {
    rotate: 'rotate-[3deg]',
    offset: 'translate-y-4 sm:translate-y-6 lg:translate-y-4',
    zIndex: 'z-20',
  },
  {
    rotate: '-rotate-[3.2deg]',
    offset: 'translate-y-1 sm:translate-y-1 lg:translate-y-10',
    zIndex: 'z-10',
  },
  {
    rotate: 'rotate-[1.8deg]',
    offset: 'translate-y-6 sm:translate-y-5 lg:-translate-y-1',
    zIndex: 'z-20',
  },
  {
    rotate: '-rotate-[2.4deg]',
    offset: 'translate-y-0 sm:translate-y-3 lg:translate-y-7',
    zIndex: 'z-10',
  },
  {
    rotate: 'rotate-[3.6deg]',
    offset: 'translate-y-5 sm:translate-y-6 lg:translate-y-2',
    zIndex: 'z-20',
  },
];

function PolaroidCard({ photo, index, onSelect }: PolaroidCardProps) {
  const scatter = POLAROID_SCATTER[index % POLAROID_SCATTER.length];
  const albumPhotos = getGalleryAlbumPhotos(photo);
  const coverSrc = photo.image?.trim() || albumPhotos[0]?.image || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.5,
        delay: (index % 5) * 0.05,
        ease: SMOOTH_EASE,
      }}
      className={`relative ${scatter.offset} ${scatter.zIndex} hover:z-40 focus-within:z-40 -mx-1 sm:-mx-1.5 -my-1 sm:-my-1.5 transition-[z-index] duration-150`}
    >
      <button
        type="button"
        onClick={() => onSelect(index)}
        className={`group w-full bg-white p-2 sm:p-2.5 pb-3 sm:pb-4 rounded-[3px] border border-black/10 shadow-[0_12px_26px_rgba(26,26,26,0.14),0_2px_6px_rgba(26,26,26,0.08)] hover:shadow-[0_22px_42px_rgba(204,0,0,0.18),0_6px_14px_rgba(0,0,0,0.12)] hover:border-[#CC0000]/35 text-left cursor-pointer transform ${scatter.rotate} hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.05] focus-visible:rotate-0 focus-visible:scale-[1.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000] transition-all duration-300 ease-out`}
        aria-label={`Open gallery album: ${photo.title} (${albumPhotos.length} photos)`}
      >
        <div className="relative aspect-[4/3.6] w-full overflow-hidden bg-[#F5F5F5] border border-black/6">
          <SmartImage
            src={coverSrc}
            alt={photo.alt || photo.title}
            fallbackTitle={photo.title}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        <div className="pt-2 sm:pt-2.5 px-0.5">
          <p className="text-[10px] sm:text-[11px] font-semibold text-[#CC0000] truncate leading-tight">
            {photo.category}
            {albumPhotos.length > 1 && (
              <span className="text-[#666666] font-medium">
                {' '}
                · {albumPhotos.length} Foto
              </span>
            )}
          </p>
          <h3 className="font-display text-sm sm:text-lg lg:text-xl font-extrabold uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#CC0000] leading-[1.04] truncate mt-0.5 transition-colors">
            {photo.title}
          </h3>
        </div>
      </button>
    </motion.div>
  );
}

export function GallerySection({ onSelectPhoto }: GallerySectionProps) {
  const { content } = useCms();
  const { galleryHeader, galleryItems } = content;

  return (
    <section
      id="gallery"
      className="relative bg-white text-[#1A1A1A] pt-10 sm:pt-16 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="right">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
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

          {/* Polaroid Collage Photo Wall */}
          <div className="relative rounded-3xl bg-[#F5F5F5] border border-black/8 px-4 pt-8 pb-14 sm:px-8 sm:pt-12 sm:pb-20 lg:px-10 lg:pt-14 lg:pb-24">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-1 gap-y-4 sm:gap-x-2 sm:gap-y-6 lg:gap-y-10 items-start">
              {galleryItems.map((photo, index) => (
                <PolaroidCard
                  key={photo.id}
                  photo={photo}
                  index={index}
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
