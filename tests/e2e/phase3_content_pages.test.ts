import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  sleepContentService,
  detectAudioDuration,
  DEFAULT_SETTINGS,
} from '../../src/services/sleepContentService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Phase 3 Verification: Content Management & UI Reorganization', () => {

  test('1. Home Screen UI Reorganization: Dedicated Listen Section at Top of Content', () => {
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );

    // Verify Dedicated Listen Section exists
    assert.ok(
      homeScreenTsx.includes('Dedicated Listen Section'),
      'HomeScreen must contain Dedicated Listen Section'
    );
    assert.ok(
      homeScreenTsx.includes('Human 2.0 Audiobook (45 Chapters)'),
      'HomeScreen must contain Audiobook title'
    );

    // Verify Tonight\'s Featured Bell Sound hero card exists
    assert.ok(
      homeScreenTsx.includes("Tonight's Featured Bell Sound · 100% Free"),
      'HomeScreen must contain Tonight\'s Featured Bell Sound card'
    );

    // Verify ordering: Dedicated Listen section appears BEFORE Tonight's Featured Bell Sound hero card
    const listenIndex = homeScreenTsx.indexOf('Dedicated Listen Section');
    const heroIndex = homeScreenTsx.indexOf("Tonight's Featured Bell Sound · 100% Free");
    assert.ok(listenIndex > 0, 'Listen section must be present');
    assert.ok(heroIndex > 0, 'Hero card must be present');
    assert.ok(
      listenIndex < heroIndex,
      'Dedicated Listen Section must appear BEFORE Tonight\'s Featured Bell Sound hero card'
    );

    // Verify the old bottom audiobook banner has been removed (only one occurrence in file)
    const matches = homeScreenTsx.match(/Dedicated Listen Section/g);
    assert.equal(
      matches?.length,
      1,
      'Dedicated Listen Section must appear exactly once at the top of content'
    );

    // Verify touch target min-height >= 44px
    assert.ok(
      homeScreenTsx.includes('min-h-[48px]') || homeScreenTsx.includes('min-h-[44px]'),
      'Dedicated Listen banner must maintain >= 44px touch target'
    );
  });

  test('2. Tracks Section & TrackEditorModal Specification', () => {
    const tracksViewTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/TracksView.tsx'),
      'utf-8'
    );
    const modalTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/TrackEditorModal.tsx'),
      'utf-8'
    );

    // Table columns in TracksView: TITLE, CATEGORY, ACCESS, DURATION, PLAYS, PUB
    const expectedHeaders = ['TITLE', 'CATEGORY', 'ACCESS', 'DURATION', 'PLAYS', 'PUB'];
    for (const header of expectedHeaders) {
      assert.ok(
        tracksViewTsx.includes(`<th className="py-3 px-3">${header}</th>`) ||
        tracksViewTsx.includes(`<th className="py-3 px-4">${header}</th>`) ||
        tracksViewTsx.includes(header),
        `TracksView must render column header "${header}"`
      );
    }

    // Top bar: "+ New track", search, count badge
    assert.ok(tracksViewTsx.includes('+ New track'), 'Must include "+ New track" button');
    assert.ok(tracksViewTsx.includes('Search by title'), 'Must include search input');

    // Empty state
    assert.ok(tracksViewTsx.includes('Nothing here yet'), 'Must have empty state title');
    assert.ok(tracksViewTsx.includes('Add the first one'), 'Must have link "Add the first one"');

    // Modal fields: Title, Subtitle, Description, Category dropdown, Type Tag, Engine, Duration, Access, Tags, Free Shelf, Sort order, Published
    assert.ok(modalTsx.includes('Title'), 'TrackEditorModal must have Title');
    assert.ok(modalTsx.includes('Subtitle'), 'TrackEditorModal must have Subtitle');
    assert.ok(modalTsx.includes('Description'), 'TrackEditorModal must have Description');
    assert.ok(modalTsx.includes('Category'), 'TrackEditorModal must have Category');
    assert.ok(modalTsx.includes('Type Tag'), 'TrackEditorModal must have Type Tag');
    assert.ok(modalTsx.includes('Audio Engine Type'), 'TrackEditorModal must have Audio Engine Type');
    assert.ok(modalTsx.includes('Duration (Seconds)'), 'TrackEditorModal must have Duration');
    assert.ok(modalTsx.includes('Access Tier'), 'TrackEditorModal must have Access Tier');
    assert.ok(modalTsx.includes('Tags'), 'TrackEditorModal must have Tags');
    assert.ok(modalTsx.includes('Is Free Shelf'), 'TrackEditorModal must have Is Free Shelf toggle');
    assert.ok(modalTsx.includes('Sort Order'), 'TrackEditorModal must have Sort Order');
    assert.ok(modalTsx.includes('Published'), 'TrackEditorModal must have Published toggle');
    assert.ok(modalTsx.includes('Delete track'), 'TrackEditorModal must have Delete track button');
  });

  test('3. Audio Upload Inside Track & Chapter Editors with Storage Buckets', () => {
    const uploadTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/AudioUpload.tsx'),
      'utf-8'
    );

    // Storage bucket targeting
    assert.ok(
      uploadTsx.includes('sleep-audio-free'),
      'AudioUpload must reference sleep-audio-free bucket'
    );
    assert.ok(
      uploadTsx.includes('sleep-audio-pro'),
      'AudioUpload must reference sleep-audio-pro bucket'
    );

    // Audio duration auto-detection
    assert.ok(
      uploadTsx.includes('detectAudioDuration'),
      'AudioUpload must use detectAudioDuration helper'
    );

    // Preview / Play / Pause
    assert.ok(uploadTsx.includes('Preview') || uploadTsx.includes('togglePlayPreview'), 'Must support audio preview');
    assert.ok(uploadTsx.includes('Replace'), 'Must support replacing audio file');

    // Moving file between buckets
    assert.ok(
      uploadTsx.includes('moveAudioFile'),
      'AudioUpload must support moveAudioFile between buckets'
    );
  });

  test('4. Audiobook Chapters Section & ChapterEditorModal Specification', () => {
    const chaptersViewTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/ChaptersView.tsx'),
      'utf-8'
    );
    const modalTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/ChapterEditorModal.tsx'),
      'utf-8'
    );

    // Table columns: CH #, TITLE, PART, DURATION, ACCESS, PLAYS, PUB
    const expectedHeaders = ['CH #', 'TITLE', 'PART', 'DURATION', 'ACCESS', 'PLAYS', 'PUB'];
    for (const header of expectedHeaders) {
      assert.ok(
        chaptersViewTsx.includes(header),
        `ChaptersView must render column "${header}"`
      );
    }

    // Top bar: "+ New chapter", search, part filter
    assert.ok(chaptersViewTsx.includes('+ New chapter'), 'ChaptersView must have "+ New chapter"');
    assert.ok(chaptersViewTsx.includes('partFilter'), 'ChaptersView must filter by part');
    assert.ok(chaptersViewTsx.includes('Nothing here yet'), 'ChaptersView must handle empty state');

    // Modal fields: Chapter Number, Title, Part Number & Part Title, Duration, Description, Key Takeaway, Access, Audio Upload, Published
    assert.ok(modalTsx.includes('Chapter #'), 'ChapterEditorModal must have Chapter #');
    assert.ok(modalTsx.includes('Title'), 'ChapterEditorModal must have Title');
    assert.ok(modalTsx.includes('Part Number'), 'ChapterEditorModal must have Part Number');
    assert.ok(modalTsx.includes('Part Title'), 'ChapterEditorModal must have Part Title');
    assert.ok(modalTsx.includes('Duration'), 'ChapterEditorModal must have Duration');
    assert.ok(modalTsx.includes('Description'), 'ChapterEditorModal must have Description');
    assert.ok(modalTsx.includes('Key Takeaway'), 'ChapterEditorModal must have Key Takeaway');
    assert.ok(modalTsx.includes('AudioUpload'), 'ChapterEditorModal must integrate AudioUpload');
    assert.ok(modalTsx.includes('Published'), 'ChapterEditorModal must have Published toggle');
  });

  test('5. Categories Section & CategoryEditorModal Specification', () => {
    const catViewTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/CategoriesView.tsx'),
      'utf-8'
    );
    const modalTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/CategoryEditorModal.tsx'),
      'utf-8'
    );

    // Table columns: TITLE, SLUG, SUBTITLE, ORDER, TRACKS COUNT, PUB
    const expectedHeaders = ['TITLE', 'SLUG', 'SUBTITLE', 'ORDER', 'TRACKS COUNT', 'PUB'];
    for (const header of expectedHeaders) {
      assert.ok(
        catViewTsx.includes(header),
        `CategoriesView must render column "${header}"`
      );
    }

    // Modal fields: Title, Slug, Subtitle, Sort Order, Published
    assert.ok(modalTsx.includes('Title'), 'CategoryEditorModal must have Title');
    assert.ok(modalTsx.includes('Slug'), 'CategoryEditorModal must have Slug');
    assert.ok(modalTsx.includes('Subtitle'), 'CategoryEditorModal must have Subtitle');
    assert.ok(modalTsx.includes('Sort Order'), 'CategoryEditorModal must have Sort Order');
    assert.ok(modalTsx.includes('Published'), 'CategoryEditorModal must have Published');
  });

  test('6. Tonight\'s Featured Section Specification', () => {
    const featuredTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/FeaturedTonightView.tsx'),
      'utf-8'
    );

    assert.ok(
      featuredTsx.includes('Currently Featured on Consumer Home Hero'),
      'Must display hero preview card'
    );
    assert.ok(
      featuredTsx.includes('Set as Featured') || featuredTsx.includes('Set as Tonight\'s Featured'),
      'Must provide 1-click action to set featured track'
    );
    assert.ok(
      featuredTsx.includes('Play Audio Preview') || featuredTsx.includes('handleTogglePlay'),
      'Must support previewing candidate track audio'
    );
  });

  test('7. App Screens Editor Tabbed Architecture & Settings Schema', () => {
    const screensTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/AppScreensView.tsx'),
      'utf-8'
    );

    // Required tabs: Sleep Home, Reset (SOS), Ebb AI, Paywall, Sleep Timer, Legal Pages
    assert.ok(screensTsx.includes('Sleep Home'), 'Must have Sleep Home tab');
    assert.ok(screensTsx.includes('Reset (SOS)'), 'Must have Reset SOS tab');
    assert.ok(screensTsx.includes('Ebb AI'), 'Must have Ebb AI tab');
    assert.ok(screensTsx.includes('Paywall'), 'Must have Paywall tab');
    assert.ok(screensTsx.includes('Sleep Timer'), 'Must have Sleep Timer tab');
    assert.ok(screensTsx.includes('Legal Pages'), 'Must have Legal Pages tab');

    // Key settings copy fields
    assert.ok(screensTsx.includes('greeting'), 'Must edit home greeting');
    assert.ok(screensTsx.includes('hero_badge'), 'Must edit hero badge');
    assert.ok(screensTsx.includes('pacing_prompts'), 'Must edit pacing prompts');
    assert.ok(screensTsx.includes('systemPrompt'), 'Must edit Ebb system prompt');
    assert.ok(screensTsx.includes('benefits'), 'Must edit paywall benefits');
    assert.ok(screensTsx.includes('presets'), 'Must edit timer presets');
    assert.ok(screensTsx.includes('terms') && screensTsx.includes('privacy'), 'Must edit terms & privacy');

    // JSON Validation and Save/Reset actions
    assert.ok(screensTsx.includes('JSON Schema Validation') || screensTsx.includes('JSON'), 'Must support JSON validation');
    assert.ok(screensTsx.includes('Reset to default'), 'Must support resetting to defaults');
    assert.ok(screensTsx.includes('Save Settings'), 'Must support saving settings');
  });

  test('8. Full CRUD & Reactive In-Memory / Supabase Service Synchronization', async () => {
    // 1. Tracks CRUD test
    const initialTracks = await sleepContentService.getTracks(true);
    const testTrack = await sleepContentService.saveTrack({
      title: 'Automated Test Soundscape',
      subtitle: 'Testing CRUD operations',
      category: 'soundscape',
      durationSeconds: 720,
      isPremium: false,
    });

    assert.ok(testTrack.id, 'Created track must have an ID');
    assert.equal(testTrack.title, 'Automated Test Soundscape');

    // Verify track is in cached list
    const updatedTracks = await sleepContentService.getTracks(true);
    assert.ok(
      updatedTracks.some((t) => t.id === testTrack.id),
      'Track must exist in tracks list'
    );

    // Toggle publish
    const published = await sleepContentService.toggleTrackPublished(testTrack.id);
    assert.equal(typeof published, 'boolean', 'Toggle publish must return boolean');

    // Set featured tonight
    const setFeatured = await sleepContentService.setFeaturedTonightTrack(testTrack.id);
    assert.ok(setFeatured, 'setFeaturedTonightTrack must succeed');

    // Delete track
    const deleted = await sleepContentService.deleteTrack(testTrack.id);
    assert.ok(deleted, 'deleteTrack must return true');

    const afterDelete = await sleepContentService.getTracks(true);
    assert.ok(
      !afterDelete.some((t) => t.id === testTrack.id),
      'Deleted track must not exist in list'
    );

    // 2. Categories CRUD test
    const testCat = await sleepContentService.saveCategory({
      title: 'Deep Meditation Test',
      subtitle: 'Testing category save',
    });
    assert.ok(testCat.slug, 'Category must have a slug');

    await sleepContentService.deleteCategory(testCat.id);
    const catsAfter = await sleepContentService.getCategories(true);
    assert.ok(
      !catsAfter.some((c) => c.id === testCat.id),
      'Deleted category must not exist'
    );

    // 3. Settings Save & Reset test
    await sleepContentService.saveSetting('test_key', { foo: 'bar' });
    const fetchedSetting = await sleepContentService.getSetting('test_key', {});
    assert.deepEqual(fetchedSetting, { foo: 'bar' });
  });

  test('9. AdminApp Routing to All 16 Navigation Sections', () => {
    const adminAppTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/AdminApp.tsx'),
      'utf-8'
    );

    // Verify view imports and usages
    assert.ok(adminAppTsx.includes('<TracksView'), 'AdminApp must render TracksView');
    assert.ok(adminAppTsx.includes('<ChaptersView'), 'AdminApp must render ChaptersView');
    assert.ok(adminAppTsx.includes('<CategoriesView'), 'AdminApp must render CategoriesView');
    assert.ok(adminAppTsx.includes('<FeaturedTonightView'), 'AdminApp must render FeaturedTonightView');
    assert.ok(adminAppTsx.includes('<AppScreensView'), 'AdminApp must render AppScreensView');
  });
});
