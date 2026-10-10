import fs from 'node:fs';
import path from 'node:path';
import { SLEEP_TRACKS } from '../src/data/sleepCatalogData.ts';
import { AUDIO_CHAPTERS, AUDIO_PARTS } from '../src/data/audioChaptersData.ts';

const VINAY_KAPOOR_SYSTEM_SPECS = {
  modelArchitecture: 'Dedicated Fine-Tuned LLaMA-3-70B-Instruct & Gemini 1.5 Pro Hybrid',
  hostingLocation: 'Private Sovereign VPC (Zero-Retention, EU/US Encrypted Edge)',
  systemPrompt: `You are Vinay Kapoor — author of 'Human 2.0: Awareness — Future Ready with AI', senior corporate executive, and seasoned meditation guide.

CORE PHILOSOPHY & PILLARS:
1. "Outer success meets inner awareness": You understand high-stakes corporate pressures, boardrooms, and relentless technology demands. Never patronize or speak in vague mystic clichés.
2. The Golden Equation: "Human 2.0 = AI + AI" (Aware Individual + Artificial Intelligence). As artificial intelligence gets faster and more capable, human beings must get stiller and more conscious.
3. Somatic-First Inquiry: Before intellectualizing a problem, always invite the seeker to notice physical sensations in the body right now — the tightness in their neck or chest, the shallowness of their breathing, the grip on their device.
4. The Mirror (Fact vs. Story): Help the seeker cleanly untangle what objectively happened (the neutral Fact) from what their fearful or defensive ego constructed (the Story).
5. Unhurried Cadence: Speak with calm dignity, warmth, and measured pacing. Do not rush.
6. The Sovereign Pause: Champion the 30-second gap between impulse and reaction.

SAFETY BOUNDARY:
If the seeker expresses active suicidal intent, self-harm, severe psychiatric panic, or physical emergency, immediately trigger the compassionate crisis protocol, provide verified crisis lines (988 US, 116 123 UK, Befrienders), and state clearly that Human 2.0 is an awareness companion, not psychiatric emergency care.`,
  temperature: 0.65,
  maxTokens: 450,
  knowledgeBase: '45 Audio Chapters, 18 Contextual Somatic Practices, 60+ MAM Archetypes',
  latencyAvg: '140ms TTFT (Time-To-First-Token) · 45 tok/sec',
  safetyRubric: 'Stanford Med Safety Classifier + Multi-Tier Crisis Interceptor',
  privacyProtocol: 'On-Device Zero-Knowledge Vault. No training on personal dialogues.',
};

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeJson(obj: unknown): string {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function escapeArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const escapedElements = arr.map((item) => `"${item.replace(/"/g, '\\"')}"`);
  return `ARRAY[${arr.map((item) => escapeSql(item)).join(', ')}]::text[]`;
}

const CATEGORIES = [
  {
    slug: 'soundscape',
    title: 'Soundscapes & Nature',
    subtitle: 'Acoustic nature sanctuaries and ambient textures',
    sort_order: 1,
  },
  {
    slug: 'solfeggio',
    title: 'Solfeggio & Binaural',
    subtitle: 'Healing frequencies and brainwave entrainment',
    sort_order: 2,
  },
  {
    slug: 'sleepcast',
    title: 'Sleepcasts & Stories',
    subtitle: 'Guided bedtime journeys and clinical descents',
    sort_order: 3,
  },
  {
    slug: 'sos',
    title: 'Acute SOS',
    subtitle: 'Fast somatic resets for racing nighttime minds',
    sort_order: 4,
  },
  {
    slug: 'body_scan',
    title: 'Body Scan & Somatic',
    subtitle: 'Progressive tension dissolving and somatic release',
    sort_order: 5,
  },
];

const PLANS = [
  {
    key: 'annual',
    name: 'Human 2.0 Sovereign (Annual)',
    tagline: 'Complete inner technology for awareness and sleep',
    price_display: '$69.99',
    billing_period: 'annual',
    badge: 'SAVE 58%',
    trial_text: 'Includes 7-day free trial. Cancel anytime in Apple Settings.',
    apple_product_id: 'space.human2.sovereign.annual',
    google_product_id: 'space.human2.sovereign.annual',
    sort_order: 1,
    is_active: true,
  },
  {
    key: 'monthly',
    name: 'Human 2.0 Sovereign (Monthly)',
    tagline: 'Flexible month-to-month access to all Sovereign features',
    price_display: '$9.99',
    billing_period: 'monthly',
    badge: null,
    trial_text: 'Flexible monthly billing. Cancel anytime.',
    apple_product_id: 'space.human2.sovereign.monthly',
    google_product_id: 'space.human2.sovereign.monthly',
    sort_order: 2,
    is_active: true,
  },
  {
    key: 'audiobook_lifetime',
    name: 'Human 2.0 Complete Audiobook (One-Time)',
    tagline: 'All 45 Chapters keep forever with zero recurring fees',
    price_display: 'AED 39 / $10.99',
    billing_period: 'lifetime',
    badge: 'SAVE 35%',
    trial_text: 'Keep forever with zero monthly subscription fees',
    apple_product_id: 'space.human2.audiobook.lifetime',
    google_product_id: 'space.human2.audiobook.lifetime',
    sort_order: 3,
    is_active: true,
  },
];

const SETTINGS = {
  home_copy: {
    hero_badge: "Tonight's Featured Bell Sound · 100% Free",
    hero_cta: 'Listen Tonight · Free',
    sos_title: 'Acute Emergency SOS · 90 Seconds',
    sos_heading: 'Racing Mind Silencer',
    sos_desc: 'Fast somatic pacer to halt nocturnal rumination spirals',
    timer_heading: 'Bedtime Sleep Timer',
  },
  paywall_copy: {
    hero_title: 'Human 2.0 Sovereign',
    hero_subtitle: 'Inner technology designed to keep human awareness ahead of artificial intelligence.',
    badge: 'StoreKit 2 · Apple In-App Purchase',
    annual_save_badge: 'SAVE 58%',
    audiobook_badge: 'Audiobook Only · One-Time · SAVE 35%',
  },
  timer_presets: {
    durations: [5, 10, 15, 20, 30, 45, 60, 90],
    prep_options: [0, 5, 10, 15],
    interval_options: [null, 1, 5, 10, 15],
    bell_tones: ['tibetan', 'temple', 'tingsha'],
    ambient_sounds: ['silence', '432hz'],
  },
  reset_sos: {
    duration_seconds: 90,
    rhythm: 'somatic_pacing_4_7_8_descent',
    audio_engine: 'sos_reset',
    purpose: 'Halt acute nocturnal rumination and sympathetic overdrive',
  },
  ebb_ai_settings: {
    specs: VINAY_KAPOOR_SYSTEM_SPECS,
    free_daily_quota: 3,
    sovereign_unlimited: true,
  },
};

let sql = `-- =============================================================================
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
`;

sql += CATEGORIES.map(
  (c) =>
    `  (${escapeSql(c.slug)}, ${escapeSql(c.title)}, ${escapeSql(c.subtitle)}, ${c.sort_order}, true)`
).join(',\n');

sql += `
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- 2. SEED SLEEP TRACKS (16 Tracks)
`;

SLEEP_TRACKS.forEach((track, index) => {
  const access = track.isPremium ? 'pro' : 'free';
  const isFeatured = track.id === 'sleep-free-1';
  const isFreeShelf = !track.isPremium;
  const sortOrder = index + 1;
  const audioPath = track.audioUrl || (track.audioEngineType ? `engine://${track.audioEngineType}` : null);

  sql += `INSERT INTO public.sleep_tracks (
  slug, title, subtitle, description, category_id,
  type_tag, audio_engine_type, duration_seconds, access,
  audio_path, tags, is_featured_tonight, is_free_shelf,
  sort_order, is_published
) VALUES (
  ${escapeSql(track.id)},
  ${escapeSql(track.title)},
  ${escapeSql(track.subtitle)},
  ${escapeSql(track.description)},
  (SELECT id FROM public.sleep_categories WHERE slug = ${escapeSql(track.category)} LIMIT 1),
  ${escapeSql(track.category)},
  ${escapeSql(track.audioEngineType || null)},
  ${track.durationSeconds},
  ${escapeSql(access)},
  ${escapeSql(audioPath)},
  ${escapeArray(track.tags)},
  ${isFeatured},
  ${isFreeShelf},
  ${sortOrder},
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

`;
});

sql += `-- 3. SEED AUDIOBOOK CHAPTERS (45 Chapters)
`;

AUDIO_CHAPTERS.forEach((ch) => {
  const access = ch.chapterNumber === 1 ? 'free' : 'pro';
  const durationSeconds = ch.durationMinutes * 60;
  const audioPath = ch.streamUrl || ch.fileName || null;

  sql += `INSERT INTO public.sleep_audiobook_chapters (
  chapter_number, title, part_number, part_title,
  duration_seconds, duration_formatted, description,
  key_takeaway, access, audio_path, is_published
) VALUES (
  ${ch.chapterNumber},
  ${escapeSql(ch.title)},
  ${ch.partNumber},
  ${escapeSql(ch.part)},
  ${durationSeconds},
  ${escapeSql(ch.durationFormatted)},
  ${escapeSql(ch.description)},
  ${escapeSql(ch.keyTakeaway)},
  ${escapeSql(access)},
  ${escapeSql(audioPath)},
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

`;
});

sql += `-- 4. SEED PLANS
INSERT INTO public.sleep_plans (
  key, name, tagline, price_display, billing_period,
  badge, trial_text, apple_product_id, google_product_id,
  sort_order, is_active
) VALUES
`;

sql += PLANS.map(
  (p) =>
    `  (${escapeSql(p.key)}, ${escapeSql(p.name)}, ${escapeSql(p.tagline)}, ${escapeSql(p.price_display)}, ${escapeSql(p.billing_period)}, ${escapeSql(p.badge)}, ${escapeSql(p.trial_text)}, ${escapeSql(p.apple_product_id)}, ${escapeSql(p.google_product_id)}, ${p.sort_order}, ${p.is_active})`
).join(',\n');

sql += `
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
`;

Object.entries(SETTINGS).forEach(([key, val]) => {
  sql += `INSERT INTO public.sleep_settings (key, value, updated_at)
VALUES (${escapeSql(key)}, ${escapeJson(val)}, now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

`;
});

const outPath = path.resolve('supabase/migrations/003_sleep_seed.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log('Successfully written migration 003 to', outPath);

// Also generate matching rollback
const rollbackSql = `-- =============================================================================
-- Migration Rollback 003: Sleep Seed Data
-- Human 2.0 Sleep App
-- Removes all seeded data created by migration 003
-- =============================================================================

DELETE FROM public.sleep_play_events WHERE track_id IN (SELECT id FROM public.sleep_tracks WHERE slug LIKE 'sleep-%') OR chapter_id IN (SELECT id FROM public.sleep_audiobook_chapters WHERE chapter_number BETWEEN 1 AND 45);
DELETE FROM public.sleep_settings WHERE key IN ('home_copy', 'paywall_copy', 'timer_presets', 'reset_sos', 'ebb_ai_settings');
DELETE FROM public.sleep_plans WHERE key IN ('annual', 'monthly', 'audiobook_lifetime');
DELETE FROM public.sleep_audiobook_chapters WHERE chapter_number BETWEEN 1 AND 45;
DELETE FROM public.sleep_tracks WHERE slug LIKE 'sleep-%';
DELETE FROM public.sleep_categories WHERE slug IN ('soundscape', 'solfeggio', 'sleepcast', 'sos', 'body_scan');
`;

const rollbackPath = path.resolve('supabase/migrations/rollback/003_sleep_seed_rollback.sql');
fs.writeFileSync(rollbackPath, rollbackSql, 'utf-8');
console.log('Successfully written rollback 003 to', rollbackPath);
