import React from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Play, 
  ChevronRight, 
  Moon, 
  Radio, 
  Bell, 
  Zap, 
  BookOpen,
  Sparkles,
  Crown
} from 'lucide-react';
import type { Screen, ConstructionAudioSession } from '../types';
import { DAILY_CALM_SESSION, SOS_SESSIONS } from '../data/extendedMindfulnessData';
import { audioEngine } from '../utils/audioEngine';

interface StakeholderPreviewSectionProps {
  onNavigate: (screen: Screen) => void;
  onOpenConstructionSession?: (session: ConstructionAudioSession) => void;
}

/**
 * StakeholderPreviewSection
 * 
 * Contains all candidate mindfulness expansion features added for stakeholder demonstration:
 * 1. Ebb AI Companion (somatic feeling & weather triage)
 * 2. Daily Calm (10m) & SOS Acute Stress (90s) fast-action cards
 * 3. 4-Pillar Hub (7-Day Foundations, Sleep Sanctuary, Unguided Timer, Live & Community)
 * 4. 100,000+ Multi-Tradition & Masterclass Library Explorer
 * 
 * Modularly isolated so it can be enabled, disabled, or removed with a single toggle in HomeScreen.tsx.
 */
export const StakeholderPreviewSection: React.FC<StakeholderPreviewSectionProps> = ({
  onNavigate,
  onOpenConstructionSession,
}) => {
  return (
    <section className="space-y-3.5 pt-3 mt-3 border-t-2 border-dashed border-[#e6dccb] dark:border-[#1d2e38]">
      {/* Stakeholder Demo Header & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#8e6724] dark:text-[#e8b98a]" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
            Mindfulness Expansion Suite
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d9a44a]/15 dark:bg-[#e8b98a]/15 text-[#8e6724] dark:text-[#e8b98a] font-mono font-semibold">
          Stakeholder Preview
        </span>
      </div>
      <p className="text-[11px] text-[#6c7774] dark:text-[#8da0ac] -mt-1 leading-snug">
        Proposed ecosystem extensions for mindfulness, sleep, unguided practice, and community.
      </p>

      {/* 1. EBB AI COMPANION BANNER */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          audioEngine.playBreathChime('inhale');
          onNavigate('ebb');
        }}
        className="p-3.5 rounded-3xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] text-white shadow-xs cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center text-lg shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            🌊
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a]">
                Ebb · AI Companion
              </span>
              <span className="text-[8.5px] bg-white/20 text-[#e8b98a] px-1.5 py-0.2 rounded-full font-mono">
                Somatic AI
              </span>
            </div>
            <h3 className="font-serif-title text-sm font-bold text-white leading-tight">
              How is your internal weather?
            </h3>
            <p className="text-[10.5px] text-white/80 leading-snug">
              Senses how you are feeling and suggests the exact practice or sound.
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#e8b98a] group-hover:translate-x-0.5 transition-transform" />
      </motion.div>

      {/* 2. DAILY CALM (10m) & SOS ACUTE STRESS (90s) FAST BAR */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Daily Calm */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            if (onOpenConstructionSession) {
              onOpenConstructionSession(DAILY_CALM_SESSION);
            } else {
              onNavigate('explore');
            }
          }}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] bg-[#fdf6ec] dark:bg-[#18262f] px-1.5 py-0.2 rounded-md">
                Daily Calm · 10m
              </span>
              <div className="w-5 h-5 rounded-full bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center">
                <Play size={9} className="fill-current ml-0.2" />
              </div>
            </div>
            <h4 className="font-serif-title text-xs font-bold text-[#17495e] dark:text-[#f1ede6] leading-tight group-hover:text-[#1f5f78] dark:group-hover:text-[#e8b98a] transition-colors">
              Cultivating Unshakable Calm
            </h4>
          </div>
          <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6] mt-2">
            Tamara Levitt · Fresh Today
          </span>
        </motion.div>

        {/* SOS Acute Reset */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            if (onOpenConstructionSession) {
              onOpenConstructionSession(SOS_SESSIONS[0]);
            } else {
              onNavigate('explore');
            }
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fdf6ec] to-white dark:from-[#1b252b] dark:to-[#14232c] border border-[#d9a44a]/40 dark:border-[#e8b98a]/30 shadow-xs cursor-pointer hover:shadow-sm transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] bg-[#d9a44a]/20 dark:bg-[#e8b98a]/20 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <Zap size={9} />
                <span>SOS Reset · 90s</span>
              </span>
              <div className="w-5 h-5 rounded-full bg-[#8e6724] dark:bg-[#e8b98a] text-white dark:text-[#0b1317] flex items-center justify-center">
                <Play size={9} className="fill-current ml-0.2" />
              </div>
            </div>
            <h4 className="font-serif-title text-xs font-bold text-[#17495e] dark:text-[#f1ede6] leading-tight">
              Panic & Spiral Circuit Breaker
            </h4>
          </div>
          <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6] mt-2">
            Neuro-Somatic Reset →
          </span>
        </motion.div>
      </div>

      {/* 3. 4-PILLAR FEATURE HUB: Foundations, Sleep, Timer, Community */}
      <div className="grid grid-cols-2 gap-2">
        {/* Beginner Path */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('explore');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#dce9f0] dark:bg-[#1b2d39] text-[#1f5f78] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
            <Compass size={15} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-[#8e6724] dark:text-[#e8b98a] block">
              7-Day Course
            </span>
            <h4 className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight">
              Beginner Path
            </h4>
          </div>
        </motion.div>

        {/* Sleep Sanctuary */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('explore');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#1a2b36] text-[#8e6724] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
            <Moon size={15} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-[#8e6724] dark:text-[#e8b98a] block">
              Sleep Library
            </span>
            <h4 className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight">
              Sleep Stories & Sanctuary
            </h4>
          </div>
        </motion.div>

        {/* Custom Unguided Timer */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('timer');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#fdf6ec] dark:bg-[#1f2b33] text-[#d9a44a] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
            <Bell size={15} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-[#8e6724] dark:text-[#e8b98a] block">
              Interval Bells
            </span>
            <h4 className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight">
              Unguided Timer
            </h4>
          </div>
        </motion.div>

        {/* Live & Community */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('community');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#e8f1ec] dark:bg-[#153123] text-[#3c7858] dark:text-[#52a378] flex items-center justify-center shrink-0">
            <Radio size={15} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-[#3c7858] dark:text-[#52a378] block">
              Live Now
            </span>
            <h4 className="text-xs font-semibold text-[#17495e] dark:text-[#f1ede6] truncate leading-tight">
              Rooms & Circles
            </h4>
          </div>
        </motion.div>
      </div>

      {/* 4. 100,000+ TRADITIONS & MASTERCLASSES HERO EXPLORER BANNER */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          audioEngine.playBreathChime('inhale');
          onNavigate('explore');
        }}
        className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 transition-all group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#1b2c37] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center font-bold text-xs">
              <BookOpen size={16} />
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                100,000+ Master Catalog
              </span>
              <h3 className="font-serif-title text-sm font-bold text-[#17495e] dark:text-[#f1ede6]">
                Traditions & Subject Masterclasses
              </h3>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8e6724] dark:text-[#e8b98a] group-hover:translate-x-0.5 transition-transform" />
        </div>

        <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
          Secular Mindfulness, Soto Zen, Vipassana, Kundalini, Stoic, Advaita Vedanta, plus masterclasses from Tara Brach, Jud Brewer & Vinay Kapoor.
        </p>

        <div className="mt-2.5 pt-2 border-t border-[#e6dccb]/60 dark:border-[#1d2e38] flex items-center justify-between text-[10.5px]">
          <span className="text-[#838c89] dark:text-[#6c8491]">Widest Range of Lineages</span>
          <span className="text-[#17495e] dark:text-[#e8b98a] font-semibold">Browse 100k+ Library →</span>
        </div>
      </motion.div>

      {/* 5. SOVEREIGN MEMBERSHIP & STOREKIT 2 PAYWALL */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          audioEngine.playBreathChime('inhale');
          onNavigate('subscription');
        }}
        className="p-4 rounded-3xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#254d60] text-white shadow-xs cursor-pointer border border-[#d9a44a]/40 group flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#d9a44a]/20 border border-[#d9a44a]/50 text-[#e8b98a] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Crown size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a]">
                Monetization Architecture
              </span>
              <span className="text-[8.5px] bg-[#d9a44a]/30 text-[#e8b98a] px-1.5 py-0.2 rounded-full font-mono font-semibold">
                StoreKit 2
              </span>
            </div>
            <h3 className="font-serif-title text-sm font-bold text-white leading-tight">
              Human 2.0 Sovereign Paywall
            </h3>
            <p className="text-[10.5px] text-white/80 leading-snug">
              $69.99/yr with 7-Day Free Trial · AI Teacher, 45 Audiobooks, 100k+ Library
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#e8b98a] group-hover:translate-x-0.5 transition-transform shrink-0" />
      </motion.div>
    </section>
  );
};
