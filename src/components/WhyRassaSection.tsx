import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Coffee, Droplets, LayoutGrid, Sun } from 'lucide-react';
import type { FeatureIconName } from '@/src/data/features';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function renderFeatureIcon(icon: FeatureIconName) {
  const iconClass = 'w-4 h-4 text-white';
  switch (icon) {
    case 'coffee':
      return <Coffee className={iconClass} aria-hidden="true" />;
    case 'droplets':
      return <Droplets className={iconClass} aria-hidden="true" />;
    case 'layout-grid':
      return <LayoutGrid className={iconClass} aria-hidden="true" />;
    case 'sun':
      return <Sun className={iconClass} aria-hidden="true" />;
  }
}

export function WhyRassaSection() {
  const { content } = useCms();
  const { whyRassaHeader, whyRassaFeatures } = content;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 24,
    mass: 0.9,
  });
  const cupScale = useTransform(smoothProgress, [0, 0.5, 1], [0.92, 1.04, 0.94]);
  const cupY = useTransform(smoothProgress, [0, 1], [24, -24]);

  const leftFeatures = whyRassaFeatures.slice(0, 2);
  const rightFeatures = whyRassaFeatures.slice(2, 4);

  return (
    <section
      ref={sectionRef}
      id="why-rassa"
      className="relative bg-[#CC0000] text-white pt-10 sm:pt-16 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          <div className="text-center mb-8 sm:mb-12">
            <span className="block text-xs font-bold tracking-[0.2em] text-white/80 uppercase mb-2">
              {whyRassaHeader.eyebrow}
            </span>
            <h2 className="font-display text-[clamp(2.1rem,8.5vw,2.8rem)] sm:text-[clamp(2.4rem,5vw,4rem)] font-extrabold text-white leading-[0.98] uppercase tracking-tight">
              {whyRassaHeader.title}
            </h2>
          </div>

          {/* 3-Column Flanking Layout with Center Splashing Cup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-6 items-center">
            {/* Left Column Features */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:space-y-12 order-2 lg:order-1">
              {leftFeatures.map((feature, idx) => (
                <motion.article
                  key={feature.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.16,
                    ease: SMOOTH_EASE,
                  }}
                  className="flex flex-col items-start text-left lg:items-end lg:text-right p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 lg:p-0 lg:bg-transparent lg:border-0 lg:rounded-none"
                >
                  <div className="inline-flex items-center gap-2.5 mb-2">
                    <span className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                      {renderFeatureIcon(feature.icon)}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-white">
                      - {feature.title} -
                    </h3>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed lg:max-w-xs">
                    {feature.description}
                  </p>
                </motion.article>
              ))}
            </div>

            {/* Center Levitating Coffee Splash Visual */}
            <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 my-1 lg:my-0">
              <motion.div
                style={{ scale: cupScale, y: cupY }}
                className="relative w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[380px] aspect-square"
              >
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{
                    duration: 6.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-full h-full"
                >
                  <SmartImage
                    src={whyRassaHeader.centerImage}
                    alt="Signature Rassa Kopi iced coffee cup"
                    fallbackTitle="Rassa Kopi Craft"
                    containerClassName="w-full h-full bg-[#CC0000]"
                    className="w-full h-full object-contain drop-shadow-[0_22px_36px_rgba(0,0,0,0.28)]"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column Features */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:space-y-12 order-3">
              {rightFeatures.map((feature, idx) => (
                <motion.article
                  key={feature.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.16,
                    ease: SMOOTH_EASE,
                  }}
                  className="flex flex-col items-start text-left p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 lg:p-0 lg:bg-transparent lg:border-0 lg:rounded-none"
                >
                  <div className="inline-flex items-center gap-2.5 mb-2">
                    <span className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                      {renderFeatureIcon(feature.icon)}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-white">
                      - {feature.title} -
                    </h3>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed lg:max-w-xs">
                    {feature.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to White Gallery Section */}
      <TornEdge fillColor="#FFFFFF" position="bottom" variant="b" />
    </section>
  );
}
