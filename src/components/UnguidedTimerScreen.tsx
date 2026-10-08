import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface UnguidedTimerScreenProps {
  onBack: () => void;
  onRecordMAM: (title: string) => void;
}

export const UnguidedTimerScreen: React.FC<UnguidedTimerScreenProps> = ({ onBack, onRecordMAM }) => {
  // Settings
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [prepSeconds, setPrepSeconds] = useState<number>(10);
  const [intervalMinutes, setIntervalMinutes] = useState<number | null>(5);
  const [bellTone, setBellTone] = useState<'tibetan' | 'temple' | 'tingsha'>('tibetan');
  const [ambientSound, setAmbientSound] = useState<'silence' | '432hz'>('432hz');

  // Timer lifecycle
  const [state, setState] = useState<'setup' | 'prep' | 'running' | 'paused' | 'complete'>('setup');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);
  const [currentPrepRemaining, setCurrentPrepRemaining] = useState<number>(prepSeconds);

  const timerRef = useRef<number | null>(null);

  // Play bell sound helper
  const playSelectedBell = () => {
    hapticsEngine.trigger('hold');
    if (bellTone === 'tibetan') {
      audioEngine.playBowlChime(360, 5);
    } else if (bellTone === 'temple') {
      audioEngine.playBowlChime(220, 6);
    } else {
      audioEngine.playBreathChime('inhale');
    }
  };

  const handleStartTimer = () => {
    hapticsEngine.trigger('tap');
    if (prepSeconds > 0) {
      setCurrentPrepRemaining(prepSeconds);
      setState('prep');
    } else {
      startSessionDirectly();
    }
  };

  const startSessionDirectly = () => {
    playSelectedBell();
    if (ambientSound === '432hz') {
      audioEngine.toggleAmbientDrone();
    }
    setSecondsRemaining(durationMinutes * 60);
    setState('running');
  };

  // Timer loop
  useEffect(() => {
    if (state === 'prep') {
      const prepInterval = setInterval(() => {
        setCurrentPrepRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(prepInterval);
            startSessionDirectly();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(prepInterval);
    }

    if (state === 'running') {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          // Check interval bells
          if (intervalMinutes !== null && prev > 1) {
            const elapsed = durationMinutes * 60 - prev + 1;
            if (elapsed > 0 && elapsed % (intervalMinutes * 60) === 0) {
              playSelectedBell();
            }
          }

          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    if (state === 'paused' || state === 'complete' || state === 'setup') {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [state, intervalMinutes, durationMinutes]);

  const finishSession = () => {
    setState('complete');
    if (ambientSound === '432hz') {
      audioEngine.stopDrone();
    }
    audioEngine.playBowlChime(480, 6);
    hapticsEngine.trigger('finish');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1f5f78', '#d9a44a', '#e8b98a'],
      });
    } catch {
      // ignore
    }

    onRecordMAM(`Unguided Stillness (${durationMinutes} min)`);
  };

  const handlePause = () => {
    hapticsEngine.trigger('tap');
    setState('paused');
  };

  const handleResume = () => {
    hapticsEngine.trigger('tap');
    setState('running');
  };

  const handleReset = () => {
    hapticsEngine.trigger('tap');
    if (ambientSound === '432hz') audioEngine.stopDrone();
    setState('setup');
    setSecondsRemaining(durationMinutes * 60);
  };

  const formatClock = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    durationMinutes > 0
      ? ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100
      : 0;

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (ambientSound === '432hz') audioEngine.stopDrone();
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
            Pure Meditation
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Custom Unguided Timer
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {/* Dynamic Content */}
      <div className="p-4 space-y-4">
        {state === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Duration Selector */}
            <div className="bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#17495e] dark:text-[#e8b98a]">
                  Duration
                </span>
                <span className="text-base font-mono font-bold text-[#17495e] dark:text-[#e8b98a]">
                  {durationMinutes} min
                </span>
              </div>

              {/* Quick Duration Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      hapticsEngine.trigger('tap');
                      setDurationMinutes(d);
                    }}
                    className={`py-2 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                      durationMinutes === d
                        ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] shadow-xs'
                        : 'bg-[#f7f3ec] dark:bg-[#192b36] text-[#5a6663] dark:text-[#98abb6] hover:bg-[#efe9df]'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            {/* Interval Bells */}
            <div className="bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#17495e] dark:text-[#e8b98a] flex items-center gap-1.5">
                  <Bell size={13} />
                  <span>Interval Bells</span>
                </span>
                <span className="text-[11px] font-mono text-[#838c89] dark:text-[#98abb6]">
                  {intervalMinutes ? `Every ${intervalMinutes} min` : 'None'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'None', val: null },
                  { label: 'Every 5m', val: 5 },
                  { label: 'Every 10m', val: 10 },
                  { label: 'Every 15m', val: 15 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      hapticsEngine.trigger('tap');
                      setIntervalMinutes(item.val);
                    }}
                    className={`py-1.5 rounded-xl text-[10.5px] font-semibold transition-all cursor-pointer ${
                      intervalMinutes === item.val
                        ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] shadow-xs'
                        : 'bg-[#f7f3ec] dark:bg-[#192b36] text-[#5a6663] dark:text-[#98abb6] hover:bg-[#efe9df]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bell Sound & Background Atmosphere */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Bell Tone */}
              <div className="bg-white dark:bg-[#14232c] p-3.5 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                  Starting Bell
                </span>
                <div className="space-y-1">
                  {[
                    { id: 'tibetan' as const, label: 'Tibetan Bowl' },
                    { id: 'temple' as const, label: 'Temple Gong' },
                    { id: 'tingsha' as const, label: 'Tingsha Chime' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBellTone(b.id);
                        playSelectedBell();
                      }}
                      className={`w-full py-1 px-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                        bellTone === b.id
                          ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317]'
                          : 'text-[#5a6663] dark:text-[#98abb6] hover:bg-[#f7f3ec]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Sound */}
              <div className="bg-white dark:bg-[#14232c] p-3.5 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                  Background
                </span>
                <div className="space-y-1">
                  {[
                    { id: '432hz' as const, label: '432Hz Stillness' },
                    { id: 'silence' as const, label: 'Pure Silence' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        hapticsEngine.trigger('tap');
                        setAmbientSound(s.id);
                      }}
                      className={`w-full py-1 px-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                        ambientSound === s.id
                          ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317]'
                          : 'text-[#5a6663] dark:text-[#98abb6] hover:bg-[#f7f3ec]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation Delay */}
            <div className="bg-white dark:bg-[#14232c] p-3.5 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between text-xs">
              <span className="text-[#5a6663] dark:text-[#98abb6] font-semibold">
                Warm-up Posture Delay:
              </span>
              <div className="flex items-center gap-1">
                {[0, 10, 20, 30].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      hapticsEngine.trigger('tap');
                      setPrepSeconds(s);
                    }}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                      prepSeconds === s
                        ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317]'
                        : 'bg-[#f7f3ec] dark:bg-[#192b36] text-[#5a6663] dark:text-[#98abb6]'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Big Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartTimer}
              className="w-full py-3.5 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
            >
              <Play size={15} className="fill-current" />
              <span>Begin {durationMinutes}-Minute Meditation</span>
            </motion.button>
          </motion.div>
        )}

        {state === 'prep' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#17495e] to-[#d9a44a] text-white flex items-center justify-center text-3xl font-mono font-bold shadow-lg animate-pulse">
              {currentPrepRemaining}
            </div>
            <h3 className="font-serif-title text-base font-bold text-[#17495e] dark:text-[#f1ede6]">
              Settle Into Your Posture
            </h3>
            <p className="text-xs text-[#5a6663] dark:text-[#98abb6] max-w-xs">
              Drop your shoulders, rest hands in your lap, and soften your gaze. Bell rings when timer begins.
            </p>
          </motion.div>
        )}

        {(state === 'running' || state === 'paused') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 flex flex-col items-center justify-center text-center space-y-6"
          >
            {/* Concentric Clock Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border-2 border-[#d9a44a]/30 dark:border-[#e8b98a]/30"
              />

              {/* Core Timer Circle */}
              <div className="w-52 h-52 rounded-full bg-white dark:bg-[#14232c] border-2 border-[#17495e] dark:border-[#e8b98a] shadow-xl flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold text-[#17495e] dark:text-[#f1ede6] tracking-tight">
                  {formatClock(secondsRemaining)}
                </span>
                <span className="text-[10px] text-[#8e6724] dark:text-[#e8b98a] font-mono uppercase mt-1 font-semibold">
                  {state === 'paused' ? 'Paused' : `${Math.round(progressPercent)}% elapsed`}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-center text-[#5a6663] dark:text-[#98abb6] cursor-pointer"
                title="Cancel Session"
              >
                <RotateCcw size={16} />
              </button>

              {state === 'running' ? (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handlePause}
                  className="w-14 h-14 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Pause size={22} className="fill-current" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleResume}
                  className="w-14 h-14 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Play size={22} className="fill-current ml-0.5" />
                </motion.button>
              )}

              <button
                onClick={playSelectedBell}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] cursor-pointer"
                title="Ring Bell Now"
              >
                <Bell size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#e8f1ec] dark:bg-[#153123] text-[#3c7858] dark:text-[#52a378] flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3c7858] dark:text-[#52a378] font-bold">
              +1 Meaningful Awareness Moment
            </span>

            <h3 className="font-serif-title text-xl font-bold text-[#17495e] dark:text-[#f1ede6]">
              {durationMinutes} Minutes of Stillness Complete
            </h3>

            <p className="text-xs text-[#5a6663] dark:text-[#98abb6] max-w-xs font-serif-quote italic">
              "The silence you rested in is not gone. You carry it within you as you stand."
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="py-3 px-8 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Finish & Return
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
