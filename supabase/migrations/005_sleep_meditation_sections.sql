-- ============================================================================
-- Migration: 005_sleep_meditation_sections.sql
-- Description: Dynamic meditation & audio sections with custom pricing plans
--              and designated free vs paid audio items.
-- Additive only: Uses sleep_ prefix, respects existing tables.
-- ============================================================================

-- 1. Create sleep_sections table
CREATE TABLE IF NOT EXISTS public.sleep_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  section_type text NOT NULL DEFAULT 'meditation', -- 'meditation' | 'audiobook' | 'soundscape' | 'custom'
  pricing_type text NOT NULL DEFAULT 'standalone', -- 'free' | 'standalone' | 'subscription' | 'tiered'
  price_display text NOT NULL DEFAULT 'AED 49',
  price_aed text DEFAULT 'AED 49',
  price_usd text DEFAULT '$12.99',
  pricing_tagline text DEFAULT 'One-time access',
  badge text DEFAULT 'Meditation',
  apple_product_id text,
  google_product_id text,
  sort_order int DEFAULT 1,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create sleep_section_items table
CREATE TABLE IF NOT EXISTS public.sleep_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.sleep_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  description text,
  duration_seconds int DEFAULT 0,
  duration_formatted text DEFAULT '00:00',
  access text NOT NULL DEFAULT 'paid', -- 'free' | 'paid'
  audio_path text,
  audio_bucket text DEFAULT 'sleep-audio-pro', -- 'sleep-audio-free' | 'sleep-audio-pro'
  sort_order int DEFAULT 1,
  is_published boolean DEFAULT true,
  play_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add section_id to sleep_tracks (additive nullable FK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sleep_tracks' AND column_name = 'section_id'
  ) THEN
    ALTER TABLE public.sleep_tracks ADD COLUMN section_id uuid REFERENCES public.sleep_sections(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE public.sleep_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_section_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for sleep_sections
-- Public anonymous / authenticated can read published sections
DROP POLICY IF EXISTS "Public can view published sections" ON public.sleep_sections;
CREATE POLICY "Public can view published sections"
  ON public.sleep_sections
  FOR SELECT
  TO public
  USING (is_published = true);

-- Admins can do everything on sleep_sections
DROP POLICY IF EXISTS "Admins full access to sleep_sections" ON public.sleep_sections;
CREATE POLICY "Admins full access to sleep_sections"
  ON public.sleep_sections
  FOR ALL
  TO authenticated
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

-- 6. RLS Policies for sleep_section_items
-- Public can view published section items
DROP POLICY IF EXISTS "Public can view published section items" ON public.sleep_section_items;
CREATE POLICY "Public can view published section items"
  ON public.sleep_section_items
  FOR SELECT
  TO public
  USING (is_published = true);

-- Admins can do everything on sleep_section_items
DROP POLICY IF EXISTS "Admins full access to sleep_section_items" ON public.sleep_section_items;
CREATE POLICY "Admins full access to sleep_section_items"
  ON public.sleep_section_items
  FOR ALL
  TO authenticated
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

-- 7. Seed Initial Exemplar Sections & Audios
INSERT INTO public.sleep_sections (
  id, slug, title, subtitle, description, section_type, pricing_type, 
  price_display, price_aed, price_usd, pricing_tagline, badge, sort_order, is_published
) VALUES 
(
  'e1000000-0000-4000-8000-000000000001',
  'sleep-meditation',
  'Sleep Meditation',
  'Restorative guided practices for deep nervous system down-regulation',
  'Clinical somatic inductions designed to quiet cognitive loops and induce restorative delta sleep.',
  'meditation',
  'standalone',
  'AED 49',
  'AED 49',
  '$12.99',
  'Lifetime access to all sleep meditations',
  'Clinical Rest',
  1,
  true
),
(
  'e2000000-0000-4000-8000-000000000002',
  'meditation-women',
  'Meditation for Women',
  'Targeted cyclical rest, hormone balancing, and nighttime serenity',
  'Specialized nervous system grounding practices for hormonal shifts, luteal recovery, and feminine restoration.',
  'meditation',
  'standalone',
  'AED 59',
  'AED 59',
  '$15.99',
  'Complete series access + future updates',
  'Women Rest',
  2,
  true
),
(
  'e3000000-0000-4000-8000-000000000003',
  'audiobook',
  'Human 2.0 Audiobook',
  'The definitive 45-chapter neurological immersion and audio philosophy',
  'Chapter 1 free sample, full 45 chapters unlocked with standalone purchase or Sovereign membership.',
  'audiobook',
  'tiered',
  'AED 39',
  'AED 39',
  '$9.99',
  'All 45 Chapters · High bitrate offline audio',
  '45 Chapters',
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  price_display = EXCLUDED.price_display,
  price_aed = EXCLUDED.price_aed,
  price_usd = EXCLUDED.price_usd;

-- Seed Sample Audios for Sleep Meditation (Free & Paid)
INSERT INTO public.sleep_section_items (
  section_id, title, subtitle, duration_seconds, duration_formatted, access, audio_bucket, sort_order, is_published
) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'Introductory Sleep Descent', 'Free introductory somatic grounding', 600, '10:00', 'free', 'sleep-audio-free', 1, true),
  ('e1000000-0000-4000-8000-000000000001', 'Body Weighting & Delta Drop', 'Free neuromuscular release', 900, '15:00', 'free', 'sleep-audio-free', 2, true),
  ('e1000000-0000-4000-8000-000000000001', 'Vagus Nerve Reset for Insomnia', 'Deep autonomic parasympathetic shift', 1500, '25:00', 'paid', 'sleep-audio-pro', 3, true),
  ('e1000000-0000-4000-8000-000000000001', 'Yoga Nidra for Deep Awakening', 'Subconscious cleansing before slumber', 1800, '30:00', 'paid', 'sleep-audio-pro', 4, true),
  ('e1000000-0000-4000-8000-000000000001', 'Racing Mind Dissolution', 'Cognitive defusion for acute overthinking', 1200, '20:00', 'paid', 'sleep-audio-pro', 5, true)
ON CONFLICT DO NOTHING;

-- Seed Sample Audios for Meditation for Women (Free & Paid)
INSERT INTO public.sleep_section_items (
  section_id, title, subtitle, duration_seconds, duration_formatted, access, audio_bucket, sort_order, is_published
) VALUES
  ('e2000000-0000-4000-8000-000000000002', 'Luteal Phase Softening', 'Free hormonal evening grounding', 720, '12:00', 'free', 'sleep-audio-free', 1, true),
  ('e2000000-0000-4000-8000-000000000002', 'Emotional Vessel Release', 'Letting down the day emotional cargo', 1200, '20:00', 'paid', 'sleep-audio-pro', 2, true),
  ('e2000000-0000-4000-8000-000000000002', 'Adrenal Recovery & Deep Peace', 'Restoring cortisol rhythm overnight', 1500, '25:00', 'paid', 'sleep-audio-pro', 3, true),
  ('e2000000-0000-4000-8000-000000000002', 'Womb & Pelvic Breath Sanctum', 'Sacred feminine somatic unwinding', 1800, '30:00', 'paid', 'sleep-audio-pro', 4, true)
ON CONFLICT DO NOTHING;
