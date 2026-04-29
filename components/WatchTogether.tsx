'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';

export default function WatchTogether() {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Convert YouTube URL to embed URL
  const convertToEmbed = (url: string): string => {
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1`;
    }
    return url;
  };

  // Sync video state via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('watch-together')
      .on('broadcast', { event: 'video-sync' }, (payload) => {
        const data = payload.payload;
        if (data.user !== user?.email) {
          if (data.action === 'load') {
            setEmbedUrl(data.url);
          } else if (data.action === 'play') {
            setIsPlaying(true);
          } else if (data.action === 'pause') {
            setIsPlaying(false);
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setPartnerOnline(users.length > 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: user?.email });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, supabase]);

  const loadVideo = () => {
    if (!videoUrl.trim()) return;
    const embed = convertToEmbed(videoUrl);
    setEmbedUrl(embed);

    // Broadcast to partner
    supabase.channel('watch-together').send({
      type: 'broadcast',
      event: 'video-sync',
      payload: { action: 'load', url: embed, user: user?.email },
    });
  };

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);

    supabase.channel('watch-together').send({
      type: 'broadcast',
      event: 'video-sync',
      payload: { action: next ? 'play' : 'pause', user: user?.email },
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
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
            Watch Together 🎬
          </h1>
          <p className="text-soft-black/50 dark:text-dark-text/50" style={{ fontFamily: 'var(--font-casual)' }}>
            Movie nights, even when apart ✨
          </p>

          {/* Partner Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full glass"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                partnerOnline
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  : 'bg-soft-black/20 dark:bg-dark-text/20'
              }`}
            />
            <span className="text-sm text-soft-black/60 dark:text-dark-text/60">
              {partnerOnline ? 'Your love is here ❤️' : 'Waiting for your love...'}
            </span>
          </motion.div>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-8 shadow-lg shadow-rose-500/5"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube link..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-rose-100 dark:border-rose-800/20 outline-none text-sm focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && loadVideo()}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={loadVideo}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium shadow-lg shadow-rose-500/20 text-sm whitespace-nowrap"
            >
              Load Video
            </motion.button>
          </div>
        </motion.div>

        {/* Video Player */}
        {embedUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/10"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100/20 dark:border-rose-800/10">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ❤️
                </motion.span>
                <span
                  className="text-sm text-soft-black/60 dark:text-dark-text/60"
                  style={{ fontFamily: 'var(--font-casual)' }}
                >
                  Watching together
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="px-4 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </motion.button>
            </div>

            {/* Video */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-16 text-center shadow-lg shadow-rose-500/5"
          >
            <span className="text-6xl block mb-4">🎬</span>
            <p
              className="text-soft-black/40 dark:text-dark-text/40"
              style={{ fontFamily: 'var(--font-casual)', fontSize: '1.1rem' }}
            >
              Paste a video link above to start watching together
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
