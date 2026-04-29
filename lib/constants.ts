// ============================================
// 🔐 ALLOWED USERS - Replace with your Gmail addresses
// ============================================
export const ALLOWED_USERS = [
  'opstarlord521@gmail.com',      // User 1 — You
  'glaniashajik@gmail.com',   // User 2 — Your Partner
];

// ============================================
// 💕 RELATIONSHIP CONFIG
// ============================================
export const RELATIONSHIP_START_DATE = new Date('2025-09-02T00:00:00');

export const COUPLE_NAMES = {
  user1: 'You',
  user2: 'Your Love',
};

export const SITE_CONFIG = {
  title: 'Our Space',
  tagline: 'A digital love story ✨',
  description: 'A private space for two souls',
};

// ============================================
// 📁 STORAGE PATHS
// ============================================
export const STORAGE_BUCKET = 'couple-memories';

export const STORAGE_PATHS = {
  memories: (month: string) => `/memories/${month}`,
  gallery: '/gallery',
  letters: '/letters',
};

// ============================================
// 📅 TIMELINE HELPER
// ============================================
export function getTimelineMonths(): { key: string; label: string; year: number; month: number }[] {
  const start = new Date(2025, 8); // September 2025
  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] = [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const current = new Date(start);
  while (current <= now) {
    const m = current.getMonth();
    const y = current.getFullYear();
    months.push({
      key: `${monthNames[m].toLowerCase()}-${y}`,
      label: monthNames[m],
      year: y,
      month: m,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// ============================================
// 🧭 NAVIGATION ITEMS
// ============================================
export const NAV_ITEMS = [
  { label: 'Home', href: '/', emoji: '🏠' },
  { label: 'Letters', href: '/letters', emoji: '💌' },
  { label: 'Watch', href: '/watch', emoji: '🎬' },
  { label: 'Games', href: '/games', emoji: '🎮' },
  { label: 'Gallery', href: '/gallery', emoji: '📸' },
];
