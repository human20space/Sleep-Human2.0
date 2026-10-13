import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Music,
  Disc3,
} from 'lucide-react';
import { MUSIC_TRACKS, type MusicTrack } from '../data/musicData';
import { useLanguage } from '../i18n/LanguageContext';
import { audioEngine } from '../utils/audioEngine';
import type { Screen } from '../types';

interface MusicScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export const MusicScreen: React.FC<MusicScreenProps> = ({ onBack, onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'hi' | 'en'>('all');
  const [activeTrack, setActiveTrack] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [isLocalPlaying, setIsLocalPlaying] = useState<boolean>(false);

  const filteredTracks = selectedLanguage === 'all'
    ? MUSIC_TRACKS
    : MUSIC_TRACKS.filter((t) => t.language === selectedLanguage);

  const handlePlayMusic = (track: MusicTrack) => {
    setActiveTrack(track);
    if (!track.isFree) {
      audioEngine.playBreathChime('exhale');
      onNavigate('subscription');
      return;
    }

    if (activeTrack.id === track.id && isLocalPlaying) {
      audioEngine.stopProceduralSound();
      setIsLocalPlaying(false);
    } else {
      audioEngine.playBreathChime('inhale');
      // Procedural soothing background harmonics for the track
      audioEngine.toggleOceanRainNoise();
      setIsLocalPlaying(true);
    }
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
            {t.musicTag}
          </span>
          <span className="text-xs font-bold text-[#17495e] dark:text-[#e8b98a]">
            {t.musicTitle}
          </span>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="w-full max-w-4xl mx-auto px-4 space-y-5 pt-3 pb-8">
        {/* HERO TITLE */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17495e]/10 dark:bg-[#e8b98a]/15 text-[#17495e] dark:text-[#e8b98a] text-[10px] font-mono font-bold uppercase tracking-widest">
            <Music size={11} className="fill-current" />
            <span>Songs & Mood-Based Audio</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#17495e] dark:text-[#e8b98a] tracking-tight">
            {t.musicHeroTitle}
          </h1>
          <p className="text-xs text-[#5a6663] dark:text-[#9eb2be] max-w-lg mx-auto">
            {t.musicHeroSubtitle}
          </p>
        </div>

        {/* 3. FEATURED ACTIVE SONG PLAYER CARD */}
        <div className={`p-5 rounded-3xl bg-gradient-to-br ${activeTrack.coverGradient} text-white shadow-md border border-white/20 relative overflow-hidden`}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-full bg-black/30 text-[#e8b98a]">
              {activeTrack.languageLabel} · {activeTrack.moodLabel}
            </span>
            <span className="text-xs font-mono text-white/80">
              {activeTrack.durationFormatted}
            </span>
          </div>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2">
              <Disc3 size={20} className={`text-[#e8b98a] ${isLocalPlaying ? 'animate-spin' : ''}`} />
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-white leading-tight">
                {activeTrack.title} {activeTrack.titleHindi ? `(${activeTrack.titleHindi})` : ''}
              </h2>
            </div>
            <p className="text-xs text-white/85">
              {activeTrack.artist}
            </p>
          </div>

          {/* Poetry / Lyrics Excerpt */}
          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/10 mb-4 text-xs italic leading-relaxed text-[#e8b98a]">
            "{activeTrack.lyricsExcerpt}"
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handlePlayMusic(activeTrack)}
              className="py-3 px-6 rounded-2xl bg-[#e8b98a] text-[#070b0e] font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:brightness-105"
            >
              {isLocalPlaying ? (
                <>
                  <Pause size={16} className="fill-current" />
                  <span>Pause Music</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-current" />
                  <span>{t.listenNow} ({activeTrack.isFree ? 'Free' : 'Sovereign'})</span>
                </>
              )}
            </motion.button>

            <span className="text-[11px] text-white/80 font-mono">
              {activeTrack.description.slice(0, 45)}...
            </span>
          </div>
        </div>

        {/* 4. LANGUAGE SELECTOR (Hindi / English / All) */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17495e] dark:text-[#e8b98a] uppercase font-mono">
              Language:
            </span>
            {[
              { id: 'all', label: 'All Songs' },
              { id: 'hi', label: 'हिन्दी (Hindi)' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id as 'all' | 'hi' | 'en')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  selectedLanguage === lang.id
                    ? 'bg-[#17495e] dark:bg-[#e8b98a] text-white dark:text-[#070b0e] shadow-xs'
                    : 'bg-white dark:bg-[#121e25] text-[#5a6663] dark:text-[#9eb2be] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#5a6663] dark:text-[#9eb2be]">
            {filteredTracks.length} tracks
          </span>
        </div>

        {/* 5. MUSIC TRACKS LIST */}
        <div className="space-y-3">
          {filteredTracks.map((track) => {
            const isCurrent = activeTrack.id === track.id;
            return (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handlePlayMusic(track)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-white dark:bg-[#121e25] border-[#17495e] dark:border-[#e8b98a] shadow-sm'
                    : 'bg-white/70 dark:bg-[#121e25]/70 border-[#e6dccb] dark:border-[#1d2e38] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${track.coverGradient} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    {isCurrent && isLocalPlaying ? (
                      <Pause size={18} className="fill-current" />
                    ) : (
                      <Play size={18} className="fill-current translate-x-0.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif-title text-sm sm:text-base font-bold text-[#17495e] dark:text-[#f2ede4] truncate">
                        {track.title}
                      </h4>
                      {track.titleHindi && (
                        <span className="text-xs text-[#8e6724] dark:text-[#e8b98a] font-medium hidden sm:inline">
                          · {track.titleHindi}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5a6663] dark:text-[#9eb2be] truncate">
                      {track.artist} · <span className="font-mono text-[11px]">{track.languageLabel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                    track.isFree
                      ? 'bg-[#3c7858]/15 text-[#3c7858] dark:text-[#52a378]'
                      : 'bg-[#d9a44a]/20 text-[#8e6724] dark:text-[#e8b98a]'
                  }`}>
                    {track.isFree ? 'Free' : 'Sovereign'}
                  </span>
                  <span className="text-xs font-mono text-[#717e7a] dark:text-[#8ea2b0]">
                    {track.durationFormatted}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
