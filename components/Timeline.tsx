'use client';

import { motion } from 'framer-motion';
import { getTimelineMonths } from '@/lib/constants';
import TimelinePolaroid from '@/components/TimelinePolaroid';

export default function Timeline() {
  const chapters = getTimelineMonths();

  return (
    <section className="relative py-24 bg-paper-surface overflow-hidden" id="timeline">
      {/* Corkboard texture simulation */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{
        backgroundImage: `radial-gradient(var(--color-warm-gray) 1px, transparent 1px)`,
        backgroundSize: '12px 12px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-display italic text-ink-brown">Our Memories</h2>
          <p className="font-handwriting text-xl text-warm-gray mt-2">a journey through time</p>
        </div>

        {/* MOBILE: Horizontal Scroll Timeline */}
        <div className="md:hidden relative pb-12">
          {/* Horizontal Line */}
          <div className="absolute top-[180px] left-0 right-0 h-0.5 bg-ink-brown/20 z-0" />
          
          <div className="flex overflow-x-auto gap-12 snap-x snap-mandatory hide-scrollbar relative z-10 px-4 pt-10">
            {chapters.map((chapter, idx) => {
              const rotate = idx % 2 === 0 ? '-rotate-2' : 'rotate-2';
              return (
                <motion.div
                  key={chapter.key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[280px] snap-center flex flex-col items-center"
                >
                  {/* Washi Tape / Timeline Node on the line */}
                  <div className="mb-8 relative flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-dusty-rose shadow-md mb-2 border-2 border-paper-bg z-20" />
                    <div className="w-24 h-7 bg-paper-bg/90 shadow-sm rotate-[-3deg] backdrop-blur-sm flex items-center justify-center relative border border-warm-sand/50" style={{ clipPath: 'polygon(0% 5%, 100% 0%, 98% 95%, 2% 100%)' }}>
                      <span className="font-handwriting text-ink-brown">{chapter.label} {chapter.year}</span>
                    </div>
                  </div>
                  
                  <TimelinePolaroid 
                    monthKey={chapter.key}
                    label={chapter.label}
                    rotateClass={rotate}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP: Vertical Alternating Timeline */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-ink-brown/20 z-0" />

          {chapters.map((chapter, idx) => {
            const isLeft = idx % 2 === 0;
            const rotate = isLeft ? '-rotate-2' : 'rotate-2';
            
            return (
              <div key={chapter.key} className="relative flex items-center justify-between mb-32 w-full">
                
                {/* Left Side */}
                <div className="w-5/12 flex justify-end">
                  {isLeft && (
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`w-full max-w-sm origin-bottom-right`}
                    >
                      <TimelinePolaroid 
                        monthKey={chapter.key}
                        label={chapter.label}
                        rotateClass={rotate}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Center Node (Timeline Point) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-4 h-4 rounded-full bg-dusty-rose shadow-[0_0_0_4px_var(--color-paper-surface)] border border-ink-brown/10 mb-3"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-32 h-8 bg-paper-bg shadow-md rotate-[-2deg] flex items-center justify-center relative border border-warm-sand/30"
                    style={{ clipPath: 'polygon(0% 5%, 100% 0%, 98% 95%, 2% 100%)' }}
                  >
                    <span className="font-handwriting text-lg text-ink-brown">{chapter.label} {chapter.year}</span>
                  </motion.div>
                </div>

                {/* Right Side */}
                <div className="w-5/12 flex justify-start">
                  {!isLeft && (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`w-full max-w-sm origin-bottom-left`}
                    >
                      <TimelinePolaroid 
                        monthKey={chapter.key}
                        label={chapter.label}
                        rotateClass={rotate}
                      />
                    </motion.div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
