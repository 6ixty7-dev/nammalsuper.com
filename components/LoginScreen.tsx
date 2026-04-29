'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf6f0 0%, #fce4ec 30%, #fff1f2 60%, #fdf6f0 100%)',
      }}
    >
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 100 + i * 60,
              height: 100 + i * 60,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, rgba(244, 63, 94, ${0.05 + i * 0.01}) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20 * (i % 2 ? 1 : -1), 0],
              y: [0, -15, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 6 + i * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-10 md:p-14 max-w-md w-full text-center relative z-10 shadow-2xl shadow-rose-500/10"
      >
        {/* Heart Icon */}
        <motion.div
          className="text-6xl mb-6"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          💕
        </motion.div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl gradient-text mb-3"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          Our Space
        </h1>

        <p className="text-soft-black/60 mb-2" style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem' }}>
          A place just for the two of us
        </p>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-8" />

        {/* Google Login Button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-dark-card text-soft-black dark:text-dark-text font-medium shadow-lg shadow-rose-500/10 hover:shadow-xl hover:shadow-rose-500/15 transition-all duration-300 border border-rose-100 dark:border-rose-800/30"
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </motion.button>

        <p
          className="mt-6 text-xs text-soft-black/30"
          style={{ fontFamily: 'var(--font-casual)' }}
        >
          This space is private • Only two souls allowed
        </p>
      </motion.div>
    </div>
  );
}
