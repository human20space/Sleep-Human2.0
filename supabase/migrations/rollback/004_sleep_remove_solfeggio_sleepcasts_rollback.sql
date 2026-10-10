-- =============================================================================
-- Rollback 004: Restore Solfeggio frequencies and Sleepcasts
-- Human 2.0 Sleep App
-- Restores solfeggio and sleepcast tracks & categories
-- =============================================================================

-- 1. Reactivate solfeggio and sleepcast categories
UPDATE public.sleep_categories
SET is_published = true, updated_at = now()
WHERE slug IN ('solfeggio', 'sleepcast');

-- 2. Reactivate tracks
UPDATE public.sleep_tracks
SET is_published = true, updated_at = now()
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
