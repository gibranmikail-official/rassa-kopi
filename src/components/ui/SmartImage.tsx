import { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';

export const DEFAULT_IMAGE_URL = '/assets/brand/default-image.png';

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
  const [defaultFailed, setDefaultFailed] = useState(false);

  useEffect(() => {
    setHasError(false);
    setDefaultFailed(false);
  }, [src]);

  const trimmedSrc = src?.trim() ?? '';
  const shouldUseDefault = !trimmedSrc || hasError;

  if (shouldUseDefault && defaultFailed) {
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

  if (shouldUseDefault) {
    return (
      <img
        src={DEFAULT_IMAGE_URL}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onError={() => setDefaultFailed(true)}
        className={className}
      />
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
