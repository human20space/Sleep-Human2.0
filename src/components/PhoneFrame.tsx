import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export type DeviceEmulatorMode = 'iphone' | 'pixel' | 'ipad' | 'desktop';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeScreen: string;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ 
  children,
  isDark,
  onToggleDark 
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceEmulatorMode>('iphone');
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const toggleSound = () => {
    const isPlaying = audioEngine.toggleAmbientDrone();
    setAmbientPlaying(isPlaying);
  };

  return (
    <div className="w-full h-full min-h-screen min-h-[100dvh] bg-[#dcd3c2] dark:bg-[#070c0e] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col items-center justify-start p-0 sm:p-4 transition-all duration-300 overflow-hidden">
      {/* Top Desktop Chrome Toolbar — visible ONLY on desktop/tablet screens (>=640px) */}
      <header className="hidden sm:flex w-full max-w-5xl items-center justify-between py-2 px-4 mb-3 bg-[#efe9df]/95 dark:bg-[#101b22]/95 backdrop-blur-md rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-sm shrink-0 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#17495e] dark:bg-[#1f3542] flex items-center justify-center text-[#e8b98a] font-serif-title font-bold text-sm shadow-sm">
            2.0
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-[#17495e] dark:text-[#e8b98a] leading-tight">Human 2.0</h1>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-[#17495e]/15 text-[#17495e] dark:bg-[#e8b98a]/20 dark:text-[#e8b98a] font-bold">
                Sleep Sanctuary
              </span>
            </div>
            <p className="text-[11px] text-[#5a6663] dark:text-[#9eb2be] -mt-0.5">Tri-Platform Engine · iOS, Android, iPad & Web App</p>
          </div>
        </div>

        {/* Device Emulator Selector & Platform Switcher */}
        <div className="flex items-center gap-1 bg-[#e6dccb]/60 dark:bg-[#16252e] p-1 rounded-xl border border-[#d8ccb8] dark:border-[#1f3442]">
          <button
            onClick={() => setDeviceMode('iphone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === 'iphone'
                ? 'bg-white dark:bg-[#17495e] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#5a6663] dark:text-[#9eb2be] hover:text-[#17495e] dark:hover:text-[#e8b98a]'
            }`}
            title="iPhone 15 Pro Mobile Emulator"
          >
            <Smartphone size={13} />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => setDeviceMode('pixel')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === 'pixel'
                ? 'bg-white dark:bg-[#17495e] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#5a6663] dark:text-[#9eb2be] hover:text-[#17495e] dark:hover:text-[#e8b98a]'
            }`}
            title="Android Google Pixel 8 Emulator"
          >
            <Smartphone size={13} />
            <span>Pixel (Android)</span>
          </button>

          <button
            onClick={() => setDeviceMode('ipad')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === 'ipad'
                ? 'bg-white dark:bg-[#17495e] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#5a6663] dark:text-[#9eb2be] hover:text-[#17495e] dark:hover:text-[#e8b98a]'
            }`}
            title="iPad Air / Pro Tablet Emulator"
          >
            <Tablet size={13} />
            <span>iPad Tablet</span>
          </button>

          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-[#17495e] text-[#17495e] dark:text-[#e8b98a] shadow-xs'
                : 'text-[#5a6663] dark:text-[#9eb2be] hover:text-[#17495e] dark:hover:text-[#e8b98a]'
            }`}
            title="Universal Responsive Web App"
          >
            <Monitor size={13} />
            <span>Web App</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Soundscape Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              ambientPlaying 
                ? 'bg-[#1f5f78] dark:bg-[#17495e] text-[#f7f3ec] shadow-sm animate-pulse' 
                : 'bg-[#f7f3ec] dark:bg-[#14232c] text-[#5a6663] dark:text-[#9eb2be] hover:text-[#1f5f78] dark:hover:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38]'
            }`}
            title="Toggle 432Hz ambient stillness resonance"
          >
            <Volume2 size={13} className={ambientPlaying ? 'animate-pulse' : 'opacity-70'} />
            <span>{ambientPlaying ? '432Hz Active' : 'Sound Off'}</span>
          </button>

          {/* Daylight / Night Sanctuary Theme Toggle */}
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f7f3ec] dark:bg-[#14232c] hover:bg-[#efe9df] dark:hover:bg-[#1d2e38] text-[#5a6663] dark:text-[#9eb2be] border border-[#e6dccb] dark:border-[#1d2e38] transition-all cursor-pointer"
              title={isDark ? 'Switch to Daylight Light Mode' : 'Switch to Night Sanctuary Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun size={13} className="text-[#e8b98a]" />
                  <span>Daylight</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-[#17495e]" />
                  <span>Night</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main View Container */}
      <main className="w-full h-full flex-1 flex justify-center items-center overflow-hidden">
        {/* On native mobile screens (<640px), render edge-to-edge 100vw x 100dvh without fake bezel */}
        {isMobileScreen ? (
          <div className="w-full h-full min-h-[100dvh] bg-[#f7f3ec] dark:bg-[#0b1317] flex flex-col relative overflow-hidden transition-colors">
            {/* Minimal Mobile Floating Ambient Button */}
            <div className="absolute top-2 right-3 z-50 pointer-events-auto">
              <button
                onClick={toggleSound}
                className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all flex items-center justify-center cursor-pointer ${
                  ambientPlaying 
                    ? 'bg-[#1f5f78] dark:bg-[#17495e] text-[#e8b98a] ring-2 ring-[#d9a44a]/50' 
                    : 'bg-white/80 dark:bg-[#14232c]/80 text-[#5a6663] dark:text-[#9eb2be] border border-[#e6dccb] dark:border-[#1d2e38]'
                }`}
                title="Toggle Ambient Audio"
              >
                {ambientPlaying ? <Volume2 size={14} className="animate-pulse" /> : <VolumeX size={14} />}
              </button>
            </div>

            {/* Mobile Viewport Screen */}
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        ) : deviceMode === 'iphone' ? (
          /* iPhone 15 Pro Emulator Bezel */
          <div className="relative w-[393px] h-[852px] max-h-[calc(100vh-80px)] bg-[#f7f3ec] dark:bg-[#0b1317] rounded-[52px] border-[12px] border-[#101719] dark:border-[#05080a] shadow-[0_25px_60px_-15px_rgba(23,73,94,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col transition-colors">
            {/* Dynamic Island Capsule */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 pointer-events-none flex items-center justify-end pr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111923] border border-[#233543]/40" />
            </div>

            {/* Inner Content */}
            <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col pt-3">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1f2a28]/25 dark:bg-[#f2ede4]/30 rounded-full pointer-events-none z-50" />
          </div>
        ) : deviceMode === 'pixel' ? (
          /* Google Pixel 8 Android Emulator Bezel */
          <div className="relative w-[412px] h-[890px] max-h-[calc(100vh-80px)] bg-[#f7f3ec] dark:bg-[#0b1317] rounded-[44px] border-[10px] border-[#101719] dark:border-[#05080a] shadow-[0_25px_60px_-15px_rgba(23,73,94,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col transition-colors">
            {/* Android Punch Hole Camera */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 pointer-events-none" />

            {/* Inner Content */}
            <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col pt-2">
              {children}
            </div>

            {/* Android Gesture Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#1f2a28]/25 dark:bg-[#f2ede4]/30 rounded-full pointer-events-none z-50" />
          </div>
        ) : deviceMode === 'ipad' ? (
          /* iPad Air / Pro Tablet Emulator Bezel */
          <div className="relative w-[820px] max-w-[96vw] h-[890px] max-h-[calc(100vh-80px)] bg-[#f7f3ec] dark:bg-[#0b1317] rounded-[38px] border-[14px] border-[#101719] dark:border-[#05080a] shadow-[0_30px_70px_-15px_rgba(23,73,94,0.4)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col transition-colors">
            {/* iPad Front Sensor */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a252b] rounded-full z-50 pointer-events-none" />

            {/* Inner Content with Native Tablet Dimensions */}
            <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col pt-2">
              {children}
            </div>

            {/* iPad Home Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#1f2a28]/25 dark:bg-[#f2ede4]/30 rounded-full pointer-events-none z-50" />
          </div>
        ) : (
          /* Universal Responsive Web App (Desktop Mode) */
          <div className="w-full max-w-5xl h-[890px] max-h-[calc(100vh-80px)] bg-[#f7f3ec] dark:bg-[#0b1317] rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-[0_20px_50px_rgba(23,73,94,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative transition-colors">
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
