-- =============================================================================
-- Migration 002: Sleep Row Level Security (RLS) & Access Control
-- Human 2.0 Sleep App
-- Security Definer helper: sleep_is_admin()
-- Mandatory naming convention: Every policy MUST start with "sleep_"
-- Public read of published rows; Admin-only write access
-- Storage buckets: sleep-audio-free (public) & sleep-audio-pro (private)
-- =============================================================================

-- 1. SECURITY DEFINER HELPER
CREATE OR REPLACE FUNCTION public.sleep_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.sleep_admins
    WHERE user_id = auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sleep_is_admin() TO anon, authenticated, service_role;

-- 2. TABLE PERMISSIONS (GRANTS)
-- Essential for PostgREST to allow requests to reach RLS evaluation
GRANT ALL ON TABLE public.sleep_categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_tracks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_audiobook_chapters TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_plans TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_admins TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_entitlements TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sleep_play_events TO anon, authenticated, service_role;

-- 3. ENABLE RLS ON ALL SLEEP TABLES
ALTER TABLE public.sleep_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_audiobook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_play_events ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES: sleep_categories (All names prefixed with "sleep_")
CREATE POLICY "sleep_categories_select"
  ON public.sleep_categories FOR SELECT
  USING (is_published = true OR public.sleep_is_admin());

CREATE POLICY "sleep_categories_insert"
  ON public.sleep_categories FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_categories_update"
  ON public.sleep_categories FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_categories_delete"
  ON public.sleep_categories FOR DELETE
  USING (public.sleep_is_admin());

-- 5. POLICIES: sleep_tracks
CREATE POLICY "sleep_tracks_select"
  ON public.sleep_tracks FOR SELECT
  USING (is_published = true OR public.sleep_is_admin());

CREATE POLICY "sleep_tracks_insert"
  ON public.sleep_tracks FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_tracks_update"
  ON public.sleep_tracks FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_tracks_delete"
  ON public.sleep_tracks FOR DELETE
  USING (public.sleep_is_admin());

-- 6. POLICIES: sleep_audiobook_chapters
CREATE POLICY "sleep_audiobook_chapters_select"
  ON public.sleep_audiobook_chapters FOR SELECT
  USING (is_published = true OR public.sleep_is_admin());

CREATE POLICY "sleep_audiobook_chapters_insert"
  ON public.sleep_audiobook_chapters FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_audiobook_chapters_update"
  ON public.sleep_audiobook_chapters FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_audiobook_chapters_delete"
  ON public.sleep_audiobook_chapters FOR DELETE
  USING (public.sleep_is_admin());

-- 7. POLICIES: sleep_plans
CREATE POLICY "sleep_plans_select"
  ON public.sleep_plans FOR SELECT
  USING (is_active = true OR public.sleep_is_admin());

CREATE POLICY "sleep_plans_insert"
  ON public.sleep_plans FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_plans_update"
  ON public.sleep_plans FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_plans_delete"
  ON public.sleep_plans FOR DELETE
  USING (public.sleep_is_admin());

-- 8. POLICIES: sleep_settings
CREATE POLICY "sleep_settings_select"
  ON public.sleep_settings FOR SELECT
  USING (true);

CREATE POLICY "sleep_settings_insert"
  ON public.sleep_settings FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_settings_update"
  ON public.sleep_settings FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_settings_delete"
  ON public.sleep_settings FOR DELETE
  USING (public.sleep_is_admin());

-- 9. POLICIES: sleep_admins
CREATE POLICY "sleep_admins_select"
  ON public.sleep_admins FOR SELECT
  USING (user_id = auth.uid() OR public.sleep_is_admin());

CREATE POLICY "sleep_admins_insert"
  ON public.sleep_admins FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_admins_update"
  ON public.sleep_admins FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_admins_delete"
  ON public.sleep_admins FOR DELETE
  USING (public.sleep_is_admin());

-- 10. POLICIES: sleep_entitlements
CREATE POLICY "sleep_entitlements_select"
  ON public.sleep_entitlements FOR SELECT
  USING (user_id = auth.uid() OR public.sleep_is_admin());

CREATE POLICY "sleep_entitlements_insert"
  ON public.sleep_entitlements FOR INSERT
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_entitlements_update"
  ON public.sleep_entitlements FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_entitlements_delete"
  ON public.sleep_entitlements FOR DELETE
  USING (public.sleep_is_admin());

-- 11. POLICIES: sleep_play_events (Telemetry)
CREATE POLICY "sleep_play_events_insert"
  ON public.sleep_play_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "sleep_play_events_select"
  ON public.sleep_play_events FOR SELECT
  USING (user_id = auth.uid() OR public.sleep_is_admin());

CREATE POLICY "sleep_play_events_update"
  ON public.sleep_play_events FOR UPDATE
  USING (public.sleep_is_admin())
  WITH CHECK (public.sleep_is_admin());

CREATE POLICY "sleep_play_events_delete"
  ON public.sleep_play_events FOR DELETE
  USING (public.sleep_is_admin());

-- 12. STORAGE BUCKETS (Additive setup)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('sleep-audio-free', 'sleep-audio-free', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    INSERT INTO storage.buckets (id, name, public)
    VALUES ('sleep-audio-pro', 'sleep-audio-pro', false)
    ON CONFLICT (id) DO UPDATE SET public = false;
  END IF;
END $$;

-- 13. STORAGE OBJECT POLICIES (All names prefixed with "sleep_")
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    EXECUTE '
      CREATE POLICY "sleep_storage_free_select"
        ON storage.objects FOR SELECT
        USING (bucket_id = ''sleep-audio-free'');
    ';

    EXECUTE '
      CREATE POLICY "sleep_storage_pro_select"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = ''sleep-audio-pro'' AND (
            public.sleep_is_admin() OR
            EXISTS (
              SELECT 1 FROM public.sleep_entitlements
              WHERE user_id = auth.uid()
                AND status = ''active''
                AND (expires_at IS NULL OR expires_at > now())
            )
          )
        );
    ';

    EXECUTE '
      CREATE POLICY "sleep_storage_insert_admin"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id IN (''sleep-audio-free'', ''sleep-audio-pro'') AND
          public.sleep_is_admin()
        );
    ';

    EXECUTE '
      CREATE POLICY "sleep_storage_update_admin"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id IN (''sleep-audio-free'', ''sleep-audio-pro'') AND
          public.sleep_is_admin()
        )
        WITH CHECK (
          bucket_id IN (''sleep-audio-free'', ''sleep-audio-pro'') AND
          public.sleep_is_admin()
        );
    ';

    EXECUTE '
      CREATE POLICY "sleep_storage_delete_admin"
        ON storage.objects FOR DELETE
        USING (
          bucket_id IN (''sleep-audio-free'', ''sleep-audio-pro'') AND
          public.sleep_is_admin()
        );
    ';
  END IF;
END $$;
