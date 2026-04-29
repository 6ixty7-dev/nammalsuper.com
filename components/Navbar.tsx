'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from '@/lib/constants';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-card rounded-none border-t-0 border-l-0 border-r-0' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-brown group-hover:scale-110 transition-transform">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xl tracking-wide font-display italic text-ink-brown">Our Space</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-sm font-ui transition-colors ${
                    isActive ? 'text-ink-brown font-medium' : 'text-warm-gray hover:text-ink-brown'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.svg
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 w-full h-[3px] text-antique-gold"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path d="M0 5 Q 50 0 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="animate-[stroke-dashoffset_250ms_linear]" />
                    </motion.svg>
                  )}
                </Link>
              );
            })}
            
            <button
              onClick={() => signOut()}
              className="text-sm font-ui text-warm-gray hover:text-ink-brown transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="glass-card rounded-full px-6 py-4 mx-auto max-w-sm pointer-events-auto shadow-[0_8px_32px_rgba(44,24,16,0.15)]"
        >
          <div className="flex items-center justify-between">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-1 p-2"
                >
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                    {item.emoji}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-antique-gold shadow-[0_0_8px_rgba(201,169,110,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </>
  );
}
