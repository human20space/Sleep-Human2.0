import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize2, X, Headphones } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface MiniPlayerBarProps {
  onOpenFullPlayer: () => void;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({ onOpenFullPlayer }) => {
  const {
    currentChapter,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    skip,
    showMiniPlayer,
    dismissMiniPlayer,
    sleepTimerSecondsLeft,
  } = useAudio();

  if (!showMiniPlayer) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute bottom-[66px] left-2.5 right-2.5 z-30 bg-white/95 dark:bg-[#132028]/95 backdrop-blur-md rounded-2xl border border-[#e6dccb] dark:border-[#223541] shadow-[0_8px_25px_rgba(23,73,94,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        {/* Slim top progress line */}
        <div className="w-full h-[3px] bg-[#e6dccb]/50 dark:bg-[#1c2c36] relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#17495e] to-[#d9a44a] dark:from-[#3ba2c7] dark:to-[#e8b98a]"
            style={{ width: `${progressPercent}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <div className="px-3 py-2 flex items-center justify-between gap-2.5">
          {/* Left area: Tappable to open full audiobook view */}
          <div
            onClick={onOpenFullPlayer}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
          >
            {/* Chapter Badge with Waveform indicator */}
            <div className="relative w-8 h-8 rounded-xl bg-[#17495e] dark:bg-[#1e303c] text-[#e8b98a] flex items-center justify-center font-mono text-[10px] font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <div className="flex items-end justify-center gap-[2px] h-3 w-3">
                  <span className="w-[2px] bg-[#e8b98a] rounded-full animate-sound-1 h-full" />
                  <span className="w-[2px] bg-[#e8b98a] rounded-full animate-sound-2 h-full" />
                  <span className="w-[2px] bg-[#e8b98a] rounded-full animate-sound-3 h-full" />
                </div>
              ) : (
                <Headphones size={13} className="text-[#e8b98a]" />
              )}
            </div>

            {/* Chapter Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase font-bold text-[#8e6724] dark:text-[#e8b98a]">
                  Ch {currentChapter.chapterNumber}
                </span>
                {sleepTimerSecondsLeft !== null && (
                  <span className="text-[8.5px] px-1 py-0.2 rounded-md bg-[#17495e]/10 dark:bg-[#e8b98a]/20 text-[#17495e] dark:text-[#e8b98a] font-mono">
                    🌙 {Math.ceil(sleepTimerSecondsLeft / 60)}m
                  </span>
                )}
              </div>
              <h4 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight group-hover:text-[#1f5f78] dark:group-hover:text-[#e8b98a] transition-colors">
                {currentChapter.title}
              </h4>
              <p className="text-[9.5px] font-mono text-[#838c89] dark:text-[#98abb6] truncate">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Skip -15s */}
            <button
              onClick={() => skip(-15)}
              className="w-7 h-7 rounded-lg text-[#5a6663] dark:text-[#98abb6] hover:bg-[#efe9df] dark:hover:bg-[#1a2b36] flex items-center justify-center transition-colors cursor-pointer"
              title="Skip back 15s"
            >
              <RotateCcw size={12} />
            </button>

            {/* Play/Pause Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              className="w-8 h-8 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-xs cursor-pointer hover:opacity-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={13} className="fill-current" />
              ) : (
                <Play size={13} className="fill-current ml-0.5" />
              )}
            </motion.button>

            {/* Expand to Full View */}
            <button
              onClick={onOpenFullPlayer}
              className="w-7 h-7 rounded-lg text-[#5a6663] dark:text-[#98abb6] hover:bg-[#efe9df] dark:hover:bg-[#1a2b36] flex items-center justify-center transition-colors cursor-pointer"
              title="Open full audiobook player"
            >
              <Maximize2 size={12} />
            </button>

            {/* Close Mini Player */}
            <button
              onClick={dismissMiniPlayer}
              className="w-6 h-6 rounded-lg text-[#838c89] dark:text-[#69818f] hover:bg-[#efe9df] dark:hover:bg-[#1a2b36] flex items-center justify-center transition-colors cursor-pointer"
              title="Dismiss mini-player"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
