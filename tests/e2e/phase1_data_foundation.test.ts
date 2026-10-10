import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SLEEP_TRACKS } from '../../src/data/sleepCatalogData.ts';
import { AUDIO_CHAPTERS } from '../../src/data/audioChaptersData.ts';
import { MASTERCLASSES } from '../../src/data/extendedMindfulnessData.ts';
import { REFERENCE_SLEEP_CATALOG } from './helpers/fixtures.ts';
import { sleepContentService } from '../../src/services/sleepContentService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Phase 1 Verification: Data Foundation & Matthew Walker Removal', () => {

  test('1. Dr. Matthew Walker attribution removal verification', () => {
    // Check sleep-prem-3 in catalog
    const track3 = SLEEP_TRACKS.find((t) => t.id === 'sleep-prem-3');
    assert.ok(track3, 'sleep-prem-3 must exist');
    assert.equal(track3.title, 'Clinical Sleep Architecture & Circadian Descent');
    assert.equal(track3.subtitle, 'Guided neurological wind-down and sleep spindle induction');
    assert.deepEqual(track3.tags, ['Science', 'Guided', 'Sovereign', 'Sleepcast']);
    assert.equal(track3.description, 'Evidence-based cognitive descent into restorative non-REM slumber.');

    // Check test fixture reference
    const fixtureTrack3 = REFERENCE_SLEEP_CATALOG.find((t) => t.id === 'sleep-prem-3');
    assert.ok(fixtureTrack3, 'Fixture sleep-prem-3 must exist');
    assert.equal(fixtureTrack3.title, 'Clinical Sleep Architecture & Circadian Descent');

    // Check masterclass-sleep-science in extendedMindfulnessData
    const masterclass = MASTERCLASSES.find((m) => m.id === 'masterclass-sleep-science');
    assert.ok(masterclass, 'masterclass-sleep-science must exist');
    assert.ok(!masterclass.teacher.includes('Matthew Walker'), 'Teacher must not be Matthew Walker');
    assert.ok(!masterclass.subtitle?.includes('Matthew Walker'), 'Subtitle must not include Matthew Walker');
    assert.ok(!masterclass.description.includes('Matthew Walker'), 'Description must not include Matthew Walker');

    // Check HomeScreen.tsx
    const homeScreenContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'), 'utf-8');
    assert.ok(!homeScreenContent.includes('Dr. Matthew Walker'), 'HomeScreen must not mention Dr. Matthew Walker');
    assert.ok(homeScreenContent.includes('Clinical Sleepcasts, Yoga Nidra, and somatic releases'), 'HomeScreen must include Clinical Sleepcasts copy');

    // Check SubscriptionScreen.tsx
    const subScreenContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/SubscriptionScreen.tsx'), 'utf-8');
    assert.ok(!subScreenContent.includes('Dr. Walker'), 'SubscriptionScreen must not mention Dr. Walker');
    assert.ok(subScreenContent.includes('Dr. Jud & Tara Brach'), 'SubscriptionScreen must include Dr. Jud & Tara Brach');

    // Check StakeholderPreviewSection.tsx
    const previewContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/StakeholderPreviewSection.tsx'), 'utf-8');
    assert.ok(!previewContent.includes('Matthew Walker'), 'StakeholderPreviewSection must not mention Matthew Walker');
  });

  test('2. Migration 001 Schema Foundation & Rollback compliance', () => {
    const migration001 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/001_sleep_schema.sql'), 'utf-8');
    const rollback001 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/rollback/001_sleep_schema_rollback.sql'), 'utf-8');

    // Verify all 8 tables are defined and prefixed with sleep_
    const requiredTables = [
      'sleep_categories',
      'sleep_tracks',
      'sleep_audiobook_chapters',
      'sleep_plans',
      'sleep_settings',
      'sleep_admins',
      'sleep_entitlements',
      'sleep_play_events',
    ];

    for (const table of requiredTables) {
      assert.ok(migration001.includes(`CREATE TABLE IF NOT EXISTS public.${table}`), `Migration 001 must create table ${table}`);
      assert.ok(rollback001.includes(`DROP TABLE IF EXISTS public.${table}`), `Rollback 001 must drop table ${table}`);
    }

    // Verify triggers and indexes use sleep_ prefix
    const triggerMatches = migration001.match(/CREATE TRIGGER ([a-zA-Z0-9_]+)/g) || [];
    for (const match of triggerMatches) {
      const triggerName = match.replace('CREATE TRIGGER ', '');
      assert.ok(triggerName.startsWith('sleep_'), `Trigger ${triggerName} must start with sleep_`);
    }

    const indexMatches = migration001.match(/CREATE INDEX IF NOT EXISTS ([a-zA-Z0-9_]+)/g) || [];
    for (const match of indexMatches) {
      const indexName = match.replace('CREATE INDEX IF NOT EXISTS ', '');
      assert.ok(indexName.startsWith('sleep_'), `Index ${indexName} must start with sleep_`);
    }
  });

  test('3. Migration 002 RLS & Access Control compliance', () => {
    const migration002 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/002_sleep_rls.sql'), 'utf-8');
    const rollback002 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/rollback/002_sleep_rls_rollback.sql'), 'utf-8');

    // Verify security definer helper
    assert.ok(migration002.includes('CREATE OR REPLACE FUNCTION public.sleep_is_admin()'), 'Must create sleep_is_admin() helper');
    assert.ok(migration002.includes('SECURITY DEFINER'), 'sleep_is_admin must be SECURITY DEFINER');

    // Verify table grants for PostgREST
    assert.ok(migration002.includes('GRANT ALL ON TABLE public.sleep_categories TO anon, authenticated, service_role;'), 'Must grant permissions to anon and authenticated');

    // Verify EVERY policy starts with "sleep_"
    const policyMatches = migration002.match(/CREATE POLICY "([^"]+)"/g) || [];
    assert.ok(policyMatches.length >= 25, `Expected at least 25 policies, found ${policyMatches.length}`);

    for (const match of policyMatches) {
      const policyName = match.replace(/CREATE POLICY "|"/g, '');
      assert.ok(policyName.startsWith('sleep_'), `Policy "${policyName}" MUST start with prefix "sleep_" per project rules`);
      // Verify rollback drops the policy
      assert.ok(rollback002.includes(`DROP POLICY IF EXISTS "${policyName}"`), `Rollback 002 must drop policy "${policyName}"`);
    }

    // Verify storage buckets
    assert.ok(migration002.includes('sleep-audio-free'), 'Must create sleep-audio-free bucket');
    assert.ok(migration002.includes('sleep-audio-pro'), 'Must create sleep-audio-pro bucket');
  });

  test('4. Migration 003 Seed Data & Rollback compliance', () => {
    const migration003 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/003_sleep_seed.sql'), 'utf-8');
    const rollback003 = fs.readFileSync(path.join(PROJECT_ROOT, 'supabase/migrations/rollback/003_sleep_seed_rollback.sql'), 'utf-8');

    // Verify 5 categories seeded
    assert.ok(migration003.includes("'soundscape'"), 'Must seed soundscape category');
    assert.ok(migration003.includes("'solfeggio'"), 'Must seed solfeggio category');
    assert.ok(migration003.includes("'sleepcast'"), 'Must seed sleepcast category');
    assert.ok(migration003.includes("'sos'"), 'Must seed sos category');
    assert.ok(migration003.includes("'body_scan'"), 'Must seed body_scan category');

    // Verify Clinical Sleep Architecture seeded (no Matthew Walker)
    assert.ok(migration003.includes('Clinical Sleep Architecture & Circadian Descent'), 'Must seed Clinical Sleep Architecture in migration 003');
    assert.ok(!migration003.includes('Matthew Walker'), 'Migration 003 must not contain Matthew Walker');

    // Verify 45 chapters seeded
    assert.ok(migration003.includes('Outer Success, Inner Void'), 'Must seed Chapter 1');
    assert.ok(migration003.includes('Living as Human 2.0'), 'Must seed Part 5');

    // Verify 3 plans seeded
    assert.ok(migration003.includes("'annual'"), 'Must seed annual plan');
    assert.ok(migration003.includes("'monthly'"), 'Must seed monthly plan');
    assert.ok(migration003.includes("'audiobook_lifetime'"), 'Must seed audiobook_lifetime plan');

    // Verify settings seeded
    assert.ok(migration003.includes("'home_copy'"), 'Must seed home_copy setting');
    assert.ok(migration003.includes("'paywall_copy'"), 'Must seed paywall_copy setting');
    assert.ok(migration003.includes("'timer_presets'"), 'Must seed timer_presets setting');
    assert.ok(migration003.includes("'reset_sos'"), 'Must seed reset_sos setting');
    assert.ok(migration003.includes("'ebb_ai_settings'"), 'Must seed ebb_ai_settings setting');

    // Verify rollback cleans up all 5 areas
    assert.ok(rollback003.includes('DELETE FROM public.sleep_settings'), 'Rollback must delete settings');
    assert.ok(rollback003.includes('DELETE FROM public.sleep_plans'), 'Rollback must delete plans');
    assert.ok(rollback003.includes('DELETE FROM public.sleep_audiobook_chapters'), 'Rollback must delete chapters');
    assert.ok(rollback003.includes('DELETE FROM public.sleep_tracks'), 'Rollback must delete tracks');
    assert.ok(rollback003.includes('DELETE FROM public.sleep_categories'), 'Rollback must delete categories');
  });

  test('5. SleepContentService local offline fallback & resilience', async () => {
    // Unconfigured environment should fall back seamlessly to local static data
    const tracks = await sleepContentService.getTracks();
    assert.equal(tracks.length, 16, 'Must return 16 sleep tracks in offline/fallback mode');

    const chapters = await sleepContentService.getAudiobookChapters();
    assert.equal(chapters.length, 45, 'Must return 45 audiobook chapters in offline/fallback mode');

    const categories = await sleepContentService.getCategories();
    assert.equal(categories.length, 5, 'Must return 5 categories in offline/fallback mode');

    const plans = await sleepContentService.getPlans();
    assert.equal(plans.length, 3, 'Must return 3 subscription plans in offline/fallback mode');

    // Synchronous getters must immediately provide full local data
    assert.equal(sleepContentService.getCachedTracks().length, 16);
    assert.equal(sleepContentService.getCachedChapters().length, 45);

    // Recording play events must not throw in unconfigured or offline mode
    await assert.doesNotReject(async () => {
      await sleepContentService.recordPlayEvent({ trackId: 'sleep-free-1', platform: 'web' });
      await sleepContentService.recordPlayEvent({ chapterId: 'ch-1', platform: 'web' });
      await sleepContentService.recordPlayEvent({ trackId: 'invalid-non-uuid-string' });
    });
  });

  test('6. .env.example exists and contains no secret keys', () => {
    const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');

    const envContent = fs.readFileSync(envExamplePath, 'utf-8');
    assert.ok(envContent.includes('VITE_SUPABASE_URL'), '.env.example must mention VITE_SUPABASE_URL');
    assert.ok(envContent.includes('VITE_SUPABASE_ANON_KEY'), '.env.example must mention VITE_SUPABASE_ANON_KEY');
    assert.ok(!/VITE_.*SERVICE_ROLE/i.test(envContent), '.env.example must not export service role keys');
    assert.ok(!/SUPABASE_SERVICE_ROLE/i.test(envContent), '.env.example must not contain service role key variables');
  });
});
