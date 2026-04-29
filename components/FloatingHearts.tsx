'use client';

import { motion } from 'framer-motion';

const hearts = [
  { x: '5%', y: '15%', size: 18, delay: 0, duration: 8 },
  { x: '88%', y: '22%', size: 14, delay: 1.2, duration: 10 },
  { x: '15%', y: '55%', size: 12, delay: 2.5, duration: 9 },
  { x: '78%', y: '65%', size: 16, delay: 0.8, duration: 7 },
  { x: '45%', y: '85%', size: 10, delay: 3.0, duration: 11 },
  { x: '92%', y: '45%', size: 13, delay: 1.8, duration: 8.5 },
  { x: '8%', y: '78%', size: 15, delay: 0.5, duration: 9.5 },
  { x: '65%', y: '12%', size: 11, delay: 2.0, duration: 10.5 },
];

export default function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/30 dark:text-rose-500/15"
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: heart.size,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: heart.duration,
            delay: heart.delay,
            ease: 'easeInOut',
          }}
        >
          ♥
        </motion.div>
      ))}

      {/* Decorative curved lines */}
      <svg
        className="absolute top-20 right-10 w-32 h-32 text-rose-200/20 dark:text-rose-500/10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M10 50 Q 50 10, 90 50 Q 50 90, 10 50"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
      <svg
        className="absolute bottom-32 left-8 w-24 h-24 text-rose-200/15 dark:text-rose-500/8"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.3" fill="none" />
      </svg>
    </div>
  );
}
