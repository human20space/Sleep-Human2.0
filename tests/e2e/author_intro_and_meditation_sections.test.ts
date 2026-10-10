import test, { describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();

describe('Author Intro, Meditation Sections & Relaxing Bell Renaming', () => {
  test('1. Author Intro Screen Specification & Routing', () => {
    const authorIntroTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/AuthorIntroScreen.tsx'),
      'utf-8'
    );
    const appTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/App.tsx'), 'utf-8');
    const typesTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/types/index.ts'), 'utf-8');

    // Type screen inclusion
    assert.ok(typesTsx.includes("'author_intro'"), "types/index.ts must include 'author_intro' screen");

    // Author content
    assert.ok(authorIntroTsx.includes('Vinay Kapoor'), 'Must mention Author Vinay Kapoor');
    assert.ok(
      authorIntroTsx.includes('Human 2.0: Awareness — Future Ready with AI'),
      'Must mention book title'
    );
    assert.ok(authorIntroTsx.includes('Skip to App'), 'Must provide a quick skip button');
    assert.ok(authorIntroTsx.includes('Enter Sleep Sanctuary'), 'Must provide primary CTA to enter sanctuary');
    assert.ok(authorIntroTsx.includes('VideoPlayer'), 'Must embed Author Video message');

    // Routing in App.tsx
    assert.ok(
      appTsx.includes("SplashScreen onComplete={() => setCurrentScreen('author_intro')}"),
      'SplashScreen completes to author_intro'
    );
    assert.ok(
      appTsx.includes("currentScreen === 'author_intro'"),
      'App.tsx renders AuthorIntroScreen'
    );
  });

  test('2. Meditation Hub Architecture & Landing Page Specifications', () => {
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );
    const meditationHubTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/MeditationHubScreen.tsx'),
      'utf-8'
    );
    const appTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/App.tsx'), 'utf-8');
    const sectionsViewTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/content/SectionsView.tsx'),
      'utf-8'
    );

    // Landing Page Square Boxes: 1st Audio Book, 2nd Meditation linking to meditation_hub
    assert.ok(homeScreenTsx.includes('aspect-square'), 'Must feature square boxes');
    assert.ok(homeScreenTsx.includes('Audio Book'), '1st square must feature Audio Book');
    assert.ok(homeScreenTsx.includes('Meditation'), '2nd square must feature Meditation');
    assert.ok(homeScreenTsx.includes("onNavigate('meditation_hub')"), 'Meditation box must navigate to meditation_hub');
    assert.ok(homeScreenTsx.includes('Explore All Series'), 'Must change subtext under Restorative Meditation');

    // Uniform Top Header with User Profile circle next to Unlock All
    assert.ok(homeScreenTsx.includes("onNavigate('profile')"), 'Must have User Profile button in top right');
    assert.ok(homeScreenTsx.includes('w-9 h-9 rounded-full'), 'Profile and Night buttons must be uniform circular buttons');
    assert.ok(homeScreenTsx.includes('min-h-[44px]'), 'Buttons must adhere to min-h-[44px] touch target');

    // Author Profile near the Vault (NOT floating outside)
    assert.ok(homeScreenTsx.includes("onNavigate('author_intro')"), 'Must have Author Profile button');
    assert.ok(!homeScreenTsx.includes('fixed bottom-20 right-4'), 'Floating outside author button must be removed');
    assert.ok(homeScreenTsx.includes('Personal Awareness Vault'), 'Author must appear near the Vault');

    // Removal from Home Screen & Presence in MeditationHubScreen
    assert.ok(!homeScreenTsx.includes('id="meditation-collection-view"'), 'Meditation collections removed from HomeScreen');
    assert.ok(appTsx.includes('MeditationHubScreen'), 'App.tsx must register MeditationHubScreen');

    // MeditationHubScreen Dynamic Sections & Audio Badges
    assert.ok(meditationHubTsx.includes('useSleepSections'), 'MeditationHubScreen must consume useSleepSections()');
    assert.ok(meditationHubTsx.includes('useSectionItems'), 'MeditationHubScreen must consume useSectionItems()');
    assert.ok(meditationHubTsx.includes('sec.priceDisplay'), 'Must display section pricing badge (e.g. AED 49)');
    assert.ok(meditationHubTsx.includes('FREE AUDIO'), 'Must display FREE AUDIO badge');
    assert.ok(meditationHubTsx.includes('PAID ·'), 'Must display PAID badge');
    assert.ok(meditationHubTsx.includes('handlePlayAudio'), 'Must provide audio playback');

    // Admin Panel Section Rearrangement Option
    assert.ok(sectionsViewTsx.includes('handleMoveSection'), 'Admin panel must provide handleMoveSection to rearrange sections');
    assert.ok(sectionsViewTsx.includes('ArrowUp'), 'Admin panel must have Move Up button');
    assert.ok(sectionsViewTsx.includes('ArrowDown'), 'Admin panel must have Move Down button');
  });

  test('3. Relaxing Bell Renaming Across Codebase', () => {
    const catalogTs = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/data/sleepCatalogData.ts'),
      'utf-8'
    );
    const audioContextTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/context/AudioContext.tsx'),
      'utf-8'
    );
    const adminAppTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/admin/AdminApp.tsx'),
      'utf-8'
    );
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );

    assert.ok(catalogTs.includes("title: 'Relaxing Bell'"), "Catalog sleep-free-1 must be named 'Relaxing Bell'");
    assert.ok(audioContextTsx.includes("title: 'Relaxing Bell'"), "AudioContext default track must be 'Relaxing Bell'");
    assert.ok(adminAppTsx.includes('Relaxing Bell'), "Admin telemetry must reference 'Relaxing Bell'");
    assert.ok(
      homeScreenTsx.includes("Tonight's Featured Bell Sound · 100% Free"),
      "Hero badge must retain 'Tonight's Featured Bell Sound · 100% Free'"
    );
  });
});
