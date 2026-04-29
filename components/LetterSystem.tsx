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
      receiver: 'partner', 
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
    <div className="min-h-screen pt-24 pb-16 px-4 night-zone">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display italic text-night-text mb-4 tracking-wide">
            Midnight Letters
          </h1>
          <p className="font-handwriting text-xl text-amber-glow/80">
            words spoken in the quiet hours
          </p>
        </motion.div>

        {/* Compose Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCompose(true)}
          className="w-full max-w-lg mx-auto mb-16 py-6 px-8 glass-card flex flex-col items-center justify-center gap-3 cursor-pointer group shimmer-glass block"
        >
          <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">✍️</span>
          <span className="font-ui text-sm tracking-widest uppercase text-night-text/70 group-hover:text-amber-glow transition-colors">
            Draft a new letter
          </span>
        </motion.button>

        {/* Letters Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {letters.map((letter, index) => {
            const isSender = letter.sender === user?.email;
            return (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => openLetter(letter)}
                className={`glass-card p-6 cursor-pointer group ${
                  !letter.is_read && !isSender ? 'ring-1 ring-bloom-pink/50 shadow-[0_0_20px_rgba(255,155,174,0.15)]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isSender ? 'text-white/40' : 'text-amber-glow'}>
                        {isSender ? (
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        ) : (
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />
                        )}
                      </svg>
                      <span className="font-ui text-xs tracking-wider uppercase text-white/50">
                        {isSender ? 'Sent' : 'Received'}
                      </span>
                    </div>
                    {!letter.is_read && !isSender && (
                      <span className="inline-block mt-1 font-handwriting text-bloom-pink text-sm">
                        unopened
                      </span>
                    )}
                  </div>
                  <span className="font-ui text-xs text-white/30">
                    {new Date(letter.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="mt-auto">
                  <button className="w-full py-3 rounded-full border border-white/10 text-white/60 font-ui text-sm group-hover:bg-white/5 group-hover:text-amber-glow transition-all">
                    {isSender ? 'Read your letter' : 'Break the seal'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Letter Reading Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0814]/80 backdrop-blur-md"
            onClick={() => { setSelectedLetter(null); setEnvelopeOpen(false); }}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg flex flex-col items-center justify-center h-full"
            >
              
              {!envelopeOpen ? (
                // Pre-open Envelope State
                <motion.div 
                  className="relative cursor-pointer float-subtle"
                  onClick={() => setEnvelopeOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-[320px] h-[200px] bg-[#E8DDD0] rounded-sm relative shadow-2xl flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)' }}>
                    <div className="absolute inset-0 bg-noise opacity-30 mix-blend-multiply" />
                  </div>
                  {/* Flap */}
                  <div className="absolute top-0 left-0 w-full h-[120px] bg-[#F5EFE6] origin-top shadow-[0_4px_10px_rgba(0,0,0,0.1)] z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                    <div className="absolute inset-0 bg-noise opacity-30 mix-blend-multiply" />
                  </div>
                  {/* Wax Seal */}
                  <motion.div 
                    className="absolute top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#8B0000] z-20 flex items-center justify-center shadow-[0_4px_10px_rgba(139,0,0,0.4)] border border-[#5c0000]"
                    animate={{ boxShadow: ['0 0 0 rgba(139,0,0,0)', '0 0 20px rgba(139,0,0,0.6)', '0 0 0 rgba(139,0,0,0)'] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <span className="font-display italic text-white/80 text-xl">L</span>
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer-sweep_2s_infinite]" />
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                // Opened Letter State
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="paper-card p-10 md:p-14 w-full relative"
                >
                  {/* Ruled lines background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #2C1810 32px)' }} />
                  
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-antique-gold mx-auto mb-8">
                    <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z" />
                  </svg>

                  <p className="font-handwriting text-ink-brown text-2xl md:text-3xl leading-[32px] whitespace-pre-wrap relative z-10">
                    {selectedLetter.message}
                  </p>

                  <div className="mt-16 text-center">
                    <button 
                      onClick={() => { setSelectedLetter(null); setEnvelopeOpen(false); }}
                      className="btn-ghost text-sm"
                    >
                      Fold & Keep
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0814]/80 backdrop-blur-md"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-card p-8 md:p-12 max-w-lg w-full"
            >
              <h2 className="text-4xl font-display italic text-ink-brown mb-6 text-center">
                Pour your heart out
              </h2>

              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="My dearest..."
                className="w-full h-48 bg-transparent border-none outline-none resize-none text-ink-brown placeholder:text-warm-gray/40 font-handwriting text-2xl leading-[32px]"
                autoFocus
              />

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-warm-sand">
                <button
                  onClick={() => setShowCompose(false)}
                  className="font-ui text-warm-gray text-sm hover:text-ink-brown transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={sendLetter}
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary"
                >
                  {sending ? 'Sealing...' : 'Seal with Wax'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
