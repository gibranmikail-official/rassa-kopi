import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  Navigation,
} from 'lucide-react';
import { useCms } from '@/src/context/CmsContext';
import { SwipeSection } from './ui/SwipeSection';
import { TornEdge } from './ui/TornEdge';

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function VisitUsSection() {
  const { content } = useCms();
  const { visit } = content;

  const operatingHours = [
    { days: 'Monday - Thursday', hours: visit.monThuHours, closed: false },
    { days: 'Friday', hours: visit.friHours, closed: false },
    { days: 'Saturday', hours: visit.satHours, closed: false },
    { days: 'Sunday', hours: visit.sunHours, closed: visit.sunClosed },
  ];

  return (
    <section
      id="visit"
      className="relative bg-[#F5F5F5] text-[#1A1A1A] pt-10 sm:pt-16 overflow-x-clip scroll-mt-20"
    >
      <SwipeSection direction="left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Outlet Information & Directions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: SMOOTH_EASE }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-xs font-bold tracking-[0.2em] text-[#CC0000] uppercase mb-2">
                {visit.eyebrow}
              </span>

              <h2 className="font-display text-[clamp(2.1rem,8.5vw,2.8rem)] sm:text-[clamp(2.4rem,5vw,4rem)] font-extrabold text-[#1A1A1A] leading-[0.98] uppercase tracking-tight mb-3.5 sm:mb-4">
                {visit.title}
              </h2>

              <p className="text-sm sm:text-base text-[#666666] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                {visit.description}
              </p>

              {/* White Surface Card for High-Contrast Details */}
              <div className="bg-white text-[#1A1A1A] rounded-2xl border border-black/8 divide-y divide-black/6 mb-6 sm:mb-8">
                <div className="p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#CC0000]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">
                      {visit.outletName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                      {visit.address}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#CC0000]" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">
                      Operating Hours
                    </h3>
                    <dl className="space-y-1.5 text-xs sm:text-sm">
                      {operatingHours.map((slot) => (
                        <div
                          key={slot.days}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
                        >
                          <dt className="text-[#666666]">{slot.days}</dt>
                          <dd
                            className={`font-semibold tabular-nums ${
                              slot.closed ? 'text-[#CC0000]' : 'text-[#1A1A1A]'
                            }`}
                          >
                            {slot.hours}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <a
                    href={visit.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -m-1 sm:-m-2 rounded-xl hover:bg-[#F5F5F5] group transition-colors focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] transition-colors duration-300">
                      <Instagram
                        className="w-5 h-5 text-[#CC0000] group-hover:text-white transition-colors duration-300"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#1A1A1A]">
                        Instagram
                      </span>
                      <span className="block text-xs text-[#666666] truncate group-hover:text-[#CC0000] transition-colors duration-300">
                        {visit.instagramHandle}
                      </span>
                    </div>
                  </a>

                  <a
                    href={visit.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -m-1 sm:-m-2 rounded-xl hover:bg-[#F5F5F5] group transition-colors focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] transition-colors duration-300">
                      <TikTokIcon className="w-4 h-4 text-[#CC0000] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#1A1A1A]">
                        TikTok
                      </span>
                      <span className="block text-xs text-[#666666] truncate group-hover:text-[#CC0000] transition-colors duration-300">
                        {visit.tiktokHandle}
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href={visit.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto justify-between sm:justify-start inline-flex items-center gap-3 pl-5 pr-2 py-1.5 min-h-[48px] rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    <span>{visit.ctaLabel}</span>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white text-[#CC0000] inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Right Column: Live Google Maps Embed */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: 0.14, ease: SMOOTH_EASE }}
              className="lg:col-span-6 flex items-stretch"
            >
              <div className="w-full min-h-[300px] sm:min-h-[380px] lg:min-h-[480px] rounded-2xl bg-white text-[#1A1A1A] border border-black/8 overflow-hidden flex flex-col">
                <div className="relative flex-1 min-h-[240px] sm:min-h-[320px]">
                  <iframe
                    src={visit.googleMapsEmbedUrl}
                    title="Rassa Kopi Location on Google Maps"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-5 sm:py-4 border-t border-black/8">
                  <div className="min-w-0">
                    <p className="font-display text-base font-extrabold uppercase tracking-wide text-[#1A1A1A]">
                      {visit.outletName}
                    </p>
                    <p className="text-xs text-[#666666] truncate">
                      {visit.shortArea}
                    </p>
                  </div>
                  <a
                    href={visit.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-2 -mr-2 text-xs font-bold text-[#CC0000] hover:text-[#A80000] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                  >
                    <span>Open Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SwipeSection>

      {/* Torn Paper Edge Transition to Red Final CTA Section */}
      <TornEdge fillColor="#CC0000" position="bottom" variant="b" />
    </section>
  );
}
