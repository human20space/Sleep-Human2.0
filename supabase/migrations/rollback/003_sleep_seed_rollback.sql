-- =============================================================================
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
