import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  sleepContentService,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_ITEMS,
} from '../../src/services/sleepContentService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Meditation Sections & Free/Paid Audio Management', () => {

  test('1. Migration 005 and Rollback File Validation', () => {
    const migrationPath = path.join(PROJECT_ROOT, 'supabase/migrations/005_sleep_meditation_sections.sql');
    const rollbackPath = path.join(PROJECT_ROOT, 'supabase/migrations/rollback/005_sleep_meditation_sections_rollback.sql');

    assert.ok(fs.existsSync(migrationPath), 'Migration 005 file must exist');
    assert.ok(fs.existsSync(rollbackPath), 'Rollback 005 file must exist');

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    assert.ok(migrationSql.includes('sleep_sections'), 'Must create sleep_sections table');
    assert.ok(migrationSql.includes('sleep_section_items'), 'Must create sleep_section_items table');
    assert.ok(migrationSql.includes('price_aed'), 'Must store AED price for sections');
    assert.ok(migrationSql.includes('price_usd'), 'Must store USD price for sections');
    assert.ok(migrationSql.includes('pricing_tagline'), 'Must store pricing tagline');
    assert.ok(migrationSql.includes("access text NOT NULL DEFAULT 'paid'"), 'Must store access level with paid default');
    assert.ok(migrationSql.includes('sleep-audio-free'), 'Must reference free audio bucket');
    assert.ok(migrationSql.includes('sleep-audio-pro'), 'Must reference pro audio bucket');
    assert.ok(migrationSql.includes('sleep_is_admin()'), 'Must enforce RLS via sleep_is_admin()');

    // Verify seeded sections have distinct pricing
    assert.ok(migrationSql.includes("'AED 49'"), 'Must seed AED 49 sleep meditation');
    assert.ok(migrationSql.includes("'AED 59'"), 'Must seed AED 59 women meditation');
    assert.ok(migrationSql.includes("'AED 39'"), 'Must seed AED 39 audiobook section');

    const rollbackSql = fs.readFileSync(rollbackPath, 'utf-8');
    assert.ok(rollbackSql.includes('sleep_section_items'), 'Rollback must drop sleep_section_items');
    assert.ok(rollbackSql.includes('sleep_sections'), 'Rollback must drop sleep_sections');
  });

  test('2. Default Meditation Sections & Custom Pricing', async () => {
    const sections = await sleepContentService.getSections(true);
    assert.ok(sections.length >= 2, 'Must have at least 2 default meditation sections');

    const sleepMeditation = sections.find((s) => s.slug === 'sleep-meditation');
    assert.ok(sleepMeditation, 'Sleep Meditation section must exist');
    assert.equal(sleepMeditation.priceAed, 'AED 49', 'Sleep Meditation must be priced at AED 49');
    assert.equal(sleepMeditation.pricingType, 'standalone');

    const womenMeditation = sections.find((s) => s.slug === 'meditation-women');
    assert.ok(womenMeditation, 'Meditation for Women section must exist');
    assert.equal(womenMeditation.priceAed, 'AED 59', 'Meditation for Women must have custom AED 59 price');
    assert.equal(womenMeditation.pricingType, 'standalone');
    assert.notEqual(
      sleepMeditation.priceAed,
      womenMeditation.priceAed,
      'Sections must have distinct pricing plans'
    );
  });

  test('3. Free and Paid Audios within Meditation Sections', async () => {
    const sleepMeditation = (await sleepContentService.getSections(true)).find(
      (s) => s.slug === 'sleep-meditation'
    );
    assert.ok(sleepMeditation, 'Sleep Meditation section must exist');

    const items = await sleepContentService.getSectionItems(sleepMeditation.id, true);
    assert.ok(items.length >= 2, 'Section must have items');

    const freeItems = items.filter((i) => i.access === 'free');
    const paidItems = items.filter((i) => i.access === 'paid');

    assert.ok(freeItems.length >= 1, 'Section must have at least one FREE audio');
    assert.ok(paidItems.length >= 1, 'Section must have at least one PAID audio');

    // Free audio bucket check
    const sampleFree = freeItems[0];
    assert.equal(sampleFree.access, 'free');
    assert.equal(sampleFree.audioBucket, 'sleep-audio-free');

    // Paid audio bucket check
    const samplePaid = paidItems[0];
    assert.equal(samplePaid.access, 'paid');
    assert.equal(samplePaid.audioBucket, 'sleep-audio-pro');
  });

  test('4. Admin CRUD: Create New Section with Independent Pricing Plan', async () => {
    const testSlug = `test-meditation-${Date.now()}`;
    const newSection = await sleepContentService.saveSection({
      title: 'Meditation for Deep Focus & Sleep Reset',
      slug: testSlug,
      subtitle: 'Cognitive restoration and autonomic pacer',
      description: 'Advanced breath pacing and theta frequency guidance',
      sectionType: 'meditation',
      pricingType: 'standalone',
      priceAed: 'AED 79',
      priceUsd: '$21.99',
      priceDisplay: 'AED 79 · Lifetime',
      pricingTagline: 'One-time access to complete focus series',
      badge: 'Focus',
      sortOrder: 10,
      isPublished: true,
    });

    assert.ok(newSection.id, 'Created section must have an ID');
    assert.equal(newSection.priceAed, 'AED 79');
    assert.equal(newSection.priceUsd, '$21.99');
    assert.equal(newSection.pricingTagline, 'One-time access to complete focus series');

    // Add Free Audio to this section
    const freeAudio = await sleepContentService.saveSectionItem({
      sectionId: newSection.id,
      title: 'Focus Intro & Parasympathetic Primer',
      subtitle: 'Free foundational breath pacer',
      durationSeconds: 480,
      durationFormatted: '08:00',
      access: 'free',
      audioPath: 'focus/primer_free.mp3',
      audioBucket: 'sleep-audio-free',
      sortOrder: 1,
      isPublished: true,
    });

    assert.equal(freeAudio.access, 'free');
    assert.equal(freeAudio.audioBucket, 'sleep-audio-free');

    // Add Paid Audio to this section
    const paidAudio = await sleepContentService.saveSectionItem({
      sectionId: newSection.id,
      title: 'Master Theta Resonance Immersion',
      subtitle: 'Complete 30-min deep restoration protocol',
      durationSeconds: 1800,
      durationFormatted: '30:00',
      access: 'paid',
      audioPath: 'focus/master_theta_paid.mp3',
      audioBucket: 'sleep-audio-pro',
      sortOrder: 2,
      isPublished: true,
    });

    assert.equal(paidAudio.access, 'paid');
    assert.equal(paidAudio.audioBucket, 'sleep-audio-pro');

    // Verify Section Item Counts
    const allSections = await sleepContentService.getSections(true);
    const createdInList = allSections.find((s) => s.id === newSection.id);
    assert.ok(createdInList);
    assert.equal(createdInList.freeCount, 1, 'Section must report 1 free track');
    assert.equal(createdInList.paidCount, 1, 'Section must report 1 paid track');

    // Toggle Audio from Free to Paid
    const switchedAudio = await sleepContentService.saveSectionItem({
      id: freeAudio.id,
      access: 'paid',
      audioBucket: 'sleep-audio-pro',
    });
    assert.equal(switchedAudio.access, 'paid');
    assert.equal(switchedAudio.audioBucket, 'sleep-audio-pro');

    // Clean up created test items and section
    await sleepContentService.deleteSectionItem(freeAudio.id);
    await sleepContentService.deleteSectionItem(paidAudio.id);
    await sleepContentService.deleteSection(newSection.id);

    const afterDelete = await sleepContentService.getSections(true);
    assert.ok(!afterDelete.find((s) => s.id === newSection.id), 'Deleted section must no longer exist');
  });

  test('5. Admin Navigation and Routing Integration', () => {
    const navTs = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/adminNavigation.ts'),
      'utf-8'
    );
    assert.ok(navTs.includes("'sections'"), 'AdminSection union must include sections');
    assert.ok(navTs.includes("label: 'Meditation Sections'"), 'Nav group must include Meditation Sections');
    assert.ok(navTs.includes("group: 'LISTEN'"), 'Nav group must be LISTEN');

    const adminAppTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/AdminApp.tsx'),
      'utf-8'
    );
    assert.ok(adminAppTsx.includes('import { SectionsView }'), 'AdminApp must import SectionsView');
    assert.ok(adminAppTsx.includes("case 'sections':"), 'AdminApp must route sections');
    assert.ok(adminAppTsx.includes('<SectionsView />'), 'AdminApp must render SectionsView');

    const dashboardViewTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/DashboardView.tsx'),
      'utf-8'
    );
    assert.ok(dashboardViewTsx.includes('Meditation sections'), 'Dashboard must show Meditation sections card');
    assert.ok(dashboardViewTsx.includes('new_section'), 'Dashboard must show new_section quick action');
  });

  test('6. UI Component Files Integrity', () => {
    const sectionsViewPath = path.join(PROJECT_ROOT, 'src/admin/content/SectionsView.tsx');
    const editorModalPath = path.join(PROJECT_ROOT, 'src/admin/content/SectionEditorModal.tsx');
    const audioModalPath = path.join(PROJECT_ROOT, 'src/admin/content/SectionAudioModal.tsx');

    assert.ok(fs.existsSync(sectionsViewPath), 'SectionsView.tsx must exist');
    assert.ok(fs.existsSync(editorModalPath), 'SectionEditorModal.tsx must exist');
    assert.ok(fs.existsSync(audioModalPath), 'SectionAudioModal.tsx must exist');

    const sectionsViewCode = fs.readFileSync(sectionsViewPath, 'utf-8');
    assert.ok(sectionsViewCode.includes('handleToggleAudioAccess'), 'Must provide 1-click Free/Paid audio toggle');
    assert.ok(sectionsViewCode.includes('FREE AUDIO'), 'Must display FREE AUDIO badge');
    assert.ok(sectionsViewCode.includes('PAID AUDIO'), 'Must display PAID AUDIO badge');
    assert.ok(sectionsViewCode.includes('SectionEditorModal'), 'Must embed SectionEditorModal');
    assert.ok(sectionsViewCode.includes('SectionAudioModal'), 'Must embed SectionAudioModal');

    const audioModalCode = fs.readFileSync(audioModalPath, 'utf-8');
    assert.ok(audioModalCode.includes('Audio Access Level'), 'Audio modal must have Access Level selector');
    assert.ok(audioModalCode.includes('sleep-audio-free'), 'Audio modal must designate sleep-audio-free bucket');
    assert.ok(audioModalCode.includes('sleep-audio-pro'), 'Audio modal must designate sleep-audio-pro bucket');
  });
});
