import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Search,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Info,
  Moon,
  Compass,
  Eye,
  Pause as PauseIcon,
  Cpu,
  Lock
} from 'lucide-react';
import type { Screen } from '../types';
import { AUDIO_CHAPTERS, AUDIO_PARTS } from '../data/audioChaptersData';
import { useAudio } from '../context/AudioContext';

interface AudioChaptersScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export const AudioChaptersScreen: React.FC<AudioChaptersScreenProps> = ({ onBack, onNavigate }) => {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPartOverview, setShowPartOverview] = useState<boolean>(false);

  // Sovereign tier check from local storage
  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';

  // Consume global audio provider
  const {
    currentChapter,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    sleepTimerMinutes,
    sleepTimerSecondsLeft,
    playChapter,
    togglePlay,
    seek,
    skip,
    nextChapter,
    prevChapter,
    setRate,
    toggleMute,
    setSleepTimer,
  } = useAudio();

  // Filter chapters based on selected part and search query
  const filteredChapters = AUDIO_CHAPTERS.filter((chapter) => {
    const matchesPart = selectedPart === null || chapter.partNumber === selectedPart;
    const matchesSearch =
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.chapterNumber.toString().includes(searchQuery) ||
      chapter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.part.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPart && matchesSearch;
  });

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleRateChange = () => {
    const rates = [0.75, 1.0, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setRate(nextRate);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentFree = currentChapter.chapterNumber <= 3;
  const isCurrentLocked = !isCurrentFree && !isPremium;

  const handleTogglePlay = () => {
    if (isCurrentLocked) {
      onNavigate('subscription');
      return;
    }
    togglePlay();
  };

  // Helper for cross-linking chapter topic to interactive tools
  const getChapterInteractiveTool = (chapterNum: number): { screen: Screen; label: string; actionText: string; icon: typeof Eye } => {
    if ([8, 9, 10, 16, 22, 28].includes(chapterNum)) {
      return { screen: 'mirror', label: 'The Mirror', actionText: 'Deconstruct This Trigger', icon: Eye };
    }
    if ([1, 2, 7, 11, 12, 17, 25, 30].includes(chapterNum)) {
      return { screen: 'pause', label: 'The Sovereign Pause', actionText: 'Take 30-Second Pause', icon: PauseIcon };
    }
    if ([19, 20, 21, 35, 40, 44, 45].includes(chapterNum)) {
      return { screen: 'human_ai', label: 'Human + AI', actionText: 'Explore AI Grounding', icon: Cpu };
    }
    if ([3, 4, 5, 6, 13, 14, 15].includes(chapterNum)) {
      return { screen: 'practice', label: 'Micro-Practice', actionText: 'Try 3-Min Practice', icon: Sparkles };
    }
    return { screen: 'journey', label: 'Inquiry Journey', actionText: 'Explore 3-Day Journey', icon: Compass };
  };

  const interactiveTool = getChapterInteractiveTool(currentChapter.chapterNumber);
  const ToolIcon = interactiveTool.icon;
  const activePart = AUDIO_PARTS.find((p) => p.partNumber === currentChapter.partNumber);

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Sticky Header */}
      <div className="w-full max-w-4xl mx-auto px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Headphones size={13} className="text-[#8e6724] dark:text-[#e8b98a]" />
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8e6724] dark:text-[#e8b98a]">
              Audiobook Series
            </span>
          </div>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            HUMAN 2.0 Audio Chapters
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        {/* Audiobook Master Banner */}
        <div className="bg-gradient-to-br from-[#17495e] to-[#1f5f78] dark:from-[#0d222c] dark:to-[#143240] text-white p-4 rounded-3xl shadow-sm border border-[#17495e]/40 dark:border-[#1f4a5c]/50 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#e8b98a] font-semibold flex items-center gap-1.5">
                <Sparkles size={11} />
                Official Audiobook
              </span>
              <span className="text-[9px] bg-white/15 dark:bg-black/30 text-[#e8b98a] px-2 py-0.5 rounded-full font-mono">
                45 Chapters
              </span>
            </div>

            <h3 className="font-serif-title text-base font-bold text-white leading-snug">
              HUMAN 2.0 by Vinay Kapoor
            </h3>

            <p className="text-xs text-white/85 leading-relaxed font-serif-quote italic">
              "As technology becomes more intelligent, human beings need to become more aware."
            </p>
          </div>
        </div>

        {/* HERO AUDIO PLAYER CARD */}
        <div className="bg-white dark:bg-[#14232c] p-5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-4 transition-colors">
          {/* Chapter Metadata */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] bg-[#fdf6ec] dark:bg-[#1b2b36] border border-[#d9a44a]/25 dark:border-[#e8b98a]/30 px-2 py-0.5 rounded-full font-bold">
                  Chapter {currentChapter.chapterNumber} of 45
                </span>
                {isCurrentFree ? (
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Free
                  </span>
                ) : isPremium ? (
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] border border-[#d9a44a]/30 flex items-center gap-1">
                    <Sparkles size={9} /> Sovereign
                  </span>
                ) : (
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] border border-[#d9a44a]/30 flex items-center gap-1">
                    <Lock size={9} /> Sovereign
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Part {currentChapter.partNumber}
              </span>
            </div>

            {isCurrentLocked && (
              <div className="mb-2 p-2.5 rounded-2xl bg-[#fdf6ec] dark:bg-[#1b2b36] border border-[#d9a44a]/40 dark:border-[#e8b98a]/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock size={13} className="text-[#8e6724] dark:text-[#e8b98a] shrink-0" />
                  <span className="text-[11px] text-[#1f2a28] dark:text-[#f1ede6] font-medium leading-tight truncate">
                    Chapters 4–45 require Sovereign Membership
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('subscription')}
                  className="px-2.5 py-1 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] text-[10.5px] font-bold shrink-0 cursor-pointer"
                >
                  Unlock All →
                </button>
              </div>
            )}

            <h3 className="font-serif-title text-lg font-bold text-[#17495e] dark:text-[#f1ede6] leading-snug">
              {currentChapter.title}
            </h3>

            <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed mt-1">
              {currentChapter.description}
            </p>
          </div>

          {/* Key Takeaway Pill */}
          <div className="p-3 rounded-2xl bg-[#fdf6ec] dark:bg-[#18262f] border border-[#d9a44a]/20 dark:border-[#e8b98a]/20">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#8e6724] dark:text-[#e8b98a] block mb-0.5">
              Key Insight
            </span>
            <p className="font-serif-quote italic text-xs text-[#1f2a28] dark:text-[#f1ede6] leading-relaxed">
              "{currentChapter.keyTakeaway}"
            </p>
          </div>

          {/* Contextual Cross-link to Interactive Tool */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(interactiveTool.screen)}
            className="p-3 rounded-2xl bg-gradient-to-r from-[#efe9df] to-[#f7f3ec] dark:from-[#182a35] dark:to-[#14232c] border border-[#e6dccb] dark:border-[#1f3747] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1b2f3d] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <ToolIcon size={15} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                  Practice In Real Time
                </span>
                <p className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6]">
                  {interactiveTool.actionText}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#17495e] dark:text-[#e8b98a] group-hover:translate-x-0.5 transition-transform">
              Explore →
            </span>
          </motion.div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1 py-1 h-8">
            {[40, 65, 30, 85, 45, 95, 60, 35, 75, 50, 90, 40, 70, 80, 55, 35, 65, 90, 45, 60, 30].map((h, i) => (
              <motion.span
                key={i}
                animate={isPlaying ? {
                  height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(20, h * 0.4)}%`],
                } : { height: '25%' }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8 + (i % 5) * 0.15,
                  ease: 'easeInOut',
                }}
                className={`w-1 rounded-full transition-colors ${
                  isPlaying ? 'bg-[#1f5f78] dark:bg-[#e8b98a]' : 'bg-[#e6dccb] dark:bg-[#1d2f3a]'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#e6dccb] dark:bg-[#1c2e39] rounded-lg appearance-none cursor-pointer accent-[#17495e] dark:accent-[#e8b98a]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#838c89] dark:text-[#98abb6]">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Primary Audio Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Playback Speed */}
            <button
              onClick={handleRateChange}
              className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#e8b98a] hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Change Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Skip Back 15s */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => skip(-15)}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Skip back 15 seconds"
            >
              <RotateCcw size={15} />
            </motion.button>

            {/* Previous Chapter */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevChapter}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Previous Chapter"
            >
              <SkipBack size={16} />
            </motion.button>

            {/* PLAY / PAUSE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePlay}
              className="w-13 h-13 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-md hover:bg-[#1f5f78] dark:hover:bg-[#f2cfab] transition-all cursor-pointer"
              title={isCurrentLocked ? 'Unlock with Sovereign' : isPlaying ? 'Pause' : 'Play'}
            >
              {isCurrentLocked ? (
                <Lock size={20} />
              ) : isPlaying ? (
                <Pause size={22} className="fill-current" />
              ) : (
                <Play size={22} className="fill-current ml-0.5" />
              )}
            </motion.button>

            {/* Next Chapter */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextChapter}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Next Chapter"
            >
              <SkipForward size={16} />
            </motion.button>

            {/* Skip Forward 15s */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => skip(15)}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Skip forward 15 seconds"
            >
              <RotateCw size={15} />
            </motion.button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          {/* Sleep Timer Selector */}
          <div className="pt-2 border-t border-[#e6dccb]/60 dark:border-[#1d2e38] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-semibold text-[#17495e] dark:text-[#e8b98a] flex items-center gap-1.5">
                <Moon size={12} />
                <span>Sleep Timer:</span>
              </span>
              <span className="font-mono text-[#838c89] dark:text-[#98abb6]">
                {sleepTimerSecondsLeft !== null
                  ? `Fading out in ${Math.floor(sleepTimerSecondsLeft / 60)}:${(sleepTimerSecondsLeft % 60).toString().padStart(2, '0')}`
                  : 'Timer Off'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: 'Off', val: null },
                { label: '15m', val: 15 },
                { label: '30m', val: 30 },
                { label: '45m', val: 45 },
                { label: '60m', val: 60 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSleepTimer(opt.val)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    sleepTimerMinutes === opt.val
                      ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] shadow-xs'
                      : 'bg-[#f7f3ec] dark:bg-[#182933] text-[#5a6663] dark:text-[#98abb6] hover:bg-[#efe9df] dark:hover:bg-[#203644]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Audio Reference */}
          <div className="pt-1 flex items-center justify-between text-xs border-t border-[#e6dccb]/60 dark:border-[#1d2e38]">
            <span className="text-[11px] text-[#5a6663] dark:text-[#98abb6]">
              Track: <strong className="font-mono text-[#17495e] dark:text-[#e8b98a]">{currentChapter.fileName}</strong>
            </span>
            <span className="text-[11px] text-[#8e6724] dark:text-[#e8b98a] font-medium font-mono">
              {currentChapter.durationFormatted}
            </span>
          </div>
        </div>

        {/* SEARCH & PART FILTER SECTION */}
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#838c89] dark:text-[#98abb6]" />
            <input
              type="text"
              placeholder="Search 45 chapters (e.g. ego, trigger, AI, pause)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] text-xs text-[#1f2a28] dark:text-[#f1ede6] placeholder-[#838c89] dark:placeholder-[#6c8491] focus:outline-none focus:border-[#17495e] dark:focus:border-[#e8b98a] transition-colors shadow-xs"
            />
          </div>

          {/* Part Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedPart(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPart === null
                  ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] shadow-xs'
                  : 'bg-white dark:bg-[#14232c] text-[#5a6663] dark:text-[#98abb6] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1a2d38]'
              }`}
            >
              All (45)
            </button>

            {AUDIO_PARTS.map((part) => (
              <button
                key={part.partNumber}
                onClick={() => setSelectedPart(selectedPart === part.partNumber ? null : part.partNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPart === part.partNumber
                    ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] shadow-xs'
                    : 'bg-white dark:bg-[#14232c] text-[#5a6663] dark:text-[#98abb6] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1a2d38]'
                }`}
              >
                Part {part.partNumber} ({part.chapters})
              </button>
            ))}
          </div>

          {/* Active Part Overview accordion */}
          {activePart && (
            <div className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] text-xs space-y-1 shadow-xs transition-colors">
              <button
                onClick={() => setShowPartOverview(!showPartOverview)}
                className="w-full flex items-center justify-between text-left font-semibold text-[#17495e] dark:text-[#e8b98a] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#8e6724] dark:text-[#e8b98a]" />
                  <span>{activePart.title}</span>
                </div>
                <Info size={13} className="text-[#838c89] dark:text-[#98abb6]" />
              </button>

              <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed pt-0.5">
                {activePart.desc}
              </p>
            </div>
          )}
        </div>

        {/* CHAPTER LIST */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              {filteredChapters.length} Chapters Available
            </span>
            <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
              Narration by Vinay Kapoor
            </span>
          </div>

          <div className="space-y-2">
            {filteredChapters.map((chapter) => {
              const isCurrent = currentChapter.id === chapter.id;
              const isChapterFree = chapter.chapterNumber <= 3;
              const isChapterLocked = !isChapterFree && !isPremium;

              return (
                <motion.div
                  key={chapter.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (isChapterLocked) {
                      onNavigate('subscription');
                      return;
                    }
                    playChapter(chapter);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#fdf6ec] dark:bg-[#18262f] border-[#d9a44a] dark:border-[#e8b98a] shadow-xs'
                      : 'bg-white dark:bg-[#14232c] border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#fbf9f5] dark:hover:bg-[#182a35]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Chapter Number Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                          isCurrent
                            ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317]'
                            : 'bg-[#efe9df] dark:bg-[#1b2c37] text-[#17495e] dark:text-[#98abb6]'
                        }`}
                      >
                        {chapter.chapterNumber < 10 ? `0${chapter.chapterNumber}` : chapter.chapterNumber}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] uppercase font-semibold tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                            Part {chapter.partNumber}
                          </span>
                          <span className="text-[#838c89] dark:text-[#6c8491] text-[9px]">•</span>
                          <span className="text-[9.5px] text-[#838c89] dark:text-[#98abb6] font-mono">
                            {chapter.durationFormatted}
                          </span>
                          <span className="text-[#838c89] dark:text-[#6c8491] text-[9px]">•</span>
                          {isChapterFree ? (
                            <span className="text-[8.5px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full font-mono">
                              FREE
                            </span>
                          ) : isChapterLocked ? (
                            <span className="text-[8.5px] bg-[#fdf6ec] dark:bg-[#1b2b36] border border-[#d9a44a]/40 dark:border-[#e8b98a]/40 text-[#8e6724] dark:text-[#e8b98a] font-bold px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5">
                              <Lock size={8} /> SOVEREIGN
                            </span>
                          ) : (
                            <span className="text-[8.5px] bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] font-bold px-1.5 py-0.2 rounded-full font-mono">
                              SOVEREIGN
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-xs font-serif-title font-bold leading-snug ${
                            isCurrent ? 'text-[#17495e] dark:text-[#e8b98a]' : 'text-[#1f2a28] dark:text-[#f1ede6]'
                          }`}
                        >
                          {chapter.title}
                        </h4>

                        <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6] line-clamp-2 leading-tight">
                          {chapter.description}
                        </p>
                      </div>
                    </div>

                    {/* Play/Pause or Lock Indicator */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isCurrent && isPlaying
                            ? 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317]'
                            : isChapterLocked
                            ? 'bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] border border-[#d9a44a]/30'
                            : 'bg-[#f7f3ec] dark:bg-[#1b2c37] text-[#17495e] dark:text-[#98abb6]'
                        }`}
                      >
                        {isChapterLocked ? (
                          <Lock size={12} />
                        ) : isCurrent && isPlaying ? (
                          <Pause size={12} className="fill-current" />
                        ) : (
                          <Play size={12} className="fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Audiobook Complete Series Overview Footer */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17495e] dark:text-[#e8b98a]">
            <Headphones size={15} className="text-[#8e6724] dark:text-[#e8b98a]" />
            <span>Complete 45-Chapter Audiobook</span>
          </div>

          <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
            Written and narrated by Vinay Kapoor. Bringing together outer success and inner awareness across 5 thematic movements.
          </p>
        </div>
      </div>
    </div>
  );
};
