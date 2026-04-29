'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import UnauthorizedScreen from '@/components/UnauthorizedScreen';
import Navbar from '@/components/Navbar';
import FloatingHearts from '@/components/FloatingHearts';
import Hero from '@/components/Hero';
import DaysCounter from '@/components/DaysCounter';
import Timeline from '@/components/Timeline';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user, isAllowed, isLoading } = useAuth();

  // Loading State
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #fdf6f0 0%, #fce4ec 50%, #fdf6f0 100%)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl"
        >
          💕
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />;
  }

  // Unauthorized
  if (!isAllowed) {
    return <UnauthorizedScreen />;
  }

  // Main Homepage
  return (
    <div className="min-h-screen relative">
      <FloatingHearts />
      <Navbar />
      <main className="relative z-10">
        <Hero />

        {/* Decorative separator */}
        <div className="max-w-xs mx-auto py-12 md:py-24">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-warm-sand" />
            <span className="text-warm-gray opacity-50 text-xl">✤</span>
            <div className="h-px w-16 bg-warm-sand" />
          </div>
        </div>

        <Timeline />

        {/* Footer */}
        <footer className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p
              className="text-2xl gradient-text mb-2"
              style={{ fontFamily: 'var(--font-handwritten)' }}
            >
              Made with love
            </p>
            <p className="text-sm text-soft-black/30 dark:text-dark-text/30">
              Our Space © {new Date().getFullYear()}
            </p>
          </motion.div>
        </footer>
      </main>
    </div>
  );
}
