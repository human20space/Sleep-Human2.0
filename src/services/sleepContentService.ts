import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { SLEEP_TRACKS } from '../data/sleepCatalogData.ts';
import { AUDIO_CHAPTERS } from '../data/audioChaptersData.ts';
import type { SleepTrack, AudioChapter, SleepSection, SleepSectionItem } from '../types/index.ts';
import { useState, useEffect } from 'react';

export type { SleepSection, SleepSectionItem };

export interface SleepCategory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  sortOrder: number;
  isPublished: boolean;
  tracksCount?: number;
}

export interface SleepPlan {
  id: string;
  key: string;
  name: string;
  tagline?: string;
  priceDisplay: string;
  billingPeriod: string;
  badge?: string | null;
  trialText?: string | null;
  appleProductId?: string;
  googleProductId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SleepAppSettings {
  home_copy?: Record<string, string>;
  paywall_copy?: Record<string, string>;
  timer_presets?: Record<string, unknown>;
  reset_sos?: Record<string, unknown>;
  ebb_ai_settings?: Record<string, unknown>;
  legal_pages?: Record<string, string>;
  [key: string]: unknown;
}

export const DEFAULT_CATEGORIES: SleepCategory[] = [
  {
    id: 'cat-soundscape',
    slug: 'soundscape',
    title: 'Soundscapes & Nature',
    subtitle: 'Acoustic nature sanctuaries and ambient textures',
    sortOrder: 1,
    isPublished: true,
    tracksCount: 5,
  },
  {
    id: 'cat-sos',
    slug: 'sos',
    title: 'Acute SOS',
    subtitle: 'Fast somatic resets for racing nighttime minds',
    sortOrder: 2,
    isPublished: true,
    tracksCount: 1,
  },
  {
    id: 'cat-body_scan',
    slug: 'body_scan',
    title: 'Body Scan & Somatic',
    subtitle: 'Progressive tension dissolving and somatic release',
    sortOrder: 3,
    isPublished: true,
    tracksCount: 3,
  },
];

export const DEFAULT_PLANS: SleepPlan[] = [
  {
    id: 'plan-annual',
    key: 'annual',
    name: 'Human 2.0 Sovereign (Annual)',
    tagline: 'Complete inner technology for awareness and sleep',
    priceDisplay: '$69.99',
    billingPeriod: 'annual',
    badge: 'SAVE 58%',
    trialText: 'Includes 7-day free trial. Cancel anytime in Apple Settings.',
    appleProductId: 'space.human2.sovereign.annual',
    googleProductId: 'space.human2.sovereign.annual',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'plan-monthly',
    key: 'monthly',
    name: 'Human 2.0 Sovereign (Monthly)',
    tagline: 'Flexible month-to-month access to all Sovereign features',
    priceDisplay: '$9.99',
    billingPeriod: 'monthly',
    badge: null,
    trialText: 'Flexible monthly billing. Cancel anytime.',
    appleProductId: 'space.human2.sovereign.monthly',
    googleProductId: 'space.human2.sovereign.monthly',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'plan-audiobook',
    key: 'audiobook_lifetime',
    name: 'Human 2.0 Complete Audiobook (One-Time)',
    tagline: 'All 45 Chapters keep forever with zero recurring fees',
    priceDisplay: 'AED 39 / $10.99',
    billingPeriod: 'lifetime',
    badge: 'SAVE 35%',
    trialText: 'Keep forever with zero monthly subscription fees',
    appleProductId: 'space.human2.audiobook.lifetime',
    googleProductId: 'space.human2.audiobook.lifetime',
    sortOrder: 3,
    isActive: true,
  },
];

export const DEFAULT_SECTIONS: SleepSection[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    slug: 'sleep-meditation',
    title: 'Sleep Meditation',
    subtitle: 'Restorative guided practices for deep nervous system down-regulation',
    description: 'Clinical somatic inductions designed to quiet cognitive loops and induce restorative delta sleep.',
    sectionType: 'meditation',
    pricingType: 'standalone',
    priceDisplay: 'AED 49',
    priceAed: 'AED 49',
    priceUsd: '$12.99',
    pricingTagline: 'Lifetime access to all sleep meditations',
    badge: 'Clinical Rest',
    sortOrder: 1,
    isPublished: true,
    freeCount: 2,
    paidCount: 3,
    itemsCount: 5,
  },
  {
    id: 'e2000000-0000-4000-8000-000000000002',
    slug: 'meditation-women',
    title: 'Meditation for Women',
    subtitle: 'Targeted cyclical rest, hormone balancing, and nighttime serenity',
    description: 'Specialized nervous system grounding practices for hormonal shifts, luteal recovery, and feminine restoration.',
    sectionType: 'meditation',
    pricingType: 'standalone',
    priceDisplay: 'AED 59',
    priceAed: 'AED 59',
    priceUsd: '$15.99',
    pricingTagline: 'Complete series access + future updates',
    badge: 'Women Rest',
    sortOrder: 2,
    isPublished: true,
    freeCount: 1,
    paidCount: 3,
    itemsCount: 4,
  },
  {
    id: 'e3000000-0000-4000-8000-000000000003',
    slug: 'audiobook',
    title: 'Human 2.0 Audiobook',
    subtitle: 'The definitive 45-chapter neurological immersion and audio philosophy',
    description: 'Chapter 1 free sample, full 45 chapters unlocked with standalone purchase or Sovereign membership.',
    sectionType: 'audiobook',
    pricingType: 'tiered',
    priceDisplay: 'AED 39',
    priceAed: 'AED 39',
    priceUsd: '$9.99',
    pricingTagline: 'All 45 Chapters · High bitrate offline audio',
    badge: '45 Chapters',
    sortOrder: 3,
    isPublished: true,
    freeCount: 1,
    paidCount: 44,
    itemsCount: 45,
  },
];

export const DEFAULT_SECTION_ITEMS: SleepSectionItem[] = [
  {
    id: 'item-sm-1',
    sectionId: 'e1000000-0000-4000-8000-000000000001',
    title: 'Introductory Sleep Descent',
    subtitle: 'Free introductory somatic grounding',
    description: 'A 10-minute progressive body unwinding into quiet rest.',
    durationSeconds: 600,
    durationFormatted: '10:00',
    access: 'free',
    audioPath: '/audio/sample.mp3',
    audioBucket: 'sleep-audio-free',
    sortOrder: 1,
    isPublished: true,
    playCount: 142,
  },
  {
    id: 'item-sm-2',
    sectionId: 'e1000000-0000-4000-8000-000000000001',
    title: 'Body Weighting & Delta Drop',
    subtitle: 'Free neuromuscular release',
    description: 'Releasing micro-tensions in the jaw, shoulders, and hips.',
    durationSeconds: 900,
    durationFormatted: '15:00',
    access: 'free',
    audioPath: '/audio/sample.mp3',
    audioBucket: 'sleep-audio-free',
    sortOrder: 2,
    isPublished: true,
    playCount: 98,
  },
  {
    id: 'item-sm-3',
    sectionId: 'e1000000-0000-4000-8000-000000000001',
    title: 'Vagus Nerve Reset for Insomnia',
    subtitle: 'Deep autonomic parasympathetic shift',
    description: 'Vagal nerve stimulation pacing to stop middle-of-the-night waking.',
    durationSeconds: 1500,
    durationFormatted: '25:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 3,
    isPublished: true,
    playCount: 412,
  },
  {
    id: 'item-sm-4',
    sectionId: 'e1000000-0000-4000-8000-000000000001',
    title: 'Yoga Nidra for Deep Awakening',
    subtitle: 'Subconscious cleansing before slumber',
    description: 'Traditional yogic sleep threshold visualization.',
    durationSeconds: 1800,
    durationFormatted: '30:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 4,
    isPublished: true,
    playCount: 305,
  },
  {
    id: 'item-sm-5',
    sectionId: 'e1000000-0000-4000-8000-000000000001',
    title: 'Racing Mind Dissolution',
    subtitle: 'Cognitive defusion for acute overthinking',
    description: 'De-coupling cognitive narratives from bodily anxiety.',
    durationSeconds: 1200,
    durationFormatted: '20:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 5,
    isPublished: true,
    playCount: 221,
  },
  {
    id: 'item-wm-1',
    sectionId: 'e2000000-0000-4000-8000-000000000002',
    title: 'Luteal Phase Softening',
    subtitle: 'Free hormonal evening grounding',
    description: 'Easing pre-menstrual sensory sensitivity and insomnia.',
    durationSeconds: 720,
    durationFormatted: '12:00',
    access: 'free',
    audioPath: '/audio/sample.mp3',
    audioBucket: 'sleep-audio-free',
    sortOrder: 1,
    isPublished: true,
    playCount: 88,
  },
  {
    id: 'item-wm-2',
    sectionId: 'e2000000-0000-4000-8000-000000000002',
    title: 'Emotional Vessel Release',
    subtitle: 'Letting down the day emotional cargo',
    description: 'Releasing somatic emotional tension held in the solar plexus.',
    durationSeconds: 1200,
    durationFormatted: '20:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 2,
    isPublished: true,
    playCount: 164,
  },
  {
    id: 'item-wm-3',
    sectionId: 'e2000000-0000-4000-8000-000000000002',
    title: 'Adrenal Recovery & Deep Peace',
    subtitle: 'Restoring cortisol rhythm overnight',
    description: 'Deep restorative autonomic pacification for burnout and high cortisol.',
    durationSeconds: 1500,
    durationFormatted: '25:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 3,
    isPublished: true,
    playCount: 198,
  },
  {
    id: 'item-wm-4',
    sectionId: 'e2000000-0000-4000-8000-000000000002',
    title: 'Womb & Pelvic Breath Sanctum',
    subtitle: 'Sacred feminine somatic unwinding',
    description: 'Pelvic floor relaxation and deep grounding breath.',
    durationSeconds: 1800,
    durationFormatted: '30:00',
    access: 'paid',
    audioPath: '/audio/pro_sample.mp3',
    audioBucket: 'sleep-audio-pro',
    sortOrder: 4,
    isPublished: true,
    playCount: 142,
  },
];

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  home_copy: {
    greeting: 'Sleep Sanctuary',
    hero_badge: "Tonight's Featured Bell Sound · 100% Free",
    hero_cta: 'Listen Tonight · Free',
    sos_title: 'Acute Emergency SOS · 90 Seconds',
    sos_heading: 'Racing Mind Silencer',
    sos_desc: 'Fast somatic pacer to halt nocturnal rumination spirals',
    timer_heading: 'Bedtime Sleep Timer',
    shelf_free: 'Free Sleep Recordings',
    shelf_soundscapes: 'Soundscapes & Somatic Sanctuary',
  },
  reset_sos: {
    title: 'Racing Mind Silencer',
    subtitle: 'Fast somatic pacer to halt nocturnal rumination spirals',
    duration_seconds: 90,
    rhythm: 'somatic_pacing_4_7_8_descent',
    audio_engine: 'sos_reset',
    pacing_prompts: [
      'Drop shoulders away from ears',
      'Soften the tongue from the roof of mouth',
      'Release the grip on thinking',
      'Allow gravity to hold your weight',
    ],
  },
  ebb_ai_settings: {
    persona: 'Vinay Kapoor - Calm, dignified, executive guide',
    systemPrompt:
      "You are Vinay Kapoor — author of 'Human 2.0: Awareness — Future Ready with AI', senior corporate executive, and seasoned meditation guide.\n\nCORE PHILOSOPHY & PILLARS:\n1. \"Outer success meets inner awareness\": You understand high-stakes corporate pressures, boardrooms, and relentless technology demands. Never patronize or speak in vague mystic clichés.\n2. The Golden Equation: \"Human 2.0 = AI + AI\" (Aware Individual + Artificial Intelligence). As artificial intelligence gets faster and more capable, human beings must get stiller and more conscious.\n3. Somatic-First Inquiry: Before intellectualizing a problem, always invite the seeker to notice physical sensations in the body right now — the tightness in their neck or chest, the shallowness of their breathing, the grip on their device.\n4. The Mirror (Fact vs. Story): Help the seeker cleanly untangle what objectively happened (the neutral Fact) from what their fearful or defensive ego constructed (the Story).\n5. Unhurried Cadence: Speak with calm dignity, warmth, and measured pacing. Do not rush.\n6. The Sovereign Pause: Champion the 30-second gap between impulse and reaction.\n\nSAFETY BOUNDARY:\nIf the seeker expresses active suicidal intent, self-harm, severe psychiatric panic, or physical emergency, immediately trigger the compassionate crisis protocol, provide verified crisis lines (988 US, 116 123 UK, Befrienders), and state clearly that Human 2.0 is an awareness companion, not psychiatric emergency care.",
    starter_prompts: [
      'I cannot turn off work thoughts tonight.',
      'My chest feels tight and racing.',
      'Help me drop into sleep with somatic awareness.',
    ],
  },
  paywall_copy: {
    headline: 'Human 2.0 Sovereign',
    subtitle: 'Inner technology designed to keep human awareness ahead of artificial intelligence.',
    benefits: [
      'Access all 45 Audiobook Chapters',
      'Full library of acoustic nature soundscapes',
      'Unlimited dialogues with Ebb AI night companion',
      'Advanced somatic body scans and sleep timers',
    ],
    badge: 'StoreKit 2 · Apple In-App Purchase',
    annual_save_badge: 'SAVE 58%',
    audiobook_badge: 'Audiobook Only · One-Time · SAVE 35%',
  },
  timer_presets: {
    presets: [15, 30, 45, 60],
    durations: [5, 10, 15, 20, 30, 45, 60, 90],
    bell_tones: ['tibetan', 'temple', 'tingsha'],
    ambient_sounds: ['silence', '432hz'],
  },
  legal_pages: {
    terms: '# Terms of Service\n\nWelcome to Human 2.0 Sleep. By using this application, you agree to our terms of service...',
    privacy: '# Privacy Policy\n\nHuman 2.0 Sleep practices privacy-by-design. Your audio listening sessions and Ebb AI dialogues remain strictly private...',
    advisory: '# Clinical Advisory Notice\n\nHuman 2.0 Sleep is an awareness and sleep-supporting application. It is not intended for medical diagnosis or clinical treatment.',
  },
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(val?: string | null): boolean {
  return Boolean(val && UUID_REGEX.test(val));
}

interface RawTrackRow {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  type_tag?: string;
  duration_seconds?: number;
  access?: string;
  audio_engine_type?: string;
  audio_path?: string;
  tags?: string[];
  description?: string;
  is_featured_tonight?: boolean;
  is_free_shelf?: boolean;
  sort_order?: number;
  is_published?: boolean;
  play_count?: number;
}

interface RawChapterRow {
  id: string;
  chapter_number: number;
  title: string;
  part_number: number;
  part_title: string;
  duration_seconds?: number;
  duration_formatted: string;
  description?: string;
  key_takeaway?: string;
  access?: string;
  audio_path?: string;
  is_published?: boolean;
  play_count?: number;
}

interface RawCategoryRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  sort_order: number;
  is_published: boolean;
}

interface RawPlanRow {
  id: string;
  key: string;
  name: string;
  tagline?: string;
  price_display: string;
  billing_period: string;
  badge?: string;
  trial_text?: string;
  apple_product_id?: string;
  google_product_id?: string;
  sort_order: number;
  is_active: boolean;
}

interface RawSectionRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  section_type: string;
  pricing_type: string;
  price_display: string;
  price_aed?: string;
  price_usd?: string;
  pricing_tagline?: string;
  badge?: string;
  apple_product_id?: string;
  google_product_id?: string;
  sort_order: number;
  is_published: boolean;
}

interface RawSectionItemRow {
  id: string;
  section_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration_seconds: number;
  duration_formatted: string;
  access: string;
  audio_path?: string;
  audio_bucket?: string;
  sort_order: number;
  is_published: boolean;
  play_count: number;
}

function resolveAudioUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  if (path.startsWith('engine://')) {
    return undefined;
  }
  if (isSupabaseConfigured && supabase) {
    if (path.startsWith('sleep-audio-free/')) {
      const relPath = path.replace(/^sleep-audio-free\//, '');
      const { data } = supabase.storage.from('sleep-audio-free').getPublicUrl(relPath);
      return data?.publicUrl;
    }
  }
  return undefined;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function detectAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof Audio === 'undefined') {
        resolve(0);
        return;
      }
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;
      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration);
        URL.revokeObjectURL(url);
        resolve(isNaN(dur) ? 0 : dur);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
    } catch {
      resolve(0);
    }
  });
}

export async function uploadAudioFile(
  file: File,
  bucket: 'sleep-audio-free' | 'sleep-audio-pro',
  onProgress?: (progress: number) => void
): Promise<{ path: string; publicUrl?: string; durationSeconds: number; fileName: string }> {
  const durationSeconds = await detectAudioDuration(file);
  const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${bucket}/${cleanName}`;

  if (onProgress) onProgress(30);

  if (isSupabaseConfigured && supabase) {
    try {
      if (onProgress) onProgress(65);
      const { error } = await supabase.storage.from(bucket).upload(cleanName, file, {
        upsert: true,
      });
      if (error) throw error;
      if (onProgress) onProgress(100);

      let publicUrl: string | undefined = undefined;
      if (bucket === 'sleep-audio-free') {
        const { data: pubData } = supabase.storage.from('sleep-audio-free').getPublicUrl(cleanName);
        publicUrl = pubData?.publicUrl;
      }
      return {
        path,
        publicUrl,
        durationSeconds,
        fileName: file.name,
      };
    } catch (err) {
      console.warn('[uploadAudioFile] Storage upload warning:', err);
    }
  }

  if (onProgress) onProgress(100);
  const objectUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : undefined;
  return {
    path,
    publicUrl: objectUrl,
    durationSeconds,
    fileName: file.name,
  };
}

export async function moveAudioFile(
  sourcePath: string,
  fromBucket: 'sleep-audio-free' | 'sleep-audio-pro',
  toBucket: 'sleep-audio-free' | 'sleep-audio-pro'
): Promise<{ path: string; publicUrl?: string }> {
  if (fromBucket === toBucket) return { path: sourcePath };
  const fileName = sourcePath.split('/').pop() || sourcePath;
  const newPath = `${toBucket}/${fileName}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage.from(fromBucket).download(fileName);
      if (!downloadError && fileData) {
        await supabase.storage.from(toBucket).upload(fileName, fileData, { upsert: true });
        await supabase.storage.from(fromBucket).remove([fileName]);

        let publicUrl: string | undefined = undefined;
        if (toBucket === 'sleep-audio-free') {
          const { data: pubData } = supabase.storage.from('sleep-audio-free').getPublicUrl(fileName);
          publicUrl = pubData?.publicUrl;
        }
        return { path: newPath, publicUrl };
      }
    } catch (err) {
      console.warn('[moveAudioFile] Storage move warning:', err);
    }
  }

  return { path: newPath };
}

function mapRowToSleepTrack(row: RawTrackRow): SleepTrack {
  return {
    id: row.slug || row.id,
    dbId: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    category: (row.type_tag || 'soundscape') as SleepTrack['category'],
    durationSeconds: row.duration_seconds || 0,
    isPremium: row.access === 'pro',
    audioEngineType: (row.audio_engine_type as SleepTrack['audioEngineType']) || undefined,
    audioUrl: resolveAudioUrl(row.audio_path),
    tags: Array.isArray(row.tags) ? row.tags : [],
    description: row.description || '',
    isPublished: row.is_published !== false,
    isFreeShelf: Boolean(row.is_free_shelf),
    isFeaturedTonight: Boolean(row.is_featured_tonight),
    sortOrder: row.sort_order ?? 0,
    playCount: row.play_count ?? 0,
    audioPath: row.audio_path || '',
  };
}

function mapRowToAudioChapter(row: RawChapterRow): AudioChapter {
  const durationMinutes = Math.round((row.duration_seconds || 0) / 60);
  const localChapter = AUDIO_CHAPTERS.find((c) => c.chapterNumber === row.chapter_number);

  return {
    id: `ch-${row.chapter_number}`,
    dbId: row.id,
    chapterNumber: row.chapter_number,
    title: row.title,
    part: row.part_title,
    partNumber: row.part_number,
    durationMinutes: durationMinutes || 10,
    durationFormatted: row.duration_formatted,
    durationSeconds: row.duration_seconds || (durationMinutes * 60) || 600,
    description: row.description || '',
    keyTakeaway: row.key_takeaway || '',
    fileName: `Chapter ${row.chapter_number}.mp3`,
    driveUrl: 'https://drive.google.com/drive/folders/1OqZnx9-aUMwhhaqYRzULuLjnT0iWQJ_0',
    driveId: localChapter?.driveId,
    streamUrl: resolveAudioUrl(row.audio_path),
    access: (row.access as 'free' | 'pro') || (row.chapter_number === 1 ? 'free' : 'pro'),
    audioPath: row.audio_path || '',
    isPublished: row.is_published !== false,
    playCount: row.play_count ?? 0,
  };
}

function mapRowToCategory(row: RawCategoryRow): SleepCategory {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

function mapRowToPlan(row: RawPlanRow): SleepPlan {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    tagline: row.tagline,
    priceDisplay: row.price_display,
    billingPeriod: row.billing_period,
    badge: row.badge,
    trialText: row.trial_text,
    appleProductId: row.apple_product_id,
    googleProductId: row.google_product_id,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapRowToSection(row: RawSectionRow): SleepSection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    sectionType: (row.section_type || 'meditation') as SleepSection['sectionType'],
    pricingType: (row.pricing_type || 'standalone') as SleepSection['pricingType'],
    priceDisplay: row.price_display || 'AED 49',
    priceAed: row.price_aed || 'AED 49',
    priceUsd: row.price_usd || '$12.99',
    pricingTagline: row.pricing_tagline,
    badge: row.badge,
    appleProductId: row.apple_product_id,
    googleProductId: row.google_product_id,
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published !== false,
  };
}

function mapRowToSectionItem(row: RawSectionItemRow): SleepSectionItem {
  return {
    id: row.id,
    sectionId: row.section_id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    durationSeconds: row.duration_seconds || 0,
    durationFormatted: row.duration_formatted || '00:00',
    access: (row.access === 'free' ? 'free' : 'paid') as 'free' | 'paid',
    audioPath: row.audio_path,
    audioBucket: (row.audio_bucket || 'sleep-audio-pro') as 'sleep-audio-free' | 'sleep-audio-pro',
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published !== false,
    playCount: row.play_count || 0,
  };
}

class SleepContentService {
  private cachedTracks: SleepTrack[] = [];
  private cachedChapters: AudioChapter[] = [];
  private cachedCategories: SleepCategory[] = [];
  private cachedPlans: SleepPlan[] = [];
  private cachedSections: SleepSection[] = [];
  private cachedSectionItems: SleepSectionItem[] = [];
  private cachedSettings: Record<string, unknown> = {};

  private trackSlugToUuid: Map<string, string> = new Map();
  private chapterNumberToUuid: Map<number, string> = new Map();
  private chapterIdToUuid: Map<string, string> = new Map();

  private isInitialized = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    // 1. Initial base catalogs
    this.cachedTracks = SLEEP_TRACKS.map((t, idx) => ({
      ...t,
      isPublished: true,
      sortOrder: idx + 1,
      playCount: t.id === 'sleep-free-1' ? 194 : 32,
      isFeaturedTonight: idx === 0,
    }));
    this.cachedChapters = AUDIO_CHAPTERS.map((c) => ({
      ...c,
      access: c.chapterNumber === 1 ? 'free' : 'pro',
      isPublished: true,
      playCount: c.chapterNumber === 1 ? 142 : 18,
    }));
    this.cachedCategories = [...DEFAULT_CATEGORIES];
    this.cachedPlans = [...DEFAULT_PLANS];
    this.cachedSections = [...DEFAULT_SECTIONS];
    this.cachedSectionItems = [...DEFAULT_SECTION_ITEMS];
    this.cachedSettings = { ...DEFAULT_SETTINGS };

    // 2. Restore local overrides if present
    if (typeof window !== 'undefined') {
      try {
        const storedTracks = localStorage.getItem('human2_admin_tracks');
        if (storedTracks) {
          const parsed = JSON.parse(storedTracks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedTracks = parsed;
          }
        }

        const storedChapters = localStorage.getItem('human2_admin_chapters');
        if (storedChapters) {
          const parsed = JSON.parse(storedChapters);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedChapters = parsed;
          }
        }

        const storedCategories = localStorage.getItem('human2_admin_categories');
        if (storedCategories) {
          const parsed = JSON.parse(storedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedCategories = parsed;
          }
        }

        const storedSections = localStorage.getItem('human2_admin_sections');
        if (storedSections) {
          const parsed = JSON.parse(storedSections);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedSections = parsed;
          }
        }

        const storedSectionItems = localStorage.getItem('human2_admin_section_items');
        if (storedSectionItems) {
          const parsed = JSON.parse(storedSectionItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cachedSectionItems = parsed;
          }
        }

        const storedSettings = localStorage.getItem('human2_admin_settings');
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed && typeof parsed === 'object') {
            this.cachedSettings = { ...this.cachedSettings, ...parsed };
          }
        }
      } catch {
        // Fallback to in-memory state
      }
    }
  }

  private persistLocal(type: 'tracks' | 'chapters' | 'categories' | 'settings' | 'sections' | 'section_items') {
    if (typeof window !== 'undefined') {
      try {
        if (type === 'tracks') {
          localStorage.setItem('human2_admin_tracks', JSON.stringify(this.cachedTracks));
        } else if (type === 'chapters') {
          localStorage.setItem('human2_admin_chapters', JSON.stringify(this.cachedChapters));
        } else if (type === 'categories') {
          localStorage.setItem('human2_admin_categories', JSON.stringify(this.cachedCategories));
        } else if (type === 'sections') {
          localStorage.setItem('human2_admin_sections', JSON.stringify(this.cachedSections));
        } else if (type === 'section_items') {
          localStorage.setItem('human2_admin_section_items', JSON.stringify(this.cachedSectionItems));
        } else if (type === 'settings') {
          localStorage.setItem('human2_admin_settings', JSON.stringify(this.cachedSettings));
        }
      } catch {
        // ignore quota errors
      }
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore listener errors
      }
    });
  }

  public getCachedTracks(): SleepTrack[] {
    return this.cachedTracks;
  }

  public getCachedChapters(): AudioChapter[] {
    return this.cachedChapters;
  }

  public getCachedCategories(): SleepCategory[] {
    return this.cachedCategories;
  }

  public getCachedPlans(): SleepPlan[] {
    return this.cachedPlans;
  }

  public getCachedSections(): SleepSection[] {
    return this.cachedSections.map((s) => {
      const items = this.cachedSectionItems.filter((i) => i.sectionId === s.id);
      return {
        ...s,
        freeCount: items.filter((i) => i.access === 'free' && i.isPublished !== false).length,
        paidCount: items.filter((i) => i.access === 'paid' && i.isPublished !== false).length,
        itemsCount: items.length,
      };
    });
  }

  public getCachedSectionItems(sectionId?: string): SleepSectionItem[] {
    if (sectionId) {
      return this.cachedSectionItems.filter((i) => i.sectionId === sectionId);
    }
    return this.cachedSectionItems;
  }

  // --- TRACKS CRUD ---
  public async getTracks(includeUnpublished = false): Promise<SleepTrack[]> {
    if (!isSupabaseConfigured || !supabase) {
      return includeUnpublished
        ? this.cachedTracks
        : this.cachedTracks.filter((t) => t.isPublished !== false);
    }

    try {
      let query = supabase.from('sleep_tracks').select('*').order('sort_order', { ascending: true });
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        data.forEach((item) => {
          const raw = item as RawTrackRow;
          if (raw.slug && raw.id) {
            this.trackSlugToUuid.set(raw.slug, raw.id);
          }
        });
        const mapped = data.map((item) => mapRowToSleepTrack(item as RawTrackRow));
        this.cachedTracks = mapped;
        this.persistLocal('tracks');
        return mapped;
      }
    } catch (err) {
      console.warn('[SleepContentService] Failed to load tracks from Supabase:', err);
    }

    return includeUnpublished
      ? this.cachedTracks
      : this.cachedTracks.filter((t) => t.isPublished !== false);
  }

  public async saveTrack(trackData: Partial<SleepTrack>): Promise<SleepTrack> {
    const existingIndex = this.cachedTracks.findIndex(
      (t) => (trackData.id && t.id === trackData.id) || (trackData.dbId && t.dbId === trackData.dbId)
    );

    let savedTrack: SleepTrack;

    if (existingIndex >= 0) {
      savedTrack = {
        ...this.cachedTracks[existingIndex],
        ...trackData,
      } as SleepTrack;
      this.cachedTracks[existingIndex] = savedTrack;
    } else {
      const generatedId =
        trackData.id ||
        `track-${Date.now()}-${(trackData.title || 'new').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      savedTrack = {
        id: generatedId,
        title: trackData.title || 'Untitled Track',
        subtitle: trackData.subtitle || '',
        category: (trackData.category || 'soundscape') as SleepTrack['category'],
        durationSeconds: trackData.durationSeconds || 0,
        isPremium: Boolean(trackData.isPremium),
        audioEngineType: trackData.audioEngineType,
        audioUrl: trackData.audioUrl,
        audioPath: trackData.audioPath || (trackData.isPremium ? 'sleep-audio-pro/' : 'sleep-audio-free/'),
        tags: trackData.tags || [],
        description: trackData.description || '',
        isPublished: trackData.isPublished !== false,
        isFreeShelf: Boolean(trackData.isFreeShelf),
        isFeaturedTonight: Boolean(trackData.isFeaturedTonight),
        sortOrder: trackData.sortOrder ?? this.cachedTracks.length + 1,
        playCount: trackData.playCount ?? 0,
      };
      this.cachedTracks.unshift(savedTrack);
    }

    // Supabase sync
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          slug: savedTrack.id,
          title: savedTrack.title,
          subtitle: savedTrack.subtitle,
          description: savedTrack.description,
          type_tag: savedTrack.category,
          audio_engine_type: savedTrack.audioEngineType || null,
          duration_seconds: savedTrack.durationSeconds,
          access: savedTrack.isPremium ? 'pro' : 'free',
          audio_path: savedTrack.audioPath || null,
          tags: savedTrack.tags,
          is_free_shelf: savedTrack.isFreeShelf,
          is_featured_tonight: savedTrack.isFeaturedTonight,
          sort_order: savedTrack.sortOrder,
          is_published: savedTrack.isPublished,
        };

        if (savedTrack.dbId) {
          await supabase.from('sleep_tracks').update(payload).eq('id', savedTrack.dbId);
        } else {
          const { data } = await supabase
            .from('sleep_tracks')
            .upsert(payload, { onConflict: 'slug' })
            .select()
            .single();
          if (data && data.id) {
            savedTrack.dbId = data.id;
          }
        }
      } catch (err) {
        console.warn('[SleepContentService] Supabase track sync warning:', err);
      }
    }

    this.persistLocal('tracks');
    this.notify();
    return savedTrack;
  }

  public async deleteTrack(id: string): Promise<boolean> {
    const track = this.cachedTracks.find((t) => t.id === id || t.dbId === id);
    this.cachedTracks = this.cachedTracks.filter((t) => t.id !== id && t.dbId !== id);

    if (isSupabaseConfigured && supabase && track) {
      try {
        if (track.dbId) {
          await supabase.from('sleep_tracks').delete().eq('id', track.dbId);
        } else {
          await supabase.from('sleep_tracks').delete().eq('slug', track.id);
        }
      } catch (err) {
        console.warn('[SleepContentService] Supabase delete track warning:', err);
      }
    }

    this.persistLocal('tracks');
    this.notify();
    return true;
  }

  public async toggleTrackPublished(id: string): Promise<boolean> {
    const track = this.cachedTracks.find((t) => t.id === id || t.dbId === id);
    if (!track) return false;
    track.isPublished = !track.isPublished;
    await this.saveTrack(track);
    return Boolean(track.isPublished);
  }

  public async setFeaturedTonightTrack(id: string): Promise<boolean> {
    this.cachedTracks.forEach((t) => {
      t.isFeaturedTonight = t.id === id || t.dbId === id;
    });

    // Make sure the featured track is at the first slot for home view
    const targetIdx = this.cachedTracks.findIndex((t) => t.id === id || t.dbId === id);
    if (targetIdx > 0) {
      const [featured] = this.cachedTracks.splice(targetIdx, 1);
      this.cachedTracks.unshift(featured);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sleep_tracks').update({ is_featured_tonight: false }).neq('id', '00000000-0000-0000-0000-000000000000');
        const target = this.cachedTracks[0];
        if (target?.dbId) {
          await supabase.from('sleep_tracks').update({ is_featured_tonight: true }).eq('id', target.dbId);
        } else if (target?.id) {
          await supabase.from('sleep_tracks').update({ is_featured_tonight: true }).eq('slug', target.id);
        }
      } catch (err) {
        console.warn('[SleepContentService] Set featured tonight warning:', err);
      }
    }

    this.persistLocal('tracks');
    this.notify();
    return true;
  }

  // --- CHAPTERS CRUD ---
  public async getAudiobookChapters(includeUnpublished = false): Promise<AudioChapter[]> {
    if (!isSupabaseConfigured || !supabase) {
      return includeUnpublished
        ? this.cachedChapters
        : this.cachedChapters.filter((c) => c.isPublished !== false);
    }

    try {
      let query = supabase.from('sleep_audiobook_chapters').select('*').order('chapter_number', { ascending: true });
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        data.forEach((item) => {
          const raw = item as RawChapterRow;
          if (raw.chapter_number && raw.id) {
            this.chapterNumberToUuid.set(raw.chapter_number, raw.id);
            this.chapterIdToUuid.set(`ch-${raw.chapter_number}`, raw.id);
          }
        });
        const mapped = data.map((item) => mapRowToAudioChapter(item as RawChapterRow));
        this.cachedChapters = mapped;
        this.persistLocal('chapters');
        return mapped;
      }
    } catch (err) {
      console.warn('[SleepContentService] Chapters Supabase query warning:', err);
    }

    return includeUnpublished
      ? this.cachedChapters
      : this.cachedChapters.filter((c) => c.isPublished !== false);
  }

  public async saveChapter(chapterData: Partial<AudioChapter>): Promise<AudioChapter> {
    const existingIndex = this.cachedChapters.findIndex(
      (c) =>
        (chapterData.id && c.id === chapterData.id) ||
        (chapterData.chapterNumber && c.chapterNumber === chapterData.chapterNumber) ||
        (chapterData.dbId && c.dbId === chapterData.dbId)
    );

    let savedChapter: AudioChapter;
    const chNum = chapterData.chapterNumber || (existingIndex >= 0 ? this.cachedChapters[existingIndex].chapterNumber : this.cachedChapters.length + 1);
    const durationMins = Math.max(1, Math.round((chapterData.durationSeconds || (chapterData.durationMinutes ? chapterData.durationMinutes * 60 : 600)) / 60));
    const minsStr = Math.floor((chapterData.durationSeconds || durationMins * 60) / 60);
    const secsStr = ((chapterData.durationSeconds || 0) % 60).toString().padStart(2, '0');
    const formatted = `${minsStr}:${secsStr}`;

    if (existingIndex >= 0) {
      savedChapter = {
        ...this.cachedChapters[existingIndex],
        ...chapterData,
        durationMinutes: durationMins,
        durationFormatted: chapterData.durationFormatted || formatted,
      } as AudioChapter;
      this.cachedChapters[existingIndex] = savedChapter;
    } else {
      savedChapter = {
        id: chapterData.id || `ch-${chNum}`,
        chapterNumber: chNum,
        title: chapterData.title || `Chapter ${chNum}`,
        part: chapterData.part || 'Part 1: The Foundation',
        partNumber: chapterData.partNumber || 1,
        durationMinutes: durationMins,
        durationFormatted: chapterData.durationFormatted || formatted,
        durationSeconds: chapterData.durationSeconds || durationMins * 60,
        description: chapterData.description || '',
        keyTakeaway: chapterData.keyTakeaway || '',
        fileName: chapterData.fileName || `Chapter ${chNum}.mp3`,
        driveUrl: chapterData.driveUrl || 'https://drive.google.com/drive/folders/1OqZnx9-aUMwhhaqYRzULuLjnT0iWQJ_0',
        driveId: chapterData.driveId,
        streamUrl: chapterData.streamUrl,
        access: chapterData.access || (chNum === 1 ? 'free' : 'pro'),
        audioPath: chapterData.audioPath || `Chapter ${chNum}.mp3`,
        isPublished: chapterData.isPublished !== false,
        playCount: chapterData.playCount ?? 0,
      };
      this.cachedChapters.push(savedChapter);
    }

    this.cachedChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          chapter_number: savedChapter.chapterNumber,
          title: savedChapter.title,
          part_number: savedChapter.partNumber,
          part_title: savedChapter.part,
          duration_seconds: savedChapter.durationSeconds,
          duration_formatted: savedChapter.durationFormatted,
          description: savedChapter.description,
          key_takeaway: savedChapter.keyTakeaway,
          access: savedChapter.access,
          audio_path: savedChapter.audioPath,
          is_published: savedChapter.isPublished,
        };

        if (savedChapter.dbId) {
          await supabase.from('sleep_audiobook_chapters').update(payload).eq('id', savedChapter.dbId);
        } else {
          const { data } = await supabase
            .from('sleep_audiobook_chapters')
            .upsert(payload, { onConflict: 'chapter_number' })
            .select()
            .single();
          if (data && data.id) {
            savedChapter.dbId = data.id;
          }
        }
      } catch (err) {
        console.warn('[SleepContentService] Supabase chapter sync warning:', err);
      }
    }

    this.persistLocal('chapters');
    this.notify();
    return savedChapter;
  }

  public async deleteChapter(id: string): Promise<boolean> {
    const ch = this.cachedChapters.find((c) => c.id === id || c.dbId === id);
    this.cachedChapters = this.cachedChapters.filter((c) => c.id !== id && c.dbId !== id);

    if (isSupabaseConfigured && supabase && ch) {
      try {
        if (ch.dbId) {
          await supabase.from('sleep_audiobook_chapters').delete().eq('id', ch.dbId);
        } else {
          await supabase.from('sleep_audiobook_chapters').delete().eq('chapter_number', ch.chapterNumber);
        }
      } catch (err) {
        console.warn('[SleepContentService] Chapter delete warning:', err);
      }
    }

    this.persistLocal('chapters');
    this.notify();
    return true;
  }

  public async toggleChapterPublished(id: string): Promise<boolean> {
    const ch = this.cachedChapters.find((c) => c.id === id || c.dbId === id);
    if (!ch) return false;
    ch.isPublished = !ch.isPublished;
    await this.saveChapter(ch);
    return Boolean(ch.isPublished);
  }

  // --- CATEGORIES CRUD ---
  public async getCategories(includeUnpublished = false): Promise<SleepCategory[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.enrichCategoriesWithCount(
        includeUnpublished ? this.cachedCategories : this.cachedCategories.filter((c) => c.isPublished)
      );
    }

    try {
      let query = supabase.from('sleep_categories').select('*').order('sort_order', { ascending: true });
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        this.cachedCategories = data.map((item) => mapRowToCategory(item as RawCategoryRow));
        this.persistLocal('categories');
        return this.enrichCategoriesWithCount(this.cachedCategories);
      }
    } catch (err) {
      console.warn('[SleepContentService] Categories query warning:', err);
    }

    return this.enrichCategoriesWithCount(
      includeUnpublished ? this.cachedCategories : this.cachedCategories.filter((c) => c.isPublished)
    );
  }

  private enrichCategoriesWithCount(cats: SleepCategory[]): SleepCategory[] {
    return cats.map((cat) => ({
      ...cat,
      tracksCount: this.cachedTracks.filter((t) => t.category === cat.slug).length,
    }));
  }

  public async saveCategory(categoryData: Partial<SleepCategory>): Promise<SleepCategory> {
    const existingIndex = this.cachedCategories.findIndex(
      (c) => (categoryData.id && c.id === categoryData.id) || (categoryData.slug && c.slug === categoryData.slug)
    );

    let savedCat: SleepCategory;
    const slug = (categoryData.slug || categoryData.title || 'custom').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    if (existingIndex >= 0) {
      savedCat = {
        ...this.cachedCategories[existingIndex],
        ...categoryData,
        slug,
      };
      this.cachedCategories[existingIndex] = savedCat;
    } else {
      savedCat = {
        id: categoryData.id || `cat-${Date.now()}`,
        slug,
        title: categoryData.title || 'New Category',
        subtitle: categoryData.subtitle || '',
        sortOrder: categoryData.sortOrder ?? this.cachedCategories.length + 1,
        isPublished: categoryData.isPublished !== false,
      };
      this.cachedCategories.push(savedCat);
    }

    this.cachedCategories.sort((a, b) => a.sortOrder - b.sortOrder);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          slug: savedCat.slug,
          title: savedCat.title,
          subtitle: savedCat.subtitle,
          sort_order: savedCat.sortOrder,
          is_published: savedCat.isPublished,
        };
        await supabase.from('sleep_categories').upsert(payload, { onConflict: 'slug' });
      } catch (err) {
        console.warn('[SleepContentService] Category save warning:', err);
      }
    }

    this.persistLocal('categories');
    this.notify();
    return savedCat;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const cat = this.cachedCategories.find((c) => c.id === id || c.slug === id);
    this.cachedCategories = this.cachedCategories.filter((c) => c.id !== id && c.slug !== id);

    if (isSupabaseConfigured && supabase && cat) {
      try {
        await supabase.from('sleep_categories').delete().eq('slug', cat.slug);
      } catch (err) {
        console.warn('[SleepContentService] Category delete warning:', err);
      }
    }

    this.persistLocal('categories');
    this.notify();
    return true;
  }

  public async toggleCategoryPublished(id: string): Promise<boolean> {
    const cat = this.cachedCategories.find((c) => c.id === id || c.slug === id);
    if (!cat) return false;
    cat.isPublished = !cat.isPublished;
    await this.saveCategory(cat);
    return cat.isPublished;
  }

  // --- SETTINGS CRUD ---
  public async getSetting<T>(key: string, fallback?: T): Promise<T> {
    const defaultVal = (fallback !== undefined ? fallback : DEFAULT_SETTINGS[key]) as T;

    if (this.cachedSettings[key] !== undefined) {
      return this.cachedSettings[key] as T;
    }

    if (!isSupabaseConfigured || !supabase) {
      return defaultVal;
    }

    try {
      const { data, error } = await supabase.from('sleep_settings').select('value').eq('key', key).single();
      if (!error && data && data.value) {
        this.cachedSettings[key] = data.value;
        this.persistLocal('settings');
        return data.value as T;
      }
    } catch {
      // fallback
    }

    return defaultVal;
  }

  public async saveSetting<T>(key: string, value: T): Promise<boolean> {
    this.cachedSettings[key] = value;
    this.persistLocal('settings');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sleep_settings').upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`[SleepContentService] Setting save warning for ${key}:`, err);
      }
    }

    this.notify();
    return true;
  }

  public async resetSetting(key: string): Promise<boolean> {
    const defaultVal = DEFAULT_SETTINGS[key];
    if (defaultVal !== undefined) {
      return this.saveSetting(key, defaultVal);
    }
    return false;
  }

  public async getPlans(): Promise<SleepPlan[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.cachedPlans;
    }

    try {
      const { data, error } = await supabase
        .from('sleep_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.cachedPlans;
      }

      this.cachedPlans = data.map((item) => mapRowToPlan(item as RawPlanRow));
      return this.cachedPlans;
    } catch (err) {
      console.warn('[SleepContentService] Failed to load plans, falling back to local defaults:', err);
      return this.cachedPlans;
    }
  }

  // --- SECTIONS CRUD ---
  public async getSections(includeUnpublished = true): Promise<SleepSection[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('sleep_sections').select('*').order('sort_order', { ascending: true });
        if (!includeUnpublished) {
          query = query.eq('is_published', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          this.cachedSections = data.map((item) => mapRowToSection(item as RawSectionRow));
          this.persistLocal('sections');
        }
      } catch (err) {
        console.warn('[SleepContentService] Failed to load sections from Supabase:', err);
      }
    }

    const sections = includeUnpublished
      ? this.cachedSections
      : this.cachedSections.filter((s) => s.isPublished !== false);

    return sections.map((s) => {
      const items = this.cachedSectionItems.filter((i) => i.sectionId === s.id);
      return {
        ...s,
        freeCount: items.filter((i) => i.access === 'free' && i.isPublished !== false).length,
        paidCount: items.filter((i) => i.access === 'paid' && i.isPublished !== false).length,
        itemsCount: items.length,
      };
    });
  }

  public async saveSection(sectionData: Partial<SleepSection>): Promise<SleepSection> {
    const existingIndex = this.cachedSections.findIndex(
      (s) => s.id === sectionData.id || (sectionData.slug && s.slug === sectionData.slug)
    );
    let savedSection: SleepSection;

    if (existingIndex >= 0) {
      savedSection = {
        ...this.cachedSections[existingIndex],
        ...sectionData,
      } as SleepSection;
      this.cachedSections[existingIndex] = savedSection;
    } else {
      const generatedId =
        sectionData.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sec-${Date.now()}`);
      const slug =
        sectionData.slug ||
        (sectionData.title || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      savedSection = {
        id: generatedId,
        slug,
        title: sectionData.title || 'New Meditation Section',
        subtitle: sectionData.subtitle || '',
        description: sectionData.description || '',
        sectionType: sectionData.sectionType || 'meditation',
        pricingType: sectionData.pricingType || 'standalone',
        priceDisplay: sectionData.priceDisplay || sectionData.priceAed || 'AED 49',
        priceAed: sectionData.priceAed || 'AED 49',
        priceUsd: sectionData.priceUsd || '$12.99',
        pricingTagline: sectionData.pricingTagline || 'One-time access',
        badge: sectionData.badge || 'Meditation',
        appleProductId: sectionData.appleProductId,
        googleProductId: sectionData.googleProductId,
        sortOrder: sectionData.sortOrder ?? this.cachedSections.length + 1,
        isPublished: sectionData.isPublished !== false,
      };
      this.cachedSections.push(savedSection);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          slug: savedSection.slug,
          title: savedSection.title,
          subtitle: savedSection.subtitle,
          description: savedSection.description,
          section_type: savedSection.sectionType,
          pricing_type: savedSection.pricingType,
          price_display: savedSection.priceDisplay,
          price_aed: savedSection.priceAed,
          price_usd: savedSection.priceUsd,
          pricing_tagline: savedSection.pricingTagline,
          badge: savedSection.badge,
          sort_order: savedSection.sortOrder,
          is_published: savedSection.isPublished,
        };

        if (isValidUuid(savedSection.id)) {
          await supabase.from('sleep_sections').upsert({ id: savedSection.id, ...payload });
        } else {
          const { data } = await supabase
            .from('sleep_sections')
            .upsert(payload, { onConflict: 'slug' })
            .select('id')
            .single();
          if (data?.id) savedSection.id = data.id;
        }
      } catch (err) {
        console.warn('[SleepContentService] Section sync warning:', err);
      }
    }

    this.persistLocal('sections');
    this.notify();
    return savedSection;
  }

  public async deleteSection(id: string): Promise<boolean> {
    const existingIndex = this.cachedSections.findIndex((s) => s.id === id);
    if (existingIndex >= 0) {
      this.cachedSections.splice(existingIndex, 1);
      this.cachedSectionItems = this.cachedSectionItems.filter((i) => i.sectionId !== id);
      this.persistLocal('sections');
      this.persistLocal('section_items');
      this.notify();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (isValidUuid(id)) {
          await supabase.from('sleep_sections').delete().eq('id', id);
        } else {
          await supabase.from('sleep_sections').delete().eq('slug', id);
        }
      } catch (err) {
        console.warn('[SleepContentService] Failed to delete section from Supabase:', err);
      }
    }
    return true;
  }

  // --- SECTION ITEMS CRUD (FREE & PAID AUDIOS) ---
  public async getSectionItems(sectionId?: string, includeUnpublished = true): Promise<SleepSectionItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('sleep_section_items').select('*').order('sort_order', { ascending: true });
        if (sectionId && isValidUuid(sectionId)) {
          query = query.eq('section_id', sectionId);
        }
        if (!includeUnpublished) {
          query = query.eq('is_published', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped = data.map((item) => mapRowToSectionItem(item as RawSectionItemRow));
          if (sectionId) {
            this.cachedSectionItems = [
              ...this.cachedSectionItems.filter((i) => i.sectionId !== sectionId),
              ...mapped,
            ];
          } else {
            this.cachedSectionItems = mapped;
          }
          this.persistLocal('section_items');
        }
      } catch (err) {
        console.warn('[SleepContentService] Failed to load section items from Supabase:', err);
      }
    }

    let items = this.cachedSectionItems;
    if (sectionId) {
      items = items.filter((i) => i.sectionId === sectionId);
    }
    if (!includeUnpublished) {
      items = items.filter((i) => i.isPublished !== false);
    }
    return items;
  }

  public async saveSectionItem(itemData: Partial<SleepSectionItem>): Promise<SleepSectionItem> {
    const existingIndex = this.cachedSectionItems.findIndex((i) => i.id === itemData.id);
    let savedItem: SleepSectionItem;

    if (existingIndex >= 0) {
      savedItem = {
        ...this.cachedSectionItems[existingIndex],
        ...itemData,
      } as SleepSectionItem;
      this.cachedSectionItems[existingIndex] = savedItem;
    } else {
      const generatedId =
        itemData.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`);
      savedItem = {
        id: generatedId,
        sectionId: itemData.sectionId || '',
        title: itemData.title || 'Untitled Audio',
        subtitle: itemData.subtitle || '',
        description: itemData.description || '',
        durationSeconds: itemData.durationSeconds || 0,
        durationFormatted: itemData.durationFormatted || '00:00',
        access: itemData.access || 'paid',
        audioPath: itemData.audioPath,
        audioBucket:
          itemData.audioBucket || (itemData.access === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro'),
        sortOrder: itemData.sortOrder ?? this.cachedSectionItems.length + 1,
        isPublished: itemData.isPublished !== false,
        playCount: itemData.playCount || 0,
      };
      this.cachedSectionItems.push(savedItem);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          section_id: savedItem.sectionId,
          title: savedItem.title,
          subtitle: savedItem.subtitle,
          description: savedItem.description,
          duration_seconds: savedItem.durationSeconds,
          duration_formatted: savedItem.durationFormatted,
          access: savedItem.access,
          audio_path: savedItem.audioPath,
          audio_bucket: savedItem.audioBucket,
          sort_order: savedItem.sortOrder,
          is_published: savedItem.isPublished,
          play_count: savedItem.playCount,
        };

        if (isValidUuid(savedItem.id)) {
          await supabase.from('sleep_section_items').upsert({ id: savedItem.id, ...payload });
        } else {
          const { data } = await supabase.from('sleep_section_items').insert(payload).select('id').single();
          if (data?.id) savedItem.id = data.id;
        }
      } catch (err) {
        console.warn('[SleepContentService] Section item sync warning:', err);
      }
    }

    this.persistLocal('section_items');
    this.notify();
    return savedItem;
  }

  public async deleteSectionItem(id: string): Promise<boolean> {
    const existingIndex = this.cachedSectionItems.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      this.cachedSectionItems.splice(existingIndex, 1);
      this.persistLocal('section_items');
      this.notify();
    }

    if (isSupabaseConfigured && supabase && isValidUuid(id)) {
      try {
        await supabase.from('sleep_section_items').delete().eq('id', id);
      } catch (err) {
        console.warn('[SleepContentService] Failed to delete section item from Supabase:', err);
      }
    }
    return true;
  }

  public async recordPlayEvent(params: {
    trackId?: string;
    chapterId?: string;
    userId?: string;
    platform?: string;
  }): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    try {
      let resolvedTrackUuid: string | null = null;
      if (params.trackId) {
        if (isValidUuid(params.trackId)) {
          resolvedTrackUuid = params.trackId;
        } else {
          resolvedTrackUuid = this.trackSlugToUuid.get(params.trackId) || null;
        }
      }

      let resolvedChapterUuid: string | null = null;
      if (params.chapterId) {
        if (isValidUuid(params.chapterId)) {
          resolvedChapterUuid = params.chapterId;
        } else {
          resolvedChapterUuid = this.chapterIdToUuid.get(params.chapterId) || null;
          if (!resolvedChapterUuid) {
            const num = parseInt(params.chapterId.replace(/^ch-/, ''), 10);
            if (!isNaN(num)) {
              resolvedChapterUuid = this.chapterNumberToUuid.get(num) || null;
            }
          }
        }
      }

      const resolvedUserUuid = isValidUuid(params.userId) ? params.userId : null;

      if (resolvedTrackUuid || resolvedChapterUuid || resolvedUserUuid) {
        await supabase.from('sleep_play_events').insert({
          track_id: resolvedTrackUuid,
          chapter_id: resolvedChapterUuid,
          user_id: resolvedUserUuid,
          platform: params.platform || 'web',
        });
      }
    } catch {
      // Telemetry error suppressed
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    if (isSupabaseConfigured) {
      await Promise.allSettled([
        this.getTracks(true),
        this.getAudiobookChapters(true),
        this.getCategories(true),
        this.getPlans(),
        this.getSections(true),
        this.getSectionItems(undefined, true),
      ]);
    }
  }
}

export const sleepContentService = new SleepContentService();

export function useSleepContent() {
  const [tracks, setTracks] = useState<SleepTrack[]>(() => sleepContentService.getCachedTracks());
  const [chapters, setChapters] = useState<AudioChapter[]>(() => sleepContentService.getCachedChapters());
  const [categories, setCategories] = useState<SleepCategory[]>(() => sleepContentService.getCachedCategories());
  const [plans, setPlans] = useState<SleepPlan[]>(() => sleepContentService.getCachedPlans());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const unsubscribe = sleepContentService.subscribe(() => {
      if (isMounted) {
        setTracks([...sleepContentService.getCachedTracks()]);
        setChapters([...sleepContentService.getCachedChapters()]);
        setCategories([...sleepContentService.getCachedCategories()]);
        setPlans([...sleepContentService.getCachedPlans()]);
      }
    });

    Promise.all([
      sleepContentService.getTracks(),
      sleepContentService.getAudiobookChapters(),
      sleepContentService.getCategories(),
      sleepContentService.getPlans(),
    ])
      .then(([t, ch, cat, pl]) => {
        if (isMounted) {
          setTracks(t);
          setChapters(ch);
          setCategories(cat);
          setPlans(pl);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { tracks, chapters, categories, plans, isLoading };
}

export function useSleepSections() {
  const [sections, setSections] = useState<SleepSection[]>(() => sleepContentService.getCachedSections());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const unsubscribe = sleepContentService.subscribe(() => {
      if (isMounted) {
        setSections([...sleepContentService.getCachedSections()]);
      }
    });

    sleepContentService
      .getSections(true)
      .then((data) => {
        if (isMounted) {
          setSections(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    sections,
    isLoading,
    saveSection: (sec: Partial<SleepSection>) => sleepContentService.saveSection(sec),
    deleteSection: (id: string) => sleepContentService.deleteSection(id),
    refresh: () => sleepContentService.getSections(true),
  };
}

export function useSectionItems(sectionId?: string) {
  const [items, setItems] = useState<SleepSectionItem[]>(() => sleepContentService.getCachedSectionItems(sectionId));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const unsubscribe = sleepContentService.subscribe(() => {
      if (isMounted) {
        setItems([...sleepContentService.getCachedSectionItems(sectionId)]);
      }
    });

    sleepContentService
      .getSectionItems(sectionId, true)
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [sectionId]);

  return {
    items,
    isLoading,
    saveItem: (item: Partial<SleepSectionItem>) => sleepContentService.saveSectionItem(item),
    deleteItem: (id: string) => sleepContentService.deleteSectionItem(id),
    refresh: () => sleepContentService.getSectionItems(sectionId, true),
  };
}
