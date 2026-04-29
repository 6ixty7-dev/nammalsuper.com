'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import ReactPlayer from 'react-player';

export default function WatchTogether() {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedTime, setPlayedTime] = useState(0);
  const [isPartnerPresent, setIsPartnerPresent] = useState(false);
  const playerRef = useRef<any>(null);
  const isInternalChange = useRef(false);
  const supabase = createClient();
  const room = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    room.current = supabase.channel('watch-together', {
      config: { presence: { key: user.email } },
    });

    room.current
      .on('presence', { event: 'sync' }, () => {
        const state = room.current.state;
        const users = Object.keys(state);
        setIsPartnerPresent(users.length > 1);
      })
      .on('broadcast', { event: 'video-state' }, ({ payload }: any) => {
        if (payload.sender === user.email) return;

        isInternalChange.current = true;
        if (payload.type === 'load') {
          setVideoUrl(payload.url);
        } else if (payload.type === 'play') {
          setIsPlaying(true);
        } else if (payload.type === 'pause') {
          setIsPlaying(false);
        } else if (payload.type === 'seek') {
          playerRef.current?.seekTo(payload.time, 'seconds');
        }
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await room.current.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(room.current);
    };
  }, [user, supabase]);

  const broadcast = (payload: any) => {
    if (!room.current) return;
    room.current.send({
      type: 'broadcast',
      event: 'video-state',
      payload: { ...payload, sender: user?.email },
    });
  };

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    setVideoUrl(inputUrl);
    broadcast({ type: 'load', url: inputUrl });
    setInputUrl('');
  };

  const handlePlay = () => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setIsPlaying(true);
    broadcast({ type: 'play', time: playedTime });
  };

  const handlePause = () => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setIsPlaying(false);
    broadcast({ type: 'pause', time: playedTime });
  };

  const handleSeek = (seconds: number) => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    broadcast({ type: 'seek', time: seconds });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 night-zone">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-display italic text-night-text mb-4 tracking-wide">
            Shared Screen
          </h1>
          <p className="font-handwriting text-xl text-bloom-pink/80">
            distance means so little
          </p>
        </motion.div>

        {/* Status indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <div className={`px-6 py-2 rounded-full border ${isPartnerPresent ? 'bg-bloom-pink/10 border-bloom-pink/30 text-bloom-pink' : 'bg-white/5 border-white/10 text-white/40'} flex items-center gap-3 backdrop-blur-md transition-colors duration-500`}>
            <div className="relative flex h-3 w-3">
              {isPartnerPresent && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bloom-pink opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPartnerPresent ? 'bg-bloom-pink' : 'bg-white/20'}`}></span>
            </div>
            <span className="font-ui text-sm uppercase tracking-wider">
              {isPartnerPresent ? 'Your love is here' : 'Waiting for partner...'}
            </span>
          </div>
        </motion.div>

        {/* Input area */}
        <motion.form 
          onSubmit={handleLoad}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 mb-8 shimmer-glass"
        >
          <input
            type="text"
            placeholder="Paste a YouTube link here..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent border-b border-white/10 focus:border-amber-glow px-4 py-2 outline-none text-night-text font-ui transition-colors placeholder:text-white/20"
          />
          <button type="submit" className="btn-primary shrink-0 bg-amber-glow text-night-bg hover:shadow-[0_0_20px_rgba(240,192,64,0.4)]">
            Sync Video
          </button>
        </motion.form>

        {/* Video Player */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl overflow-hidden aspect-video shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-t border-white/20 relative"
        >
          {videoUrl ? (() => {
            const Player = ReactPlayer as any;
            return (
              <Player
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={true}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                onProgress={(p: any) => setPlayedTime(p.playedSeconds)}
                config={{
                  youtube: {
                    disablekb: 1,
                  },
                }}
              />
            );
          })() : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 bg-black/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-white/20">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
                <rect x="3" y="6" width="12" height="12" rx="2" ry="2" />
              </svg>
              <p className="font-ui uppercase tracking-widest text-sm">Waiting for a link...</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
