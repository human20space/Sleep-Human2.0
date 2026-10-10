-- =============================================================================
-- Migration 004: Remove Solfeggio frequencies and Sleepcasts
-- Human 2.0 Sleep App
-- Deactivates tracks under solfeggio and sleepcast categories,
-- and deactivates the solfeggio and sleepcast categories.
-- =============================================================================

-- 1. Deactivate solfeggio and sleepcast tracks
UPDATE public.sleep_tracks
SET is_published = false, updated_at = now()
WHERE slug IN (
  'sleep-free-2',
  'sleep-prem-1',
  'sleep-prem-2',
  'sleep-prem-3',
  'sleep-prem-8',
  'sleep-prem-9',
  'sleep-prem-12'
)
OR category_id IN (
  SELECT id FROM public.sleep_categories WHERE slug IN ('solfeggio', 'sleepcast')
);

-- 2. Deactivate solfeggio and sleepcast categories
UPDATE public.sleep_categories
SET is_published = false, updated_at = now()
WHERE slug IN ('solfeggio', 'sleepcast');
