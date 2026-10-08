import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Building2, 
  HeartHandshake, 
  Compass, 
  Eye, 
  ExternalLink,
  Globe,
  ShoppingCart,
  Headphones,
  Sun,
  Moon,
  Check,
  Crown
} from 'lucide-react';
import type { Screen } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { VideoPlayer } from './VideoPlayer';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

interface AmazonRegion {
  name: string;
  flag: string;
  url: string;
  code: string;
}

const AMAZON_REGIONS: AmazonRegion[] = [
  { name: 'United Kingdom', flag: '🇬🇧', url: 'https://www.amazon.co.uk/dp/B0HGRN9CQC', code: 'UK' },
  { name: 'United States', flag: '🇺🇸', url: 'https://www.amazon.com/dp/B0HGRN9CQC', code: 'US' },
  { name: 'India', flag: '🇮🇳', url: 'https://www.amazon.in/dp/B0HGRN9CQC', code: 'IN' },
  { name: 'Germany', flag: '🇩🇪', url: 'https://www.amazon.de/dp/B0HGRN9CQC', code: 'DE' },
  { name: 'Canada', flag: '🇨🇦', url: 'https://www.amazon.ca/dp/B0HGRN9CQC', code: 'CA' },
  { name: 'France', flag: '🇫🇷', url: 'https://www.amazon.fr/dp/B0HGRN9CQC', code: 'FR' },
  { name: 'Australia', flag: '🇦🇺', url: 'https://www.amazon.com.au/dp/B0HGRN9CQC', code: 'AU' },
  { name: 'Singapore', flag: '🇸🇬', url: 'https://www.amazon.sg/dp/B0HGRN9CQC', code: 'SG' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onBack, 
  onNavigate,
  isDark,
  onToggleDark 
}) => {

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-20 transition-colors">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8e6724] dark:text-[#e8b98a]">
            Author & Philosophy
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Vinay Kapoor
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-5">
        {/* Appearance & Theme Selector */}
        {onToggleDark && (
          <div className="bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Appearance & Theme
              </span>
              <span className="text-[9.5px] text-[#838c89] dark:text-[#98abb6]">
                {isDark ? 'Night Sanctuary Active' : 'Daylight Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Daylight Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  if (isDark) onToggleDark();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !isDark
                    ? 'bg-[#f7f3ec] border-[#17495e] ring-2 ring-[#17495e]/20 shadow-xs'
                    : 'bg-white dark:bg-[#0e181e] border-[#e6dccb] dark:border-[#1d2e38] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#162630] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a]">
                    <Sun size={14} />
                  </div>
                  {!isDark && (
                    <span className="w-5 h-5 rounded-full bg-[#17495e] text-white flex items-center justify-center text-[10px]">
                      <Check size={11} />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6]">Daylight Mode</h4>
                  <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6] leading-tight">Warm sand & serene ivory</p>
                </div>
              </button>

              {/* Night Sanctuary Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  if (!isDark) onToggleDark();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#18262f] border-[#e8b98a] ring-2 ring-[#e8b98a]/30 shadow-xs'
                    : 'bg-[#fdfbf7] dark:bg-[#0e181e] border-[#e6dccb] dark:border-[#1d2e38] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-xl bg-[#0b1317] text-[#e8b98a] flex items-center justify-center">
                    <Moon size={14} />
                  </div>
                  {isDark && (
                    <span className="w-5 h-5 rounded-full bg-[#e8b98a] text-[#0b1317] flex items-center justify-center text-[10px]">
                      <Check size={11} />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6]">Night Sanctuary</h4>
                  <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6] leading-tight">Deep starlit contrast</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Membership Tier Status Card */}
        <div className="bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d9a44a]/20 to-[#e8b98a]/30 text-[#8e6724] dark:text-[#e8b98a] flex items-center justify-center font-bold">
                <Crown size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                  Membership Tier
                </span>
                <h4 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
                  {typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true'
                    ? 'Human 2.0 Sovereign (Active)'
                    : 'Sovereign Explorer (Free Tier)'}
                </h4>
              </div>
            </div>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true'
                  ? 'bg-[#3c7858]/20 text-[#3c7858] dark:text-[#52a378]'
                  : 'bg-[#d9a44a]/15 text-[#8e6724] dark:text-[#e8b98a]'
              }`}
            >
              {typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true'
                ? 'SOVEREIGN'
                : 'FREE'}
            </span>
          </div>

          <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed mb-3">
            {typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true'
              ? 'You have complete, unrestricted access to the Conversational AI Meditation Teacher, all 45 audio chapters, and the 100,000+ library.'
              : 'Upgrade to Human 2.0 Sovereign for unlimited AI Meditation Teacher dialogue, full 45 audiobook chapters, and offline downloads.'}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('subscription');
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#17495e] to-[#1f5f78] dark:from-[#e8b98a] dark:to-[#d9a44a] text-[#e8b98a] dark:text-[#0b1317] text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
          >
            <Crown size={14} className="fill-current" />
            <span>
              {typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true'
                ? 'Manage Sovereign Membership'
                : 'Explore Sovereign Plan · 7-Day Free Trial'}
            </span>
          </motion.button>
        </div>

        {/* Author Header Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#e6dccb] shadow-xs text-center flex flex-col items-center">
          {/* Monogram Avatar */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#17495e] via-[#1f5f78] to-[#2a7a98] text-[#e8b98a] flex items-center justify-center font-serif-title text-2xl font-bold border-2 border-[#d9a44a]/40 shadow-sm">
              VK
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fdf6ec] border border-[#d9a44a] flex items-center justify-center text-[#8e6724]">
              <Sparkles size={12} />
            </div>
          </div>

          <h3 className="font-serif-title text-2xl font-bold text-[#17495e] mb-1">
            Vinay Kapoor
          </h3>

          {/* Pillars Tagline */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] font-semibold text-[#8e6724] tracking-wide mb-3">
            <span>Author</span>
            <span className="text-[#838c89]">|</span>
            <span>Banker</span>
            <span className="text-[#838c89]">|</span>
            <span>Meditation Teacher</span>
            <span className="text-[#838c89]">|</span>
            <span>Speaker</span>
          </div>

          <p className="font-serif-quote italic text-xs text-[#5a6663] leading-relaxed max-w-sm">
            "Bringing together two worlds — outer success and inner awareness."
          </p>
        </div>

        {/* Author Video Introduction */}
        <VideoPlayer
          defaultSrc="/videos/intro.mp4"
          title="Vinay Kapoor — What is Human 2.0?"
          subtitle="Watch the author explain outer success & inner awareness"
        />

        {/* The Golden Equation Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#17495e] to-[#1f5f78] text-white p-5 rounded-3xl shadow-sm border border-[#17495e]/40 relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#e8b98a] block mb-2 font-semibold">
              The Human 2.0 Formula
            </span>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs mb-3 text-center">
              <div className="font-serif-title text-xl font-bold tracking-wide text-[#e8b98a] mb-1">
                Human 2.0 = AI + AI
              </div>
              <div className="text-xs text-white/90 font-medium">
                Aware Individual + Artificial Intelligence
              </div>
            </div>

            <p className="text-xs text-white/85 font-serif-quote italic leading-relaxed text-center">
              "As technology becomes more intelligent, human beings need to become more aware."
            </p>
          </div>
        </motion.div>

        {/* The Book & Purchase Options Section */}
        <div className="bg-[#fdf6ec] p-5 rounded-3xl border border-[#d9a44a]/35 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#8e6724]">
              <BookOpen size={16} />
              <span className="text-[10.5px] uppercase tracking-wider font-bold">
                The Published Book
              </span>
            </div>
            <span className="text-[9px] bg-[#d9a44a]/20 text-[#8e6724] px-2 py-0.5 rounded-full font-mono font-semibold">
              ASIN: B0HGRN9CQC
            </span>
          </div>

          <h4 className="font-serif-title text-lg font-bold text-[#17495e] leading-snug">
            HUMAN 2.0 — AWARENESS: FUTURE READY WITH AI
          </h4>

          <p className="text-xs text-[#1f2a28] leading-relaxed">
            Human 2.0 looks at how awareness can help people navigate an AI-driven world with greater <strong>clarity</strong>, <strong>calm</strong>, <strong>emotional strength</strong>, and <strong>conscious decision-making</strong>.
          </p>

          {/* Primary Purchase Button (UK & Global Direct) */}
          <div className="pt-1">
            <a
              href="https://www.amazon.co.uk/dp/B0HGRN9CQC"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#17495e] hover:bg-[#1f5f78] text-white font-semibold text-xs shadow-sm flex items-center justify-between transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={15} className="text-[#e8b98a]" />
                <span>Order on Amazon (Direct Book Listing)</span>
              </div>
              <ExternalLink size={14} className="text-[#e8b98a] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Regional Amazon Stores Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724]">
                Order by Country / Region:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AMAZON_REGIONS.map((region) => (
                <a
                  key={region.name}
                  href={region.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white hover:bg-[#f7f3ec] border border-[#e6dccb] flex items-center justify-between transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base shrink-0">{region.flag}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#17495e] truncate leading-tight">
                        {region.name}
                      </p>
                      <span className="text-[9.5px] text-[#838c89]">
                        Amazon {region.code}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-[#838c89] group-hover:text-[#17495e] shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Global Amazon Country Selector */}
          <div className="p-3 rounded-2xl bg-white/80 border border-[#d9a44a]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17495e]">
              <Globe size={14} className="text-[#1f5f78]" />
              <span>International Delivery & Global Selector</span>
            </div>
            <p className="text-[11px] text-[#5a6663] leading-relaxed">
              Ask your friends and family to check their preferred location through the Amazon Global Navigation Website:
            </p>
            <a
              href="https://www.amazon.com/gp/navigation-country/select-country#:~:text=Website%20(Country/Region),United%20States%20United%20States"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8e6724] hover:text-[#17495e] underline transition-colors"
            >
              <span>Amazon Global Country Selector</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Audiobook & Audio Chapters Banner */}
        <div className="bg-white p-4 rounded-3xl border border-[#e6dccb] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#efe9df] text-[#17495e] flex items-center justify-center">
                <Headphones size={15} />
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8e6724] block">
                  Audio Chapters (45 MP3s)
                </span>
                <h4 className="font-serif-title text-xs font-bold text-[#17495e] -mt-0.5">
                  Official Audiobook Series
                </h4>
              </div>
            </div>
            <span className="text-[9px] bg-[#d9a44a]/20 text-[#8e6724] px-2 py-0.5 rounded-full font-mono font-semibold">
              45 Tracks
            </span>
          </div>

          <p className="text-[11px] text-[#5a6663] leading-relaxed">
            Listen to all 45 audio chapters narrated by Vinay Kapoor directly inside the Human 2.0 audio player.
          </p>

          <div className="pt-1">
            <button
              onClick={() => {
                audioEngine.playBreathChime('inhale');
                onNavigate('audio_chapters');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#17495e] hover:bg-[#1f5f78] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Headphones size={13} className="text-[#e8b98a]" />
              <span>Open Audio Player</span>
            </button>
          </div>
        </div>

        {/* Biography & Two Worlds */}
        <div className="bg-white p-5 rounded-3xl border border-[#e6dccb] shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6724] block mb-1">
              About Vinay Kapoor
            </span>
            <p className="text-xs text-[#1f2a28] leading-relaxed font-sans">
              Vinay Kapoor is a seasoned banker, meditation teacher, speaker, and author who brings together two worlds — outer success and inner awareness.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-[#f7f3ec] p-3 rounded-2xl border border-[#e6dccb]">
              <div className="flex items-center gap-1.5 text-[#17495e] font-semibold text-xs mb-1">
                <Building2 size={14} className="text-[#1f5f78]" />
                <span>The Banker</span>
              </div>
              <p className="text-[11px] text-[#5a6663] leading-snug">
                Senior-level leadership positions with <strong>Merrill Lynch</strong>, <strong>Citigroup</strong>, and <strong>Bank of Singapore</strong>.
              </p>
            </div>

            <div className="bg-[#f7f3ec] p-3 rounded-2xl border border-[#e6dccb]">
              <div className="flex items-center gap-1.5 text-[#8e6724] font-semibold text-xs mb-1">
                <HeartHandshake size={14} className="text-[#d9a44a]" />
                <span>The Teacher</span>
              </div>
              <p className="text-[11px] text-[#5a6663] leading-snug">
                Over 15 years teaching meditation & speaking at global forums on awareness, leadership, and resilience.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f7f3ec]">
            <p className="text-[11px] text-[#5a6663] leading-relaxed">
              Vinay’s focus today lies at the intersection of <strong>leadership</strong>, <strong>awareness</strong>, <strong>meditation</strong>, <strong>AI</strong>, and <strong>human potential</strong> — helping people succeed in the outer world without losing connection with their inner world.
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('mirror');
            }}
            className="py-2.5 px-3 rounded-2xl bg-[#17495e] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
          >
            <Eye size={13} />
            <span>Open The Mirror</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('journey');
            }}
            className="py-2.5 px-3 rounded-2xl bg-white border border-[#e6dccb] text-[#17495e] text-xs font-semibold shadow-xs hover:bg-[#efe9df] flex items-center justify-center gap-1.5"
          >
            <Compass size={13} />
            <span>12 Journeys</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
