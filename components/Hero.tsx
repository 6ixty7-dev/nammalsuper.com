'use client';

import { motion } from 'framer-motion';
import { SITE_CONFIG } from '@/lib/constants';

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 pt-20 overflow-hidden">
      {/* Gradient Background Orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.06) 0%, transparent 70%)',
            bottom: '10%',
            right: '15%',
          }}
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Animated Heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <motion.span
            className="inline-block text-7xl md:text-8xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            💖
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl gradient-text mb-4"
          style={{ fontFamily: 'var(--font-handwritten)', lineHeight: 1.1 }}
        >
          {SITE_CONFIG.title}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-soft-black/60 dark:text-dark-text/60 mb-6"
          style={{ fontFamily: 'var(--font-casual)', fontSize: '1.3rem' }}
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        {/* Decorative Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-32 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-6"
        />

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-soft-black/30 dark:text-dark-text/30"
          >
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            <span className="text-xs mt-2 block" style={{ fontFamily: 'var(--font-casual)' }}>
              scroll down
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
