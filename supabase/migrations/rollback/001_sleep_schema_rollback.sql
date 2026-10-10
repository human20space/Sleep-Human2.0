-- =============================================================================
-- Migration Rollback 001: Sleep Schema Foundation
-- Human 2.0 Sleep App
-- Drops all sleep_* tables and triggers in reverse dependency order
-- Additive only rollback: strictly removes only sleep_* objects
-- =============================================================================

DROP TRIGGER IF EXISTS sleep_trg_entitlements_updated_at ON public.sleep_entitlements;
DROP TRIGGER IF EXISTS sleep_trg_settings_updated_at ON public.sleep_settings;
DROP TRIGGER IF EXISTS sleep_trg_plans_updated_at ON public.sleep_plans;
DROP TRIGGER IF EXISTS sleep_trg_audiobook_chapters_updated_at ON public.sleep_audiobook_chapters;
DROP TRIGGER IF EXISTS sleep_trg_tracks_updated_at ON public.sleep_tracks;
DROP TRIGGER IF EXISTS sleep_trg_categories_updated_at ON public.sleep_categories;

DROP TABLE IF EXISTS public.sleep_play_events CASCADE;
DROP TABLE IF EXISTS public.sleep_entitlements CASCADE;
DROP TABLE IF EXISTS public.sleep_admins CASCADE;
DROP TABLE IF EXISTS public.sleep_settings CASCADE;
DROP TABLE IF EXISTS public.sleep_plans CASCADE;
DROP TABLE IF EXISTS public.sleep_audiobook_chapters CASCADE;
DROP TABLE IF EXISTS public.sleep_tracks CASCADE;
DROP TABLE IF EXISTS public.sleep_categories CASCADE;

DROP FUNCTION IF EXISTS public.sleep_set_updated_at() CASCADE;
