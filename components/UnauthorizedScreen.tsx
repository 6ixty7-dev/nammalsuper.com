'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function UnauthorizedScreen() {
  const { signOut } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf6f0 0%, #fce4ec 50%, #fdf6f0 100%)',
      }}
    >
      {/* Background hearts floating */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-200/20"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: 12 + Math.random() * 20,
          }}
          initial={{ y: '110vh', rotate: 0 }}
          animate={{ y: '-10vh', rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 10 + Math.random() * 8,
            delay: i * 1.5,
            ease: 'linear',
          }}
        >
          ♥
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-10 md:p-14 max-w-md w-full text-center relative z-10 shadow-2xl shadow-rose-500/10"
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🔒
        </motion.div>

        <h1
          className="text-3xl md:text-4xl gradient-text mb-4"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          This space belongs to two souls only
        </h1>

        <p className="text-lg mb-2">❤️</p>

        <p
          className="text-soft-black/50 mb-8"
          style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem' }}
        >
          Sorry, this is a private space made with love for just two people.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={signOut}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all"
        >
          Sign Out
        </motion.button>
      </motion.div>
    </div>
  );
}
