import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Bookmark, 
  Headphones, 
  Sun, 
  Moon, 
  Check, 
  Crown, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { Screen } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onBack, 
  onNavigate,
  isDark,
  onToggleDark 
}) => {
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('human2_user_email') || 'human2.0space@gmail.com';
    }
    return 'human2.0space@gmail.com';
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'human2.0space@gmail.com';
  });

  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then((result) => {
        const session = result.data?.session;
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          localStorage.setItem('human2_user_email', session.user.email);
          if (session.user.email.toLowerCase() === 'human2.0space@gmail.com') {
            setIsAdmin(true);
          }
        }
      });
    }
  }, []);

  const handleSignOut = async () => {
    audioEngine.playBreathChime('exhale');
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('human2_user_email');
    }
    setUserEmail('guest@human2.space');
    setIsAdmin(false);
  };

  const savedFavoritesCount = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('human2_favorites') || '[]').length
    : 0;

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#070b0e] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#070b0e]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            audioEngine.playBreathChime('exhale');
            onBack();
          }}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer min-h-[44px] min-w-[44px]"
          title="Back to Sleep Sanctuary"
          aria-label="Back to Sleep Sanctuary"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#3c7858] dark:text-[#52a378]">
            User Account
          </span>
          <h2 className="text-sm font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            User Profile
          </h2>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl mx-auto p-5 space-y-4">
        {/* 1. User Identity Card */}
        <div className="bg-white dark:bg-[#121e25] p-5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#17495e] to-[#1f5f78] text-[#e8b98a] border-2 border-[#e8b98a]/40 shadow-xs flex items-center justify-center font-serif-title text-xl font-bold shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#17495e]/10 dark:bg-[#e8b98a]/15 text-[#17495e] dark:text-[#e8b98a]">
                  Active Practitioner
                </span>
                {isAdmin && (
                  <span className="text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>Admin</span>
                  </span>
                )}
              </div>

              <h3 className="font-serif-title text-base font-bold text-[#17495e] dark:text-[#f1ede6] truncate mt-1">
                {userEmail}
              </h3>
              <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6]">
                Human 2.0 Awareness System
              </p>
            </div>
          </div>

          {/* Membership Plan Pill */}
          <div className="p-3.5 rounded-2xl bg-[#fbf9f5] dark:bg-[#16252e] border border-[#e6dccb]/70 dark:border-[#1d2e38] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d9a44a]/20 to-[#e8b98a]/30 text-[#8e6724] dark:text-[#e8b98a] flex items-center justify-center">
                <Crown size={15} />
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] block">
                  Membership Status
                </span>
                <span className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] block">
                  {isPremium ? 'Human 2.0 Sovereign (Full Access)' : 'Free Tier Explorer'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audioEngine.playBreathChime('inhale');
                onNavigate('subscription');
              }}
              className="text-xs font-bold text-[#8e6724] dark:text-[#e8b98a] hover:underline cursor-pointer"
            >
              {isPremium ? 'Manage' : 'Upgrade'}
            </button>
          </div>
        </div>

        {/* 2. Admin Panel Quick Access (Crucial for user!) */}
        {isAdmin && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              window.location.href = '/admin';
            }}
            className="bg-gradient-to-r from-[#17495e] to-[#1f5f78] text-white p-4.5 rounded-3xl shadow-xs border border-[#17495e]/60 cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a]">
                    Control Center
                  </span>
                </div>
                <h4 className="font-serif-title font-bold text-sm text-white">
                  Administrator Portal
                </h4>
                <p className="text-[10.5px] text-white/80">
                  Manage meditation sections, audios, pricing and telemetry
                </p>
              </div>
            </div>
            <ExternalLink size={16} className="text-[#e8b98a] group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
        )}

        {/* 3. Sanctuary Quick Vault Links */}
        <div className="grid grid-cols-2 gap-3">
          {/* Vault Bookmarks Card */}
          <div
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('vault');
            }}
            className="p-4 rounded-3xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/30 transition-all flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#182730] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center">
                <Bookmark size={15} />
              </div>
              <span className="font-mono text-xs font-bold text-[#17495e] dark:text-[#e8b98a]">
                {savedFavoritesCount}
              </span>
            </div>
            <div>
              <span className="font-serif-title text-xs font-bold text-[#17495e] dark:text-[#f1ede6] block">
                Saved Vault
              </span>
              <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                Bookmarked tracks
              </span>
            </div>
          </div>

          {/* Audiobook Chapters Card */}
          <div
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('audio_chapters');
            }}
            className="p-4 rounded-3xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/30 transition-all flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#182730] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center">
                <Headphones size={15} />
              </div>
              <span className="font-mono text-xs font-bold text-[#17495e] dark:text-[#e8b98a]">
                45 Ch
              </span>
            </div>
            <div>
              <span className="font-serif-title text-xs font-bold text-[#17495e] dark:text-[#f1ede6] block">
                Audiobook
              </span>
              <span className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                Complete chapters
              </span>
            </div>
          </div>
        </div>

        {/* 4. Appearance & Theme Selector */}
        {onToggleDark && (
          <div className="bg-white dark:bg-[#121e25] p-4.5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Sanctuary Theme
              </span>
              <span className="text-[9.5px] text-[#838c89] dark:text-[#98abb6]">
                {isDark ? 'Night Sanctuary Active' : 'Daylight Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (isDark) onToggleDark();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${
                  !isDark
                    ? 'bg-[#f7f3ec] border-[#17495e] ring-2 ring-[#17495e]/20'
                    : 'bg-white dark:bg-[#16252e] border-[#e6dccb] dark:border-[#1d2e38] opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={15} className="text-[#17495e]" />
                  <span className="text-xs font-bold text-[#17495e]">Daylight</span>
                </div>
                {!isDark && <Check size={13} className="text-[#17495e]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDark) onToggleDark();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${
                  isDark
                    ? 'bg-[#18262f] border-[#e8b98a] ring-2 ring-[#e8b98a]/30'
                    : 'bg-[#f7f3ec] dark:bg-[#16252e] border-[#e6dccb] dark:border-[#1d2e38] opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={15} className="text-[#e8b98a]" />
                  <span className="text-xs font-bold text-[#e8b98a]">Night</span>
                </div>
                {isDark && <Check size={13} className="text-[#e8b98a]" />}
              </button>
            </div>
          </div>
        )}

        {/* 5. Author Profile Shortcut */}
        <div
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('author_intro');
          }}
          className="p-4 rounded-3xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/30 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#17495e] dark:bg-[#1f5f78] text-[#e8b98a] flex items-center justify-center font-serif-title font-bold text-xs shadow-xs">
              VK
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a] block">
                Meet the Author
              </span>
              <h4 className="font-serif-title font-bold text-xs text-[#17495e] dark:text-[#f1ede6]">
                Vinay Kapoor
              </h4>
              <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
                Author of Human 2.0: Awareness — Future Ready with AI
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8e6724] dark:text-[#e8b98a]" />
        </div>

        {/* 6. Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#121e25] border border-rose-200 dark:border-rose-950/60 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer min-h-[44px]"
        >
          <LogOut size={15} />
          <span>Sign Out of Awareness Account</span>
        </button>
      </div>
    </div>
  );
};
