import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Play,
  X,
} from 'lucide-react';

export interface TikTokVideoItem {
  id: string;
  desc: string;
  width: number;
  height: number;
  playCount: number;
  likeCount?: number;
  authorUniqueId: string;
  permalink: string;
  coverProxyUrl: string;
  videoProxyUrl: string;
}

interface TikTokVideoModalProps {
  videos: TikTokVideoItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function formatCompactCount(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(num);
}

export function TikTokVideoModal({
  videos,
  activeIndex,
  onClose,
  onChangeIndex,
}: TikTokVideoModalProps) {
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);

  const isOpen =
    activeIndex !== null && activeIndex >= 0 && activeIndex < videos.length;
  const currentVideo = isOpen ? videos[activeIndex] : null;

  useEffect(() => {
    setUseEmbedFallback(false);
  }, [currentVideo?.id]);

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + videos.length) % videos.length);
      }
      if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % videos.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, videos.length, onClose, onChangeIndex]);

  return (
    <AnimatePresence>
      {isOpen && currentVideo && activeIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`TikTok video oleh @${currentVideo.authorUniqueId}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#CC0000]">
                  @{currentVideo.authorUniqueId}
                </p>
                <div className="flex items-center gap-2.5 text-xs text-[#666666] tabular-nums mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                    {formatCompactCount(currentVideo.playCount)}
                  </span>
                  {typeof currentVideo.likeCount === 'number' && (
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" aria-hidden="true" />
                      {formatCompactCount(currentVideo.likeCount)}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    {activeIndex + 1} / {videos.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={currentVideo.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#CC0000] text-[#1A1A1A] hover:text-white text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <span>TikTok</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup pemutar video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Portrait Video Player */}
            <div className="relative w-full aspect-[9/16] max-h-[66vh] bg-[#141414]">
              {!useEmbedFallback ? (
                <video
                  key={currentVideo.id}
                  src={currentVideo.videoProxyUrl}
                  poster={currentVideo.coverProxyUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  onError={() => setUseEmbedFallback(true)}
                />
              ) : (
                <iframe
                  key={`embed-${currentVideo.id}`}
                  src={`https://www.tiktok.com/embed/v2/${currentVideo.id}`}
                  title={currentVideo.desc}
                  className="w-full h-full border-0 bg-white"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}

              {videos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeIndex((activeIndex - 1 + videos.length) % videos.length)
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-[#CC0000] text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Video sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeIndex((activeIndex + 1) % videos.length)
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-[#CC0000] text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Video berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption Footer */}
            <div className="px-4 py-3.5 bg-white">
              <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed line-clamp-3">
                {currentVideo.desc}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
