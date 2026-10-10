-- ============================================================================
-- Rollback: 005_sleep_meditation_sections_rollback.sql
-- Description: Safely reverts migration 005_sleep_meditation_sections.sql
-- ============================================================================

-- Drop policies on sleep_section_items
DROP POLICY IF EXISTS "Admins full access to sleep_section_items" ON public.sleep_section_items;
DROP POLICY IF EXISTS "Public can view published section items" ON public.sleep_section_items;

-- Drop policies on sleep_sections
DROP POLICY IF EXISTS "Admins full access to sleep_sections" ON public.sleep_sections;
DROP POLICY IF EXISTS "Public can view published sections" ON public.sleep_sections;

-- Drop foreign key column from sleep_tracks
ALTER TABLE IF EXISTS public.sleep_tracks DROP COLUMN IF EXISTS section_id;

-- Drop tables
DROP TABLE IF EXISTS public.sleep_section_items CASCADE;
DROP TABLE IF EXISTS public.sleep_sections CASCADE;
