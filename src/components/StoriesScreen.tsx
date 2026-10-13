import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Sparkles,
  ChevronRight,
  Film,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import {
  HUMAN_STORIES,
  FEELING_RECOMMENDATIONS,
  type StoryCategory,
  type UserFeeling,
  type HumanStory,
} from '../data/storiesData';
import { useLanguage } from '../i18n/LanguageContext';
import { audioEngine } from '../utils/audioEngine';
import type { Screen } from '../types';

interface StoriesScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export const StoriesScreen: React.FC<StoriesScreenProps> = ({ onBack, onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');
  const [activeStory, setActiveStory] = useState<HumanStory>(HUMAN_STORIES[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isStoryMuted, setIsStoryMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [selectedFeeling, setSelectedFeeling] = useState<UserFeeling | null>('stressed');
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredStories = selectedCategory === 'all'
    ? HUMAN_STORIES
    : HUMAN_STORIES.filter((s) => s.category === selectedCategory);

  const handleToggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsVideoPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('[StoriesScreen] Play blocked, falling back to muted:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsStoryMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsVideoPlaying(true);
                setHasError(false);
              })
              .catch(() => {
                setHasError(true);
              });
          }
        });
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsStoryMuted(newMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const target = Number(e.target.value);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setSelectedFeeling('overwhelmed');
    audioEngine.playBreathChime('exhale');
  };

  const handleFeelingSelect = (feeling: UserFeeling) => {
    audioEngine.playBreathChime('inhale');
    setSelectedFeeling(feeling);
  };

  const handleLaunchRecommendation = (feeling: UserFeeling) => {
    const rec = FEELING_RECOMMENDATIONS[feeling];
    audioEngine.playBreathChime('exhale');
    onNavigate(rec.targetScreen);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#070b0e] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* 1. TOP NAVIGATION BAR */}
      <div className="w-full max-w-4xl mx-auto px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20 bg-[#f7f3ec]/95 dark:bg-[#070b0e]/95 backdrop-blur-md border-b border-[#e6dccb] dark:border-[#1d2e38]">
        <button
          type="button"
          onClick={() => {
            audioEngine.playBreathChime('exhale');
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] text-xs font-semibold text-[#17495e] dark:text-[#e8b98a] shadow-2xs hover:bg-[#efe9df] dark:hover:bg-[#1b2b34] transition-all cursor-pointer min-h-[44px]"
          title={t.backToHome}
          aria-label={t.backToHome}
        >
          <ArrowLeft size={15} className={isRtl ? 'rotate-180' : ''} />
          <span>{t.backToHome}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#d9a44a] dark:text-[#e8b98a] block">
            {t.storiesTag}
          </span>
          <span className="text-xs font-bold text-[#17495e] dark:text-[#e8b98a]">
            Human 2.0 Stories
          </span>
        </div>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6 pt-3 pb-8">
        {/* HERO TITLE & POSITIONING */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17495e]/10 dark:bg-[#e8b98a]/15 text-[#17495e] dark:text-[#e8b98a] text-[10px] font-mono font-bold uppercase tracking-widest">
            <Sparkles size={11} className="fill-current" />
            <span>Real people. Real life. Real shifts.</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#17495e] dark:text-[#e8b98a] tracking-tight">
            Human 2.0 Stories
          </h1>
          <p className="text-xs text-[#5a6663] dark:text-[#9eb2be] max-w-lg mx-auto">
            Not just entertainment—a functional bridge from emotional pressure to connection, presence, and joy.
          </p>
        </div>

        {/* 3. FEATURED VIDEO FILM: "WHEN LIFE FEELS TOO MUCH" */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#17495e] via-[#1f5f78] to-[#123645] text-white border border-[#17495e]/60 shadow-md">
          {/* Video Player Box */}
          <div
            className="relative aspect-video bg-black/80 flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={handleToggleVideo}
          >
            <video
              ref={videoRef}
              key={activeStory.videoUrl || activeStory.id}
              src={activeStory.videoUrl || '/videos/when-life-feels-too-much.mp4'}
              playsInline
              preload="metadata"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={handleVideoEnded}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current && videoRef.current.duration) {
                  setDuration(videoRef.current.duration);
                  setHasError(false);
                }
              }}
              onError={() => {
                console.warn('[StoriesScreen] Video failed to load source:', activeStory.videoUrl);
                setHasError(true);
              }}
              className="w-full h-full object-cover"
            />

            {/* Error Fallback with Retry */}
            {hasError && (
              <div
                className="absolute inset-0 bg-[#0d1613] flex flex-col items-center justify-center p-4 text-center text-white z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <Film size={26} className="text-[#e8b98a] mb-2" />
                <p className="text-xs font-serif-title font-semibold text-[#f7f3ec] mb-1">
                  {activeStory.title}
                </p>
                <p className="text-[11px] text-white/80 max-w-xs font-serif-quote italic mb-3">
                  "{activeStory.subtitle}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                      handleToggleVideo();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#e8b98a] text-[#070b0e] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:brightness-110"
                >
                  <RotateCcw size={13} />
                  <span>Retry Video</span>
                </button>
              </div>
            )}

            {/* Play/Pause Overlay (visible when paused or on hover) */}
            {!hasError && (
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 flex flex-col justify-between p-4 pointer-events-none transition-opacity duration-300 ${
                  isVideoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#d9a44a] text-black">
                    A Human 2.0 Story · {activeStory.durationFormatted}
                  </span>
                  <span className="text-[11px] font-mono text-white/80">
                    {activeStory.theme || activeStory.categoryLabel}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white leading-tight uppercase">
                      {activeStory.title}
                    </h2>
                    <p className="text-xs text-[#e8b98a] mt-0.5 line-clamp-1">
                      {activeStory.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Center Play Button Trigger (when paused) */}
            {!hasError && !isVideoPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVideo();
                }}
                className="absolute w-14 h-14 rounded-full bg-[#e8b98a] text-[#070b0e] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                aria-label="Play Story Film"
              >
                <Play size={24} className="fill-current translate-x-0.5" />
              </button>
            )}

            {/* Always Accessible Control Bar */}
            {!hasError && (
              <div
                className={`absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-1 text-white transition-opacity z-10 ${
                  isVideoPlaying ? 'opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Scrubber Progress Bar */}
                <div className="w-full flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#e8b98a]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleVideo}
                      className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                      title={isVideoPlaying ? 'Pause' : 'Play'}
                    >
                      {isVideoPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                      title={isStoryMuted ? 'Unmute' : 'Mute'}
                    >
                      {isStoryMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="text-[10px] font-mono text-white/80">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Under-Video Story Action Bar */}
          <div className="p-4 flex items-center justify-between bg-black/20 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Film size={15} className="text-[#e8b98a]" />
              <span className="font-medium text-white/90">
                Short cinematic journey from tension to inner sovereignty
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                audioEngine.playBreathChime('inhale');
                setSelectedFeeling('overwhelmed');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[#e8b98a] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Feeling Check-In</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* 4. "HOW ARE YOU FEELING RIGHT NOW?" INTERACTIVE TRIAGE BAR */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#101b22] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#d9a44a] dark:text-[#e8b98a] block">
                Functional Bridge
              </span>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#17495e] dark:text-[#f2ede4]">
                {t.howAreYouFeeling || 'How are you feeling right now?'}
              </h3>
              <p className="text-xs text-[#5a6663] dark:text-[#9eb2be]">
                {t.howAreYouFeelingPrompt}
              </p>
            </div>
          </div>

          {/* Feeling Selection Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.keys(FEELING_RECOMMENDATIONS) as UserFeeling[]).map((feeling) => {
              const rec = FEELING_RECOMMENDATIONS[feeling];
              const isSelected = selectedFeeling === feeling;
              return (
                <motion.button
                  key={feeling}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleFeelingSelect(feeling)}
                  className={`py-2 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer min-h-[56px] ${
                    isSelected
                      ? 'bg-[#17495e] dark:bg-[#1f5f78] text-white border-transparent shadow-sm'
                      : 'bg-[#faf8f4] dark:bg-[#16252e] text-[#1f2a28] dark:text-[#f2ede4] border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df]'
                  }`}
                >
                  <span className="text-lg">{rec.emoji}</span>
                  <span className="text-[11px] font-bold leading-tight">
                    {t.feelings[feeling] || rec.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Smart Recommendation Card */}
          {selectedFeeling && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeeling}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#17495e]/10 via-[#d9a44a]/10 to-transparent border border-[#d9a44a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8e6724] dark:text-[#e8b98a]">
                      Recommended Action for {FEELING_RECOMMENDATIONS[selectedFeeling].label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#17495e] dark:text-[#f2ede4]">
                    {FEELING_RECOMMENDATIONS[selectedFeeling].recommendationTitle}
                  </h4>
                  <p className="text-xs text-[#5a6663] dark:text-[#9eb2be]">
                    {FEELING_RECOMMENDATIONS[selectedFeeling].explanation}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleLaunchRecommendation(selectedFeeling)}
                  className="px-4 py-2.5 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#070b0e] font-bold text-xs shadow-xs hover:brightness-110 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px]"
                >
                  <span>{t.recommendations.startNow}</span>
                  <ArrowUpRight size={14} />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* 5. STORY CATEGORIES SELECTOR */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title text-lg font-bold text-[#17495e] dark:text-[#f2ede4]">
              Explore Story Categories
            </h3>
            <span className="text-xs font-mono text-[#5a6663] dark:text-[#9eb2be]">
              {filteredStories.length} stories
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Stories' },
              { id: 'real_journeys', label: 'Real Journeys (Before & After)' },
              { id: 'life_stories', label: 'Life Stories' },
              { id: 'comeback_stories', label: 'Comeback Stories' },
              { id: 'wisdom_stories', label: 'Wisdom Stories' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as StoryCategory | 'all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
                  selectedCategory === cat.id
                    ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#070b0e] shadow-xs'
                    : 'bg-white dark:bg-[#121e25] text-[#5a6663] dark:text-[#9eb2be] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {filteredStories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  audioEngine.playBreathChime('inhale');
                  if (story.videoUrl) {
                    setActiveStory(story);
                    setIsVideoPlaying(false);
                    if (videoRef.current) {
                      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  } else {
                    setSelectedFeeling('better');
                  }
                }}
                className="p-4 rounded-3xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#17495e]/15 to-[#d9a44a]/20 text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center text-lg shrink-0">
                    {story.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#d9a44a] dark:text-[#e8b98a] block">
                      {story.categoryLabel} · {story.durationFormatted}
                    </span>
                    <h4 className="font-serif-title text-sm sm:text-base font-bold text-[#17495e] dark:text-[#f2ede4] leading-tight mt-0.5">
                      {story.title}
                    </h4>
                    <p className="text-xs text-[#5a6663] dark:text-[#9eb2be] line-clamp-2 mt-1">
                      {story.subtitle}
                    </p>
                  </div>
                </div>

                {/* If it's a Real Journey, show the Before & After shift pills */}
                {story.transformationDetails && (
                  <div className="p-3 rounded-2xl bg-[#f7f3ec] dark:bg-[#16252e] border border-[#e6dccb]/70 dark:border-[#1d2e38] text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#8e6724] dark:text-[#e8b98a] font-bold">
                      <span>{story.transformationDetails.person}</span>
                      <span className="font-mono">{story.transformationDetails.role}</span>
                    </div>
                    <p className="text-[#717e7a] dark:text-[#8ea2b0] line-clamp-1 italic">
                      <strong className="text-[#17495e] dark:text-[#f2ede4] not-italic">Shift: </strong>
                      "{story.transformationDetails.shift}"
                    </p>
                    <p className="text-[#3c7858] dark:text-[#52a378] font-medium line-clamp-1">
                      ✓ {story.transformationDetails.after}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#e6dccb]/60 dark:border-[#1d2e38] text-xs text-[#17495e] dark:text-[#e8b98a] font-bold">
                  <span>View Story Arc</span>
                  <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
