import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  Lock,
  ChevronDown,
  ChevronUp,
  Crown,
} from 'lucide-react';
import type { Screen, SleepTrack } from '../types';
import {
  useSleepSections,
  useSectionItems,
  sleepContentService,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_ITEMS,
  type SleepSection,
  type SleepSectionItem,
} from '../services/sleepContentService';
import { useAudio } from '../context/AudioContext';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface MeditationHubScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export const MeditationHubScreen: React.FC<MeditationHubScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { sections } = useSleepSections();
  const { items: allSectionItems } = useSectionItems();
  const { currentTrack, isPlaying, playSleepTrack, togglePlay } = useAudio();

  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';

  // Filter only published meditation sections, sorted by sortOrder
  const meditationSections = (sections.length > 0 ? sections : DEFAULT_SECTIONS)
    .filter((s) => s.isPublished !== false && s.sectionType !== 'audiobook')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Default expand the first section (e.g. Sleep Meditation) or allow toggling
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(() => {
    return meditationSections.length > 0 ? meditationSections[0].id : 'sleep-meditation';
  });

  const getItemsForSection = (sectionId: string): SleepSectionItem[] => {
    const list = allSectionItems.filter((i) => i.sectionId === sectionId && i.isPublished !== false);
    if (list.length > 0) return list.sort((a, b) => a.sortOrder - b.sortOrder);
    return DEFAULT_SECTION_ITEMS
      .filter((i) => i.sectionId === sectionId && i.isPublished !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const handleToggleExpand = (sectionId: string) => {
    audioEngine.playBreathChime('inhale');
    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId);
  };

  const handlePlayAudio = (item: SleepSectionItem, section: SleepSection) => {
    hapticsEngine.trigger('tap');
    const isLocked = item.access === 'paid' && !isPremium;
    if (isLocked) {
      audioEngine.playBreathChime('inhale');
      onNavigate('subscription');
      return;
    }

    const track: SleepTrack = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || `${section.title} · ${item.access === 'free' ? 'Free Audio' : 'Full Audio'}`,
      category: 'soundscape',
      durationSeconds: item.durationSeconds || 600,
      isPremium: item.access === 'paid',
      audioEngineType: 'bell_sound',
      audioUrl: item.audioPath?.startsWith('http') || item.audioPath?.startsWith('/audio') ? item.audioPath : '/audio/sample.mp3',
      tags: ['meditation', section.slug],
      description: item.description || '',
      audioPath: item.audioPath,
    };

    sleepContentService.recordPlayEvent({ trackId: item.id, platform: 'web' });

    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      playSleepTrack(track);
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#070b0e] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-3xl mx-auto px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20 bg-[#f7f3ec]/95 dark:bg-[#070b0e]/95 backdrop-blur-md border-b border-[#e6dccb] dark:border-[#1d2e38]">
        <button
          type="button"
          onClick={() => {
            audioEngine.playBreathChime('exhale');
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] text-xs font-semibold text-[#17495e] dark:text-[#e8b98a] shadow-2xs hover:bg-[#efe9df] dark:hover:bg-[#1b2b34] transition-all cursor-pointer min-h-[44px]"
          title="Back to Sleep Sanctuary"
          aria-label="Back to Sleep Sanctuary"
        >
          <ArrowLeft size={15} />
          <span>Sleep Sanctuary</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#3c7858] dark:text-[#52a378] block">
            Meditation Hub
          </span>
          <span className="text-xs font-bold text-[#17495e] dark:text-[#e8b98a]">
            {meditationSections.length} Curated Series
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl mx-auto px-5 pt-5 pb-8 space-y-5">
        {/* Hub Hero Banner */}
        <div className="bg-gradient-to-br from-[#17495e] via-[#1f5f78] to-[#123645] text-white p-5 rounded-3xl shadow-sm border border-[#17495e]/60 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4ba377] animate-pulse" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#e8b98a]">
              Restorative Meditation
            </span>
          </div>
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-white leading-tight">
            Curated Meditation Series
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-lg leading-relaxed">
            Select a series below to explore free grounding recordings and complete guided protocols.
          </p>
        </div>

        {/* Dynamic Meditation Boxes (Sleep Meditation, Women, Short, and Admin-Added) */}
        <div className="space-y-4">
          {meditationSections.map((sec, idx) => {
            const items = getItemsForSection(sec.id);
            const freeItems = items.filter((i) => i.access === 'free');
            const paidItems = items.filter((i) => i.access === 'paid');
            const isExpanded = expandedSectionId === sec.id;

            return (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-[#121e25] rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs overflow-hidden transition-all"
              >
                {/* Clickable Section Box Card */}
                <div
                  onClick={() => handleToggleExpand(sec.id)}
                  className="p-5 cursor-pointer hover:bg-[#fbf9f5] dark:hover:bg-[#15232b] transition-colors select-none min-h-[48px]"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`Open ${sec.title}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Badge and Free Count Pill */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#17495e] dark:text-[#e8b98a] bg-[#17495e]/10 dark:bg-[#e8b98a]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>{sec.badge || 'Meditation Series'}</span>
                        </span>

                        <span className="text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          {freeItems.length} Free {freeItems.length === 1 ? 'Audio' : 'Audios'}
                        </span>

                        <span className="text-[9.5px] font-mono text-[#717e7a] dark:text-[#8ea0ac]">
                          {items.length} Total Tracks
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#17495e] dark:text-[#f1ede6] leading-tight">
                        {sec.title}
                      </h3>

                      {sec.subtitle && (
                        <p className="text-xs text-[#5a6663] dark:text-[#98abb6] mt-0.5 line-clamp-2">
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Pricing Badge & Expand Arrow */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#d9a44a]/20 to-[#e8b98a]/30 border border-[#d9a44a]/60 text-xs font-bold text-[#8e6724] dark:text-[#e8b98a] font-mono shadow-2xs">
                          {sec.priceDisplay || sec.priceAed || 'AED 49'}
                        </span>
                        <span className="block text-[9px] text-[#838c89] dark:text-[#7f94a0] font-mono mt-0.5">
                          {sec.pricingType === 'standalone' ? 'Standalone' : 'Lifetime'}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#f7f3ec] dark:bg-[#1a2b34] flex items-center justify-center text-[#17495e] dark:text-[#e8b98a]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inside Box: Free & Paid Audios */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#e6dccb]/70 dark:border-[#1d2e38] bg-[#fbf9f5]/50 dark:bg-[#0e171c]/50 p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-serif-title font-bold text-[#17495e] dark:text-[#e8b98a]">
                          Audios in {sec.title}
                        </span>
                        <span className="text-[10px] text-[#717e7a] dark:text-[#8ea0ac] font-mono">
                          Tap to play or unlock
                        </span>
                      </div>

                      {/* Audios List */}
                      <div className="space-y-2">
                        {items.map((item, itemIdx) => {
                          const isCurrentItemPlaying = currentTrack?.id === item.id && isPlaying;
                          const isLocked = item.access === 'paid' && !isPremium;

                          return (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.008 }}
                              whileTap={{ scale: 0.992 }}
                              onClick={() => handlePlayAudio(item, sec)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[48px] ${
                                isCurrentItemPlaying
                                  ? 'bg-[#17495e]/10 dark:bg-[#e8b98a]/15 border-[#17495e] dark:border-[#e8b98a]'
                                  : 'bg-white dark:bg-[#14222a] border-[#e6dccb] dark:border-[#1d2e38] hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 shadow-2xs'
                              }`}
                            >
                              {/* Left: Play Icon & Number */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isCurrentItemPlaying
                                      ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317]'
                                      : item.access === 'free'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                  }`}
                                >
                                  {isCurrentItemPlaying ? (
                                    <Pause size={14} className="fill-current" />
                                  ) : isLocked ? (
                                    <Lock size={14} />
                                  ) : (
                                    <Play size={14} className="fill-current ml-0.5" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-[#838c89] shrink-0">
                                      #{itemIdx + 1}
                                    </span>
                                    <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight">
                                      {item.title}
                                    </h4>
                                  </div>
                                  {item.subtitle && (
                                    <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6] truncate mt-0.5">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: Badge & Duration */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-mono text-[#838c89] dark:text-[#8aa0ad]">
                                  {item.durationFormatted || `${Math.round(item.durationSeconds / 60)}m`}
                                </span>

                                {item.access === 'free' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                                    FREE AUDIO
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-gradient-to-r from-[#d9a44a]/25 to-[#e8b98a]/35 text-[#8e6724] dark:text-[#e8b98a] border border-[#d9a44a]/50 flex items-center gap-1">
                                    <Lock size={9} />
                                    <span>{isPremium ? 'UNLOCKED' : `PAID · ${sec.priceDisplay || 'AED 49'}`}</span>
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Unlock Series Action Bar */}
                      {!isPremium && paidItems.length > 0 && (
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#d9a44a]/15 via-[#e8b98a]/20 to-[#d9a44a]/15 border border-[#d9a44a]/40">
                          <div className="flex items-center gap-2">
                            <Crown size={15} className="text-[#8e6724] dark:text-[#e8b98a]" />
                            <span className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6]">
                              {paidItems.length} full series meditations available
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playBreathChime('inhale');
                              onNavigate('subscription');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] font-bold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer self-start sm:self-auto"
                          >
                            Unlock All ({sec.priceDisplay || 'AED 49'})
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
