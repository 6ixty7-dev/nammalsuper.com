'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import OptimizedImage from '@/components/OptimizedImage';

interface TimelinePolaroidProps {
  monthKey: string;
  label: string;
  rotateClass: string;
}

export default function TimelinePolaroid({ monthKey, label, rotateClass }: TimelinePolaroidProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchImages = async () => {
    const folderPath = `memories/${monthKey}`;
    const { data, error } = await supabase.storage
      .from('couple-memories')
      .list(folderPath, { limit: 10, sortBy: { column: 'created_at', order: 'asc' } });

    if (data && !error) {
      const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder' && file.id);
      const urls = validFiles.map(file => {
        return supabase.storage.from('couple-memories').getPublicUrl(`${folderPath}/${file.name}`).data.publicUrl;
      });
      setImages(urls);
    }
  };

  // Intersection Observer to lazy load the fetch request
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasFetched) {
          fetchImages();
          setHasFetched(true);
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasFetched]);

  // Slideshow interval
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div ref={containerRef} className={`polaroid w-full ${rotateClass}`}>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-antique-gold shadow-md z-20 border border-white/20" />
      
      <div className="aspect-square bg-warm-sand/30 mb-4 image-placeholder relative rounded-sm">
        {images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <OptimizedImage 
                src={images[currentIndex]} 
                alt={`${label} memory ${currentIndex + 1}`}
                type="timeline"
                className="w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <span className="text-4xl opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">📸</span>
        )}

        {/* Slideshow dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors duration-500 ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="px-2 pb-2">
        <p className="font-handwriting text-xl text-ink-brown leading-relaxed text-center">
          Memories from {label}
        </p>
      </div>
    </div>
  );
}
