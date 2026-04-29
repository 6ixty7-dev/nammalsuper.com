'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THIS_OR_THAT_QUESTIONS = [
  { id: 1, a: 'Morning cuddles', b: 'Late night talks' },
  { id: 2, a: 'Cook together', b: 'Order takeout' },
  { id: 3, a: 'Beach sunset', b: 'Cabin in the woods' },
  { id: 4, a: 'Long drive', b: 'Movie marathon' },
];

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState<'this-or-that' | 'qna'>('this-or-that');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 night-zone">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display italic text-night-text mb-4 tracking-wide">
            Play Room
          </h1>
          <p className="font-handwriting text-xl text-amber-glow/80">
            little games, big laughs
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('this-or-that')}
            className={`px-8 py-3 rounded-full font-ui text-sm uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'this-or-that'
                ? 'bg-amber-glow text-night-bg shadow-[0_0_20px_rgba(240,192,64,0.3)]'
                : 'border border-white/10 text-white/50 hover:bg-white/5'
            }`}
          >
            This or That
          </button>
          <button
            onClick={() => setActiveTab('qna')}
            className={`px-8 py-3 rounded-full font-ui text-sm uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'qna'
                ? 'bg-bloom-pink text-night-bg shadow-[0_0_20px_rgba(255,155,174,0.3)]'
                : 'border border-white/10 text-white/50 hover:bg-white/5'
            }`}
          >
            Q & A
          </button>
        </div>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'this-or-that' ? (
            <motion.div
              key="this-or-that"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-12 text-center relative overflow-hidden shimmer-glass"
            >
              <span className="font-handwriting text-amber-glow text-xl mb-4 block">Question {currentQuestion + 1}</span>
              <h2 className="text-3xl font-display text-white mb-16">Which do you prefer?</h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button className="w-full md:w-64 py-8 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-amber-glow/10 hover:border-amber-glow/50 transition-all group">
                  <span className="font-display italic text-2xl text-white group-hover:text-amber-glow transition-colors">
                    {THIS_OR_THAT_QUESTIONS[currentQuestion].a}
                  </span>
                </button>
                <span className="font-handwriting text-2xl text-white/30">or</span>
                <button className="w-full md:w-64 py-8 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-bloom-pink/10 hover:border-bloom-pink/50 transition-all group">
                  <span className="font-display italic text-2xl text-white group-hover:text-bloom-pink transition-colors">
                    {THIS_OR_THAT_QUESTIONS[currentQuestion].b}
                  </span>
                </button>
              </div>

              <div className="mt-16">
                <button 
                  onClick={() => setCurrentQuestion((prev) => (prev + 1) % THIS_OR_THAT_QUESTIONS.length)}
                  className="btn-ghost !text-white/40 !border-white/10 hover:!text-white hover:!border-white/40"
                >
                  Next Question
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="qna"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-12 text-center shimmer-glass"
            >
              <span className="text-5xl block mb-6">💭</span>
              <h2 className="text-3xl font-display text-white mb-4">Deep Conversations</h2>
              <p className="font-handwriting text-xl text-white/50 mb-12">Ask me anything...</p>
              
              <div className="max-w-md mx-auto relative group">
                <input 
                  type="text" 
                  placeholder="Type your question..." 
                  className="w-full bg-transparent border-b-2 border-white/10 focus:border-bloom-pink px-4 py-3 outline-none text-white font-ui transition-all text-center placeholder:text-white/20"
                />
                {/* Ink dot on focus simulation */}
                <div className="absolute left-0 bottom-0 w-1.5 h-1.5 rounded-full bg-bloom-pink opacity-0 group-focus-within:opacity-100 transition-opacity" />
              </div>

              <button className="mt-12 btn-primary bg-bloom-pink text-night-bg hover:shadow-[0_0_20px_rgba(255,155,174,0.4)]">
                Ask Partner
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
