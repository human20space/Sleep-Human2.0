import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { SLEEP_TRACKS } from '../data/sleepCatalogData.ts';
import { AUDIO_CHAPTERS } from '../data/audioChaptersData.ts';
import type { SleepTrack, AudioChapter } from '../types/index.ts';
import { useState, useEffect } from 'react';

export interface SleepCategory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  sortOrder: number;
  isPublished: boolean;
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
  [key: string]: unknown;
}

const DEFAULT_CATEGORIES: SleepCategory[] = [
  {
    id: 'cat-soundscape',
    slug: 'soundscape',
    title: 'Soundscapes & Nature',
    subtitle: 'Acoustic nature sanctuaries and ambient textures',
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 'cat-solfeggio',
    slug: 'solfeggio',
    title: 'Solfeggio & Binaural',
    subtitle: 'Healing frequencies and brainwave entrainment',
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 'cat-sleepcast',
    slug: 'sleepcast',
    title: 'Sleepcasts & Stories',
    subtitle: 'Guided bedtime journeys and clinical descents',
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 'cat-sos',
    slug: 'sos',
    title: 'Acute SOS',
    subtitle: 'Fast somatic resets for racing nighttime minds',
    sortOrder: 4,
    isPublished: true,
  },
  {
    id: 'cat-body_scan',
    slug: 'body_scan',
    title: 'Body Scan & Somatic',
    subtitle: 'Progressive tension dissolving and somatic release',
    sortOrder: 5,
    isPublished: true,
  },
];

const DEFAULT_PLANS: SleepPlan[] = [
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
  audio_path?: string;
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

function resolveAudioUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) {
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
    description: row.description || '',
    keyTakeaway: row.key_takeaway || '',
    fileName: `Chapter ${row.chapter_number}.mp3`,
    driveUrl: 'https://drive.google.com/drive/folders/1OqZnx9-aUMwhhaqYRzULuLjnT0iWQJ_0',
    driveId: localChapter?.driveId,
    streamUrl: resolveAudioUrl(row.audio_path),
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

class SleepContentService {
  private cachedTracks: SleepTrack[] = [...SLEEP_TRACKS];
  private cachedChapters: AudioChapter[] = [...AUDIO_CHAPTERS];
  private cachedCategories: SleepCategory[] = [...DEFAULT_CATEGORIES];
  private cachedPlans: SleepPlan[] = [...DEFAULT_PLANS];

  private trackSlugToUuid: Map<string, string> = new Map();
  private chapterNumberToUuid: Map<number, string> = new Map();
  private chapterIdToUuid: Map<string, string> = new Map();

  private isInitialized = false;

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

  public async getCategories(): Promise<SleepCategory[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.cachedCategories;
    }

    try {
      const { data, error } = await supabase
        .from('sleep_categories')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.cachedCategories;
      }

      this.cachedCategories = data.map((item) => mapRowToCategory(item as RawCategoryRow));
      return this.cachedCategories;
    } catch (err) {
      console.warn('[SleepContentService] Failed to load categories, falling back to local defaults:', err);
      return this.cachedCategories;
    }
  }

  public async getTracks(): Promise<SleepTrack[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.cachedTracks;
    }

    try {
      const { data, error } = await supabase
        .from('sleep_tracks')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.cachedTracks;
      }

      data.forEach((item) => {
        const raw = item as RawTrackRow;
        if (raw.slug && raw.id) {
          this.trackSlugToUuid.set(raw.slug, raw.id);
        }
      });

      this.cachedTracks = data.map((item) => mapRowToSleepTrack(item as RawTrackRow));
      return this.cachedTracks;
    } catch (err) {
      console.warn('[SleepContentService] Failed to load tracks, falling back to local defaults:', err);
      return this.cachedTracks;
    }
  }

  public async getAudiobookChapters(): Promise<AudioChapter[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.cachedChapters;
    }

    try {
      const { data, error } = await supabase
        .from('sleep_audiobook_chapters')
        .select('*')
        .eq('is_published', true)
        .order('chapter_number', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.cachedChapters;
      }

      data.forEach((item) => {
        const raw = item as RawChapterRow;
        if (raw.chapter_number && raw.id) {
          this.chapterNumberToUuid.set(raw.chapter_number, raw.id);
          this.chapterIdToUuid.set(`ch-${raw.chapter_number}`, raw.id);
        }
      });

      this.cachedChapters = data.map((item) => mapRowToAudioChapter(item as RawChapterRow));
      return this.cachedChapters;
    } catch (err) {
      console.warn('[SleepContentService] Failed to load chapters, falling back to local defaults:', err);
      return this.cachedChapters;
    }
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

  public async getSetting<T>(key: string, fallback: T): Promise<T> {
    if (!isSupabaseConfigured || !supabase) {
      return fallback;
    }

    try {
      const { data, error } = await supabase
        .from('sleep_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error || !data || !data.value) {
        return fallback;
      }

      return data.value as T;
    } catch (err) {
      console.warn(`[SleepContentService] Failed to fetch setting ${key}:`, err);
      return fallback;
    }
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

      // Only insert if at least a valid track, chapter, or user UUID is resolved
      if (resolvedTrackUuid || resolvedChapterUuid || resolvedUserUuid) {
        await supabase.from('sleep_play_events').insert({
          track_id: resolvedTrackUuid,
          chapter_id: resolvedChapterUuid,
          user_id: resolvedUserUuid,
          platform: params.platform || 'web',
        });
      }
    } catch {
      // Telemetry error suppressed for seamless offline experience
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    if (isSupabaseConfigured) {
      await Promise.allSettled([
        this.getTracks(),
        this.getAudiobookChapters(),
        this.getCategories(),
        this.getPlans(),
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
    };
  }, []);

  return { tracks, chapters, categories, plans, isLoading };
}
