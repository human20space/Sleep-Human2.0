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

  test('2. Meditation Sections on Landing Page (HomeScreen.tsx)', () => {
    const homeScreenTsx = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'),
      'utf-8'
    );

    // Dynamic hooks usage
    assert.ok(homeScreenTsx.includes('useSleepSections'), 'HomeScreen must consume useSleepSections()');
    assert.ok(homeScreenTsx.includes('useSectionItems'), 'HomeScreen must consume useSectionItems()');

    // Meditation Sections rendering
    assert.ok(
      homeScreenTsx.includes('activeSections.map'),
      'HomeScreen must render published meditation sections'
    );
    assert.ok(
      homeScreenTsx.includes('sec.priceDisplay'),
      'Must display section pricing badge (e.g. AED 49)'
    );
    assert.ok(
      homeScreenTsx.includes('FREE AUDIO'),
      'Must display FREE AUDIO badge for free meditation recordings'
    );
    assert.ok(
      homeScreenTsx.includes('PAID ·'),
      'Must display PAID badge for locked audios'
    );
    assert.ok(
      homeScreenTsx.includes('handlePlaySectionAudio'),
      'Must provide 1-click playback for free audios and paywall check for paid audios'
    );
    assert.ok(
      homeScreenTsx.includes("onNavigate('author_intro')"),
      'HomeScreen must include Author shortcut button'
    );
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
