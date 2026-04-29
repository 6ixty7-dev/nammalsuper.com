'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { NAV_ITEMS } from '@/lib/constants';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-rose-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                💕
              </motion.span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-handwritten)' }}
              >
                Our Space
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 ${
                      isActive
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-soft-black/70 dark:text-dark-text/70'
                    }`}
                  >
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Music Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMusicPlaying(!musicPlaying)}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Toggle music"
              >
                {musicPlaying ? '🎵' : '🔇'}
              </motion.button>

              {/* Dark Mode */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDark}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Toggle dark mode"
              >
                {isDark ? '☀️' : '🌙'}
              </motion.button>

              {/* User Avatar */}
              {user.user_metadata?.avatar_url && (
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={user.user_metadata.avatar_url}
                  alt="You"
                  className="w-8 h-8 rounded-full border-2 border-rose-200 dark:border-rose-800 cursor-pointer"
                  onClick={() => signOut()}
                  title="Click to sign out"
                />
              )}

              {/* Mobile Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <div className="w-5 flex flex-col gap-1">
                  <motion.span
                    animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    className="block h-0.5 w-full bg-soft-black dark:bg-dark-text rounded-full"
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="block h-0.5 w-full bg-soft-black dark:bg-dark-text rounded-full"
                  />
                  <motion.span
                    animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    className="block h-0.5 w-full bg-soft-black dark:bg-dark-text rounded-full"
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 glass shadow-xl md:hidden"
          >
            <div className="p-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'hover:bg-rose-50/50 dark:hover:bg-rose-500/5'
                    }`}
                  >
                    <span className="mr-2">{item.emoji}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
