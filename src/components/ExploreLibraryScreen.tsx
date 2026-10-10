import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Play,
  Moon,
  Zap,
  BookOpen,
  GraduationCap,
  Target,
  Compass,
  Wind
} from 'lucide-react';
import {
  FOUNDATIONS_COURSE,
  SOS_SESSIONS,
  SLEEP_LIBRARY,
  DAILY_CALM_SESSION,
  MASTERCLASSES,
  GOAL_PROGRAMMES,
  TRADITIONS_CATALOG,
  BREADTH_COLLECTION,
} from '../data/extendedMindfulnessData';
import type { ConstructionAudioSession, Screen } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface ExploreLibraryScreenProps {
  onBack: () => void;
  onOpenSession: (session: ConstructionAudioSession) => void;
  onNavigate: (screen: Screen) => void;
}

type LibraryCategory =
  | 'all'
  | 'foundations'
  | 'sos'
  | 'sleep'
  | 'traditions'
  | 'masterclasses'
  | 'goals'
  | 'breath_sound';

export const ExploreLibraryScreen: React.FC<ExploreLibraryScreenProps> = ({
  onBack,
  onOpenSession,
}) => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allSessions: ConstructionAudioSession[] = [
    DAILY_CALM_SESSION,
    ...FOUNDATIONS_COURSE,
    ...SOS_SESSIONS,
    ...SLEEP_LIBRARY,
    ...MASTERCLASSES,
    ...GOAL_PROGRAMMES,
    ...TRADITIONS_CATALOG,
    ...BREADTH_COLLECTION,
  ];

  const filteredSessions = allSessions.filter((session) => {
    // Category match
    let matchesCategory = true;
    if (activeCategory === 'foundations') matchesCategory = session.category === 'foundations';
    else if (activeCategory === 'sos') matchesCategory = session.category === 'sos';
    else if (activeCategory === 'sleep') matchesCategory = session.category === 'sleep_story';
    else if (activeCategory === 'traditions') matchesCategory = session.category === 'tradition';
    else if (activeCategory === 'masterclasses') matchesCategory = session.category === 'masterclass';
    else if (activeCategory === 'goals') matchesCategory = session.category === 'goal_program';
    else if (activeCategory === 'breath_sound') matchesCategory = session.category === 'soundscape' || session.category === 'breathwork';

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      session.title.toLowerCase().includes(q) ||
      session.description.toLowerCase().includes(q) ||
      session.teacher.toLowerCase().includes(q) ||
      (session.tradition && session.tradition.toLowerCase().includes(q)) ||
      session.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all' as LibraryCategory, label: 'All 100k+', icon: Sparkles },
    { id: 'foundations' as LibraryCategory, label: 'Beginner Path (7d)', icon: Compass },
    { id: 'sos' as LibraryCategory, label: 'SOS Acute (1-3m)', icon: Zap },
    { id: 'sleep' as LibraryCategory, label: 'Sleep Stories & Wind-Down', icon: Moon },
    { id: 'traditions' as LibraryCategory, label: 'Traditions (Zen/Vipassana/Kundalini)', icon: BookOpen },
    { id: 'masterclasses' as LibraryCategory, label: 'Masterclasses', icon: GraduationCap },
    { id: 'goals' as LibraryCategory, label: 'Goal Programs (Anxiety/Focus)', icon: Target },
    { id: 'breath_sound' as LibraryCategory, label: 'Breath & Soundscapes', icon: Wind },
  ];

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
            100,000+ Master Library
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Explore Traditions & Paths
          </h2>
        </div>

        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#838c89] dark:text-[#98abb6]" />
          <input
            type="text"
            placeholder="Search by topic, tradition (Zen, Vipassana, Kundalini) or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] text-xs text-[#1f2a28] dark:text-[#f1ede6] placeholder-[#838c89] dark:placeholder-[#6c8491] focus:outline-none focus:border-[#17495e] dark:focus:border-[#e8b98a] shadow-xs transition-colors"
          />
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  hapticsEngine.trigger('tap');
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] shadow-xs'
                    : 'bg-white dark:bg-[#14232c] text-[#5a6663] dark:text-[#98abb6] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1b2d39]'
                }`}
              >
                <Icon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* RESULTS FEED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
              {filteredSessions.length} Sessions Available
            </span>
            <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
              Audio in Production / Upload Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  audioEngine.playBreathChime('inhale');
                  onOpenSession(session);
                }}
                className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a] bg-[#fdf6ec] dark:bg-[#18262f] px-2 py-0.5 rounded-full font-mono">
                        {session.tradition || session.category.replace('_', ' ')}
                      </span>
                      <span className="text-[9.5px] font-mono text-[#838c89] dark:text-[#98abb6]">
                        {session.durationFormatted}
                      </span>
                      <span className="text-[8.5px] px-1.5 py-0.2 bg-[#d9a44a]/15 text-[#8e6724] dark:text-[#e8b98a] rounded-md font-mono">
                        Audio format
                      </span>
                    </div>

                    <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6] leading-snug group-hover:text-[#1f5f78] dark:group-hover:text-[#e8b98a] transition-colors">
                      {session.title}
                    </h3>

                    {session.subtitle && (
                      <p className="text-[10.5px] text-[#8e6724] dark:text-[#e8b98a] font-medium leading-tight">
                        {session.subtitle}
                      </p>
                    )}

                    <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10.5px]">
                      <span className="text-[#838c89] dark:text-[#6c8491]">
                        Teacher: <strong className="text-[#17495e] dark:text-[#e8b98a] font-semibold">{session.teacher}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Play size={13} className="fill-current ml-0.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
