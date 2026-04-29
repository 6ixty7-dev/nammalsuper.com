'use client';

import { motion } from 'framer-motion';
import { getTimelineMonths, STORAGE_BUCKET } from '@/lib/constants';

export default function Timeline() {
  const months = getTimelineMonths();

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl gradient-text mb-3"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            Our Story
          </h2>
          <p className="text-soft-black/50 dark:text-dark-text/50">
            Every month, a new chapter ✨
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="timeline-line hidden md:block" />

          {months.map((month, index) => {
            const isLeft = index % 2 === 0;
            const placeholderImages = [
              `/${STORAGE_BUCKET}/memories/${month.key}/img1.jpg`,
              `/${STORAGE_BUCKET}/memories/${month.key}/img2.jpg`,
              `/${STORAGE_BUCKET}/memories/${month.key}/img3.jpg`,
            ];

            return (
              <motion.div
                key={month.key}
                initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative mb-16 md:mb-24 ${
                  isLeft
                    ? 'md:pr-[55%]'
                    : 'md:pl-[55%]'
                }`}
              >
                {/* Timeline Dot */}
                <div className="timeline-dot hidden md:block" style={{ top: '24px' }} />

                {/* Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-2xl p-6 shadow-lg shadow-rose-500/5 relative overflow-hidden"
                >
                  {/* Month Header */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3
                      className="text-2xl md:text-3xl gradient-text"
                      style={{ fontFamily: 'var(--font-handwritten)' }}
                    >
                      {month.label}
                    </h3>
                    <span className="text-sm text-soft-black/40 dark:text-dark-text/40">
                      {month.year}
                    </span>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {placeholderImages.map((src, imgIndex) => (
                      <motion.div
                        key={imgIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: imgIndex * 0.1 }}
                        className="image-placeholder aspect-square rounded-xl"
                        title={src}
                      >
                        <span className="relative z-10">📷</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Caption */}
                  <p
                    className="text-sm text-soft-black/60 dark:text-dark-text/60 italic"
                    style={{ fontFamily: 'var(--font-casual)', fontSize: '1rem' }}
                  >
                    Add your memories for {month.label} {month.year}...
                  </p>

                  {/* Decorative Corner */}
                  <div className="absolute -top-1 -right-1 text-rose-200/30 dark:text-rose-500/10 text-4xl">
                    ♡
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
