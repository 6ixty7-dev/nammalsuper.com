'use client';

import { motion } from 'framer-motion';
import { usePresence, formatLastSeen } from '@/hooks/usePresence';
import { usePartner } from '@/hooks/usePartner';

interface PresenceIndicatorProps {
  currentPage?: string;
  compact?: boolean;
}

export default function PresenceIndicator({ currentPage, compact = false }: PresenceIndicatorProps) {
  const { isPartnerOnline, partnerLastSeen, partnerCurrentPage } = usePresence(currentPage);
  const { partner } = usePartner();

  const partnerName = partner?.name || 'Your Love';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex h-2.5 w-2.5">
          {isPartnerOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPartnerOnline ? 'bg-green-400' : 'bg-warm-gray/40'}`} />
        </div>
        <span className="text-xs font-ui text-warm-gray">
          {isPartnerOnline ? `${partnerName} is here ❤️` : `Last seen ${formatLastSeen(partnerLastSeen)}`}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-md transition-all duration-500 ${
        isPartnerOnline
          ? 'bg-green-500/10 border-green-400/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]'
          : 'bg-white/5 border-white/10'
      }`}
    >
      {/* Avatar */}
      {partner?.avatar_url ? (
        <div className="relative">
          <img
            src={partner.avatar_url}
            alt={partnerName}
            className="w-7 h-7 rounded-full object-cover border border-white/20"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-night-bg ${
            isPartnerOnline ? 'bg-green-400' : 'bg-warm-gray/50'
          }`} />
        </div>
      ) : (
        <div className="relative flex h-3 w-3">
          {isPartnerOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isPartnerOnline ? 'bg-green-400' : 'bg-warm-gray/40'}`} />
        </div>
      )}

      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`font-ui text-sm tracking-wide ${isPartnerOnline ? 'text-green-300' : 'text-white/40'}`}>
          {isPartnerOnline ? (
            <>
              <span className="font-medium">{partnerName}</span> is online ❤️
            </>
          ) : (
            <>Last seen {formatLastSeen(partnerLastSeen)}</>
          )}
        </span>
        {isPartnerOnline && partnerCurrentPage && (
          <span className="text-[10px] text-white/30 font-ui">
            Viewing {partnerCurrentPage === '/' ? 'Home' : partnerCurrentPage.replace('/', '')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
