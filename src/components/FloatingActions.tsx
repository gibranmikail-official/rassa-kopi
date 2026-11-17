import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 420);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showBackToTop) return null;

  return (
    <div className="fixed bottom-5 right-5 z-30">
      <button
        type="button"
        onClick={scrollToTop}
        className="w-11 h-11 rounded-full bg-white text-[#1A1A1A] border border-black/15 shadow-md hover:border-[#CC0000] hover:text-[#CC0000] flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CC0000]"
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
