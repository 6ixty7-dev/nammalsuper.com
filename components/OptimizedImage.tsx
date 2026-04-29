'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  type?: 'gallery' | 'timeline' | 'thumbnail';
  className?: string;
  fill?: boolean;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  type = 'gallery', 
  className = '', 
  fill = true 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply Supabase transformations if it's a Supabase URL
  let optimizedSrc = src;
  if (src.includes('supabase.co')) {
    const width = type === 'gallery' ? 800 : type === 'timeline' ? 600 : 300;
    const quality = 70;
    
    // Add transformation parameters if it's a public URL and doesn't already have query params
    if (!src.includes('?')) {
      optimizedSrc = `${src}?width=${width}&quality=${quality}`;
    }
  }

  // A tiny, warm 1x1 pixel base64 string matching our paper-bg (#FAF7F2 / #E8DDD0 tone)
  const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88+TpfwAI8AO+y9fBcwAAAABJRU5ErkJggg==";

  return (
    <div className={`relative overflow-hidden bg-[#E8DDD0]/30 ${className}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isLoaded ? 'scale-100 blur-0 opacity-100' : 'scale-105 blur-[10px] opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        sizes={type === 'gallery' ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
        placeholder="blur"
        blurDataURL={blurDataURL}
        quality={70}
        loading="lazy"
      />
    </div>
  );
}
