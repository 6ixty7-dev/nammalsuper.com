'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORAGE_BUCKET } from '@/lib/constants';

// Generate placeholder gallery images
const galleryImages = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  src: `/${STORAGE_BUCKET}/gallery/img${i + 1}.jpg`,
  caption: `Memory #${i + 1}`,
}));

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl gradient-text mb-3"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            Our Gallery 📸
          </h1>
          <p className="text-soft-black/50 dark:text-dark-text/50" style={{ fontFamily: 'var(--font-casual)' }}>
            Moments we never want to forget
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelectedImage(img)}
              className="image-placeholder aspect-square rounded-2xl cursor-pointer shadow-lg shadow-rose-500/5 group relative overflow-hidden"
              title={img.src}
            >
              <span className="relative z-10 text-3xl group-hover:scale-110 transition-transform">📷</span>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end p-3">
                <span
                  className="text-white/80 text-xs"
                  style={{ fontFamily: 'var(--font-casual)' }}
                >
                  {img.caption}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full"
            >
              {/* Image */}
              <div className="image-placeholder aspect-video rounded-2xl mb-4 shadow-2xl" title={selectedImage.src}>
                <span className="relative z-10 text-6xl">📷</span>
              </div>

              {/* Caption */}
              <div className="text-center">
                <p
                  className="text-white/80 text-lg"
                  style={{ fontFamily: 'var(--font-casual)' }}
                >
                  {selectedImage.caption}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {selectedImage.src}
                </p>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                ✕
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
