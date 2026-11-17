import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Play,
  RefreshCw,
} from 'lucide-react';
import { siteConfig } from '@/src/config/siteConfig';
import {
  TikTokVideoModal,
  formatCompactCount,
  type TikTokVideoItem,
} from './TikTokVideoModal';

interface TikTokProfile {
  uniqueId: string;
  nickname: string;
  signature: string;
  followerCount: number;
  heartCount: number;
  avatarProxyUrl: string;
  profileUrl: string;
}

interface TikTokFeedPayload {
  profile: TikTokProfile;
  videos: TikTokVideoItem[];
  fetchedAt: number;
}

interface TikTokFeedProps {
  tiktokUrl?: string;
}

function extractTikTokUsername(url?: string): string {
  const raw = url || siteConfig.location.tiktokUrl || 'https://www.tiktok.com/@suhe_erna';
  const match = raw.match(/@([a-zA-Z0-9._]+)/);
  return match?.[1] || 'suhe_erna';
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1Z" />
    </svg>
  );
}

export function TikTokFeed({ tiktokUrl }: TikTokFeedProps) {
  const username = extractTikTokUsername(tiktokUrl);
  const [feed, setFeed] = useState<TikTokFeedPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [totalPages, setTotalPages] = useState(5);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const loadFeed = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ username });
      if (forceRefresh) qs.set('refresh', '1');
      const res = await fetch(`/api/tiktok/feed?${qs.toString()}`);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as TikTokFeedPayload;
      if (!Array.isArray(data?.videos) || data.videos.length === 0) {
        throw new Error('Empty TikTok feed');
      }
      setFeed(data);
    } catch {
      setError('fallback-embed');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadFeed(false);
  }, [loadFeed]);

  const updateScrollIndicators = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setTotalPages(1);
      setActivePage(0);
      return;
    }

    const pages = Math.max(2, Math.min(6, Math.ceil(el.scrollWidth / Math.max(1, el.clientWidth * 0.55))));
    setTotalPages(pages);

    const progress = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
    setActivePage(Math.round(progress * (pages - 1)));
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollIndicators();
    const onScroll = () => updateScrollIndicators();
    el.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => updateScrollIndicators());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [feed?.videos.length, updateScrollIndicators]);

  const handleStep = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const handleJumpToPage = (pageIdx: number) => {
    const el = trackRef.current;
    if (!el || totalPages <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetLeft = (pageIdx / (totalPages - 1)) * maxScroll;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const videos = feed?.videos ?? [];
  const profile = feed?.profile;
  const profileHref =
    profile?.profileUrl || `https://www.tiktok.com/@${username}`;

  return (
    <div className="mb-14 sm:mb-20">
      {/* Compact Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">
        <span className="inline-flex items-center gap-2 text-[#1A1A1A] font-display text-lg sm:text-xl font-extrabold tracking-tight uppercase">
          <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#CC0000] shrink-0" />
          <span>{profile?.nickname || 'Rassakopi'}</span>
        </span>

        <a
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#CC0000] hover:text-[#A80000] transition-colors whitespace-nowrap shrink-0"
        >
          <span>Follow on TikTok</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex gap-3.5 sm:gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`tiktok-skeleton-${idx}`}
              className="w-[56%] sm:w-[32%] md:w-[24%] lg:w-[calc((100%-64px)/5)] shrink-0 aspect-[9/16] rounded-2xl bg-black/8 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Fallback Official TikTok Creator Embed (for static-only hosts without /api backend) */}
      {!isLoading && error && (
        <div className="rounded-2xl bg-white border border-black/8 overflow-hidden">
          <iframe
            src={`https://www.tiktok.com/embed/@${encodeURIComponent(username)}`}
            title={`Video TikTok @${username}`}
            className="w-full h-[480px] sm:h-[520px] border-0 bg-white"
            loading="lazy"
            allow="encrypted-media;"
          />
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#FAFAFA] border-t border-black/6 text-xs text-[#666666]">
            <span>Menampilkan feed langsung dari TikTok @{username}</span>
            <button
              type="button"
              onClick={() => loadFeed(true)}
              className="inline-flex items-center gap-1 font-bold text-[#CC0000] hover:text-[#A80000] cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Cards Horizontal Carousel */}
      {!isLoading && !error && videos.length > 0 && (
        <>
          <div
            ref={trackRef}
            className="flex gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {videos.map((video, idx) => {
              const hasCoverError = !!failedCovers[video.id];
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideoIndex(idx)}
                  className="group relative w-[56%] sm:w-[32%] md:w-[24%] lg:w-[calc((100%-64px)/5)] shrink-0 snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-[#E5E5E5] border border-black/8 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
                  aria-label={`Putar video TikTok: ${video.desc}`}
                >
                  {!hasCoverError ? (
                    <img
                      src={video.coverProxyUrl}
                      alt={video.desc}
                      loading={idx < 5 ? 'eager' : 'lazy'}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedCovers((prev) => ({ ...prev, [video.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1F1F1F] flex flex-col items-center justify-center p-4 text-center text-white/80">
                      <TikTokIcon className="w-8 h-8 mb-2 text-[#CC0000]" />
                      <span className="text-xs font-semibold">@{video.authorUniqueId}</span>
                    </div>
                  )}

                  {/* Top-Right Play Indicator */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 backdrop-blur-xs text-white flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:bg-[#CC0000] transition-all duration-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </span>

                  {/* Bottom Measured Contrast Scrim + Caption & Metrics */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3 sm:p-3.5 pt-14 flex flex-col justify-end">
                    <p className="text-xs sm:text-[13px] font-medium text-white leading-snug line-clamp-2 mb-2">
                      {video.desc}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-white/95 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                        <span>{formatCompactCount(video.playCount)}</span>
                      </span>
                      {typeof video.likeCount === 'number' && (
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                          <span>{formatCompactCount(video.likeCount)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Controls Row: Dots (Left) + Prev/Next Circular Buttons (Right) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 sm:mt-5">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Halaman galeri video TikTok"
              >
                {Array.from({ length: totalPages }).map((_, pageIdx) => {
                  const isActive = pageIdx === activePage;
                  return (
                    <button
                      key={`tiktok-dot-${pageIdx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Halaman ${pageIdx + 1}`}
                      onClick={() => handleJumpToPage(pageIdx)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'w-6 bg-[#CC0000]'
                          : 'w-1.5 bg-[#1A1A1A]/20 hover:bg-[#1A1A1A]/45'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  disabled={!canScrollPrev}
                  aria-label="Video TikTok sebelumnya"
                  className="w-10 h-10 rounded-full bg-white border border-black/15 text-[#1A1A1A] hover:border-[#CC0000] hover:text-[#CC0000] disabled:opacity-35 disabled:hover:border-black/15 disabled:hover:text-[#1A1A1A] disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  disabled={!canScrollNext}
                  aria-label="Video TikTok berikutnya"
                  className="w-10 h-10 rounded-full bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#CC0000] hover:border-[#CC0000] hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:border-[#1A1A1A] disabled:hover:text-[#1A1A1A] disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Interactive Video Lightbox Player */}
      <TikTokVideoModal
        videos={videos}
        activeIndex={activeVideoIndex}
        onClose={() => setActiveVideoIndex(null)}
        onChangeIndex={(nextIdx) => setActiveVideoIndex(nextIdx)}
      />
    </div>
  );
}
