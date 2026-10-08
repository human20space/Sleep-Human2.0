import React from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Crown,
  Play,
  Pause,
  Volume2,
  Headphones,
  ChevronRight,
  Bookmark,
  Zap,
  Lock,
} from 'lucide-react';
import type { Screen, SleepTrack } from '../types';
import { SLEEP_TRACKS } from '../data/sleepCatalogData';
import { useAudio } from '../context/AudioContext';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  mamsCount?: number;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  isDark,
  onToggleDark,
}) => {
  const {
    currentTrack,
    isPlaying,
    playSleepTrack,
    togglePlay,
    sleepTimerMinutes,
    setSleepTimer,
    favorites,
    toggleFavorite,
    continueListening,
  } = useAudio();

  const isPremium = typeof window !== 'undefined' && localStorage.getItem('human2_is_premium') === 'true';

  const freeTracks = SLEEP_TRACKS.filter((t) => !t.isPremium);
  const solfeggioTracks = SLEEP_TRACKS.filter((t) => t.category === 'solfeggio');
  const sleepcastTracks = SLEEP_TRACKS.filter((t) => t.category === 'sleepcast' || t.category === 'body_scan');

  const heroTrack = SLEEP_TRACKS[0]; // Sacred Temple Bell
  const sosTrack = SLEEP_TRACKS.find((t) => t.id === 'sleep-free-4') || SLEEP_TRACKS[3]; // 90s SOS

  const handleTrackClick = (track: SleepTrack) => {
    hapticsEngine.trigger('tap');
    if (track.isPremium && !isPremium) {
      audioEngine.playBreathChime('inhale');
      onNavigate('subscription');
      return;
    }

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playSleepTrack(track);
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#070b0e] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-28 transition-colors">
      {/* 1. TOP HEADER & TIER BADGE */}
      <div className="w-full max-w-4xl mx-auto px-5 pt-3.5 pb-2 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4ba377] inline-block animate-pulse" />
            <h1 className="font-serif-title text-2xl font-bold text-[#17495e] dark:text-[#e8b98a] leading-tight">
              Sleep Sanctuary
            </h1>
          </div>
          <p className="text-[11px] text-[#717e7a] dark:text-[#90a2ad]">
            Calm nights · Restored nervous system
          </p>
        </div>

        {/* Top Actions: Theme Toggle & Sovereign Pill */}
        <div className="flex items-center gap-1.5">
          {onToggleDark && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleDark}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1c2c36] shadow-xs text-xs font-semibold text-[#17495e] dark:text-[#e8b98a] cursor-pointer"
              title={isDark ? 'Daylight Mode' : 'Night Sanctuary'}
            >
              {isDark ? (
                <>
                  <Sun size={13} className="text-[#e8b98a]" />
                  <span>Daylight</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-[#17495e]" />
                  <span>Night</span>
                </>
              )}
            </motion.button>
          )}

          {/* Sovereign Tier Pill */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audioEngine.playBreathChime('inhale');
              onNavigate('subscription');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#d9a44a]/20 to-[#e8b98a]/30 border border-[#d9a44a]/60 shadow-xs text-xs font-bold text-[#8e6724] dark:text-[#e8b98a] cursor-pointer"
            title="Sovereign Membership Status"
          >
            <Crown size={13} className="text-[#8e6724] dark:text-[#e8b98a] fill-current" />
            <span>{isPremium ? 'Sovereign' : 'Unlock All'}</span>
          </motion.button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 space-y-4 pt-1">
        {/* 2. TONIGHT'S BEDTIME IMMERSION HERO CARD */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-[#17495e] via-[#1c556d] to-[#123645] text-white p-4.5 rounded-3xl shadow-sm border border-[#17495e]/50 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#e8b98a] bg-black/25 px-2.5 py-0.5 rounded-full">
              Tonight's Featured Bell Sound · 100% Free
            </span>
            <span className="text-xs text-[#e8b98a]/90 font-mono font-semibold">
              {Math.floor(heroTrack.durationSeconds / 60)} min
            </span>
          </div>

          <h3 className="font-serif-title text-lg font-bold text-white mb-1">
            {heroTrack.title}
          </h3>
          <p className="font-serif-quote italic text-xs text-white/85 leading-relaxed mb-3.5">
            "{heroTrack.subtitle}"
          </p>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTrackClick(heroTrack)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#e8b98a] hover:bg-[#dfaf7f] text-[#0b1317] font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {currentTrack?.id === heroTrack.id && isPlaying ? (
                <>
                  <Pause size={15} className="fill-current" />
                  <span>Pause Bell Sound</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-current" />
                  <span>Listen Tonight · Free</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite(heroTrack.id)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                favorites.includes(heroTrack.id)
                  ? 'bg-[#d9a44a] text-white border-[#d9a44a]'
                  : 'bg-white/10 text-white/80 border-white/20 hover:text-white'
              }`}
              title="Save to Favourites"
            >
              <Bookmark size={16} className={favorites.includes(heroTrack.id) ? 'fill-current' : ''} />
            </motion.button>
          </div>
        </motion.div>

        {/* 3. ACUTE 90-SECOND RACING MIND RESET (CENTER SOS) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => handleTrackClick(sosTrack)}
          className="bg-white dark:bg-[#121e25] p-3.5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer hover:border-[#17495e]/40 dark:hover:border-[#e8b98a]/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Zap size={18} className="fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-amber-700 dark:text-amber-400">
                  Acute Emergency SOS · 90 Seconds
                </span>
              </div>
              <h4 className="font-serif-title font-bold text-xs text-[#17495e] dark:text-[#f1ede6] leading-snug">
                Racing Mind Silencer
              </h4>
              <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6]">
                Fast somatic pacer to halt nocturnal rumination spirals
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8e6724] dark:text-[#e8b98a] group-hover:translate-x-0.5 transition-transform" />
        </motion.div>

        {/* 4. SLEEP TIMER BAR */}
        <div className="bg-white dark:bg-[#121e25] p-3 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs">
          <div className="flex items-center justify-between text-[11px] mb-2 px-1">
            <span className="font-semibold text-[#17495e] dark:text-[#e8b98a] flex items-center gap-1.5">
              <Moon size={12} />
              <span>Bedtime Sleep Timer</span>
            </span>
            <span className="text-[10px] font-mono text-[#838c89] dark:text-[#98abb6]">
              {sleepTimerMinutes ? `Auto-fadeout in ${sleepTimerMinutes}m` : 'Timer Off'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
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
                className={`py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
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

        {/* 5. CONTINUE LISTENING (If items exist) */}
        {continueListening && continueListening.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Continue Listening
              </span>
              <button
                onClick={() => onNavigate('vault')}
                className="text-[10px] text-[#838c89] dark:text-[#98abb6] hover:underline cursor-pointer"
              >
                View Vault →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {continueListening.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const matched = SLEEP_TRACKS.find((t) => t.id === item.id);
                    if (matched) handleTrackClick(matched);
                    else onNavigate('audio_chapters');
                  }}
                  className="p-3 rounded-2xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between cursor-pointer hover:border-[#17495e]/30 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#efe9df] dark:bg-[#1a2d38] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center shrink-0">
                      <Volume2 size={14} />
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
                  <Play size={14} className="text-[#8e6724] dark:text-[#e8b98a] shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FREE SLEEP RECORDINGS (NO REGISTRATION REQUIRED) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3c7858] dark:text-[#52a378] block">
                Free Sleep Recordings
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Instant audio playback · No registration needed
              </span>
            </div>
            <span className="text-[9.5px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">
              4 FREE TRACKS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {freeTracks.map((track) => (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTrackClick(track)}
                className="bg-white dark:bg-[#121e25] p-3.5 rounded-2xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs cursor-pointer flex flex-col justify-between hover:border-[#17495e]/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase font-mono font-bold text-[#3c7858] dark:text-[#52a378]">
                      {track.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="text-[#838c89] hover:text-[#d9a44a]"
                    >
                      <Bookmark size={13} className={favorites.includes(track.id) ? 'fill-[#d9a44a] text-[#d9a44a]' : ''} />
                    </button>
                  </div>
                  <h4 className="font-serif-title font-bold text-xs text-[#17495e] dark:text-[#f1ede6] leading-snug line-clamp-2 mb-1">
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6] line-clamp-2 leading-tight">
                    {track.subtitle}
                  </p>
                </div>

                <div className="pt-2.5 mt-2 border-t border-[#e6dccb]/50 dark:border-[#1d2e38] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#838c89]">{Math.floor(track.durationSeconds / 60)}m</span>
                  <span className="text-[#17495e] dark:text-[#e8b98a] font-bold flex items-center gap-1">
                    {currentTrack?.id === track.id && isPlaying ? <Pause size={10} /> : <Play size={10} />}
                    Play
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 7. SOLFEGGIO FREQUENCIES & DELTA BINAURAL BEATS */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                Solfeggio Frequencies & Binaurals
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Deep neurological resonance & slow-wave delta sleep
              </span>
            </div>
            <Crown size={14} className="text-[#8e6724] dark:text-[#e8b98a]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {solfeggioTracks.map((track) => {
              const isLocked = track.isPremium && !isPremium;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between cursor-pointer hover:border-[#17495e]/40 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#efe9df] dark:bg-[#1a2d38] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center font-bold text-xs shrink-0">
                      {isLocked ? <Lock size={14} /> : <Volume2 size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                          {track.title}
                        </h4>
                        {isLocked && (
                          <span className="text-[8.5px] bg-[#d9a44a]/20 text-[#8e6724] dark:text-[#e8b98a] px-1.5 py-0.2 rounded font-mono font-bold">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6] truncate">
                        {track.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-[#838c89]">
                      {Math.floor(track.durationSeconds / 60)}m
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="text-[#838c89] hover:text-[#d9a44a]"
                    >
                      <Bookmark size={14} className={favorites.includes(track.id) ? 'fill-[#d9a44a] text-[#d9a44a]' : ''} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. SLEEPCAST STORIES & NIGHT MASTERCLASSES */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8e6724] dark:text-[#e8b98a] block">
                Sleepcasts & Night Masterclasses
              </span>
              <span className="text-[10px] text-[#838c89] dark:text-[#98abb6]">
                Dr. Matthew Walker, Yoga Nidra, and somatic releases
              </span>
            </div>
            <Crown size={14} className="text-[#8e6724] dark:text-[#e8b98a]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sleepcastTracks.map((track) => {
              const isLocked = track.isPremium && !isPremium;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#121e25] border border-[#e6dccb] dark:border-[#1d2e38] flex items-center justify-between cursor-pointer hover:border-[#17495e]/40 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#efe9df] dark:bg-[#1a2d38] text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center font-bold text-xs shrink-0">
                      {isLocked ? <Lock size={14} /> : <Headphones size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#17495e] dark:text-[#f1ede6] truncate">
                          {track.title}
                        </h4>
                        {isLocked && (
                          <span className="text-[8.5px] bg-[#d9a44a]/20 text-[#8e6724] dark:text-[#e8b98a] px-1.5 py-0.2 rounded font-mono font-bold">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-[#5a6663] dark:text-[#98abb6] truncate">
                        {track.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-[#838c89]">
                      {Math.floor(track.durationSeconds / 60)}m
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="text-[#838c89] hover:text-[#d9a44a]"
                    >
                      <Bookmark size={14} className={favorites.includes(track.id) ? 'fill-[#d9a44a] text-[#d9a44a]' : ''} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9. STANDALONE AUDIOBOOK PROMO BANNER */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => {
            audioEngine.playBreathChime('inhale');
            onNavigate('audio_chapters');
          }}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#17495e] via-[#1f5f78] to-[#17495e] text-white shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-[#e8b98a] flex items-center justify-center shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#e8b98a] block">
                Dedicated Listen Section
              </span>
              <h4 className="font-serif-title text-xs font-bold text-white">
                Human 2.0 Audiobook (45 Chapters)
              </h4>
              <p className="text-[10.5px] text-white/80">
                Chapters 1–3 Free · Full audiobook in the Listen tab
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#e8b98a]" />
        </motion.div>
      </div>
    </div>
  );
};
