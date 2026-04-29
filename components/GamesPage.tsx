'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { createClient } from '@/lib/supabase';

// ============================================
// GAME DATA
// ============================================

const THIS_OR_THAT = [
  { a: 'Morning cuddles', b: 'Late night talks' },
  { a: 'Cook together', b: 'Order takeout' },
  { a: 'Beach sunset', b: 'Cabin in the woods' },
  { a: 'Long drive', b: 'Movie marathon' },
  { a: 'Rain on the window', b: 'Snow outside' },
  { a: 'Love letter', b: 'Surprise visit' },
  { a: 'Dance in the kitchen', b: 'Sing in the car' },
  { a: 'First kiss again', b: 'First date again' },
  { a: 'Matching outfits', b: 'Stealing their hoodie' },
  { a: 'Forehead kisses', b: 'Hand holding' },
];

const TRUTH_OR_DARE = [
  { type: 'truth', text: "What's something you've never told me?" },
  { type: 'dare', text: 'Send me your most embarrassing selfie right now' },
  { type: 'truth', text: 'What was your first impression of me?' },
  { type: 'dare', text: 'Record a voice note saying 3 things you love about me' },
  { type: 'truth', text: "What's the most romantic thing you've imagined us doing?" },
  { type: 'dare', text: 'Write me a 4-line poem right now' },
  { type: 'truth', text: 'When did you realize you loved me?' },
  { type: 'dare', text: 'Set your phone wallpaper to my photo for a week' },
  { type: 'truth', text: "What's your favorite memory of us?" },
  { type: 'dare', text: 'Plan our next date in under 30 seconds' },
  { type: 'truth', text: 'What song makes you think of me?' },
  { type: 'dare', text: 'Send me 5 heart emojis to everyone in your recent chats' },
];

const RAPID_FIRE = [
  'Your love language?',
  'Favorite thing about me?',
  'Our song?',
  'Dream vacation together?',
  'My best quality?',
  'Funniest memory of us?',
  'One word for our love?',
  'My comfort food?',
  'Where do you see us in 5 years?',
  'Something I do that melts your heart?',
  'My hidden talent?',
  'Best date we ever had?',
];

type GameType = 'this-or-that' | 'truth-or-dare' | 'rapid-fire';

interface GameState {
  gameType: GameType;
  currentQuestion: number;
  myAnswer: string | null;
  partnerAnswer: string | null;
  showResults: boolean;
}

export default function GamesPage() {
  const { user } = useAuth();
  const { partner } = usePartner();
  const [supabase] = useState(() => createClient());
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    gameType: 'this-or-that',
    currentQuestion: 0,
    myAnswer: null,
    partnerAnswer: null,
    showResults: false,
  });
  const [isPartnerInGame, setIsPartnerInGame] = useState(false);
  const [rapidFireAnswer, setRapidFireAnswer] = useState('');

  const partnerName = partner?.name || 'Your Love';

  // Game channel for real-time sync
  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase.channel('game-room', {
      config: { presence: { key: user.email } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setIsPartnerInGame(users.length > 1);
      })
      .on('broadcast', { event: 'game-action' }, ({ payload }) => {
        if (payload.sender === user.email) return;

        switch (payload.action) {
          case 'answer':
            setGameState((prev) => ({
              ...prev,
              partnerAnswer: payload.answer,
              showResults: prev.myAnswer !== null,
            }));
            break;
          case 'next':
            setGameState((prev) => ({
              ...prev,
              currentQuestion: payload.questionIndex,
              myAnswer: null,
              partnerAnswer: null,
              showResults: false,
            }));
            setRapidFireAnswer('');
            break;
          case 'start-game':
            setActiveGame(payload.gameType);
            setGameState({
              gameType: payload.gameType,
              currentQuestion: 0,
              myAnswer: null,
              partnerAnswer: null,
              showResults: false,
            });
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, supabase]);

  // Track active game in presence
  useEffect(() => {
    if (!user?.email) return;
    const updatePresence = async () => {
      const channel = supabase.channel('game-room');
      // @ts-ignore
      if (channel.state === 'joined') {
        try {
          await channel.track({
            game: activeGame,
            online_at: new Date().toISOString(),
          });
        } catch (e) {
          console.error('Game presence track error:', e);
        }
      }
    };
    updatePresence();
  }, [activeGame, user?.email, supabase]);

  const broadcast = useCallback(
    (payload: Record<string, unknown>) => {
      const channel = supabase.channel('game-room');
      // @ts-ignore
      if (channel.state === 'joined') {
        channel.send({
          type: 'broadcast',
          event: 'game-action',
          payload: { ...payload, sender: user?.email },
        });
      }
    },
    [supabase, user?.email]
  );

  const startGame = (type: GameType) => {
    setActiveGame(type);
    setGameState({
      gameType: type,
      currentQuestion: 0,
      myAnswer: null,
      partnerAnswer: null,
      showResults: false,
    });
    broadcast({ action: 'start-game', gameType: type });
  };

  const submitAnswer = (answer: string) => {
    setGameState((prev) => ({
      ...prev,
      myAnswer: answer,
      showResults: prev.partnerAnswer !== null,
    }));
    broadcast({ action: 'answer', answer });
  };

  const nextQuestion = () => {
    const next = gameState.currentQuestion + 1;
    setGameState((prev) => ({
      ...prev,
      currentQuestion: next,
      myAnswer: null,
      partnerAnswer: null,
      showResults: false,
    }));
    setRapidFireAnswer('');
    broadcast({ action: 'next', questionIndex: next });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 night-zone">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-display italic text-night-text mb-4 tracking-wide">
            Play Room
          </h1>
          <p className="font-handwriting text-xl text-amber-glow/80">
            little games, big laughs
          </p>

          {/* Partner Status */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              {isPartnerInGame && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPartnerInGame ? 'bg-green-400' : 'bg-white/20'}`} />
            </div>
            <span className="font-ui text-sm text-white/40">
              {isPartnerInGame ? `${partnerName} is playing with you ❤️` : `Waiting for ${partnerName}...`}
            </span>
          </div>
        </motion.div>

        {!activeGame ? (
          /* Game Selection */
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { type: 'this-or-that' as GameType, emoji: '🤔', title: 'This or That', desc: 'Choose together, see if you match', color: 'amber-glow' },
              { type: 'truth-or-dare' as GameType, emoji: '🔥', title: 'Truth or Dare', desc: 'Spice things up', color: 'bloom-pink' },
              { type: 'rapid-fire' as GameType, emoji: '⚡', title: 'Rapid Fire', desc: 'Quick answers, no thinking', color: 'amber-glow' },
            ].map((game) => (
              <motion.button
                key={game.type}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(game.type)}
                className="glass-card p-8 text-center cursor-pointer group shimmer-glass"
              >
                <span className="text-5xl block mb-4">{game.emoji}</span>
                <h3 className="text-xl font-display text-white mb-2">{game.title}</h3>
                <p className="font-ui text-sm text-white/40">{game.desc}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Active Game */
          <div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setActiveGame(null)}
              className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors font-ui text-sm"
            >
              ← Back to games
            </motion.button>

            <AnimatePresence mode="wait">
              {/* THIS OR THAT */}
              {activeGame === 'this-or-that' && gameState.currentQuestion < THIS_OR_THAT.length && (
                <motion.div
                  key={`tot-${gameState.currentQuestion}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-12 text-center shimmer-glass"
                >
                  <span className="font-handwriting text-amber-glow text-xl mb-4 block">
                    Question {gameState.currentQuestion + 1} / {THIS_OR_THAT.length}
                  </span>
                  <h2 className="text-3xl font-display text-white mb-16">Which do you prefer?</h2>

                  {!gameState.showResults ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                      <button
                        onClick={() => submitAnswer('a')}
                        disabled={gameState.myAnswer !== null}
                        className={`w-full md:w-64 py-8 px-6 rounded-2xl border transition-all ${
                          gameState.myAnswer === 'a'
                            ? 'bg-amber-glow/20 border-amber-glow text-amber-glow'
                            : 'border-white/10 bg-white/5 hover:bg-amber-glow/10 hover:border-amber-glow/50 text-white'
                        }`}
                      >
                        <span className="font-display italic text-2xl">
                          {THIS_OR_THAT[gameState.currentQuestion].a}
                        </span>
                      </button>
                      <span className="font-handwriting text-2xl text-white/30">or</span>
                      <button
                        onClick={() => submitAnswer('b')}
                        disabled={gameState.myAnswer !== null}
                        className={`w-full md:w-64 py-8 px-6 rounded-2xl border transition-all ${
                          gameState.myAnswer === 'b'
                            ? 'bg-bloom-pink/20 border-bloom-pink text-bloom-pink'
                            : 'border-white/10 bg-white/5 hover:bg-bloom-pink/10 hover:border-bloom-pink/50 text-white'
                        }`}
                      >
                        <span className="font-display italic text-2xl">
                          {THIS_OR_THAT[gameState.currentQuestion].b}
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Results */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-4xl mb-4">
                        {gameState.myAnswer === gameState.partnerAnswer ? '💕 You matched!' : '😄 Different choices!'}
                      </div>
                      <div className="flex justify-center gap-8">
                        <div className="text-center">
                          <p className="font-ui text-xs text-white/40 mb-2 uppercase tracking-wider">You</p>
                          <p className="font-display text-xl text-amber-glow">
                            {gameState.myAnswer === 'a' ? THIS_OR_THAT[gameState.currentQuestion].a : THIS_OR_THAT[gameState.currentQuestion].b}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-ui text-xs text-white/40 mb-2 uppercase tracking-wider">{partnerName}</p>
                          <p className="font-display text-xl text-bloom-pink">
                            {gameState.partnerAnswer === 'a' ? THIS_OR_THAT[gameState.currentQuestion].a : THIS_OR_THAT[gameState.currentQuestion].b}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {gameState.myAnswer && !gameState.partnerAnswer && (
                    <p className="mt-8 font-handwriting text-white/30 animate-pulse">
                      Waiting for {partnerName} to answer...
                    </p>
                  )}

                  {gameState.showResults && (
                    <button onClick={nextQuestion} className="mt-12 btn-ghost !text-white/40 !border-white/10 hover:!text-white hover:!border-white/40">
                      Next Question →
                    </button>
                  )}
                </motion.div>
              )}

              {/* TRUTH OR DARE */}
              {activeGame === 'truth-or-dare' && gameState.currentQuestion < TRUTH_OR_DARE.length && (
                <motion.div
                  key={`tod-${gameState.currentQuestion}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-12 text-center shimmer-glass"
                >
                  <div className="mb-8">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-ui uppercase tracking-wider ${
                      TRUTH_OR_DARE[gameState.currentQuestion].type === 'truth'
                        ? 'bg-amber-glow/20 text-amber-glow border border-amber-glow/30'
                        : 'bg-bloom-pink/20 text-bloom-pink border border-bloom-pink/30'
                    }`}>
                      {TRUTH_OR_DARE[gameState.currentQuestion].type}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-display text-white mb-12 leading-relaxed">
                    {TRUTH_OR_DARE[gameState.currentQuestion].text}
                  </h2>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        submitAnswer('done');
                      }}
                      disabled={gameState.myAnswer !== null}
                      className={`px-8 py-3 rounded-full font-ui text-sm uppercase tracking-wider transition-all ${
                        gameState.myAnswer
                          ? 'bg-green-500/20 border border-green-400/30 text-green-400'
                          : 'border border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {gameState.myAnswer ? '✓ Done!' : 'Mark as Done'}
                    </button>
                    <button
                      onClick={nextQuestion}
                      className="px-8 py-3 rounded-full font-ui text-sm uppercase tracking-wider border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
                    >
                      Skip →
                    </button>
                  </div>

                  {gameState.myAnswer && !gameState.partnerAnswer && (
                    <p className="mt-6 font-handwriting text-white/30 animate-pulse">
                      Waiting for {partnerName}...
                    </p>
                  )}

                  {gameState.myAnswer && gameState.partnerAnswer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8"
                    >
                      <p className="text-2xl mb-4">✨ Both done!</p>
                      <button onClick={nextQuestion} className="btn-ghost !text-white/40 !border-white/10 hover:!text-white hover:!border-white/40">
                        Next Challenge →
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* RAPID FIRE */}
              {activeGame === 'rapid-fire' && gameState.currentQuestion < RAPID_FIRE.length && (
                <motion.div
                  key={`rf-${gameState.currentQuestion}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-12 text-center shimmer-glass"
                >
                  <span className="font-handwriting text-amber-glow text-xl mb-2 block">⚡ Rapid Fire</span>
                  <span className="font-ui text-xs text-white/30 uppercase tracking-wider mb-8 block">
                    Question {gameState.currentQuestion + 1} / {RAPID_FIRE.length}
                  </span>

                  <h2 className="text-3xl font-display text-white mb-12">
                    {RAPID_FIRE[gameState.currentQuestion]}
                  </h2>

                  {!gameState.showResults ? (
                    <div className="max-w-md mx-auto">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={rapidFireAnswer}
                          onChange={(e) => setRapidFireAnswer(e.target.value)}
                          disabled={gameState.myAnswer !== null}
                          placeholder="Your answer..."
                          className="flex-1 bg-white/5 border border-white/10 focus:border-amber-glow/50 rounded-2xl px-5 py-3 outline-none text-white font-ui text-sm transition-all placeholder:text-white/15"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && rapidFireAnswer.trim()) {
                              submitAnswer(rapidFireAnswer.trim());
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (rapidFireAnswer.trim()) submitAnswer(rapidFireAnswer.trim());
                          }}
                          disabled={!rapidFireAnswer.trim() || gameState.myAnswer !== null}
                          className="px-6 py-3 rounded-2xl bg-amber-glow/20 border border-amber-glow/30 text-amber-glow font-ui text-sm hover:bg-amber-glow/30 transition-all disabled:opacity-30"
                        >
                          Lock In
                        </button>
                      </div>

                      {gameState.myAnswer && !gameState.partnerAnswer && (
                        <p className="mt-6 font-handwriting text-white/30 animate-pulse">
                          Waiting for {partnerName}...
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Results */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-center gap-8 mt-4">
                        <div className="glass-card p-6 min-w-[150px]">
                          <p className="font-ui text-xs text-white/40 mb-2 uppercase tracking-wider">You said</p>
                          <p className="font-handwriting text-xl text-amber-glow">{gameState.myAnswer}</p>
                        </div>
                        <div className="glass-card p-6 min-w-[150px]">
                          <p className="font-ui text-xs text-white/40 mb-2 uppercase tracking-wider">{partnerName} said</p>
                          <p className="font-handwriting text-xl text-bloom-pink">{gameState.partnerAnswer}</p>
                        </div>
                      </div>
                      <button onClick={nextQuestion} className="mt-6 btn-ghost !text-white/40 !border-white/10 hover:!text-white hover:!border-white/40">
                        Next ⚡
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Game Over */}
              {activeGame && (
                (activeGame === 'this-or-that' && gameState.currentQuestion >= THIS_OR_THAT.length) ||
                (activeGame === 'truth-or-dare' && gameState.currentQuestion >= TRUTH_OR_DARE.length) ||
                (activeGame === 'rapid-fire' && gameState.currentQuestion >= RAPID_FIRE.length)
              ) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center shimmer-glass"
                >
                  <span className="text-6xl block mb-6">🎉</span>
                  <h2 className="text-3xl font-display text-white mb-4">Game Complete!</h2>
                  <p className="font-handwriting text-xl text-white/50 mb-8">That was fun, wasn&apos;t it?</p>
                  <button onClick={() => setActiveGame(null)} className="btn-primary bg-amber-glow text-night-bg">
                    Play Another Game
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
