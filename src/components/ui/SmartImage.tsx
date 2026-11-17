import { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  lazy?: boolean;
  fallbackTitle?: string;
}

export function SmartImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  lazy = true,
  fallbackTitle,
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F5F5F5] text-[#666666] p-6 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-full bg-white border border-black/6 flex items-center justify-center mb-2.5">
          <Coffee className="w-5 h-5 text-[#CC0000]" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[#1A1A1A]/75 line-clamp-2 max-w-[180px]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
