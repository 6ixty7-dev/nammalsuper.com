'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { usePresence } from '@/hooks/usePresence';
import { createClient } from '@/lib/supabase';

interface Message {
  id: string;
  sender_email: string;
  receiver_email: string;
  message: string;
  created_at: string;
}

export default function ChatSystem() {
  const { user } = useAuth();
  const { partner } = usePartner();
  const { isPartnerOnline } = usePresence('/chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [supabase] = useState(() => createClient());

  const partnerEmail = partner?.email || '';
  const partnerName = partner?.name || 'Your Love';

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!user?.email || !partnerEmail) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_email.eq.${user.email},receiver_email.eq.${partnerEmail}),and(sender_email.eq.${partnerEmail},receiver_email.eq.${user.email})`
        )
        .order('created_at', { ascending: true })
        .limit(200);

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
      setLoading(false);
    };

    fetchMessages();

    // Real-time subscription for new messages
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's relevant to this conversation
          if (
            (newMsg.sender_email === user.email && newMsg.receiver_email === partnerEmail) ||
            (newMsg.sender_email === partnerEmail && newMsg.receiver_email === user.email)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, partnerEmail, supabase, scrollToBottom]);

  // Typing indicator channel
  useEffect(() => {
    if (!user?.email) return;

    const typingChannel = supabase.channel('typing-indicator');

    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.email !== user.email) {
          setPartnerTyping(payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [user?.email, supabase]);

  // Handle typing broadcast
  const handleTyping = useCallback(() => {
    if (!user?.email) return;

    const typingChannel = supabase.channel('typing-indicator');

    if (!isTyping) {
      setIsTyping(true);
      // @ts-ignore
      if (typingChannel.state === 'joined') {
        typingChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { email: user.email, isTyping: true },
        });
      }
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2s
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // @ts-ignore
      if (typingChannel.state === 'joined') {
        typingChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { email: user.email, isTyping: false },
        });
      }
    }, 2000);
  }, [user?.email, isTyping, supabase]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.email || !partnerEmail) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    setIsTyping(false);
    const typingChannel = supabase.channel('typing-indicator');
    // @ts-ignore
    if (typingChannel.state === 'joined') {
      typingChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { email: user.email, isTyping: false },
      });
    }

    await supabase.from('messages').insert({
      sender_email: user.email,
      receiver_email: partnerEmail,
      message: messageText,
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const existingGroup = groups.find((g) => g.date === date);
    if (existingGroup) {
      existingGroup.msgs.push(msg);
    } else {
      groups.push({ date, msgs: [msg] });
    }
    return groups;
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 night-zone flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-display italic text-night-text mb-2 tracking-wide">
            Our Whispers
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              {isPartnerOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPartnerOnline ? 'bg-green-400' : 'bg-white/20'}`} />
            </div>
            <span className="font-ui text-sm text-white/50">
              {isPartnerOnline ? `${partnerName} is here` : `${partnerName} is away`}
            </span>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 glass-card rounded-3xl p-4 md:p-6 flex flex-col min-h-[50vh] max-h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 chat-scroll">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-3xl animate-pulse">💬</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                <span className="text-5xl mb-4">💌</span>
                <p className="font-handwriting text-xl">Start your first whisper...</p>
              </div>
            ) : (
              <>
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    {/* Date Separator */}
                    <div className="flex items-center gap-3 py-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs font-ui text-white/30 uppercase tracking-wider">{group.date}</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Messages */}
                    {group.msgs.map((msg, i) => {
                      const isMine = msg.sender_email === user?.email;
                      const showAvatar = i === 0 || group.msgs[i - 1].sender_email !== msg.sender_email;
                      const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                        >
                          <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm font-ui leading-relaxed ${
                                isMine
                                  ? 'bg-bloom-pink/20 text-bloom-pink border border-bloom-pink/20 rounded-br-md'
                                  : 'bg-white/8 text-white/90 border border-white/10 rounded-bl-md'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className="text-[10px] text-white/20 mt-1 px-1 font-ui">{time}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {partnerTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 mt-3 px-1"
                    >
                      <div className="flex gap-1 items-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 rounded-bl-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-white/25 font-ui">{partnerName} is typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="mt-4 flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Whisper something sweet..."
                className="w-full bg-white/5 border border-white/10 focus:border-bloom-pink/50 rounded-2xl px-5 py-3 outline-none text-white/90 font-ui text-sm transition-all placeholder:text-white/15"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-bloom-pink/20 border border-bloom-pink/30 flex items-center justify-center text-bloom-pink hover:bg-bloom-pink/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
