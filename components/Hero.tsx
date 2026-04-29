'use client';

import { motion } from 'framer-motion';
import { useDaysCounter } from '@/hooks/useDaysCounter';
import { usePartner } from '@/hooks/usePartner';
import { usePresence, formatLastSeen } from '@/hooks/usePresence';

export default function Hero() {
  const { days, hours, minutes, seconds } = useDaysCounter();
  const { partner, myProfile } = usePartner();
  const { isPartnerOnline, partnerLastSeen } = usePresence();

  const myName = myProfile?.name || 'You';
  const partnerName = partner?.name || 'Your Love';

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-12 md:pt-24 bg-noise">
      
      {/* Abstract Watercolor Wash (Simulated with gradients) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-multiply opacity-40 blur-[80px]"
          style={{ background: 'radial-gradient(circle, var(--color-dusty-rose) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full mix-blend-multiply opacity-30 blur-[60px]"
          style={{ background: 'radial-gradient(circle, var(--color-antique-gold) 0%, transparent 70%)', transform: 'translate(20%, 20%)' }}
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Handwritten Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 text-center"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display italic text-ink-brown leading-tight tracking-tight">
            Our Story
          </h1>
          <p className="mt-4 font-handwriting text-xl md:text-2xl text-warm-gray transform rotate-1">
            {myName} & {partnerName} — since the beginning...
          </p>

          {/* Partner Status */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="relative flex h-2 w-2">
              {isPartnerOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPartnerOnline ? 'bg-green-500' : 'bg-warm-gray/40'}`} />
            </div>
            <span className="font-ui text-xs text-warm-gray/60">
              {isPartnerOnline ? `${partnerName} is here with you ❤️` : `${partnerName} was here ${formatLastSeen(partnerLastSeen)}`}
            </span>
          </div>
        </motion.div>

        {/* Floating Counter Pill */}
        <div className="relative">
          {/* Doodle Hearts */}
          <motion.svg
            className="absolute -left-12 top-2 text-dusty-rose"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </motion.svg>
          
          <motion.svg
            className="absolute -right-10 bottom-0 text-antique-gold"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: [5, -5, 5] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </motion.svg>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card px-8 py-4 rounded-full float-subtle flex items-center gap-6"
          >
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="font-display text-2xl md:text-3xl text-ink-brown tabular-nums tracking-tight">{days}</span>
              <span className="font-handwriting text-warm-gray text-sm mt-1">days</span>
            </div>
            <span className="text-warm-sand">:</span>
            <div className="flex flex-col items-center min-w-[30px]">
              <span className="font-display text-xl md:text-2xl text-ink-brown tabular-nums tracking-tight">{hours}</span>
              <span className="font-handwriting text-warm-gray text-xs mt-1">hrs</span>
            </div>
            <span className="text-warm-sand">:</span>
            <div className="flex flex-col items-center min-w-[30px]">
              <span className="font-display text-xl md:text-2xl text-ink-brown tabular-nums tracking-tight">{minutes}</span>
              <span className="font-handwriting text-warm-gray text-xs mt-1">min</span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Ink Quill Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <motion.svg
          width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-warm-gray mb-3"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <path d="M12 19V5M5 12l7 7 7-7" />
        </motion.svg>
        <span className="font-display italic text-sm text-warm-gray">scroll</span>
      </motion.div>
      
    </section>
  );
}
