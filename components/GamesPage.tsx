'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';

// ============================================
// THIS OR THAT GAME
// ============================================
const thisOrThatQuestions = [
  { a: 'Sunrise walks', b: 'Sunset drives' },
  { a: 'Cook together', b: 'Order in' },
  { a: 'Movie night', b: 'Stargazing' },
  { a: 'Beach vacation', b: 'Mountain escape' },
  { a: 'Love letters', b: 'Voice notes' },
  { a: 'Rainy cuddles', b: 'Sunny picnic' },
  { a: 'First to text', b: 'Last to say goodnight' },
  { a: 'Matching outfits', b: 'Stealing hoodies' },
  { a: 'Slow dance', b: 'Pillow fight' },
  { a: 'Photo album', b: 'Video diary' },
];

function ThisOrThat() {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('this-or-that')
      .on('broadcast', { event: 'choice', }, (payload) => {
        if (payload.payload.user !== user?.email) {
          setPartnerChoice(payload.payload.choice);
        }
      })
      .on('broadcast', { event: 'next-q' }, (payload) => {
        setCurrentQ(payload.payload.index);
        setMyChoice(null);
        setPartnerChoice(null);
        setRevealed(false);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.email, supabase]);

  useEffect(() => {
    if (myChoice && partnerChoice) {
      setTimeout(() => setRevealed(true), 500);
    }
  }, [myChoice, partnerChoice]);

  const makeChoice = (choice: string) => {
    setMyChoice(choice);
    supabase.channel('this-or-that').send({
      type: 'broadcast',
      event: 'choice',
      payload: { choice, user: user?.email },
    });
  };

  const nextQuestion = () => {
    const next = (currentQ + 1) % thisOrThatQuestions.length;
    setCurrentQ(next);
    setMyChoice(null);
    setPartnerChoice(null);
    setRevealed(false);
    supabase.channel('this-or-that').send({
      type: 'broadcast',
      event: 'next-q',
      payload: { index: next },
    });
  };

  const q = thisOrThatQuestions[currentQ];

  return (
    <div className="glass rounded-2xl p-8 shadow-lg shadow-rose-500/5">
      <div className="text-center mb-6">
        <span className="text-3xl mb-3 block">💕</span>
        <h3
          className="text-sm text-soft-black/50 dark:text-dark-text/50 uppercase tracking-wider"
        >
          Question {currentQ + 1} of {thisOrThatQuestions.length}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[q.a, q.b].map((option) => {
          const isMyChoice = myChoice === option;
          const isPartnerChoice = partnerChoice === option;
          const isMatch = revealed && isMyChoice && isPartnerChoice;

          return (
            <motion.button
              key={option}
              whileHover={!myChoice ? { scale: 1.03, y: -2 } : {}}
              whileTap={!myChoice ? { scale: 0.97 } : {}}
              onClick={() => !myChoice && makeChoice(option)}
              className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                isMyChoice
                  ? 'bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-white/50 dark:bg-dark-card/50 hover:bg-white/80 dark:hover:bg-dark-card/80'
              } ${isMatch ? 'ring-4 ring-emerald-400/50' : ''}`}
              disabled={!!myChoice}
            >
              <span
                className="text-lg font-medium block"
                style={{ fontFamily: 'var(--font-casual)' }}
              >
                {option}
              </span>
              {revealed && isPartnerChoice && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-xl"
                >
                  {isMatch ? '💕' : '💜'}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Status */}
      <div className="text-center">
        {!myChoice && (
          <p className="text-sm text-soft-black/40 dark:text-dark-text/40" style={{ fontFamily: 'var(--font-casual)' }}>
            Pick your choice!
          </p>
        )}
        {myChoice && !partnerChoice && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-rose-400"
            style={{ fontFamily: 'var(--font-casual)' }}
          >
            Waiting for your love to choose...
          </motion.p>
        )}
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p
              className="text-lg mb-3"
              style={{ fontFamily: 'var(--font-casual)' }}
            >
              {myChoice === partnerChoice ? "You both chose the same! 💕" : "Different choices, same love 💫"}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextQuestion}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/20"
            >
              Next Question →
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Q&A MODE
// ============================================
function QnAMode() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [asker, setAsker] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('qna-mode')
      .on('broadcast', { event: 'ask' }, (payload) => {
        setCurrentQuestion(payload.payload.question);
        setAsker(payload.payload.user);
        setMyAnswer('');
        setPartnerAnswer(null);
      })
      .on('broadcast', { event: 'answer' }, (payload) => {
        if (payload.payload.user !== user?.email) {
          setPartnerAnswer(payload.payload.answer);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.email, supabase]);

  const askQuestion = () => {
    if (!question.trim()) return;
    setCurrentQuestion(question);
    setAsker(user?.email || null);
    setMyAnswer('');
    setPartnerAnswer(null);
    supabase.channel('qna-mode').send({
      type: 'broadcast',
      event: 'ask',
      payload: { question, user: user?.email },
    });
    setQuestion('');
  };

  const submitAnswer = () => {
    if (!myAnswer.trim()) return;
    supabase.channel('qna-mode').send({
      type: 'broadcast',
      event: 'answer',
      payload: { answer: myAnswer, user: user?.email },
    });
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-lg shadow-rose-500/5">
      <div className="text-center mb-6">
        <span className="text-3xl mb-3 block">❓</span>
        <h3
          className="text-lg gradient-text"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          Q&A Mode
        </h3>
      </div>

      {/* Ask Question */}
      {!currentQuestion && (
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your love something..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-rose-100 dark:border-rose-800/20 outline-none text-sm focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={askQuestion}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/20"
          >
            Ask
          </motion.button>
        </div>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p
            className="text-xl text-center mb-6 text-soft-black/80 dark:text-dark-text/80"
            style={{ fontFamily: 'var(--font-casual)' }}
          >
            &ldquo;{currentQuestion}&rdquo;
          </p>

          {asker !== user?.email && !myAnswer && (
            <div className="flex gap-3">
              <input
                type="text"
                value={myAnswer}
                onChange={(e) => setMyAnswer(e.target.value)}
                placeholder="Your answer..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-rose-100 dark:border-rose-800/20 outline-none text-sm focus:ring-2 focus:ring-rose-300 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={submitAnswer}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/20"
              >
                Send
              </motion.button>
            </div>
          )}

          {partnerAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-center"
            >
              <p className="text-sm text-soft-black/50 dark:text-dark-text/50 mb-1">Their answer:</p>
              <p className="text-lg" style={{ fontFamily: 'var(--font-casual)' }}>
                {partnerAnswer}
              </p>
            </motion.div>
          )}

          <button
            onClick={() => { setCurrentQuestion(null); setMyAnswer(''); setPartnerAnswer(null); }}
            className="w-full mt-4 text-sm text-soft-black/40 dark:text-dark-text/40 hover:text-rose-400 transition-colors"
          >
            Ask a new question
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// MEMORY QUIZ
// ============================================
const memoryQuizQuestions = [
  { q: "What was our first date?", type: "text" },
  { q: "What's my favorite food?", type: "text" },
  { q: "What song reminds you of us?", type: "text" },
  { q: "Where would we go on a dream vacation?", type: "text" },
  { q: "What's my comfort movie?", type: "text" },
  { q: "What's the first thing you noticed about me?", type: "text" },
  { q: "What's our inside joke?", type: "text" },
  { q: "What's my dream job?", type: "text" },
];

function MemoryQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const q = memoryQuizQuestions[currentQ];

  const submit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
  };

  const next = () => {
    setCurrentQ((prev) => (prev + 1) % memoryQuizQuestions.length);
    setAnswer('');
    setSubmitted(false);
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-lg shadow-rose-500/5">
      <div className="text-center mb-6">
        <span className="text-3xl mb-3 block">🧠</span>
        <h3
          className="text-lg gradient-text"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          Memory Quiz
        </h3>
        <p className="text-xs text-soft-black/40 dark:text-dark-text/40 mt-1">
          {currentQ + 1} / {memoryQuizQuestions.length}
        </p>
      </div>

      <p
        className="text-xl text-center mb-6"
        style={{ fontFamily: 'var(--font-casual)' }}
      >
        {q.q}
      </p>

      {!submitted ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-rose-100 dark:border-rose-800/20 outline-none text-sm focus:ring-2 focus:ring-rose-300 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={submit}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/20"
          >
            Submit
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 mb-4">
            <p className="text-sm text-soft-black/50 dark:text-dark-text/50 mb-1">You answered:</p>
            <p className="text-lg" style={{ fontFamily: 'var(--font-casual)' }}>{answer}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={next}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/20"
          >
            Next Question →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// GAMES PAGE
// ============================================
export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<'this-or-that' | 'qna' | 'quiz'>('this-or-that');

  const games = [
    { id: 'this-or-that' as const, label: 'This or That', emoji: '💕' },
    { id: 'qna' as const, label: 'Q&A Mode', emoji: '❓' },
    { id: 'quiz' as const, label: 'Memory Quiz', emoji: '🧠' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl md:text-5xl gradient-text mb-3"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            Fun Together 🎮
          </h1>
          <p className="text-soft-black/50 dark:text-dark-text/50" style={{ fontFamily: 'var(--font-casual)' }}>
            Play, laugh, and know each other better
          </p>
        </motion.div>

        {/* Game Switcher */}
        <div className="flex justify-center gap-2 mb-8">
          {games.map((game) => (
            <motion.button
              key={game.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(game.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeGame === game.id
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'glass hover:bg-rose-50 dark:hover:bg-rose-500/10'
              }`}
            >
              <span className="mr-1.5">{game.emoji}</span>
              {game.label}
            </motion.button>
          ))}
        </div>

        {/* Active Game */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeGame === 'this-or-that' && <ThisOrThat />}
            {activeGame === 'qna' && <QnAMode />}
            {activeGame === 'quiz' && <MemoryQuiz />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
