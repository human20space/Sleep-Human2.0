// Authoritative interface contracts and spec validators derived from ORIGINAL_REQUEST.md & PROJECT.md

export interface WebAppManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface WebAppManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  scope: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'natural' | 'landscape' | 'portrait';
  theme_color: string;
  background_color: string;
  icons: WebAppManifestIcon[];
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateManifestSpec(manifest: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null object'] };
  }

  const m = manifest as Record<string, unknown>;

  if (m.name !== 'Human 2.0') {
    errors.push(`Expected name to be "Human 2.0", got "${m.name}"`);
  }

  if (m.short_name !== 'Human 2.0') {
    errors.push(`Expected short_name to be "Human 2.0", got "${m.short_name}"`);
  }

  if (m.start_url !== '/') {
    errors.push(`Expected start_url to be "/", got "${m.start_url}"`);
  }

  if (m.scope !== '/') {
    errors.push(`Expected scope to be "/", got "${m.scope}"`);
  }

  if (m.display !== 'standalone') {
    errors.push(`Expected display to be "standalone", got "${m.display}"`);
  }

  if (m.orientation !== 'portrait') {
    errors.push(`Expected orientation to be "portrait", got "${m.orientation}"`);
  }

  const validThemeColors = ['#05070a', '#f7f3ec'];
  if (!m.theme_color || typeof m.theme_color !== 'string' || !validThemeColors.includes(m.theme_color.toLowerCase())) {
    errors.push(`Expected theme_color to be one of ${JSON.stringify(validThemeColors)}, got "${m.theme_color}"`);
  }

  if (!m.background_color || typeof m.background_color !== 'string' || !validThemeColors.includes(m.background_color.toLowerCase())) {
    errors.push(`Expected background_color to be one of ${JSON.stringify(validThemeColors)}, got "${m.background_color}"`);
  }

  if (!Array.isArray(m.icons) || m.icons.length < 3) {
    errors.push('Expected icons to be an array with at least 3 icons (192, 512, maskable 512)');
  } else {
    const has192 = m.icons.some((i: WebAppManifestIcon) => i.sizes === '192x192' && i.type === 'image/png');
    const has512 = m.icons.some((i: WebAppManifestIcon) => i.sizes === '512x512' && i.type === 'image/png');
    const hasMaskable = m.icons.some((i: WebAppManifestIcon) => i.sizes === '512x512' && (i.purpose?.includes('maskable') || i.purpose === 'any maskable'));

    if (!has192) errors.push('Missing 192x192 PNG icon');
    if (!has512) errors.push('Missing 512x512 PNG icon');
    if (!hasMaskable) errors.push('Missing maskable 512x512 PNG icon');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface SleepTrackSpec {
  id: string;
  title: string;
  subtitle: string;
  category: 'sleepcast' | 'solfeggio' | 'soundscape' | 'sos' | 'body_scan';
  durationSeconds: number;
  isPremium: boolean;
  audioEngineType?: 'solfeggio_432' | 'solfeggio_528' | 'delta_binaural' | 'ocean_rain' | 'sos_reset';
  audioUrl?: string;
  tags: string[];
  description: string;
}

export function validateSleepCatalogSpec(catalog: SleepTrackSpec[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(catalog)) {
    return { valid: false, errors: ['Catalog must be an array'] };
  }

  if (catalog.length < 12 || catalog.length > 20) {
    errors.push(`Expected catalog track count between 12 and 20, got ${catalog.length}`);
  }

  const freeTracks = catalog.filter(t => !t.isPremium);
  const premiumTracks = catalog.filter(t => t.isPremium);

  if (freeTracks.length < 3 || freeTracks.length > 5) {
    errors.push(`Expected 3 to 5 free tracks (specifically 4), got ${freeTracks.length}`);
  }

  const requiredCategories = ['sleepcast', 'solfeggio', 'soundscape', 'sos', 'body_scan'];
  for (const cat of requiredCategories) {
    if (!catalog.some(t => t.category === cat)) {
      errors.push(`Missing required category "${cat}" in sleep catalog`);
    }
  }

  for (const [idx, track] of catalog.entries()) {
    if (!track.id) errors.push(`Track at index ${idx} missing id`);
    if (!track.title) errors.push(`Track at index ${idx} missing title`);
    if (typeof track.durationSeconds !== 'number' || track.durationSeconds <= 0) {
      errors.push(`Track ${track.id || idx} has invalid durationSeconds: ${track.durationSeconds}`);
    }
    if (typeof track.isPremium !== 'boolean') {
      errors.push(`Track ${track.id || idx} has non-boolean isPremium`);
    }
    if (!Array.isArray(track.tags)) {
      errors.push(`Track ${track.id || idx} has non-array tags`);
    }
    if (!track.description) {
      errors.push(`Track ${track.id || idx} missing description`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface ContinueListeningItem {
  id: string;
  type: 'sleep_track' | 'audiobook';
  title: string;
  subtitle: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
}

export class MockLocalStorageVault {
  private store: Map<string, string> = new Map();

  public getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  // High-level vault methods matching Human 2.0 contracts
  public isSovereign(): boolean {
    return this.getItem('human2_is_premium') === 'true';
  }

  public setSovereign(premium: boolean): void {
    this.setItem('human2_is_premium', premium ? 'true' : 'false');
  }

  public getFavorites(): string[] {
    const raw = this.getItem('human2_favorites');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public toggleFavorite(id: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(id);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(id);
      isFav = true;
    }
    this.setItem('human2_favorites', JSON.stringify(favs));
    return isFav;
  }

  public getContinueListening(): ContinueListeningItem[] {
    const raw = this.getItem('human2_continue_listening');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveProgress(item: Omit<ContinueListeningItem, 'updatedAt'>): void {
    const list = this.getContinueListening();
    const existingIndex = list.findIndex(i => i.id === item.id);
    const clampedPosition = Math.max(0, Math.min(item.positionSeconds, item.durationSeconds));

    const updatedItem: ContinueListeningItem = {
      ...item,
      positionSeconds: clampedPosition,
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedItem;
    } else {
      list.unshift(updatedItem);
    }

    this.setItem('human2_continue_listening', JSON.stringify(list));
  }
}

/**
 * Service Worker script analyzer
 */
export function analyzeServiceWorkerScript(script: string) {
  return {
    hasSkipWaitingHandler: /SKIP_WAITING/.test(script) && /skipWaiting/.test(script),
    hasActivateCacheCleanup: /activate/.test(script) && /caches\.delete/.test(script),
    hasRangeHeaderGuard: /range/i.test(script) || /Range/.test(script),
    excludesAudioMedia: /\/audio\/|\.mp3/i.test(script),
    excludesVideoMedia: /\/videos\/|\.mp4/i.test(script),
    hasOfflineFallback: /index\.html/.test(script) || /offline/i.test(script),
  };
}
