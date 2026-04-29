'use client';

import { motion } from 'framer-motion';
import { useDaysCounter } from '@/hooks/useDaysCounter';

export default function DaysCounter() {
  const { days, hours, minutes, seconds } = useDaysCounter();

  const counterItems = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-16 px-4"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl mb-2 gradient-text"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          We&apos;ve been together for...
        </motion.h2>
        <p className="text-sm text-soft-black/50 dark:text-dark-text/50 mb-10">
          Since September 2, 2025
        </p>

        <div className="flex justify-center gap-4 md:gap-8">
          {counterItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              className="glass rounded-2xl p-4 md:p-6 min-w-[70px] md:min-w-[100px] shadow-lg shadow-rose-500/5"
            >
              <motion.div
                key={item.value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-4xl font-bold gradient-text"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {item.value}
              </motion.div>
              <div
                className="text-xs md:text-sm text-soft-black/50 dark:text-dark-text/50 mt-1"
                style={{ fontFamily: 'var(--font-casual)' }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative heart */}
        <motion.div
          className="mt-8 text-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          💕
        </motion.div>
      </div>
    </motion.section>
  );
}
