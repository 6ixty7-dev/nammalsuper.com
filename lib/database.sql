-- ============================================
-- 🗄️ OUR SPACE — DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Stores user info and partner linking
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  partner_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also trigger on sign-in to update avatar/name
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. MESSAGES TABLE (Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages (sender_email, receiver_email);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);

-- 3. LETTERS TABLE (recreate properly if needed)
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_letters_participants ON letters (sender, receiver);

-- 4. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL, -- 'this-or-that', 'truth-or-dare', 'rapid-fire'
  current_question INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GAME ANSWERS TABLE
CREATE TABLE IF NOT EXISTS game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  player_email TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_index, player_email)
);

-- ============================================
-- 🔒 ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles (we only have 2), update own
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- MESSAGES: Both participants can read/write
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (sender_email, receiver_email)
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = sender_email
  );

-- LETTERS: Both participants can read/write
DROP POLICY IF EXISTS "Users can view their letters" ON letters;
CREATE POLICY "Users can view their letters" ON letters
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (sender, receiver)
  );

DROP POLICY IF EXISTS "Users can send letters" ON letters;
CREATE POLICY "Users can send letters" ON letters
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = sender
  );

DROP POLICY IF EXISTS "Users can update letter read status" ON letters;
CREATE POLICY "Users can update letter read status" ON letters
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = receiver
  );

-- GAME SESSIONS: All authenticated users can CRUD
DROP POLICY IF EXISTS "Authenticated users can manage game sessions" ON game_sessions;
CREATE POLICY "Authenticated users can manage game sessions" ON game_sessions
  FOR ALL USING (auth.role() = 'authenticated');

-- GAME ANSWERS: All authenticated users can CRUD
DROP POLICY IF EXISTS "Authenticated users can manage game answers" ON game_answers;
CREATE POLICY "Authenticated users can manage game answers" ON game_answers
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 📡 ENABLE REALTIME
-- ============================================
-- Run these to enable realtime on the tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE letters;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;

-- ============================================
-- 🔗 LINK THE TWO PARTNERS
-- Update these emails to match your ALLOWED_USERS
-- ============================================
-- After both users have signed in at least once, run:
-- UPDATE profiles SET partner_email = 'glaniashajik@gmail.com' WHERE email = 'opstarlord521@gmail.com';
-- UPDATE profiles SET partner_email = 'opstarlord521@gmail.com' WHERE email = 'glaniashajik@gmail.com';
