import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '@/src/context/CmsContext';
import { HeroMarquee } from './ui/HeroMarquee';
import { TornEdge } from './ui/TornEdge';

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HeroSection() {
  const { content } = useCms();
  const { hero } = content;
  const headlineLines = [
    { text: hero.line1, highlight: false },
    { text: hero.line2, highlight: false },
    { text: hero.line3Highlight, highlight: true },
  ];
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 24,
    mass: 0.9,
  });

  const contentX = useTransform(smoothProgress, [0, 0.18, 1], [0, 0, -68]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.22, 0.95], [1, 1, 0.08]);
  const cupX = useTransform(smoothProgress, [0, 0.18, 1], [0, 0, 44]);
  const splashX = useTransform(smoothProgress, [0, 0.18, 1], [0, 0, 74]);
  const splashY = useTransform(smoothProgress, [0, 0.18, 1], [0, 0, -28]);
  const visualOpacity = useTransform(smoothProgress, [0, 0.28, 0.96], [1, 1, 0.15]);

  return (
      <section
      ref={sectionRef}
      id="home"
      className="relative bg-white text-[#1A1A1A] overflow-x-clip scroll-mt-20"
    >
      {/* Two-Column Hero Layout on Pure White */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2 sm:pt-10 sm:pb-4 lg:pt-12 lg:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-6 items-center">
          {/* Left Content Column */}
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { x: contentX, opacity: contentOpacity }
            }
            className="lg:col-span-6 relative z-10 will-change-transform"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: SMOOTH_EASE }}
              className="text-[11px] sm:text-sm font-bold tracking-[0.18em] text-[#CC0000] uppercase mb-3 sm:mb-4"
            >
              {hero.eyebrow}
            </motion.p>

            <h1 className="font-display text-[clamp(2.45rem,11.2vw,3.4rem)] sm:text-[clamp(3rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.015em] uppercase mb-4 sm:mb-6 text-balance">
              {headlineLines.map((line, idx) => (
                <span key={`${idx}-${line.text}`} className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 0.95,
                      delay: 0.15 + idx * 0.16,
                      ease: SMOOTH_EASE,
                    }}
                    className={`block ${
                      line.highlight ? 'text-[#CC0000]' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.65, ease: SMOOTH_EASE }}
              className="text-sm sm:text-base text-[#555555] leading-relaxed max-w-md mb-6 sm:mb-8"
            >
              {hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.82, ease: SMOOTH_EASE }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <a
                href="#menu"
                className="group inline-flex items-center gap-3 pl-5 sm:pl-6 pr-2 py-2 min-h-[46px] sm:min-h-[48px] rounded-full bg-[#CC0000] text-white hover:bg-[#A80000] text-sm font-bold transition-colors duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
              >
                <span>{hero.primaryCtaLabel}</span>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#CC0000] inline-flex items-center justify-center transition-all duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Visual Column: Layered Animated Splash (hs-1) & Iced Coffee Cup (hs-2) */}
          <motion.div
            style={
              prefersReducedMotion ? undefined : { opacity: visualOpacity }
            }
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[370px] sm:max-w-[550px] lg:w-[106%] lg:max-w-[630px] aspect-[1.06/1] mx-auto select-none">
              {/* Soft Contact Shadow Beneath Cup */}
              <motion.div
                aria-hidden="true"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={
                  prefersReducedMotion
                    ? { opacity: 0.22 }
                    : {
                        opacity: [0.22, 0.14, 0.22],
                        scale: [1, 0.92, 1],
                      }
                }
                transition={{
                  opacity: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="pointer-events-none absolute left-[38%] bottom-[1%] w-[45%] h-4 rounded-full bg-[#1A1A1A]/20 blur-md z-0"
              />

              {/* Back Layer: hs-1 Creamy Coffee Splash & Roasted Beans */}
              <motion.div
                style={
                  prefersReducedMotion
                    ? undefined
                    : { x: splashX, y: splashY }
                }
                className="pointer-events-none absolute left-[1%] top-[1%] w-[96%] z-10 will-change-transform"
              >
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, scale: 0.74, y: 36 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 1.35,
                    delay: 0.25,
                    ease: SMOOTH_EASE,
                  }}
                >
                  <motion.img
                    src={hero.splashImage}
                    alt=""
                    aria-hidden="true"
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: [5, -7, 5],
                            rotate: [0.9, -0.9, 0.9],
                            scale: [1, 1.028, 1],
                          }
                    }
                    transition={{
                      duration: 8.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-full h-auto object-contain will-change-transform"
                  />
                </motion.div>
              </motion.div>

              {/* Front Layer: hs-2 Iced Boba Coffee Cup */}
              <motion.div
                style={prefersReducedMotion ? undefined : { x: cupX }}
                className="pointer-events-none absolute left-[34%] bottom-[2%] w-[53%] z-20 will-change-transform"
              >
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 48, scale: 0.92, rotate: -2 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  transition={{
                    duration: 1.15,
                    delay: 0.1,
                    ease: SMOOTH_EASE,
                  }}
                >
                  <motion.img
                    src={hero.cupImage}
                    alt="Signature iced coffee cup surrounded by a splash of fresh creamy coffee and roasted coffee beans"
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : {
                            y: [-6, 6, -6],
                            rotate: [-0.8, 0.8, -0.8],
                          }
                    }
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-full h-auto object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.12)] will-change-transform"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Crossed Diagonal Running Text Banner */}
      <HeroMarquee />

      {/* Torn Paper Edge Transition to Soft Gray About Section */}
      <TornEdge fillColor="#F5F5F5" position="bottom" variant="a" />
    </section>
  );
}
