import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Moon,
  Compass,
  Play,
  Shield,
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface AuthorIntroScreenProps {
  onContinue: () => void;
}

export const AuthorIntroScreen: React.FC<AuthorIntroScreenProps> = ({ onContinue }) => {
  return (
    <div className="flex-1 w-full h-full bg-[#070b0e] text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-10">
      {/* Background ambient radial aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-gradient-to-b from-[#1f5f78]/25 via-[#d9a44a]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Skip Button */}
      <div className="w-full max-w-xl mx-auto px-5 pt-4 pb-2 flex items-center justify-between relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4ba377] animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-[#e8b98a] uppercase font-bold">
            Author Introduction
          </span>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="text-xs font-semibold text-[#8fd0ff]/80 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer backdrop-blur-xs flex items-center gap-1"
        >
          <span>Skip to App</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="w-full max-w-xl mx-auto px-5 space-y-5 relative z-10 my-auto py-4">
        {/* Author Avatar & Header Card */}
        <div className="text-center space-y-3">
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#17495e] to-[#1f5f78] border-2 border-[#e8b98a]/50 flex items-center justify-center shadow-[0_0_40px_rgba(232,185,138,0.25)] mx-auto">
              <span className="font-serif-title font-bold text-2xl text-[#e8b98a]">VK</span>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#d9a44a] text-[#070b0e]">
              <Sparkles size={12} className="fill-current" />
            </div>
          </div>

          <div>
            <h1 className="font-serif-title text-2xl font-bold text-white tracking-wide">
              Vinay Kapoor
            </h1>
            <p className="text-xs text-[#e8b98a] font-medium mt-0.5">
              Author of <span className="italic">Human 2.0: Awareness — Future Ready with AI</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-mono text-[#98abb6]">
              <span>Author</span>
              <span>·</span>
              <span>Senior Corporate Executive</span>
              <span>·</span>
              <span>Meditation Teacher</span>
            </div>
          </div>
        </div>

        {/* Philosophy Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4.5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5"
        >
          <div className="flex items-center gap-2 text-[#e8b98a] text-[11px] font-mono uppercase tracking-wider font-bold">
            <Compass size={14} />
            <span>The Human 2.0 Equation</span>
          </div>

          <blockquote className="font-serif-quote italic text-sm text-[#f7f3ec] leading-relaxed">
            "Outer success meets inner awareness. As artificial intelligence gets faster and more capable, human beings must get stiller and more conscious."
          </blockquote>

          <p className="text-xs text-[#98abb6] leading-relaxed">
            Human 2.0 Sleep is engineered for high-functioning individuals navigating boardrooms, screens, and relentless cognitive demands.
            It provides clinical somatic resets, acoustic relaxing bells, and restorative nighttime guidance to dissolve sleep anxiety.
          </p>
        </motion.div>

        {/* 3 Pillar Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#1f5f78]/40 text-[#8fd0ff] flex items-center justify-center mb-1.5">
              <Headphones size={15} />
            </div>
            <div className="font-serif-title font-bold text-xs text-white">45 Audio Chapters</div>
            <p className="text-[10px] text-[#98abb6] leading-snug">
              Complete book narrated directly by Vinay Kapoor in the Dedicated Listen section.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#d9a44a]/20 text-[#e8b98a] flex items-center justify-center mb-1.5">
              <Moon size={15} />
            </div>
            <div className="font-serif-title font-bold text-xs text-white">Sleep Sanctuary</div>
            <p className="text-[10px] text-[#98abb6] leading-snug">
              Nocturnal restorative soundscapes, relaxing bells, and vagus nerve resets.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-1.5">
              <Shield size={15} />
            </div>
            <div className="font-serif-title font-bold text-xs text-white">Sovereign Agency</div>
            <p className="text-[10px] text-[#98abb6] leading-snug">
              Zero algorithms, zero trackers. Pure conscious human agency for deep rest.
            </p>
          </div>
        </div>

        {/* Video Introduction Preview */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#e8b98a] flex items-center gap-1.5 font-bold">
            <Play size={12} className="fill-current" />
            <span>Author Video Message</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <VideoPlayer
              defaultSrc="/videos/intro.mp4"
              title="Vinay Kapoor — What is Human 2.0?"
              subtitle="Watch the author explain outer success & inner awareness"
            />
          </div>
        </div>
      </div>

      {/* Bottom CTA to Landing Page */}
      <div className="w-full max-w-xl mx-auto px-5 pt-3 relative z-10 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] hover:brightness-110 text-white font-bold text-sm shadow-[0_10px_25px_rgba(31,95,120,0.5)] flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
        >
          <span>Enter Sleep Sanctuary</span>
          <ArrowRight size={16} className="text-[#e8b98a]" />
        </motion.button>

        <p className="text-[10px] text-center text-[#98abb6] mt-2">
          Not therapy. Not an AI friend. Conscious human agency for nighttime restoration.
        </p>
      </div>
    </div>
  );
};
