-- =============================================================================
-- Migration Rollback 002: Sleep Row Level Security (RLS) & Access Control
-- Human 2.0 Sleep App
-- Strictly drops only policies and objects created in migration 002
-- =============================================================================

-- 1. DROP STORAGE POLICIES & BUCKETS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    EXECUTE '
      DROP POLICY IF EXISTS "sleep_storage_delete_admin" ON storage.objects;
      DROP POLICY IF EXISTS "sleep_storage_update_admin" ON storage.objects;
      DROP POLICY IF EXISTS "sleep_storage_insert_admin" ON storage.objects;
      DROP POLICY IF EXISTS "sleep_storage_pro_select" ON storage.objects;
      DROP POLICY IF EXISTS "sleep_storage_free_select" ON storage.objects;
    ';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    DELETE FROM storage.buckets WHERE id IN ('sleep-audio-free', 'sleep-audio-pro');
  END IF;
END $$;

-- 2. DROP TABLE POLICIES
DROP POLICY IF EXISTS "sleep_play_events_delete" ON public.sleep_play_events;
DROP POLICY IF EXISTS "sleep_play_events_update" ON public.sleep_play_events;
DROP POLICY IF EXISTS "sleep_play_events_select" ON public.sleep_play_events;
DROP POLICY IF EXISTS "sleep_play_events_insert" ON public.sleep_play_events;

DROP POLICY IF EXISTS "sleep_entitlements_delete" ON public.sleep_entitlements;
DROP POLICY IF EXISTS "sleep_entitlements_update" ON public.sleep_entitlements;
DROP POLICY IF EXISTS "sleep_entitlements_insert" ON public.sleep_entitlements;
DROP POLICY IF EXISTS "sleep_entitlements_select" ON public.sleep_entitlements;

DROP POLICY IF EXISTS "sleep_admins_delete" ON public.sleep_admins;
DROP POLICY IF EXISTS "sleep_admins_update" ON public.sleep_admins;
DROP POLICY IF EXISTS "sleep_admins_insert" ON public.sleep_admins;
DROP POLICY IF EXISTS "sleep_admins_select" ON public.sleep_admins;

DROP POLICY IF EXISTS "sleep_settings_delete" ON public.sleep_settings;
DROP POLICY IF EXISTS "sleep_settings_update" ON public.sleep_settings;
DROP POLICY IF EXISTS "sleep_settings_insert" ON public.sleep_settings;
DROP POLICY IF EXISTS "sleep_settings_select" ON public.sleep_settings;

DROP POLICY IF EXISTS "sleep_plans_delete" ON public.sleep_plans;
DROP POLICY IF EXISTS "sleep_plans_update" ON public.sleep_plans;
DROP POLICY IF EXISTS "sleep_plans_insert" ON public.sleep_plans;
DROP POLICY IF EXISTS "sleep_plans_select" ON public.sleep_plans;

DROP POLICY IF EXISTS "sleep_audiobook_chapters_delete" ON public.sleep_audiobook_chapters;
DROP POLICY IF EXISTS "sleep_audiobook_chapters_update" ON public.sleep_audiobook_chapters;
DROP POLICY IF EXISTS "sleep_audiobook_chapters_insert" ON public.sleep_audiobook_chapters;
DROP POLICY IF EXISTS "sleep_audiobook_chapters_select" ON public.sleep_audiobook_chapters;

DROP POLICY IF EXISTS "sleep_tracks_delete" ON public.sleep_tracks;
DROP POLICY IF EXISTS "sleep_tracks_update" ON public.sleep_tracks;
DROP POLICY IF EXISTS "sleep_tracks_insert" ON public.sleep_tracks;
DROP POLICY IF EXISTS "sleep_tracks_select" ON public.sleep_tracks;

DROP POLICY IF EXISTS "sleep_categories_delete" ON public.sleep_categories;
DROP POLICY IF EXISTS "sleep_categories_update" ON public.sleep_categories;
DROP POLICY IF EXISTS "sleep_categories_insert" ON public.sleep_categories;
DROP POLICY IF EXISTS "sleep_categories_select" ON public.sleep_categories;

-- 3. DISABLE RLS
ALTER TABLE IF EXISTS public.sleep_play_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_entitlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_audiobook_chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sleep_categories DISABLE ROW LEVEL SECURITY;

-- 4. REVOKE TABLE PERMISSIONS
REVOKE ALL ON TABLE public.sleep_play_events FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_entitlements FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_admins FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_settings FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_plans FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_audiobook_chapters FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_tracks FROM anon, authenticated, service_role;
REVOKE ALL ON TABLE public.sleep_categories FROM anon, authenticated, service_role;

-- 5. DROP HELPER FUNCTION
DROP FUNCTION IF EXISTS public.sleep_is_admin() CASCADE;
