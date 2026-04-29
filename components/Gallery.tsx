'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import OptimizedImage from '@/components/OptimizedImage';

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  height: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase.storage
        .from('couple-memories')
        .list('gallery', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (data && !error) {
        // Filter out any hidden system files or folders like .emptyFolderPlaceholder
        const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder' && file.id);
        
        const mapped = validFiles.map((file, idx) => {
          const { data: { publicUrl } } = supabase.storage
            .from('couple-memories')
            .getPublicUrl(`gallery/${file.name}`);
            
          return {
            id: file.id || file.name,
            url: publicUrl,
            name: file.name,
            // Assign varying heights dynamically to create a masonry-like look
            height: idx % 3 === 0 ? 'h-[400px]' : idx % 2 === 0 ? 'h-[300px]' : 'h-[350px]',
          };
        });
        setImages(mapped);
      }
      setLoading(false);
    };

    fetchGallery();
  }, [supabase]);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 bg-paper-bg relative overflow-hidden">
      {/* Linen Texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, #E8DDD0 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, #E8DDD0 3px)',
        backgroundSize: '4px 4px'
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display italic text-ink-brown mb-4 tracking-wide">
            The Gallery
          </h1>
          <p className="font-handwriting text-xl text-warm-gray">
            fragments of forever
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-4xl animate-pulse">📸</span>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-handwriting text-2xl text-warm-gray">No moments uploaded yet...</p>
            <p className="font-ui text-sm mt-4 text-warm-gray/60">Upload images to the &apos;gallery&apos; folder in your Supabase bucket.</p>
          </div>
        ) : (
          /* Masonry Grid Simulation using Columns */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {images.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 3) * 0.1, duration: 0.8 }}
                className="break-inside-avoid relative group"
              >
                <div 
                  className="polaroid cursor-pointer"
                  onClick={() => setSelectedImg(img)}
                >
                  <OptimizedImage 
                    src={img.url} 
                    alt={img.name} 
                    type="gallery"
                    className={`w-full ${img.height} mb-4 rounded-[2px]`} 
                  />
                  
                  {/* Hand-drawn SVG hover border */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" xmlns="http://www.w3.org/2000/svg">
                    <rect 
                      x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)" 
                      fill="none" stroke="var(--color-antique-gold)" strokeWidth="2" 
                      strokeDasharray="1000" strokeDashoffset="1000"
                      className="group-hover:animate-[stroke-dashoffset_0.8s_ease-out_forwards]" 
                      rx="4" ry="4" 
                      style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} 
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0814]/80 backdrop-blur-md"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="polaroid-glass max-w-4xl w-full p-6 pb-12"
            >
              <div className="relative w-full h-[60vh] md:h-[75vh] rounded-sm overflow-hidden bg-black/20">
                 <OptimizedImage 
                    src={selectedImg.url} 
                    alt={selectedImg.name} 
                    type="gallery"
                    className="w-full h-full" 
                  />
              </div>
              
              <button 
                onClick={() => setSelectedImg(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/50 hover:text-white transition-colors z-50"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
