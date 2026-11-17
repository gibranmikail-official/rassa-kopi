import { useCms } from '@/src/context/CmsContext';

function CoffeeBeanIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.45 4.2c1.12 1.12 1.25 3.1.28 4.92-.82 1.54-2.18 2.24-3.28 3.24-1.08.98-1.56 2.1-1.94 3.44a6.45 6.45 0 0 1-3.36-1.85c-2.34-2.34-2.34-6.14 0-8.48 2.13-2.13 5.47-2.34 7.83-.63.16-.2.31-.42.47-.64zm-1.9 11.6c-1.12-1.12-1.25-3.1-.28-4.92.82-1.54 2.18-2.24 3.28-3.24 1.08-.98 1.56-2.1 1.94-3.44a6.45 6.45 0 0 1 3.36 1.85c2.34 2.34 2.34 6.14 0 8.48-2.13 2.13-5.47 2.34-7.83.63-.16.2-.31.42-.47.64z" />
    </svg>
  );
}

function MarqueeTrack({
  phrase,
  direction,
  textClassName,
}: {
  phrase: string;
  direction: 'left' | 'right';
  textClassName?: string;
}) {
  const animClass =
    direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  const repeated = Array.from({ length: 6 }, () => phrase);

  return (
    <div className="flex w-max select-none whitespace-nowrap">
      <div className={`flex items-center will-change-transform ${animClass}`}>
        {[0, 1].map((dupIndex) => (
          <div key={dupIndex} className="flex items-center shrink-0">
            {repeated.map((text, idx) => (
              <div
                key={`${dupIndex}-${idx}`}
                className={`inline-flex items-center gap-4 sm:gap-5 px-4 sm:px-5 ${textClassName ?? ''}`}
              >
                <span className="text-sm sm:text-base md:text-lg font-semibold tracking-wide">
                  {text}
                </span>
                <CoffeeBeanIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 opacity-90" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroMarquee() {
  const { content } = useCms();
  const { marquee } = content;

  return (
    <div
      aria-hidden="true"
      className="relative w-full h-24 sm:h-32 md:h-36 lg:h-40 overflow-hidden flex items-center justify-center mt-2 sm:-mt-5 lg:-mt-8 mb-2"
    >
      {/* Back Ribbon (Deep Crimson, angled slightly upward left-to-right) */}
      <div className="absolute w-[112%] -rotate-[1.6deg] bg-[#990000] py-2.5 sm:py-3 z-10 shadow-sm">
        <MarqueeTrack
          phrase={marquee.backPhrase}
          direction="right"
          textClassName="text-white/80"
        />
      </div>

      {/* Front Ribbon (Rassa Red, angled downward left-to-right) */}
      <div className="absolute w-[112%] rotate-[2.3deg] bg-[#CC0000] py-2.5 sm:py-3 z-20 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.24)]">
        <MarqueeTrack
          phrase={marquee.frontPhrase}
          direction="left"
          textClassName="text-white"
        />
      </div>
    </div>
  );
}
