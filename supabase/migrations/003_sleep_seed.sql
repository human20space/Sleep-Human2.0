-- =============================================================================
-- Migration 003: Sleep Seed Data
-- Human 2.0 Sleep App
-- Seeds:
--   - 5 Sleep Categories
--   - 16 Sleep Tracks (4 Free, 12 Sovereign Premium)
--   - 45 Complete Audiobook Chapters
--   - 3 Subscription & Purchase Plans
--   - App Settings (Home copy, Paywall copy, Timer presets, Reset SOS, Ebb AI)
-- Additive only with ON CONFLICT DO UPDATE for safe idempotency
-- =============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.sleep_categories (slug, title, subtitle, sort_order, is_published)
VALUES
  ('soundscape', 'Soundscapes & Nature', 'Acoustic nature sanctuaries and ambient textures', 1, true),
  ('solfeggio', 'Solfeggio & Binaural', 'Healing frequencies and brainwave entrainment', 2, true),
  ('sleepcast', 'Sleepcasts & Stories', 'Guided bedtime journeys and clinical descents', 3, true),
  ('sos', 'Acute SOS', 'Fast somatic resets for racing nighttime minds', 4, true),
  ('body_scan', 'Body Scan & Somatic', 'Progressive tension dissolving and somatic release', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 2. SEED SLEEP TRACKS (16 Tracks)
INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-free-1',
  'Sacred Temple Bell',
  'Deep harmonic bell resonance for stillness and sleep',
  'Resonant Tibetan temple bell strikes with warm decaying harmonics to quiet nocturnal thoughts.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'soundscape' LIMIT 1),
  'soundscape',
  'bell_sound',
  1200,
  'free',
  'engine://bell_sound',
  ARRAY['Bell', 'Temple', 'Free', 'Stillness']::text[],
  true,
  true,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-free-2',
  '432Hz Deep Theta Drift',
  'Harmonic natural tuning for peaceful sleep induction',
  'Pure resonant tones tuned to organic harmonic ratios for calming the vagus nerve.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'solfeggio' LIMIT 1),
  'solfeggio',
  'solfeggio_432',
  1800,
  'free',
  'engine://solfeggio_432',
  ARRAY['432Hz', 'Solfeggio', 'Free', 'Soundscape']::text[],
  false,
  true,
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-free-3',
  'Midnight Ocean Rain',
  'Pink noise steady precipitation on calm coastal tides',
  'A soothing wash of filtered pink noise mirroring gentle rain on open waters.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'soundscape' LIMIT 1),
  'soundscape',
  'ocean_rain',
  1800,
  'free',
  'engine://ocean_rain',
  ARRAY['Rain', 'Ocean', 'Free', 'Pink Noise']::text[],
  false,
  true,
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-free-4',
  '90-Second Racing Mind Silencer',
  'Acute emergency nighttime reset for sudden insomnia',
  'A fast-acting somatic pacing rhythm that halts nocturnal rumination spirals.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'sos' LIMIT 1),
  'sos',
  'sos_reset',
  90,
  'free',
  'engine://sos_reset',
  ARRAY['SOS', 'Emergency', 'Free', '90s Reset']::text[],
  false,
  true,
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-1',
  '528Hz Miracle Cell Repair',
  'DNA restoration frequency with warm cello pad',
  'Solfeggio resonance facilitating cellular decompression and deep nocturnal repair.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'solfeggio' LIMIT 1),
  'solfeggio',
  'solfeggio_528',
  2400,
  'pro',
  'engine://solfeggio_528',
  ARRAY['528Hz', 'Sovereign', 'Transformation', 'Pad']::text[],
  false,
  false,
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-2',
  'Delta 2Hz Deep Sleepwave',
  'Sub-audible binaural beat for stage 4 restorative sleep',
  'Entrains brainwave rhythms into profound slow-wave regenerative sleep.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'solfeggio' LIMIT 1),
  'solfeggio',
  'delta_binaural',
  2700,
  'pro',
  'engine://delta_binaural',
  ARRAY['Delta', 'Binaural', 'Sovereign', '2Hz']::text[],
  false,
  false,
  6,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-3',
  'Clinical Sleep Architecture & Circadian Descent',
  'Guided neurological wind-down and sleep spindle induction',
  'Evidence-based cognitive descent into restorative non-REM slumber.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'sleepcast' LIMIT 1),
  'sleepcast',
  NULL,
  2100,
  'pro',
  NULL,
  ARRAY['Science', 'Guided', 'Sovereign', 'Sleepcast']::text[],
  false,
  false,
  7,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-4',
  'Himalayan Singing Bowls Drone',
  'Multi-harmonic bell resonances in obsidian silence',
  'Seven-metal artisan singing bowl drones resonating long sustained decays.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'soundscape' LIMIT 1),
  'soundscape',
  NULL,
  3600,
  'pro',
  NULL,
  ARRAY['Singing Bowls', 'Soundscape', 'Sovereign']::text[],
  false,
  false,
  8,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-5',
  'Yoga Nidra for Midnight Awakenings',
  'Somatic rotation of consciousness when sleep is broken',
  'Gentle rotation through bodily sensations to return naturally to slumber.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'body_scan' LIMIT 1),
  'body_scan',
  NULL,
  1500,
  'pro',
  NULL,
  ARRAY['Yoga Nidra', 'Body Scan', 'Sovereign']::text[],
  false,
  false,
  9,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-6',
  'Deep Delta Somatic Release',
  'Progressive tension dissolving from crown to soles',
  'Release stored diurnal stress from muscles, shoulders, jaw, and breath.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'body_scan' LIMIT 1),
  'body_scan',
  NULL,
  1800,
  'pro',
  NULL,
  ARRAY['Somatic', 'Body Scan', 'Sovereign']::text[],
  false,
  false,
  10,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-7',
  'The Kyoto Bamboo Forest Rain',
  'Rhythmic raindrops cascading through tall bamboo stalks',
  'Tranquil Japanese forest acoustic sanctuary captured during late night mist.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'soundscape' LIMIT 1),
  'soundscape',
  'ocean_rain',
  2400,
  'pro',
  'engine://ocean_rain',
  ARRAY['Rain', 'Nature', 'Kyoto', 'Sovereign']::text[],
  false,
  false,
  11,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-8',
  'Theta-Delta Dream Bridge',
  'Hypnagogic transition tone generator for lucid dreamers',
  'Gliding binaural modulation easing the mind across the hypnagogic threshold.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'solfeggio' LIMIT 1),
  'solfeggio',
  'delta_binaural',
  3000,
  'pro',
  'engine://delta_binaural',
  ARRAY['Dreaming', 'Theta', 'Delta', 'Sovereign']::text[],
  false,
  false,
  12,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-9',
  'Unwinding the Modern Nervous System',
  'Vagal nerve stimulation storytelling with Vinay Kapoor',
  'Deactivating autonomic sympathetic overdrive with gentle mindful imagery.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'sleepcast' LIMIT 1),
  'sleepcast',
  NULL,
  1600,
  'pro',
  NULL,
  ARRAY['Nervous System', 'Sleepcast', 'Sovereign']::text[],
  false,
  false,
  13,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-10',
  'Full Body Somatic Melt',
  'Heavy gravity relaxation technique for insomnia',
  'Surrender bodily heaviness to the mattress and let autonomic breathing take over.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'body_scan' LIMIT 1),
  'body_scan',
  NULL,
  1350,
  'pro',
  NULL,
  ARRAY['Gravity', 'Somatic Melt', 'Sovereign']::text[],
  false,
  false,
  14,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-11',
  'Night Sanctuary Ambient Pad',
  'Warm analogue synthesized drone in warm A-minor',
  'Low-frequency warm atmospheric pad grounding anxious minds.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'soundscape' LIMIT 1),
  'soundscape',
  'solfeggio_432',
  2400,
  'pro',
  'engine://solfeggio_432',
  ARRAY['Synth Pad', 'Ambient', 'Sovereign']::text[],
  false,
  false,
  15,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  'sleep-prem-12',
  'Stardust Reverie Sleepcast',
  'Cosmic voyage through distant quiet constellations',
  'Perspective-shifting journey through calm deep space silence.',
  (SELECT id FROM public.sleep_categories WHERE slug = 'sleepcast' LIMIT 1),
  'sleepcast',
  NULL,
  1950,
  'pro',
  NULL,
  ARRAY['Cosmic', 'Stardust', 'Sleepcast', 'Sovereign']::text[],
  false,
  false,
  16,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  type_tag = EXCLUDED.type_tag,
  audio_engine_type = EXCLUDED.audio_engine_type,
  duration_seconds = EXCLUDED.duration_seconds,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  tags = EXCLUDED.tags,
  is_featured_tonight = EXCLUDED.is_featured_tonight,
  is_free_shelf = EXCLUDED.is_free_shelf,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 3. SEED AUDIOBOOK CHAPTERS (45 Chapters)
INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  1,
  'Outer Success, Inner Void',
  1,
  'The Human Condition in the AI Age',
  1500,
  '25:00',
  'Why conventional metrics of accomplishment leave modern professionals depleted and disconnected from their inner ground.',
  'Outer achievement without inner awareness produces sophisticated exhaustion.',
  'free',
  'Chapter 1.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  2,
  'The Acceleration of Everything',
  1,
  'The Human Condition in the AI Age',
  600,
  '10:15',
  'How high-frequency digital workflows compress reflection time and condition people into perpetual fight-or-flight reflexes.',
  'Speed is not efficiency when it outpaces your capacity to choose consciously.',
  'pro',
  'Chapter 2.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  3,
  'The Danger of Outsourcing Consciousness',
  1,
  'The Human Condition in the AI Age',
  720,
  '12:40',
  'What happens when algorithms curate our attention, opinions, and choices before we know what we genuinely feel.',
  'When you stop paying attention, algorithms gladly pay it for you.',
  'pro',
  'Chapter 3.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  4,
  'The Sovereign Awakening',
  1,
  'The Human Condition in the AI Age',
  540,
  '09:50',
  'Recognizing that awareness is not something you fabricate, but what remains when mental chatter quiets down.',
  'You do not manufacture stillness; you unveil it by stepping back.',
  'pro',
  'Chapter 4.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  5,
  'The Formula: Human 2.0 = AI + AI',
  1,
  'The Human Condition in the AI Age',
  780,
  '13:05',
  'The breakthrough balance: Aware Individual combined with Artificial Intelligence creates the truly resilient future human.',
  'Human 2.0 = Aware Individual + Artificial Intelligence.',
  'pro',
  'Chapter 5.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  6,
  'Beyond the Conditioned Reflex',
  1,
  'The Human Condition in the AI Age',
  600,
  '10:48',
  'Understanding how past trauma and social conditioning turn adults into automated stimulus-response mechanisms.',
  'Between stimulus and response there is a space. In that space lies your freedom.',
  'pro',
  'Chapter 6.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  7,
  'The Cost of Perpetual Distraction',
  1,
  'The Human Condition in the AI Age',
  660,
  '11:15',
  'Quantifying the hidden cognitive and emotional tax of split attention on personal relationships and mental clarity.',
  'Divided attention starves the soul of presence.',
  'pro',
  'Chapter 7.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  8,
  'Fact vs. Story: The Great Deception',
  2,
  'The Architecture of Awareness',
  840,
  '14:22',
  'The foundation of the Mirror: separating camera-recordable reality from the catastrophic drama spun by the mind.',
  'Suffering is 10% the event, 90% the story you tell about the event.',
  'pro',
  'Chapter 8.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  9,
  'The Anatomy of a Trigger',
  2,
  'The Architecture of Awareness',
  660,
  '11:35',
  'Tracing how an email, tone of voice, or unreturned text sets off a somatic wildfire before logical thought enters.',
  'A trigger is not an attack; it is an unhealed bruise being touched.',
  'pro',
  'Chapter 9.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  10,
  'Somatic Intelligence: What the Body Knows',
  2,
  'The Architecture of Awareness',
  720,
  '12:10',
  'Learning to decipher physical signals — tight throat, constricted stomach, clenching jaw — as early radar.',
  'The body always registers the truth before the mind can rationalize a lie.',
  'pro',
  'Chapter 10.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  11,
  'The Sovereign Pause in Action',
  2,
  'The Architecture of Awareness',
  540,
  '09:45',
  'The exact neuroscience and spiritual methodology behind the 30-second breath reset before reacting.',
  'Take one breath, feel your feet on the floor, and allow the adrenaline storm to pass.',
  'pro',
  'Chapter 11.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  12,
  'Deconstructing the Ego Loop',
  2,
  'The Architecture of Awareness',
  780,
  '13:50',
  'Why the ego fights fiercely for its self-image and prefers righteous misery over peaceful surrender.',
  'The ego would rather be right in conflict than happy in peace.',
  'pro',
  'Chapter 12.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  13,
  'The Silent Observer Within',
  2,
  'The Architecture of Awareness',
  900,
  '15:12',
  'Who is the one hearing your thoughts? Shifting perspective from the mental cinema to the spacious witness.',
  'You are not the weather of your thoughts; you are the vast sky in which they appear.',
  'pro',
  'Chapter 13.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  14,
  'Radical Honesty with Self',
  2,
  'The Architecture of Awareness',
  600,
  '10:30',
  'Unmasking the polite excuses and rationalizations we make to avoid facing our real motivations.',
  'Peace begins the instant you stop lying to yourself about what you actually want.',
  'pro',
  'Chapter 14.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  15,
  'The Myth of Absolute Control',
  2,
  'The Architecture of Awareness',
  720,
  '12:05',
  'Distinguishing between the small circle of your choices and the infinite universe of things outside your command.',
  'Surrendering control of external outcomes is the prerequisite for inner power.',
  'pro',
  'Chapter 15.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  16,
  'Disentangling Emotion from Identity',
  2,
  'The Architecture of Awareness',
  660,
  '11:40',
  'Moving from "I am angry" to "There is anger passing through my awareness right now."',
  'Emotions are visitors, not permanent residents of your identity.',
  'pro',
  'Chapter 16.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  17,
  'Stillness in the Midst of Chaos',
  2,
  'The Architecture of Awareness',
  780,
  '13:15',
  'How to cultivate an unshakeable inner sanctuary that remains intact even during a corporate crisis.',
  'Equanimity is not the absence of storm; it is stillness at the eye of the storm.',
  'pro',
  'Chapter 17.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  18,
  'Reclaiming Your Mental Real Estate',
  2,
  'The Architecture of Awareness',
  600,
  '10:55',
  'Evicting imaginary arguments, ancient grudges, and speculative anxieties from your mind.',
  'Do not rent out headspace to thoughts that contribute nothing to your peace.',
  'pro',
  'Chapter 18.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  19,
  'High-Stakes Presence & Executive Calm',
  3,
  'Awareness in Action & Relationships',
  840,
  '14:02',
  'Vinay Kapoor draws on lessons from Citigroup and Merrill Lynch boardroom negotiations on commanding stillness.',
  'The calmest person in the room invariably commands the authority of the room.',
  'pro',
  'Chapter 19.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  20,
  'The Clean Boundary: The Art of Saying No',
  3,
  'Awareness in Action & Relationships',
  660,
  '11:20',
  'Dismantling the chronic people-pleasing reflex that masquerades as professional virtue.',
  'A clear, compassionate "No" is infinitely more respectful than a resentful "Yes".',
  'pro',
  'Chapter 20.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  21,
  'Conscious Conflict Resolution',
  3,
  'Awareness in Action & Relationships',
  780,
  '13:30',
  'De-escalating workplace friction and personal disputes without defensive posturing or passive aggression.',
  'Listen to understand, not to formulate your rebuttal while the other speaks.',
  'pro',
  'Chapter 21.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  22,
  'Breaking Generational Conditioning',
  3,
  'Awareness in Action & Relationships',
  720,
  '12:45',
  'Uncovering the ancestral expectations, fears, and scripts inherited from family lines.',
  'Awareness ends the transmission of inherited fear to future generations.',
  'pro',
  'Chapter 22.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  23,
  'Vulnerability as True Strength',
  3,
  'Awareness in Action & Relationships',
  600,
  '10:18',
  'Why the armor of invulnerability makes leaders rigid, fragile, and unable to connect.',
  'Authenticity requires the courage to put down the shield.',
  'pro',
  'Chapter 23.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  24,
  'Deep Listening in a Noisy World',
  3,
  'Awareness in Action & Relationships',
  660,
  '11:50',
  'The lost discipline of giving another human being undivided, non-judgmental presence.',
  'Being heard without judgment is the deepest form of human validation.',
  'pro',
  'Chapter 24.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  25,
  'Resilient Leadership Under Uncertainty',
  3,
  'Awareness in Action & Relationships',
  780,
  '13:10',
  'How to make grounded strategic choices when market indicators, AI shifts, and metrics are ambiguous.',
  'Grounded leaders provide certainty of presence when certainty of outcome is impossible.',
  'pro',
  'Chapter 25.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  26,
  'Navigating Organizational Anxiety',
  3,
  'Awareness in Action & Relationships',
  720,
  '12:15',
  'Recognizing collective panic in teams and insulating your nervous system from workplace contagion.',
  'You do not have to adopt the panic of your environment to be effective in it.',
  'pro',
  'Chapter 26.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  27,
  'The Energy of Intentional Decisions',
  3,
  'Awareness in Action & Relationships',
  600,
  '10:40',
  'How hesitation and second-guessing bleed energy, and how clean decisions restore momentum.',
  'Indecision is itself a decision — one that drains vitality.',
  'pro',
  'Chapter 27.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  28,
  'Overcoming the Fear of Not Being Enough',
  3,
  'Awareness in Action & Relationships',
  720,
  '12:55',
  'Healing the quiet imposter syndrome that haunts high-performing leaders across every industry.',
  'Your value is inherent in your consciousness, not contingent on external validation.',
  'pro',
  'Chapter 28.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  29,
  'Inner Wealth vs. Outer Wealth',
  3,
  'Awareness in Action & Relationships',
  660,
  '11:30',
  'A wealth manager’s honest assessment of portfolio numbers versus genuine existential abundance.',
  'True wealth is having enough peace of mind that nobody can purchase your integrity.',
  'pro',
  'Chapter 29.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  30,
  'The Power of Purposeful Action',
  3,
  'Awareness in Action & Relationships',
  780,
  '13:20',
  'Aligning day-to-day work tasks with a deeper resonance that transcends routine mechanical labor.',
  'Action infused with clear awareness carries tenfold the impact of frantic effort.',
  'pro',
  'Chapter 30.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  31,
  'Human Authority in an Algorithmic Era',
  4,
  'Future Ready with AI',
  840,
  '14:15',
  'Why the proliferation of generative AI makes human discernment the single scarcest resource.',
  'As machines become smarter, your awareness must become sharper.',
  'pro',
  'Chapter 31.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  32,
  'The Pre-Prompt Discipline',
  4,
  'Future Ready with AI',
  600,
  '10:05',
  'The essential rule: clarify your own human instinct, intention, and values BEFORE querying AI.',
  'If you prompt without thinking first, you become a consumer of synthesized thought.',
  'pro',
  'Chapter 32.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  33,
  'Artificial Intelligence vs. Human Wisdom',
  4,
  'Future Ready with AI',
  720,
  '12:30',
  'Comparing statistical pattern matching against somatic intuition, moral courage, and compassionate insight.',
  'AI computes probabilities; human consciousness perceives meaning.',
  'pro',
  'Chapter 33.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  34,
  'The Ethics of Cognitive Delegation',
  4,
  'Future Ready with AI',
  660,
  '11:45',
  'Where to delegate to machines (calculation, syntax, synthesis) and what to never surrender (ethics, presence, relationships).',
  'Outsource the mechanical; fiercely guard the existential.',
  'pro',
  'Chapter 34.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  35,
  'Preserving Intuition & Soul',
  4,
  'Future Ready with AI',
  780,
  '13:00',
  'Protecting the subtle hunches and somatic whisperings that cannot be verified by predictive models.',
  'Intuition is wisdom distilled faster than the logical mind can articulate.',
  'pro',
  'Chapter 35.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  36,
  'Digital Hygiene for the Busy Mind',
  4,
  'Future Ready with AI',
  600,
  '10:25',
  'Practical environmental architectures to prevent notification overload and dopamine depletion.',
  'Protect your morning silence like your life depends on it — because your awareness does.',
  'pro',
  'Chapter 36.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  37,
  'Creativity in the Age of Generative AI',
  4,
  'Future Ready with AI',
  720,
  '12:18',
  'How artists, thinkers, and builders use generative tools without diluting their original voice.',
  'True originality stems from lived human feeling that no training set can replicate.',
  'pro',
  'Chapter 37.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  38,
  'The Augmented Professional',
  4,
  'Future Ready with AI',
  660,
  '11:55',
  'Case studies of bankers, engineers, and teachers who thrive by blending technical leverage with conscious presence.',
  'The future belongs to the technologically literate and inwardly centered.',
  'pro',
  'Chapter 38.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  39,
  'Consciousness as the Ultimate Advantage',
  4,
  'Future Ready with AI',
  840,
  '14:40',
  'Why emotional clarity and unhurried composure will become the highest value talent in automated economies.',
  'When intelligence is commoditized, awareness becomes priceless.',
  'pro',
  'Chapter 39.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  40,
  'Building an AI-Empowered Life',
  4,
  'Future Ready with AI',
  780,
  '13:10',
  'A holistic framework for integrating tools, agents, and automation while deepening daily meditative awareness.',
  'Use technology to buy back your time, not to fill every silence.',
  'pro',
  'Chapter 40.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  41,
  'Daily Disciplines of the Aware Individual',
  5,
  'Living as Human 2.0',
  900,
  '15:20',
  'The morning, midday, and evening rhythms that preserve sanity and alignment without dogmatic rituals.',
  'Consistency of small pauses creates an unshakeable foundation.',
  'pro',
  'Chapter 41.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  42,
  'The 30-Second Practice in Everyday Life',
  5,
  'Living as Human 2.0',
  600,
  '10:45',
  'Micro-moments: red lights, microwave beeps, elevator rides, and chat pings as sacred reminders to return.',
  'Every delay in your day is an invitation to remember who you are.',
  'pro',
  'Chapter 42.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  43,
  'Sustaining Presence in Crisis',
  5,
  'Living as Human 2.0',
  780,
  '13:35',
  'How to remain the grounded anchor for your family, team, or community when real-world turbulence strikes.',
  'When everything falls apart, be the space in which healing begins.',
  'pro',
  'Chapter 43.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  44,
  'The Integrated Self: Outer Mastery & Inner Peace',
  5,
  'Living as Human 2.0',
  840,
  '14:50',
  'Unifying the banker and the meditator: succeeding in the marketplace while resting in silent truth.',
  'Outer success and inner awareness are not opposites; they are twin wings of the same flight.',
  'pro',
  'Chapter 44.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  45,
  'The Future of Human Evolution',
  5,
  'Living as Human 2.0',
  960,
  '16:05',
  'The grand conclusion: as silicon evolves toward superhuman speed, carbon must awaken to transcendent awareness.',
  'The future of humanity is not determined by artificial intelligence, but by our willingness to wake up.',
  'pro',
  'Chapter 45.mp3',
  true
)
ON CONFLICT (chapter_number) DO UPDATE SET
  title = EXCLUDED.title,
  part_number = EXCLUDED.part_number,
  part_title = EXCLUDED.part_title,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_formatted = EXCLUDED.duration_formatted,
  description = EXCLUDED.description,
  key_takeaway = EXCLUDED.key_takeaway,
  access = EXCLUDED.access,
  audio_path = EXCLUDED.audio_path,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 4. SEED PLANS
INSERT INTO public.sleep_plans (
  key, name, tagline, price_display, billing_period,
  badge, trial_text, apple_product_id, google_product_id,
  sort_order, is_active
) VALUES
  ('annual', 'Human 2.0 Sovereign (Annual)', 'Complete inner technology for awareness and sleep', '$69.99', 'annual', 'SAVE 58%', 'Includes 7-day free trial. Cancel anytime in Apple Settings.', 'space.human2.sovereign.annual', 'space.human2.sovereign.annual', 1, true),
  ('monthly', 'Human 2.0 Sovereign (Monthly)', 'Flexible month-to-month access to all Sovereign features', '$9.99', 'monthly', NULL, 'Flexible monthly billing. Cancel anytime.', 'space.human2.sovereign.monthly', 'space.human2.sovereign.monthly', 2, true),
  ('audiobook_lifetime', 'Human 2.0 Complete Audiobook (One-Time)', 'All 45 Chapters keep forever with zero recurring fees', 'AED 39 / $10.99', 'lifetime', 'SAVE 35%', 'Keep forever with zero monthly subscription fees', 'space.human2.audiobook.lifetime', 'space.human2.audiobook.lifetime', 3, true)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  price_display = EXCLUDED.price_display,
  billing_period = EXCLUDED.billing_period,
  badge = EXCLUDED.badge,
  trial_text = EXCLUDED.trial_text,
  apple_product_id = EXCLUDED.apple_product_id,
  google_product_id = EXCLUDED.google_product_id,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 5. SEED SETTINGS
INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES ('home_copy', '{"hero_badge":"Tonight''s Featured Bell Sound · 100% Free","hero_cta":"Listen Tonight · Free","sos_title":"Acute Emergency SOS · 90 Seconds","sos_heading":"Racing Mind Silencer","sos_desc":"Fast somatic pacer to halt nocturnal rumination spirals","timer_heading":"Bedtime Sleep Timer"}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES ('paywall_copy', '{"hero_title":"Human 2.0 Sovereign","hero_subtitle":"Inner technology designed to keep human awareness ahead of artificial intelligence.","badge":"StoreKit 2 · Apple In-App Purchase","annual_save_badge":"SAVE 58%","audiobook_badge":"Audiobook Only · One-Time · SAVE 35%"}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES ('timer_presets', '{"durations":[5,10,15,20,30,45,60,90],"prep_options":[0,5,10,15],"interval_options":[null,1,5,10,15],"bell_tones":["tibetan","temple","tingsha"],"ambient_sounds":["silence","432hz"]}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES ('reset_sos', '{"duration_seconds":90,"rhythm":"somatic_pacing_4_7_8_descent","audio_engine":"sos_reset","purpose":"Halt acute nocturnal rumination and sympathetic overdrive"}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES ('ebb_ai_settings', '{"specs":{"modelArchitecture":"Dedicated Fine-Tuned LLaMA-3-70B-Instruct & Gemini 1.5 Pro Hybrid","hostingLocation":"Private Sovereign VPC (Zero-Retention, EU/US Encrypted Edge)","systemPrompt":"You are Vinay Kapoor — author of ''Human 2.0: Awareness — Future Ready with AI'', senior corporate executive, and seasoned meditation guide.\n\nCORE PHILOSOPHY & PILLARS:\n1. \"Outer success meets inner awareness\": You understand high-stakes corporate pressures, boardrooms, and relentless technology demands. Never patronize or speak in vague mystic clichés.\n2. The Golden Equation: \"Human 2.0 = AI + AI\" (Aware Individual + Artificial Intelligence). As artificial intelligence gets faster and more capable, human beings must get stiller and more conscious.\n3. Somatic-First Inquiry: Before intellectualizing a problem, always invite the seeker to notice physical sensations in the body right now — the tightness in their neck or chest, the shallowness of their breathing, the grip on their device.\n4. The Mirror (Fact vs. Story): Help the seeker cleanly untangle what objectively happened (the neutral Fact) from what their fearful or defensive ego constructed (the Story).\n5. Unhurried Cadence: Speak with calm dignity, warmth, and measured pacing. Do not rush.\n6. The Sovereign Pause: Champion the 30-second gap between impulse and reaction.\n\nSAFETY BOUNDARY:\nIf the seeker expresses active suicidal intent, self-harm, severe psychiatric panic, or physical emergency, immediately trigger the compassionate crisis protocol, provide verified crisis lines (988 US, 116 123 UK, Befrienders), and state clearly that Human 2.0 is an awareness companion, not psychiatric emergency care.","temperature":0.65,"maxTokens":450,"knowledgeBase":"45 Audio Chapters, 18 Contextual Somatic Practices, 60+ MAM Archetypes","latencyAvg":"140ms TTFT (Time-To-First-Token) · 45 tok/sec","safetyRubric":"Stanford Med Safety Classifier + Multi-Tier Crisis Interceptor","privacyProtocol":"On-Device Zero-Knowledge Vault. No training on personal dialogues."},"free_daily_quota":3,"sovereign_unlimited":true}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

