import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { siteConfig } from '@/src/config/siteConfig';
import { useCms } from '@/src/context/CmsContext';
import { SmartImage } from './ui/SmartImage';

export function Footer() {
  const { content } = useCms();
  const { footer, visit } = content;
  const footerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 24,
    mass: 0.9,
  });

  const y = useTransform(smoothProgress, [0, 0.85], [48, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.7], [0.15, 1]);

  return (
    <footer
      ref={footerRef}
      className="relative bg-white text-[#1A1A1A] overflow-hidden"
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { y, opacity }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-24 sm:pt-14 sm:pb-14 will-change-transform"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center pb-8 sm:pb-10 border-b border-black/8">
          {/* Left: Brand Philosophy & Outlet Info */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
              {footer.description}
            </p>
            <div className="space-y-1.5 text-xs text-[#666666] leading-relaxed">
              <p className="font-bold text-[#1A1A1A]">{visit.outletName}</p>
              <p>{visit.address}</p>
              <p className="text-[#1A1A1A]/80 font-medium">{footer.hoursSummary}</p>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <div className="lg:col-span-4 flex items-center justify-center py-2 lg:py-0">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [-5, 5, -5] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center p-2 sm:p-4"
            >
              <SmartImage
                src={footer.logoUrl}
                alt={footer.brandName}
                fallbackTitle={footer.brandName}
                containerClassName="flex items-center justify-center bg-white"
                className="h-24 sm:h-36 w-auto object-contain"
              />
            </motion.div>
          </div>

          {/* Right: Navigation & Social Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#CC0000] mb-2.5">
                Explore
              </h3>
              <ul className="space-y-0.5 sm:space-y-1.5">
                {siteConfig.navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex items-center min-h-[36px] sm:min-h-0 text-sm font-medium text-[#1A1A1A]/80 hover:text-[#CC0000] transition-colors duration-300"
                    >
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#CC0000] mb-2.5">
                Follow
              </h3>
              <ul className="space-y-0.5 sm:space-y-1.5">
                <li>
                  <a
                    href={visit.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[36px] sm:min-h-0 text-sm font-medium text-[#1A1A1A]/80 hover:text-[#CC0000] transition-colors duration-300"
                  >
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href={visit.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[36px] sm:min-h-0 text-sm font-medium text-[#1A1A1A]/80 hover:text-[#CC0000] transition-colors duration-300"
                  >
                    <span>TikTok</span>
                  </a>
                </li>
                <li>
                  <a
                    href={visit.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[36px] sm:min-h-0 text-sm font-medium text-[#1A1A1A]/80 hover:text-[#CC0000] transition-colors duration-300"
                  >
                    <span>Directions</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Tagline */}
        <div className="pt-7 sm:pt-8 flex flex-col items-center text-center gap-1.5 text-xs text-[#666666]">
          <p>
            &copy; {footer.copyrightYear} {footer.brandName}. All rights reserved.
          </p>
          <span>{footer.tagline}</span>
        </div>
      </motion.div>
    </footer>
  );
}
