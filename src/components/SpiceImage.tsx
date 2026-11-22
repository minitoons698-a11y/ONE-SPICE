import { useState } from 'react';
import { Leaf } from 'lucide-react';

interface SpiceImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function SpiceImage({ src, alt, title, className = '' }: SpiceImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFECE6] via-[#E5E0D7] to-[#DAD3C7] text-[#5C5852] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Leaf className="w-6 h-6 mb-2 text-[#8C1D2F]/70" strokeWidth={1.5} />
        <span className="font-display text-sm text-[#171614]">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
