interface TornEdgeProps {
  fillColor: string;
  position?: 'bottom' | 'top';
  variant?: 'a' | 'b';
  className?: string;
}

// Midpoint spine traced from /assets/brand/torn-edge-paper.png (1920x233)
// so the lower section background fills cleanly right underneath the opaque paper strip.
const RIPPED_SPINE_PATH =
  'M0,233 L0,116 L60,138 L120,140 L180,141 L240,130 L300,108 L360,103 L420,91 L480,88 L540,94 L600,112 L660,99 L720,105 L780,117 L840,107 L900,115 L960,122 L1020,103 L1080,88 L1140,78 L1200,74 L1260,82 L1320,92 L1380,99 L1440,102 L1500,100 L1560,92 L1620,91 L1680,71 L1740,69 L1800,65 L1860,43 L1920,116 L1920,233 Z';

export function TornEdge({
  fillColor,
  position = 'bottom',
  variant = 'a',
  className = '',
}: TornEdgeProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full overflow-hidden leading-none select-none ${
        position === 'bottom' ? '-mb-px' : '-mt-px rotate-180'
      } ${className}`}
    >
      <div
        className={`relative w-[106%] -ml-[3%] h-14 sm:h-20 md:h-24 lg:h-28 ${
          variant === 'b' ? 'scale-x-[-1]' : ''
        }`}
      >
        <svg
          viewBox="0 0 1920 233"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full block"
        >
          <path d={RIPPED_SPINE_PATH} fill={fillColor} />
        </svg>

        <img
          src="/assets/brand/torn-edge-paper.png"
          alt=""
          className="relative z-10 block w-full h-full object-fill"
        />
      </div>
    </div>
  );
}
