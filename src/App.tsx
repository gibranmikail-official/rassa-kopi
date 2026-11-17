/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import type { MenuCategory } from './data/menu';
import { CmsProvider, useCms } from './context/CmsContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { WhyRassaSection } from './components/WhyRassaSection';
import { GallerySection } from './components/GallerySection';
import { VisitUsSection } from './components/VisitUsSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { GalleryLightbox } from './components/GalleryLightbox';
import { StoryModal } from './components/StoryModal';
import { FullMenuModal } from './components/FullMenuModal';
import { FloatingActions } from './components/FloatingActions';
import { CmsDrawer } from './components/cms/CmsDrawer';

function LandingPageShell() {
  const { content } = useCms();
  const [activeMenuCategory, setActiveMenuCategory] = useState<
    'All' | MenuCategory
  >('All');
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleScrollToMenu = (category?: 'All' | MenuCategory) => {
    if (category) {
      setActiveMenuCategory(category);
    }
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
      {/* Section 01: Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Section 02: Hero */}
        <HeroSection />

        {/* Section 03: About Rassa */}
        <AboutSection
          onDiscoverStory={() => setIsStoryOpen(true)}
          onSelectMenuCategory={(category) => handleScrollToMenu(category)}
        />

        {/* Section 04: Signature Menu */}
        <MenuSection
          activeCategory={activeMenuCategory}
          onChangeCategory={setActiveMenuCategory}
          onViewFullMenu={() => setIsFullMenuOpen(true)}
        />

        {/* Section 05: Why Rassa */}
        <WhyRassaSection />

        {/* Section 06: Gallery */}
        <GallerySection onSelectPhoto={(index) => setLightboxIndex(index)} />

        {/* Section 07: Visit Us / Location */}
        <VisitUsSection />

        {/* Section 08: Final CTA */}
        <FinalCtaSection />
      </main>

      {/* Section 09: Footer */}
      <Footer />

      {/* Interactive Overlays & Back-to-Top */}
      <GalleryLightbox
        photos={content.galleryItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(nextIndex) => setLightboxIndex(nextIndex)}
      />

      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onExploreMenu={() => handleScrollToMenu()}
      />

      <FullMenuModal
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
      />

      <FloatingActions />
    </div>
  );
}

function AppRouter() {
  const { isCmsOpen } = useCms();
  return isCmsOpen ? <CmsDrawer /> : <LandingPageShell />;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CmsProvider>
        <AppRouter />
      </CmsProvider>
    </MotionConfig>
  );
}

