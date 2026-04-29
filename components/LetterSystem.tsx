'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';

interface Letter {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function LetterSystem() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Fetch letters
  useEffect(() => {
    if (!user?.email) return;

    const fetchLetters = async () => {
      const { data } = await supabase
        .from('letters')
        .select('*')
        .or(`sender.eq.${user.email},receiver.eq.${user.email}`)
        .order('created_at', { ascending: false });
      if (data) setLetters(data);
    };

    fetchLetters();

    // Real-time subscription
    const channel = supabase
      .channel('letters-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'letters' },
        () => fetchLetters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, supabase]);

  const sendLetter = async () => {
    if (!newMessage.trim() || !user?.email) return;
    setSending(true);

    const { error } = await supabase.from('letters').insert({
      sender: user.email,
      receiver: 'partner', // Will be resolved server-side or by the other user's email
      message: newMessage.trim(),
      is_read: false,
    });

    if (!error) {
      setNewMessage('');
      setShowCompose(false);
    }
    setSending(false);
  };

  const openLetter = async (letter: Letter) => {
    setSelectedLetter(letter);
    setEnvelopeOpen(false);

    // Small delay then open envelope
    setTimeout(() => setEnvelopeOpen(true), 500);

    // Mark as read
    if (!letter.is_read && letter.receiver === user?.email) {
      await supabase
        .from('letters')
        .update({ is_read: true })
        .eq('id', letter.id);
    }
  };

  const unreadCount = letters.filter(
    (l) => !l.is_read && l.receiver === user?.email
  ).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl gradient-text mb-3"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            Love Letters 💌
          </h1>
          <p className="text-soft-black/50 dark:text-dark-text/50" style={{ fontFamily: 'var(--font-casual)' }}>
            Words from the heart
          </p>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                💌
              </motion.span>
              You have {unreadCount} new letter{unreadCount > 1 ? 's' : ''}!
            </motion.div>
          )}
        </motion.div>

        {/* Compose Button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCompose(true)}
          className="w-full mb-8 p-5 rounded-2xl glass shadow-lg shadow-rose-500/5 text-center cursor-pointer group"
        >
          <span className="text-lg group-hover:scale-110 inline-block transition-transform mr-2">✍️</span>
          <span
            className="text-soft-black/70 dark:text-dark-text/70 font-medium"
            style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem' }}
          >
            Write a letter to your love...
          </span>
        </motion.button>

        {/* Letters Grid */}
        <div className="grid gap-4">
          {letters.map((letter, index) => {
            const isSender = letter.sender === user?.email;
            return (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => openLetter(letter)}
                className={`glass rounded-2xl p-5 cursor-pointer shadow-lg shadow-rose-500/5 relative overflow-hidden ${
                  !letter.is_read && !isSender
                    ? 'ring-2 ring-rose-300 dark:ring-rose-500/30'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{isSender ? '📤' : '📩'}</span>
                      <span className="text-sm font-medium text-soft-black/70 dark:text-dark-text/70">
                        {isSender ? 'You wrote' : 'You received'}
                      </span>
                      {!letter.is_read && !isSender && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                          New
                        </span>
                      )}
                    </div>
                    <p
                      className="text-soft-black/50 dark:text-dark-text/50 text-sm truncate max-w-xs"
                      style={{ fontFamily: 'var(--font-casual)' }}
                    >
                      {letter.message.slice(0, 80)}...
                    </p>
                  </div>
                  <span className="text-xs text-soft-black/30 dark:text-dark-text/30 whitespace-nowrap">
                    {new Date(letter.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {letters.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass rounded-2xl"
            >
              <span className="text-5xl block mb-4">💌</span>
              <p
                className="text-soft-black/40 dark:text-dark-text/40"
                style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem' }}
              >
                No letters yet... Write the first one!
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-texture rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h2
                className="text-3xl gradient-text mb-6 text-center"
                style={{ fontFamily: 'var(--font-handwritten)' }}
              >
                Write Your Heart Out 💕
              </h2>

              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="My dearest..."
                className="w-full h-48 bg-transparent border-none outline-none resize-none text-soft-black/80 dark:text-dark-text/80 placeholder:text-soft-black/20 dark:placeholder:text-dark-text/20"
                style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem', lineHeight: '28px' }}
                autoFocus
              />

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-rose-100/30 dark:border-rose-800/20">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-5 py-2 rounded-xl text-soft-black/50 dark:text-dark-text/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={sendLetter}
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {sending ? 'Sending...' : 'Send with Love 💌'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Reading Modal (Envelope) */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setSelectedLetter(null); setEnvelopeOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              {/* Envelope */}
              <div className={`envelope mx-auto mb-8 ${envelopeOpen ? 'open' : ''}`}>
                <div className="envelope-flap" />
                <div className="envelope-heart">💕</div>
              </div>

              {/* Letter Content */}
              <AnimatePresence>
                {envelopeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="paper-texture rounded-2xl p-8 shadow-2xl"
                  >
                    <p
                      className="text-soft-black/80 dark:text-dark-text/80 whitespace-pre-wrap leading-relaxed"
                      style={{ fontFamily: 'var(--font-casual)', fontSize: '1.15rem', lineHeight: '30px' }}
                    >
                      {selectedLetter.message}
                    </p>

                    <div className="mt-6 pt-4 border-t border-rose-100/30 dark:border-rose-800/20 flex justify-between items-center">
                      <span
                        className="text-sm text-soft-black/40 dark:text-dark-text/40 italic"
                        style={{ fontFamily: 'var(--font-casual)' }}
                      >
                        — with love ♡
                      </span>
                      <span className="text-xs text-soft-black/30 dark:text-dark-text/30">
                        {new Date(selectedLetter.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
