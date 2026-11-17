import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

interface SwipeSectionProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  className?: string;
}

function DesktopSwipeContent({
  children,
  direction = 'left',
  className = '',
}: SwipeSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 26,
    mass: 0.8,
  });

  const enterOffset = direction === 'left' ? -44 : 44;
  const exitOffset = direction === 'left' ? 44 : -44;

  const x = useTransform(
    smoothProgress,
    [0, 0.16, 0.84, 1],
    [enterOffset, 0, 0, exitOffset]
  );

  const opacity = useTransform(
    smoothProgress,
    [0, 0.14, 0.86, 1],
    [0.2, 1, 1, 0.2]
  );

  return (
    <div ref={containerRef} className="overflow-x-clip">
      <motion.div style={{ x, opacity }} className={className}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Wraps a section's inner content with scroll-driven swipe motion on desktop,
 * while keeping mobile & tablet viewports free of GPU layer scaling and opacity fades.
 */
export function SwipeSection({
  children,
  direction = 'left',
  className = '',
}: SwipeSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (prefersReducedMotion || !isDesktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <DesktopSwipeContent direction={direction} className={className}>
      {children}
    </DesktopSwipeContent>
  );
}
