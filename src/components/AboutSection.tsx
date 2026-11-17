import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '@/src/context/CmsContext';
import { TikTokFeed } from './TikTokFeed';
import { SmartImage } from './ui/SmartImage';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

interface AboutSectionProps {
  onDiscoverStory: () => void;
}

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AboutSection({ onDiscoverStory }: AboutSectionProps) {
  const { content } = useCms();
  const { about, visit } = content;

  return (
    <section
      id="about"
      className="relative bg-[#F5F5F5] text-[#1A1A1A] pt-10 sm:pt-14 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          {/* Top Row: Live TikTok Video Carousel (@suhe_erna) */}
          <TikTokFeed tiktokUrl={visit.tiktokUrl} />

          {/* Centerpiece Kinetic Manifesto with Inline Pop-In Photo Capsules */}
          <div className="max-w-5xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, rotate: -3, y: 10 }}
              whileInView={{ opacity: 1, rotate: -2, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease: SMOOTH_EASE }}
              className="inline-block font-display text-sm sm:text-base font-extrabold tracking-[0.22em] text-[#CC0000] uppercase mb-3 sm:mb-4"
            >
              {about.eyebrow}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.85, ease: SMOOTH_EASE }}
              className="font-display text-[clamp(1.75rem,7.2vw,2.4rem)] sm:text-[clamp(2.25rem,5.2vw,4.4rem)] font-extrabold text-[#1A1A1A] leading-[1.1] sm:leading-[1.06] tracking-[-0.01em] uppercase mb-5 sm:mb-6"
            >
              {about.headlinePart1}{' '}
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.75, delay: 0.15, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.08, rotate: -3 }}
                className="inline-flex align-middle mx-1 sm:mx-1.5 w-14 sm:w-24 h-8 sm:h-12 rounded-full overflow-hidden border-2 border-[#CC0000]/25 shadow-sm bg-white"
              >
                <SmartImage
                  src={about.pillImage1}
                  alt="Rassa Kopi coffee bar"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </motion.span>{' '}
              {about.headlinePart2}{' '}
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.75, delay: 0.28, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.08, rotate: 3 }}
                className="inline-flex align-middle mx-1 sm:mx-1.5 w-14 sm:w-24 h-8 sm:h-12 rounded-full overflow-hidden border-2 border-[#CC0000]/25 shadow-sm bg-white"
              >
                <SmartImage
                  src={about.pillImage2}
                  alt="Pour-over coffee craft"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </motion.span>{' '}
              {about.headlinePart3}{' '}
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.75, delay: 0.4, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.08, rotate: -3 }}
                className="inline-flex align-middle mx-1 sm:mx-1.5 w-14 sm:w-24 h-8 sm:h-12 rounded-full overflow-hidden border-2 border-[#CC0000]/25 shadow-sm bg-white"
              >
                <SmartImage
                  src={about.pillImage3}
                  alt="Customers enjoying coffee together"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </motion.span>{' '}
              {about.headlinePart4}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: 0.15, ease: SMOOTH_EASE }}
              className="text-sm sm:text-lg text-[#666666] leading-relaxed max-w-2xl mx-auto mb-7 sm:mb-8"
            >
              {about.description}
            </motion.p>

            <button
              type="button"
              onClick={onDiscoverStory}
              className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 min-h-[46px] rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-sm font-bold cursor-pointer transition-colors duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
            >
              <span>{about.ctaLabel}</span>
              <span className="w-8 h-8 rounded-full bg-white text-[#CC0000] inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to Pure White Menu Section */}
      <TornEdge fillColor="#FFFFFF" position="bottom" variant="b" />
    </section>
  );
}
