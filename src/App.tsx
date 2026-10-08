import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Screen, UserInsight, AwarenessMoment, MirrorSession, ConstructionAudioSession } from './types';
import { INITIAL_USER_INSIGHTS } from './data/bookContent';
import { AudioProvider, useAudio } from './context/AudioContext';
import { PhoneFrame } from './components/PhoneFrame';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { PauseScreen } from './components/PauseScreen';
import { MirrorScreen } from './components/MirrorScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { HumanAiScreen } from './components/HumanAiScreen';
import { VaultScreen } from './components/VaultScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AudioChaptersScreen } from './components/AudioChaptersScreen';
import { EbbCompanionScreen } from './components/EbbCompanionScreen';
import { UnguidedTimerScreen } from './components/UnguidedTimerScreen';
import { LiveCommunityScreen } from './components/LiveCommunityScreen';
import { ExploreLibraryScreen } from './components/ExploreLibraryScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { AudioConstructionPlayer } from './components/AudioConstructionPlayer';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { BottomTabBar } from './components/BottomTabBar';

// PWA Engine & Notification Components
import { registerServiceWorker, applyServiceWorkerUpdate } from './pwa/registerServiceWorker';
import { usePwaInstall } from './pwa/usePwaInstall';
import { UpdateToast } from './components/UpdateToast';
import { InstallPromptModal } from './components/InstallPromptModal';
import { AudiobookPaywallModal } from './components/AudiobookPaywallModal';

export function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeConstructionSession, setActiveConstructionSession] = useState<ConstructionAudioSession | null>(null);

  // Service Worker Update State
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Custom PWA Install Engine Hook
  const {
    isIOS,
    canPromptDirectly,
    promptInstall,
    showInstallModal,
    dismissInstallPrompt,
  } = usePwaInstall();

  // Audiobook Paywall State from Audio Context
  const {
    showAudiobookPaywall,
    setShowAudiobookPaywall,
    unlockAudiobook,
  } = useAudio();

  // Initialize Service Worker Registration
  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (registration) => {
        setSwRegistration(registration);
      },
    });
  }, []);

  // Theme State — defaults to Warm Daylight Light Mode (false)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('human2_dark_mode');
      if (saved !== null) return saved === 'true';
      return false; // Default to Light Mode!
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('human2_dark_mode', isDark ? 'true' : 'false');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleToggleDark = () => setIsDark((prev) => !prev);

  // Load insights from localStorage or use initial ontology
  const [insights, setInsights] = useState<UserInsight[]>(() => {
    try {
      const saved = localStorage.getItem('human2_insights');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_INSIGHTS;
  });

  // Meaningful Awareness Moments (MAMs) - North Star Metric
  const [awarenessMoments, setAwarenessMoments] = useState<AwarenessMoment[]>(() => {
    try {
      const saved = localStorage.getItem('human2_mams');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'mam-1', timestamp: 'Yesterday', type: 'pause', title: 'The Sovereign Pause' },
      { id: 'mam-2', timestamp: '2 days ago', type: 'mirror_clarity', title: 'Mirror: Work Feedback' },
      { id: 'mam-3', timestamp: '3 days ago', type: 'experiment_committed', title: 'Journey 1: Notice Assumptions' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('human2_insights', JSON.stringify(insights));
    } catch {
      // ignore
    }
  }, [insights]);

  useEffect(() => {
    try {
      localStorage.setItem('human2_mams', JSON.stringify(awarenessMoments));
    } catch {
      // ignore
    }
  }, [awarenessMoments]);

  const handleRecordMAM = (title: string) => {
    const newMAM: AwarenessMoment = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      type: 'pause',
      title,
    };
    setAwarenessMoments((prev) => [newMAM, ...prev]);
  };

  const handleSaveInsight = (text: string, tag: string) => {
    const newInsight: UserInsight = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      source: 'mirror',
      text,
      tag,
    };
    setInsights((prev) => [newInsight, ...prev]);
  };

  const handleSaveMirrorSession = (session: MirrorSession) => {
    const text = `Trigger: "${session.trigger}" -> Core Need: "${session.coreNeed}" -> Sovereign Choice: "${session.choice}"`;
    handleSaveInsight(text, 'Mirror Clarity');
  };

  const handleClearAll = () => {
    setInsights([]);
    setAwarenessMoments([]);
    localStorage.removeItem('human2_insights');
    localStorage.removeItem('human2_mams');
  };

  return (
    <PhoneFrame activeScreen={currentScreen} isDark={isDark} onToggleDark={handleToggleDark}>
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] transition-colors">
        {/* Layer 6: Instant OTA Update Toast (Safe Area Top offset) */}
        <UpdateToast
          show={Boolean(swRegistration)}
          onRefresh={() => {
            if (swRegistration) {
              applyServiceWorkerUpdate(swRegistration);
            }
          }}
          onDismiss={() => setSwRegistration(null)}
        />

        {/* Layer 7: Custom Install Prompt Modal / Sheet */}
        <InstallPromptModal
          show={showInstallModal}
          onClose={dismissInstallPrompt}
          onInstall={promptInstall}
          isIOS={isIOS}
          canPromptDirectly={canPromptDirectly}
        />

        {/* Full-Screen Audio Under Construction Player Modal */}
        <AnimatePresence>
          {activeConstructionSession && (
            <motion.div
              key="construction-player"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute inset-0 z-50 flex flex-col bg-[#f7f3ec] dark:bg-[#0b1317]"
            >
              <AudioConstructionPlayer
                session={activeConstructionSession}
                onBack={() => setActiveConstructionSession(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 z-50"
            >
              <SplashScreen onComplete={() => setCurrentScreen('home')} />
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <HomeScreen
                onNavigate={(screen) => setCurrentScreen(screen)}
                mamsCount={awarenessMoments.length}
                isDark={isDark}
                onToggleDark={handleToggleDark}
              />
            </motion.div>
          )}

          {currentScreen === 'pause' && (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <PauseScreen
                onBack={() => setCurrentScreen('home')}
                onSaveInsight={handleSaveInsight}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'mirror' && (
            <motion.div
              key="mirror"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <MirrorScreen
                onBack={() => setCurrentScreen('home')}
                onSaveSession={handleSaveMirrorSession}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <PracticeScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
                onSaveInsight={handleSaveInsight}
              />
            </motion.div>
          )}

          {currentScreen === 'journey' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <JourneyScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
                onSaveInsight={handleSaveInsight}
              />
            </motion.div>
          )}

          {currentScreen === 'human_ai' && (
            <motion.div
              key="human_ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <HumanAiScreen
                onBack={() => setCurrentScreen('home')}
                onSaveInsight={handleSaveInsight}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <VaultScreen
                onBack={() => setCurrentScreen('home')}
                insights={insights}
                awarenessMoments={awarenessMoments}
                onClearAll={handleClearAll}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <ProfileScreen
                onBack={() => setCurrentScreen('home')}
                onNavigate={(screen) => setCurrentScreen(screen)}
                isDark={isDark}
                onToggleDark={handleToggleDark}
              />
            </motion.div>
          )}

          {currentScreen === 'audio_chapters' && (
            <motion.div
              key="audio_chapters"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <AudioChaptersScreen
                onBack={() => setCurrentScreen('home')}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            </motion.div>
          )}

          {currentScreen === 'ebb' && (
            <motion.div
              key="ebb"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <EbbCompanionScreen
                onBack={() => setCurrentScreen('home')}
                onOpenSession={(s) => setActiveConstructionSession(s)}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            </motion.div>
          )}

          {currentScreen === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <UnguidedTimerScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <LiveCommunityScreen onBack={() => setCurrentScreen('home')} />
            </motion.div>
          )}

          {currentScreen === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <ExploreLibraryScreen
                onBack={() => setCurrentScreen('home')}
                onOpenSession={(s) => setActiveConstructionSession(s)}
                onNavigate={(scr) => setCurrentScreen(scr)}
              />
            </motion.div>
          )}

          {currentScreen === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <SubscriptionScreen
                onBack={() => setCurrentScreen('home')}
                onSuccess={() => setCurrentScreen('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Floating Mini-Player Bar (shown when audio is active and not in player/pause modal) */}
        {!activeConstructionSession &&
          currentScreen !== 'splash' &&
          currentScreen !== 'audio_chapters' &&
          currentScreen !== 'pause' &&
          currentScreen !== 'timer' && (
            <MiniPlayerBar onOpenFullPlayer={() => setCurrentScreen('audio_chapters')} />
          )}

        {/* Global Bottom Tab Bar */}
        {!activeConstructionSession &&
          currentScreen !== 'splash' &&
          currentScreen !== 'pause' && (
            <BottomTabBar
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
            />
          )}

        {/* PWA Update Toast Notification */}
        <UpdateToast
          show={Boolean(swRegistration)}
          onRefresh={() => {
            if (swRegistration) {
              applyServiceWorkerUpdate(swRegistration);
            }
          }}
          onDismiss={() => setSwRegistration(null)}
        />

        {/* Custom PWA Install Experience Modal */}
        <InstallPromptModal
          show={showInstallModal}
          onClose={dismissInstallPrompt}
          onInstall={promptInstall}
          isIOS={isIOS}
          canPromptDirectly={canPromptDirectly}
        />

        {/* Dedicated Audiobook Paywall Modal (triggers when 25-min sample ends or locked chapter tapped) */}
        <AudiobookPaywallModal
          show={showAudiobookPaywall}
          onClose={() => setShowAudiobookPaywall(false)}
          onUnlockSuccess={() => unlockAudiobook()}
          onNavigateToSovereign={() => setCurrentScreen('subscription')}
        />
      </div>
    </PhoneFrame>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;
