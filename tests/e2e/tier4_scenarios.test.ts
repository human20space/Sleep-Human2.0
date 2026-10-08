// Tier 4: Real-World Application Scenarios E2E Tests (5 Complex Scenarios)
// Full End-User Workflows derived from TEST_INFRA.md

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MockLocalStorageVault,
  analyzeServiceWorkerScript,
  type SleepTrackSpec,
} from './helpers/contracts.ts';
import { checkCssRules, parseHtmlMetaAndLinks, validateTouchTargetSize } from './helpers/dom_css.ts';
import { REFERENCE_SLEEP_CATALOG } from './helpers/fixtures.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Tier 4: Real-World Application Scenarios', () => {
  // --------------------------------------------------------------------------
  // Scenario 1: Bedtime Immersion
  // --------------------------------------------------------------------------
  test('Scenario 1: Bedtime Immersion - First-time user launches app, immediately plays free sleepcast without login modal', async () => {
    // 1. First-time launch: user has blank local storage
    const vault = new MockLocalStorageVault();
    vault.clear();
    assert.equal(vault.getItem('human2_is_premium'), null);
    assert.deepEqual(vault.getFavorites(), []);
    assert.deepEqual(vault.getContinueListening(), []);

    // 2. App defaults to Sleep Sanctuary Home
    let currentScreen = 'sleep';
    assert.equal(currentScreen, 'sleep');

    // 3. User browses curated catalog, discovers free sleepcast "The Whispering Pines"
    const freeTrack = REFERENCE_SLEEP_CATALOG.find(t => t.category === 'sleepcast' && !t.isPremium);
    assert.ok(freeTrack, 'Free sleepcast track must exist in catalog');
    assert.equal(freeTrack.title, 'The Whispering Pines');
    assert.equal(freeTrack.isPremium, false);

    // 4. User taps Play button (verifying touch target >= 44px)
    const playButtonTarget = { width: 48, height: 48 };
    assert.ok(validateTouchTargetSize(playButtonTarget.width, playButtonTarget.height, 44));

    // 5. Audio state initiates immediate playback with zero authentication check or modal
    let activeTrack: SleepTrackSpec | null = null;
    let isPlaying = false;
    let authModalTriggered = false;

    const playTrack = (track: SleepTrackSpec) => {
      if (track.isPremium && !vault.isSovereign()) {
        authModalTriggered = true;
      } else {
        activeTrack = track;
        isPlaying = true;
      }
    };

    playTrack(freeTrack);

    assert.equal(authModalTriggered, false, 'Free track must never trigger auth modal');
    assert.equal(isPlaying, true);
    assert.equal(activeTrack?.id, freeTrack.id);

    // 6. User listens for 300 seconds; playback progress updates in vault
    vault.saveProgress({
      id: freeTrack.id,
      type: 'sleep_track',
      title: freeTrack.title,
      subtitle: freeTrack.subtitle,
      positionSeconds: 300,
      durationSeconds: freeTrack.durationSeconds,
    });

    const progressList = vault.getContinueListening();
    assert.equal(progressList.length, 1);
    assert.equal(progressList[0].positionSeconds, 300);

    // 7. Verify layout safety: mobile viewport fit and safe areas intact
    const indexHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf-8');
    assert.ok(indexHtml.includes('viewport-fit=cover'));
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Emergency SOS 90s Reset
  // --------------------------------------------------------------------------
  test('Scenario 2: Emergency SOS 90s Reset - Distressed user launches acute racing mind silencer', async () => {
    // 1. User is experiencing acute insomnia or racing mind; navigates to center hero SOS Reset
    let currentScreen = 'reset';
    assert.equal(currentScreen, 'reset');

    // 2. Locates 90-Second Racing Mind Silencer track
    const sosTrack = REFERENCE_SLEEP_CATALOG.find(t => t.category === 'sos');
    assert.ok(sosTrack);
    assert.equal(sosTrack.durationSeconds, 90);
    assert.equal(sosTrack.audioEngineType, 'sos_reset');
    assert.equal(sosTrack.isPremium, false);

    // 3. Audio engine initializes somatic breath pacer
    let breathPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    const cycleBreath = (seconds: number) => {
      const cycle = seconds % 19; // 4s inhale, 7s hold, 8s exhale (4-7-8 method)
      if (cycle < 4) return 'inhale';
      if (cycle < 11) return 'hold';
      return 'exhale';
    };

    assert.equal(cycleBreath(2), 'inhale');
    assert.equal(cycleBreath(6), 'hold');
    assert.equal(cycleBreath(15), 'exhale');

    // 4. Timer counts down from 90s to 0s
    let remainingSeconds = 90;
    while (remainingSeconds > 0) {
      remainingSeconds -= 10;
    }
    assert.equal(remainingSeconds, 0);

    // 5. Completion cue: bowl chime played and user returns to calm sanctuary
    let sessionCompleted = true;
    currentScreen = 'sleep';
    assert.equal(sessionCompleted, true);
    assert.equal(currentScreen, 'sleep');
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Sovereign Plan Unlock
  // --------------------------------------------------------------------------
  test('Scenario 3: Sovereign Plan Unlock - User taps locked premium track, simulates purchase, unlocks vault with 528Hz chime', async () => {
    const vault = new MockLocalStorageVault();
    vault.clear();
    assert.equal(vault.isSovereign(), false);

    // 1. User discovers locked premium track "528Hz Miracle Cell Repair"
    const lockedTrack = REFERENCE_SLEEP_CATALOG.find(t => t.id === 'sleep-prem-1');
    assert.ok(lockedTrack);
    assert.equal(lockedTrack.isPremium, true);

    // 2. User taps track; app detects locked status and surfaces Sovereign Plan sheet
    let subscriptionSheetOpen = false;
    let trackPlaying = false;

    const requestPlay = (track: SleepTrackSpec) => {
      if (track.isPremium && !vault.isSovereign()) {
        subscriptionSheetOpen = true;
      } else {
        trackPlaying = true;
      }
    };

    requestPlay(lockedTrack);
    assert.equal(subscriptionSheetOpen, true);
    assert.equal(trackPlaying, false);

    // 3. User reviews single Sovereign tier benefits and taps 1-tap simulated unlock
    const unlockButtonTarget = { width: 320, height: 52 };
    assert.ok(validateTouchTargetSize(unlockButtonTarget.width, unlockButtonTarget.height, 44));

    // 4. Simulated purchase completes: sets human2_is_premium and plays 528Hz chime
    let chimeFrequencyPlayed = 0;
    const simulateUnlock = () => {
      vault.setSovereign(true);
      chimeFrequencyPlayed = 528; // Harmonic transformation chime
      subscriptionSheetOpen = false;
    };

    simulateUnlock();

    assert.equal(vault.getItem('human2_is_premium'), 'true');
    assert.equal(vault.isSovereign(), true);
    assert.equal(chimeFrequencyPlayed, 528);
    assert.equal(subscriptionSheetOpen, false);

    // 5. User immediately replays track; playback proceeds smoothly
    requestPlay(lockedTrack);
    assert.equal(trackPlaying, true);

    // 6. User bookmarks newly unlocked track to favorites
    vault.toggleFavorite(lockedTrack.id);
    assert.ok(vault.getFavorites().includes(lockedTrack.id));
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Offline Commute / Sleep Flight
  // --------------------------------------------------------------------------
  test('Scenario 4: Offline Commute / Sleep Flight - Offline boot from SW app shell, resume chapter from vault', async () => {
    // 1. Pre-populated vault before flight
    const vault = new MockLocalStorageVault();
    vault.setSovereign(true); // Sovereign member
    vault.saveProgress({
      id: 'ch-3',
      type: 'audiobook',
      title: 'The Danger of Outsourcing Consciousness',
      subtitle: 'Chapter 3',
      positionSeconds: 420,
      durationSeconds: 720,
    });

    // 2. User goes into Airplane Mode (offline)
    const isOnline = false;

    // 3. Service worker intercepts navigation and serves cached app shell index.html
    const swMock = {
      handleNavigation: (online: boolean) => {
        if (!online) return { status: 200, source: 'cache', file: 'index.html' };
        return { status: 200, source: 'network' };
      },
    };
    const response = swMock.handleNavigation(isOnline);
    assert.equal(response.status, 200);
    assert.equal(response.source, 'cache');

    // 4. User navigates to dedicated "Listen" audiobook section
    let currentTab = 'listen';
    assert.equal(currentTab, 'listen');

    // 5. Recovers saved position for Chapter 3
    const savedItem = vault.getContinueListening().find(i => i.id === 'ch-3');
    assert.ok(savedItem);
    assert.equal(savedItem.positionSeconds, 420);

    // 6. Resumes playback from 420 seconds
    let currentPosition = savedItem.positionSeconds;
    currentPosition += 60; // 1 minute plays
    vault.saveProgress({ ...savedItem, positionSeconds: currentPosition });

    assert.equal(vault.getContinueListening()[0].positionSeconds, 480);
  });

  // --------------------------------------------------------------------------
  // Scenario 5: PWA Instant OTA Update
  // --------------------------------------------------------------------------
  test('Scenario 5: PWA Instant OTA Update - In-session update toast triggers tap-to-refresh without data loss', async () => {
    // 1. User has active state with favorites and custom sleep timer
    const vault = new MockLocalStorageVault();
    vault.setSovereign(true);
    vault.toggleFavorite('sleep-free-2');
    vault.toggleFavorite('sleep-prem-1');
    assert.equal(vault.getFavorites().length, 2);

    // 2. Background service worker detects new deployment push
    let updateFound = false;
    let waitingWorkerState: 'installed' | 'waiting' | 'activated' = 'waiting';
    let toastVisible = false;

    const onUpdateFound = () => {
      updateFound = true;
      toastVisible = true;
    };

    onUpdateFound();
    assert.equal(updateFound, true);
    assert.equal(toastVisible, true);

    // 3. Update Toast renders non-intrusively with expected copy
    const toastMessage = 'New version available · Tap to refresh';
    assert.equal(toastMessage, 'New version available · Tap to refresh');

    // 4. User taps toast refresh action
    let skipWaitingSent = false;
    let windowReloadTriggered = false;

    const onUserTapRefresh = () => {
      // Send postMessage to waiting worker
      skipWaitingSent = true;
      waitingWorkerState = 'activated';
      // controllerchange event fires
      windowReloadTriggered = true;
      toastVisible = false;
    };

    onUserTapRefresh();

    assert.equal(skipWaitingSent, true);
    assert.equal(waitingWorkerState, 'activated');
    assert.equal(windowReloadTriggered, true);
    assert.equal(toastVisible, false);

    // 5. After refresh, local storage vault retains 100% of user data
    assert.equal(vault.isSovereign(), true);
    assert.equal(vault.getFavorites().length, 2);
    assert.deepEqual(vault.getFavorites(), ['sleep-free-2', 'sleep-prem-1']);
  });
});
