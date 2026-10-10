import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Download,
  Trash2,
  Crown,
  Play,
  Pause,
  Bookmark,
  Volume2,
  Sparkles,
  Lock,
  Headphones,
} from 'lucide-react';
import type { UserInsight, AwarenessMoment, Screen } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { useAudio } from '../context/AudioContext';
import { SLEEP_TRACKS } from '../data/sleepCatalogData';
import { AUDIO_CHAPTERS } from '../data/audioChaptersData';
import { sleepContentService, useSleepContent } from '../services/sleepContentService';

interface VaultScreenProps {
  onBack: () => void;
  insights: UserInsight[];
  awarenessMoments: AwarenessMoment[];
  onClearAll: () => void;
  onNavigate?: (screen: Screen) => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  onBack,
  insights,
  awarenessMoments,
  onClearAll,
  onNavigate,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Sovereign tier check from local storage
  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';

  // Consume global audio provider
  const {
    favorites,
    continueListening,
    toggleFavorite,
    playSleepTrack,
    playChapter,
    currentTrack,
    isPlaying,
  } = useAudio();

  const allTags = ['all', ...Array.from(new Set(insights.map((i) => i.tag)))];

  const filteredInsights =
    selectedTag === 'all'
      ? insights
      : insights.filter((i) => i.tag === selectedTag);

  const handleExport = () => {
    audioEngine.playBowlChime(440, 2);
    const exportData = {
      platform: 'Human 2.0 Personal Awareness Operating System',
      exportedAt: new Date().toISOString(),
      membershipTier: isPremium ? 'Sovereign' : 'Explorer (Free)',
      meaningfulAwarenessMomentsTotal: awarenessMoments.length,
      savedFavoritesCount: favorites.length,
      continueListeningItemsCount: continueListening.length,
      momentsLog: awarenessMoments,
      personalInsights: insights,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-human2-awareness-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { tracks: sleepTracks, chapters: audioChapters } = useSleepContent();
  const currentTracks = sleepTracks.length > 0 ? sleepTracks : sleepContentService.getCachedTracks();
  const currentChapters = audioChapters.length > 0 ? audioChapters : sleepContentService.getCachedChapters();

  const handlePlayContinueItem = (item: typeof continueListening[0]) => {
    if (item.type === 'sleep_track') {
      const track = currentTracks.find((t) => t.id === item.id) || SLEEP_TRACKS.find((t) => t.id === item.id);
      if (track) {
        if (track.isPremium && !isPremium) {
          onNavigate?.('subscription');
          return;
        }
        playSleepTrack(track);
      }
    } else {
      const chapter = currentChapters.find((c) => c.id === item.id) || AUDIO_CHAPTERS.find((c) => c.id === item.id);
      if (chapter) {
        if (chapter.chapterNumber > 3 && !isPremium) {
          onNavigate?.('subscription');
          return;
        }
        playChapter(chapter);
      }
    }
  };

  const handlePlayFavorite = (favId: string) => {
    const sleepTrack = currentTracks.find((t) => t.id === favId) || SLEEP_TRACKS.find((t) => t.id === favId);
    if (sleepTrack) {
      if (sleepTrack.isPremium && !isPremium) {
        onNavigate?.('subscription');
        return;
      }
      playSleepTrack(sleepTrack);
      return;
    }
    const chapter = currentChapters.find((c) => c.id === favId) || AUDIO_CHAPTERS.find((c) => c.id === favId);
    if (chapter) {
      if (chapter.chapterNumber > 3 && !isPremium) {
        onNavigate?.('subscription');
        return;
      }
      playChapter(chapter);
      return;
    }
  };

  // Resolve metadata for favorited items
  const resolvedFavorites = favorites
    .map((favId) => {
      const st = currentTracks.find((t) => t.id === favId) || SLEEP_TRACKS.find((t) => t.id === favId);
      if (st) {
        return {
          id: st.id,
          title: st.title,
          subtitle: st.subtitle,
          category: st.category,
          durationFormatted: `${Math.floor(st.durationSeconds / 60)} min`,
          isLocked: st.isPremium && !isPremium,
          isPremium: st.isPremium,
          type: 'sleep_track' as const,
        };
      }
      const ch = currentChapters.find((c) => c.id === favId) || AUDIO_CHAPTERS.find((c) => c.id === favId);
      if (ch) {
        return {
          id: ch.id,
          title: ch.title,
          subtitle: `Chapter ${ch.chapterNumber} · ${ch.part}`,
          category: 'audiobook',
          durationFormatted: ch.durationFormatted,
          isLocked: ch.chapterNumber > 3 && !isPremium,
          isPremium: ch.chapterNumber > 3,
          type: 'audiobook' as const,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-hidden transition-colors">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1a2d38] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#3c7858] dark:text-[#52a378]" />
            <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
              My Human 2.0
            </h2>
          </div>
          <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
            Private Sovereign Awareness Vault
          </span>
        </div>

        <button
          onClick={handleExport}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1a2d38] transition-all cursor-pointer"
          title="Export my data"
        >
          <Download size={14} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* 1. SOVEREIGN MEMBERSHIP TIER CARD */}
        {isPremium ? (
          <div className="bg-gradient-to-br from-[#17495e] via-[#1c556d] to-[#123645] text-white p-4.5 rounded-3xl shadow-sm border border-[#d9a44a]/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#e8b98a] bg-black/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Crown size={11} className="text-[#e8b98a] fill-current" />
                Sovereign Member
              </span>
              <span className="text-[10px] text-[#e8b98a] font-mono font-semibold">
                All Features Unlocked
              </span>
            </div>
            <h3 className="font-serif-title text-base font-bold text-white mb-1">
              Sovereign Access Active
            </h3>
            <p className="text-xs text-white/85 leading-relaxed font-serif-quote italic">
              "Full access to 16 Sleep Soundscapes, 45 Audiobook Chapters, and unlimited Conversational AI Guidance."
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#14232c] p-4.5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#3c7858] dark:text-[#52a378] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                Explorer Tier (Free)
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                4 Free Tracks · 3 Chapters
              </span>
            </div>
            <div>
              <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6]">
                Unlock Sovereign Membership
              </h3>
              <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
                One simple plan unlocks everything: all 16 sleep soundscapes, 45 audiobook chapters, and 24/7 AI teacher dialogue.
              </p>
            </div>
            {onNavigate && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('subscription')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95 transition-all"
              >
                <Sparkles size={13} />
                <span>View Sovereign Plan ($69.99/yr) →</span>
              </motion.button>
            )}
          </div>
        )}

        {/* 1.5. AUTHOR PROFILE IN VAULT */}
        <div
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate?.('author_intro');
          }}
          className="bg-white dark:bg-[#121e25] p-3.5 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/30 transition-all flex items-center justify-between"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#17495e] dark:bg-[#1f5f78] text-[#e8b98a] flex items-center justify-center font-serif-title font-bold text-xs shadow-xs shrink-0">
              VK
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] block">
                Author & Creator
              </span>
              <h4 className="font-serif-title font-bold text-xs text-[#17495e] dark:text-[#f1ede6]">
                Vinay Kapoor
              </h4>
              <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                Human 2.0: Awareness — Future Ready with AI
              </p>
            </div>
          </div>
          <Sparkles size={15} className="text-[#8e6724] dark:text-[#e8b98a] shrink-0" />
        </div>

        {/* 2. CONTINUE LISTENING SHELF */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              Continue Listening ({continueListening.length})
            </span>
            <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
              Private local progress
            </span>
          </div>

          {continueListening.length === 0 ? (
            <div className="bg-white dark:bg-[#14232c] p-4 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] text-center text-xs text-[#838c89] dark:text-[#98abb6] transition-colors">
              No listening history yet. Start a sleep track or audiobook chapter to track progress here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {continueListening.map((item) => {
                const percent = Math.min(
                  100,
                  Math.round((item.positionSeconds / Math.max(1, item.durationSeconds)) * 100)
                );
                const isItemPlaying =
                  isPlaying && currentTrack && currentTrack.id === item.id;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePlayContinueItem(item)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex flex-col gap-2 hover:border-[#17495e]/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#1b2c37] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
                          {item.type === 'audiobook' ? (
                            <Headphones size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#838c89] dark:text-[#98abb6] truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8e6724] dark:text-[#e8b98a]">
                          {Math.floor(item.positionSeconds / 60)}m / {Math.floor(item.durationSeconds / 60)}m
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-xs">
                          {isItemPlaying ? (
                            <Pause size={12} className="fill-current" />
                          ) : (
                            <Play size={12} className="fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#efe9df] dark:bg-[#1b2c37] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#17495e] dark:bg-[#e8b98a] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. SAVED FAVOURITES SHELF */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              Saved Favourites ({resolvedFavorites.length})
            </span>
            <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
              Instant 1-tap playback
            </span>
          </div>

          {resolvedFavorites.length === 0 ? (
            <div className="bg-white dark:bg-[#14232c] p-4 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] text-center text-xs text-[#838c89] dark:text-[#98abb6] transition-colors">
              No favourites bookmarked yet. Tap the bookmark icon on any sleep recording or audiobook chapter to pin it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {resolvedFavorites.map((item) => {
                const isPlayingThis =
                  isPlaying && currentTrack && currentTrack.id === item.id;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePlayFavorite(item.id)}
                    className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#17495e]/40 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#1b2c37] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
                        {item.type === 'audiobook' ? (
                          <Headphones size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
                            {item.category}
                          </span>
                          <span className="text-[#838c89] dark:text-[#6c8491] text-[8px]">•</span>
                          <span className="text-[9px] text-[#838c89] dark:text-[#98abb6] font-mono">
                            {item.durationFormatted}
                          </span>
                          {item.isLocked && (
                            <span className="text-[8.5px] bg-[#fdf6ec] dark:bg-[#1b2b36] border border-[#d9a44a]/40 text-[#8e6724] dark:text-[#e8b98a] font-bold px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5">
                              <Lock size={8} /> SOVEREIGN
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="p-1.5 text-[#d9a44a] hover:text-[#b0802c] transition-colors cursor-pointer"
                        title="Remove from favourites"
                      >
                        <Bookmark size={15} className="fill-current" />
                      </button>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          item.isLocked
                            ? 'bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] border border-[#d9a44a]/30'
                            : 'bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317]'
                        }`}
                      >
                        {item.isLocked ? (
                          <Lock size={12} />
                        ) : isPlayingThis ? (
                          <Pause size={12} className="fill-current" />
                        ) : (
                          <Play size={12} className="fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. NORTH STAR METRIC CARD (MAMs) */}
        <div className="bg-gradient-to-br from-[#17495e] to-[#1f5f78] dark:from-[#0d222c] dark:to-[#143240] text-white p-5 rounded-3xl shadow-sm border border-[#17495e]/30 dark:border-[#1f4a5c]/40 relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#e8b98a] block mb-1">
            The North Star Metric
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-serif-title text-3xl font-bold text-white">
              {awarenessMoments.length}
            </span>
            <span className="text-xs text-white/80">
              Meaningful Awareness Moments (MAMs)
            </span>
          </div>

          <p className="text-[11px] text-white/70 leading-relaxed font-serif-quote italic">
            "No streak pressure. No gamified level 10 scores. Just real moments where you paused, separated fact from story, and made a conscious choice."
          </p>
        </div>

        {/* 5. PRIVACY PLEDGE BANNER */}
        <div className="bg-[#e8f1ec] dark:bg-[#12261c] p-3 rounded-2xl border border-[#3c7858]/30 dark:border-[#52a378]/30 flex items-center gap-2.5">
          <Shield size={18} className="text-[#3c7858] dark:text-[#52a378] shrink-0" />
          <p className="text-[10.5px] text-[#1f2a28] dark:text-[#e8f2ec] leading-tight">
            <strong>Zero Surveillance Guarantee:</strong> Your reflections and listening data are strictly on-device, never shared, and never used to train public AI models.
          </p>
        </div>

        {/* 6. SAVED INSIGHTS STREAM */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              Saved Insights ({filteredInsights.length})
            </h4>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[10.5px] px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317]'
                    : 'bg-white dark:bg-[#14232c] text-[#5a6663] dark:text-[#98abb6] border border-[#e6dccb] dark:border-[#1d2e38] hover:border-[#17495e]'
                }`}
              >
                {tag === 'all' ? 'All Insights' : tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredInsights.length === 0 ? (
            <div className="bg-white dark:bg-[#14232c] p-6 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] text-center text-xs text-[#838c89] dark:text-[#98abb6] transition-colors">
              No reflections recorded yet in this category. Complete a Pause or Mirror session to begin your awareness journal.
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white dark:bg-[#14232c] p-4 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-[#838c89] dark:text-[#98abb6]">
                  <span className="bg-[#fdf6ec] dark:bg-[#1b2b36] text-[#8e6724] dark:text-[#e8b98a] px-2 py-0.5 rounded-full font-semibold border border-[#d9a44a]/30">
                    {insight.tag}
                  </span>
                  <span>{insight.timestamp}</span>
                </div>

                <p className="text-xs text-[#1f2a28] dark:text-[#f1ede6] font-serif-quote italic leading-relaxed pt-1">
                  "{insight.text}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* 7. DANGER ZONE: CLEAR LOCAL DATA */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently clear your local awareness reflections?')) {
                onClearAll();
                audioEngine.playBowlChime(260, 2);
              }
            }}
            className="w-full py-2.5 rounded-xl border border-[#b54a3c]/30 text-[#b54a3c] dark:text-[#ff7b6b] text-xs font-semibold hover:bg-[#b54a3c]/5 dark:hover:bg-[#b54a3c]/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Purge All Local Awareness Data</span>
          </button>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#e6dccb] dark:border-[#1d2e38] bg-[#efe9df]/60 dark:bg-[#101b22]/60 text-center text-[10px] text-[#838c89] dark:text-[#98abb6] shrink-0">
        Your personal evolving awareness operating system.
      </div>
    </div>
  );
};
