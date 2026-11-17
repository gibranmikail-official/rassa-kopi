import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FinalCtaSection() {
  const { content } = useCms();
  const { finalCta } = content;

  return (
    <section className="relative bg-[#CC0000] text-white pt-14 sm:pt-20 overflow-x-clip">
      {/* Subtle Side Coffee Splash Visual Accent (Desktop) */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block pointer-events-none absolute -right-10 bottom-6 w-[280px] h-[280px] opacity-95"
      >
        <SmartImage
          src={finalCta.accentImage}
          alt=""
          containerClassName="w-full h-full bg-[#CC0000]"
          className="w-full h-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
        />
      </motion.div>

      <SwipeSection direction="right">
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.7, ease: SMOOTH_EASE }}
            className="block text-xs font-bold tracking-[0.2em] text-white/85 uppercase mb-3"
          >
            {finalCta.eyebrow}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.85, ease: SMOOTH_EASE }}
            className="font-display text-[clamp(2.2rem,9.2vw,3.1rem)] sm:text-[clamp(2.8rem,6.5vw,5rem)] font-extrabold text-white leading-[0.96] uppercase tracking-tight text-balance mb-4 sm:mb-5"
          >
            {finalCta.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.8, delay: 0.14, ease: SMOOTH_EASE }}
            className="text-sm sm:text-lg text-white/90 leading-relaxed max-w-lg mx-auto mb-7 sm:mb-8"
          >
            {finalCta.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.8, delay: 0.24, ease: SMOOTH_EASE }}
          >
            <a
              href="#menu"
              className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 min-h-[50px] rounded-full bg-white text-[#CC0000] hover:bg-[#F5F5F5] text-sm font-bold transition-colors duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>{finalCta.ctaLabel}</span>
              <span className="w-9 h-9 rounded-full bg-[#CC0000] text-white inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </a>
          </motion.div>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to Pure White Footer */}
      <TornEdge fillColor="#FFFFFF" position="bottom" variant="a" />
    </section>
  );
}
