import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useCms } from '@/src/context/CmsContext';
import { Button } from './ui/Button';
import { SmartImage } from './ui/SmartImage';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreMenu: () => void;
}

export function StoryModal({ isOpen, onClose, onExploreMenu }: StoryModalProps) {
  const { content } = useCms();
  const { about, storyPillars } = content;

  useEffect(() => {
    if (!isOpen) return;
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Our Story — Rassa Kopi"
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
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-black/8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-black/8 shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#CC0000]">
                OUR STORY
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                aria-label="Close story dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#F5F5F5]">
                <SmartImage
                  src={about.storyModalImage}
                  alt="Minimalist sunlit interior of Rassa Kopi"
                  fallbackTitle="Rassa Kopi Interior"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight mb-3">
                  {about.storyModalHeadline}
                </h2>
                <p className="text-sm sm:text-base text-[#666666] leading-relaxed mb-3.5 sm:mb-4">
                  {about.storyModalParagraph1}
                </p>
                <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
                  {about.storyModalParagraph2}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-4 border-t border-black/8">
                {storyPillars.map((pillar) => (
                  <div key={pillar.id}>
                    <p className="font-display text-sm font-bold text-[#1A1A1A] mb-1">
                      {pillar.badgeNumber}. {pillar.title}
                    </p>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-black/8 bg-[#F5F5F5] flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onExploreMenu();
                }}
              >
                Explore Our Menu
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
