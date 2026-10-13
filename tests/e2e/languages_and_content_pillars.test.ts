import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Stakeholder Requirements Verification: Languages, 4 Pillars, Stories & MediaSession', () => {

  test('1. Multi-Language System (English, Arabic RTL, Hindi)', () => {
    const translationsTs = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/i18n/translations.ts'),
      'utf-8'
    );
    const langContextTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/i18n/LanguageContext.tsx'),
      'utf-8'
    );
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );
    const profileScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/ProfileScreen.tsx'),
      'utf-8'
    );

    // Verify support for en, ar, hi
    assert.ok(translationsTs.includes("'en'"), 'Must include English dictionary');
    assert.ok(translationsTs.includes("'ar'"), 'Must include Arabic dictionary');
    assert.ok(translationsTs.includes("'hi'"), 'Must include Hindi dictionary');

    // Arabic RTL support in context
    assert.ok(langContextTsx.includes("language === 'ar'"), 'Must identify Arabic as RTL');
    assert.ok(langContextTsx.includes("document.documentElement.dir = isRtl ? 'rtl' : 'ltr'"), 'Must set dir attribute on document');
    assert.ok(langContextTsx.includes('human2_language'), 'Must persist language in localStorage');

    // Header Language switcher button
    assert.ok(homeScreenTsx.includes("setLanguage('ar')"), 'Header switcher cycles through languages');
    assert.ok(homeScreenTsx.includes("setLanguage('hi')"), 'Header switcher cycles to Hindi');
    assert.ok(homeScreenTsx.includes("min-h-[44px]"), 'Language button must meet 44px touch target');

    // Profile screen language selector
    assert.ok(profileScreenTsx.includes('setLanguage'), 'ProfileScreen allows changing language');
    assert.ok(profileScreenTsx.includes('العربية'), 'ProfileScreen displays Arabic in native script');
    assert.ok(profileScreenTsx.includes('हिन्दी'), 'ProfileScreen displays Hindi in Devanagari script');
  });

  test('2. Four Core Content Pillars on Home Screen', () => {
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );

    // Verify 2x2 grid with 4 square pillars
    assert.ok(homeScreenTsx.includes('grid-cols-2'), 'Pillars rendered in 2-column grid');
    assert.ok(homeScreenTsx.includes("onNavigate('audio_chapters')"), 'Pillar 1 navigates to Audiobook chapters');
    assert.ok(homeScreenTsx.includes("onNavigate('meditation_hub')"), 'Pillar 2 navigates to Meditation Hub');
    assert.ok(homeScreenTsx.includes("onNavigate('stories')"), 'Pillar 3 navigates to Human 2.0 Stories');
    assert.ok(homeScreenTsx.includes("onNavigate('music')"), 'Pillar 4 navigates to Music');

    // Check touch targets and responsive styling
    assert.ok(homeScreenTsx.includes('aspect-square'), 'Content cards maintain square aspect ratio');
    assert.ok(homeScreenTsx.includes('min-h-[48px]'), 'Content cards maintain >= 48px touch targets');
  });

  test('3. Human 2.0 Stories: Emotional Film, 4 Categories, and Feeling Triage Ending', () => {
    const storiesDataTs = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/data/storiesData.ts'),
      'utf-8'
    );
    const storiesScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/StoriesScreen.tsx'),
      'utf-8'
    );

    // Featured film card
    assert.ok(storiesDataTs.includes('When Life Feels Too Much'), 'Contains featured film title');
    assert.ok(storiesDataTs.includes('2:32 min') || storiesDataTs.includes('2:32'), 'Contains exact 2:32 runtime');
    assert.ok(storiesDataTs.includes('Stress & Overwhelm'), 'Presents under Stress & Overwhelm theme');

    // 4 Content categories
    assert.ok(storiesDataTs.includes("'real_journeys'"), 'Includes Real Journeys category');
    assert.ok(storiesDataTs.includes("'life_stories'"), 'Includes Life Stories category');
    assert.ok(storiesDataTs.includes("'comeback_stories'"), 'Includes Comeback Stories category');
    assert.ok(storiesDataTs.includes("'wisdom_stories'"), 'Includes Wisdom Stories category');

    // Real journeys storytelling structure: Before, Shift, Practice, After
    assert.ok(storiesDataTs.includes('before:'), 'Real journeys have before state');
    assert.ok(storiesDataTs.includes('shift:'), 'Real journeys have shift insight');
    assert.ok(storiesDataTs.includes('practice:'), 'Real journeys have practice');
    assert.ok(storiesDataTs.includes('after:'), 'Real journeys have after state');

    // End-of-video Feeling check-in with the 6 stakeholder feelings
    const feelings = ['stressed', 'overwhelmed', 'lonely', 'angry', 'better', 'grateful'];
    for (const f of feelings) {
      assert.ok(storiesDataTs.includes(`'${f}'`), `Must support feeling: ${f}`);
    }

    // Recommendation bridge into functional app actions
    assert.ok(storiesDataTs.includes('FEELING_RECOMMENDATIONS'), 'Must provide FEELING_RECOMMENDATIONS');
    assert.ok(storiesScreenTsx.includes('How are you feeling right now?'), 'Stories UI poses the feeling check-in question');
    assert.ok(storiesScreenTsx.includes('handleLaunchRecommendation'), 'Displays recommendation and direct launch button');
  });

  test('4. Music Section: Hindi & English Tracks with Mood Tags', () => {
    const musicDataTs = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/data/musicData.ts'),
      'utf-8'
    );
    const musicScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/MusicScreen.tsx'),
      'utf-8'
    );

    // Track metadata
    assert.ok(musicDataTs.includes('Inner Awakening'), 'Includes track 1');
    assert.ok(musicDataTs.includes('Sovereign Peace'), 'Includes track 2');
    assert.ok(musicDataTs.includes('Thaharaav'), 'Includes track 3');
    assert.ok(musicDataTs.includes('Human 2.0 Anthem'), 'Includes track 4');

    // Both Hindi and English languages represented
    assert.ok(musicDataTs.includes("language: 'hi'"), 'Includes Hindi track');
    assert.ok(musicDataTs.includes("language: 'en'"), 'Includes English track');

    // Music Screen UI features
    assert.ok(musicScreenTsx.includes('selectedLanguage'), 'Supports filtering tracks by language');
    assert.ok(musicScreenTsx.includes('stopProceduralSound'), 'Provides fallback audio synthesis');
    assert.ok(musicScreenTsx.includes('handlePlayMusic'), 'Supports active playback toggle');
  });

  test('5. Critical Audio Playback: Lock Screen & MediaSession Integration', () => {
    const audioContextTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/context/AudioContext.tsx'),
      'utf-8'
    );

    // Verify MediaSession registration
    assert.ok(audioContextTsx.includes("'mediaSession' in navigator"), 'Checks for MediaSession API');
    assert.ok(audioContextTsx.includes('navigator.mediaSession.metadata'), 'Sets media session metadata');
    assert.ok(audioContextTsx.includes("setActionHandler('play'"), 'Handles lock-screen play action');
    assert.ok(audioContextTsx.includes("setActionHandler('pause'"), 'Handles lock-screen pause action');
    assert.ok(audioContextTsx.includes("setActionHandler('seekto'"), 'Handles lock-screen seekto action');
    assert.ok(audioContextTsx.includes('playbackState'), 'Synchronizes lock-screen playbackState');
  });
});
