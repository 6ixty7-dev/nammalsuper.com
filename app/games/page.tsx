'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import UnauthorizedScreen from '@/components/UnauthorizedScreen';
import Navbar from '@/components/Navbar';
import FloatingHearts from '@/components/FloatingHearts';
import GamesPage from '@/components/GamesPage';

export default function Games() {
  const { user, isAllowed, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <LoginScreen />;
  if (!isAllowed) return <UnauthorizedScreen />;

  return (
    <div className="min-h-screen relative">
      <FloatingHearts />
      <Navbar />
      <main className="relative z-10">
        <GamesPage />
      </main>
    </div>
  );
}
