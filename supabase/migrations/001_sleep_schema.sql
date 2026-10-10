-- =============================================================================
-- Migration 001: Sleep Schema Foundation
-- Human 2.0 Sleep App (Admin & Content Management)
-- Strict naming convention: All tables, triggers, indexes, and functions prefixed with "sleep_"
-- Additive only: Does not modify or drop any existing tables
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable updated_at trigger helper
CREATE OR REPLACE FUNCTION public.sleep_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. SLEEP CATEGORIES
CREATE TABLE IF NOT EXISTS public.sleep_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sleep_trg_categories_updated_at
  BEFORE UPDATE ON public.sleep_categories
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 2. SLEEP TRACKS
CREATE TABLE IF NOT EXISTS public.sleep_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  category_id uuid REFERENCES public.sleep_categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  type_tag text,
  audio_engine_type text,
  duration_seconds int NOT NULL DEFAULT 0,
  access text NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  audio_path text,
  tags text[] DEFAULT '{}'::text[],
  is_featured_tonight boolean NOT NULL DEFAULT false,
  is_free_shelf boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  play_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sleep_idx_tracks_category_id ON public.sleep_tracks(category_id);
CREATE INDEX IF NOT EXISTS sleep_idx_tracks_slug ON public.sleep_tracks(slug);
CREATE INDEX IF NOT EXISTS sleep_idx_tracks_published ON public.sleep_tracks(is_published);

CREATE TRIGGER sleep_trg_tracks_updated_at
  BEFORE UPDATE ON public.sleep_tracks
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 3. SLEEP AUDIOBOOK CHAPTERS
CREATE TABLE IF NOT EXISTS public.sleep_audiobook_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number int UNIQUE NOT NULL,
  title text NOT NULL,
  part_number int NOT NULL,
  part_title text NOT NULL,
  duration_seconds int NOT NULL DEFAULT 0,
  duration_formatted text NOT NULL,
  description text,
  key_takeaway text,
  access text NOT NULL DEFAULT 'pro', -- 'free' for Ch 1, 'pro' for Ch 2-45
  audio_path text,
  is_published boolean NOT NULL DEFAULT true,
  play_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sleep_idx_audiobook_chapters_number ON public.sleep_audiobook_chapters(chapter_number);
CREATE INDEX IF NOT EXISTS sleep_idx_audiobook_chapters_published ON public.sleep_audiobook_chapters(is_published);

CREATE TRIGGER sleep_trg_audiobook_chapters_updated_at
  BEFORE UPDATE ON public.sleep_audiobook_chapters
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 4. SLEEP PLANS
CREATE TABLE IF NOT EXISTS public.sleep_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL, -- 'annual' | 'monthly' | 'audiobook_lifetime'
  name text NOT NULL,
  tagline text,
  price_display text NOT NULL,
  billing_period text NOT NULL, -- 'annual' | 'monthly' | 'lifetime'
  badge text,
  trial_text text,
  apple_product_id text,
  google_product_id text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sleep_trg_plans_updated_at
  BEFORE UPDATE ON public.sleep_plans
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 5. SLEEP SETTINGS
CREATE TABLE IF NOT EXISTS public.sleep_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sleep_trg_settings_updated_at
  BEFORE UPDATE ON public.sleep_settings
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 6. SLEEP ADMINS
CREATE TABLE IF NOT EXISTS public.sleep_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sleep_idx_admins_user_id ON public.sleep_admins(user_id);
CREATE INDEX IF NOT EXISTS sleep_idx_admins_email ON public.sleep_admins(email);

-- 7. SLEEP ENTITLEMENTS
CREATE TABLE IF NOT EXISTS public.sleep_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key text NOT NULL REFERENCES public.sleep_plans(key) ON DELETE RESTRICT ON UPDATE CASCADE,
  status text NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'expired'
  source text NOT NULL DEFAULT 'web', -- 'storekit' | 'play_billing' | 'stripe' | 'manual' | 'web'
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sleep_idx_entitlements_user_id ON public.sleep_entitlements(user_id);
CREATE INDEX IF NOT EXISTS sleep_idx_entitlements_status ON public.sleep_entitlements(status);

CREATE TRIGGER sleep_trg_entitlements_updated_at
  BEFORE UPDATE ON public.sleep_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.sleep_set_updated_at();

-- 8. SLEEP PLAY EVENTS (TELEMETRY)
CREATE TABLE IF NOT EXISTS public.sleep_play_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES public.sleep_tracks(id) ON DELETE SET NULL ON UPDATE CASCADE,
  chapter_id uuid REFERENCES public.sleep_audiobook_chapters(id) ON DELETE SET NULL ON UPDATE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  platform text NOT NULL DEFAULT 'web'
);

CREATE INDEX IF NOT EXISTS sleep_idx_play_events_track_id ON public.sleep_play_events(track_id);
CREATE INDEX IF NOT EXISTS sleep_idx_play_events_chapter_id ON public.sleep_play_events(chapter_id);
CREATE INDEX IF NOT EXISTS sleep_idx_play_events_played_at ON public.sleep_play_events(played_at);
