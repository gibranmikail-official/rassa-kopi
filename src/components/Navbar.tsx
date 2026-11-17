import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/src/config/siteConfig';
import { useCms } from '@/src/context/CmsContext';

export function Navbar() {
  const { content } = useCms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 24);

      const triggerLine = 160;
      let current = '#home';

      for (const link of siteConfig.navLinks) {
        const id = link.href.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            current = link.href;
          }
        }
      }

      if (window.innerHeight + y >= document.documentElement.scrollHeight - 40) {
        current = siteConfig.navLinks[siteConfig.navLinks.length - 1].href;
      }

      setActiveHref(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setActiveHref(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Layout spacer matching default navbar height so fixed positioning causes zero layout shift */}
      <div className="h-16 md:h-[74px] w-full shrink-0" aria-hidden="true" />

      {/* Mobile Menu Backdrop for effortless tap-outside dismiss */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      <header
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled ? 'pt-2.5 sm:pt-4 px-3 sm:px-6 lg:px-8' : 'pt-0 px-0'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled
              ? 'max-w-7xl rounded-full bg-white/85 backdrop-blur-xl border border-white/70 ring-1 ring-black/8 shadow-[0_14px_38px_-10px_rgba(0,0,0,0.16)]'
              : 'max-w-full rounded-none bg-white border-b border-black/6 shadow-none'
          }`}
        >
          <div
            className={`mx-auto max-w-7xl flex items-center justify-between gap-4 sm:gap-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isScrolled
                ? 'px-4 sm:px-8 h-14 md:h-[66px]'
                : 'px-4 sm:px-6 lg:px-8 h-16 md:h-[74px]'
            }`}
          >
            {/* Brand Logo (Left) */}
            <a
              href="#home"
              onClick={() => handleNavClick('#home')}
              aria-label="Rassa Kopi Home"
              className="inline-flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CC0000]"
            >
              <img
                src={content.footer.logoUrl}
                alt={content.footer.brandName}
                className={`w-auto object-contain transition-all duration-500 ${
                  isScrolled ? 'h-9 sm:h-12' : 'h-11 sm:h-14'
                }`}
              />
            </a>

            {/* Navigation Links (Right on Desktop) & Mobile Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <nav
                aria-label="Primary Navigation"
                className="hidden md:flex items-center gap-1 lg:gap-2"
              >
                {siteConfig.navLinks.map((link) => {
                  const isActive = activeHref === link.href;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`relative px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000] ${
                        isActive
                          ? 'text-white'
                          : 'text-[#1A1A1A]/85 hover:text-[#CC0000] hover:bg-[#CC0000]/6'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="active-nav-pill"
                          transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-full bg-[#CC0000] shadow-xs"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </a>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-[#1A1A1A] hover:bg-black/5 active:bg-black/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                aria-label={
                  mobileMenuOpen
                    ? 'Close navigation menu'
                    : 'Open navigation menu'
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`md:hidden pointer-events-auto mx-auto max-w-7xl ${
                isScrolled
                  ? 'mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/8 shadow-xl p-3'
                  : 'bg-white border-t border-black/8 shadow-lg px-4 py-4'
              }`}
            >
              <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
                {siteConfig.navLinks.map((link) => {
                  const isActive = activeHref === link.href;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`flex items-center min-h-[46px] px-4 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#CC0000] text-white shadow-xs'
                          : 'text-[#1A1A1A] hover:bg-[#F5F5F5] hover:text-[#CC0000]'
                      }`}
                    >
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
