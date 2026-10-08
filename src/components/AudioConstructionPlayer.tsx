import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Upload,
  Sparkles,
  Headphones,
  CheckCircle,
  Share2
} from 'lucide-react';
import type { ConstructionAudioSession } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface AudioConstructionPlayerProps {
  session: ConstructionAudioSession;
  onBack: () => void;
}

export const AudioConstructionPlayer: React.FC<AudioConstructionPlayerProps> = ({ session, onBack }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activeResonance, setActiveResonance] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeResonance) {
        audioEngine.stopDrone();
      }
    };
  }, [activeResonance]);

  const handleTogglePlay = () => {
    hapticsEngine.trigger('tap');

    // If a custom file is uploaded
    if (customAudioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      }
      return;
    }

    // Default under construction behavior: simulate playback with 432Hz drone resonance
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeResonance) {
        audioEngine.stopDrone();
        setActiveResonance(false);
      }
    } else {
      setIsPlaying(true);
      audioEngine.playBreathChime('inhale');
      const isDrone = audioEngine.toggleAmbientDrone();
      setActiveResonance(isDrone);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= session.durationSeconds) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleSkip = (seconds: number) => {
    hapticsEngine.trigger('tap');
    const target = Math.max(0, Math.min(session.durationSeconds, currentTime + seconds));
    setCurrentTime(target);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleRateChange = () => {
    hapticsEngine.trigger('tap');
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setUploadedFileName(file.name);
      hapticsEngine.trigger('finish');
      audioEngine.playBowlChime(480, 2);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] flex flex-col justify-between select-none relative overflow-y-auto pb-24 transition-colors">
      {/* Hidden file input for adding master audio */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        className="hidden"
      />

      {customAudioUrl && (
        <audio
          ref={audioRef}
          src={customAudioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top Header */}
      <div className="px-5 py-3 border-b border-[#e6dccb] dark:border-[#1d2e38] bg-[#f7f3ec]/95 dark:bg-[#0b1317]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (activeResonance) audioEngine.stopDrone();
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#17495e] dark:text-[#e8b98a] border border-[#e6dccb] dark:border-[#1d2e38] hover:bg-[#efe9df] dark:hover:bg-[#1c2e39] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[9.5px] tracking-widest uppercase font-mono font-bold text-[#8e6724] dark:text-[#e8b98a]">
            {session.tradition || session.category.replace('_', ' ').toUpperCase()}
          </span>
          <h2 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6] truncate max-w-[200px]">
            {session.title}
          </h2>
        </div>

        <button
          onClick={() => hapticsEngine.trigger('tap')}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#14232c] shadow-xs flex items-center justify-center text-[#5a6663] dark:text-[#98abb6] border border-[#e6dccb] dark:border-[#1d2e38]"
          title="Share"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Main Player Screen Content */}
      <div className="p-4 space-y-4">
        {/* HERO UNDER CONSTRUCTION BANNER */}
        <div className="p-3.5 rounded-2xl bg-[#fdf6ec] dark:bg-[#18262f] border border-[#d9a44a]/40 dark:border-[#e8b98a]/40 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#d9a44a]/20 dark:bg-[#e8b98a]/20 text-[#8e6724] dark:text-[#e8b98a] flex items-center justify-center shrink-0 mt-0.5">
            <Headphones size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e6724] dark:text-[#e8b98a]">
                Audio Under Construction
              </span>
              <span className="text-[8.5px] px-1.5 py-0.2 bg-[#d9a44a] text-white dark:text-[#0b1317] rounded-md font-mono font-bold">
                In Production
              </span>
            </div>
            <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-snug">
              This master session is currently being recorded. You can preview the session interface, test with the 432Hz ambient stillness synth, or upload a local audio file below.
            </p>
          </div>
        </div>

        {/* HERO PLAYER DISC / CARD */}
        <div className="bg-white dark:bg-[#14232c] p-5 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs space-y-4 transition-colors">
          {/* Cover Art Artwork Mockup */}
          <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#17495e] via-[#1f5f78] to-[#d9a44a] dark:from-[#0d222c] dark:via-[#143240] dark:to-[#e8b98a]/40 p-4 flex flex-col justify-between text-white shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#e8b98a] font-semibold flex items-center gap-1.5">
                <Sparkles size={11} />
                Human 2.0 Studio
              </span>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {session.durationFormatted}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-white/70 block uppercase font-mono">
                Guided by {session.teacher}
              </span>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                {session.title}
              </h3>
            </div>

            {/* Subtle Soundbar Overlay */}
            <div className="flex items-center gap-1">
              {[30, 60, 45, 80, 50, 90, 40, 70, 85, 40, 60, 30].map((h, i) => (
                <motion.span
                  key={i}
                  animate={isPlaying ? {
                    height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(20, h * 0.4)}%`],
                  } : { height: '20%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.7 + (i % 4) * 0.15,
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-[#e8b98a] rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Teacher and Category Meta */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17495e] dark:text-[#e8b98a]">
                {session.teacher} {session.teacherRole ? `· ${session.teacherRole}` : ''}
              </span>
              <span className="text-[10px] font-mono text-[#838c89] dark:text-[#98abb6]">
                Target: {session.durationFormatted}
              </span>
            </div>
            <p className="text-xs text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
              {session.description}
            </p>
          </div>

          {/* Key Insight */}
          {session.keyTakeaway && (
            <div className="p-3 rounded-2xl bg-[#fdf6ec] dark:bg-[#18262f] border border-[#d9a44a]/20 dark:border-[#e8b98a]/20">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#8e6724] dark:text-[#e8b98a] block mb-0.5">
                Core Teaching
              </span>
              <p className="font-serif-quote italic text-xs text-[#1f2a28] dark:text-[#f1ede6] leading-relaxed">
                "{session.keyTakeaway}"
              </p>
            </div>
          )}

          {/* Progress Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={session.durationSeconds || 600}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#e6dccb] dark:bg-[#1c2e39] rounded-lg appearance-none cursor-pointer accent-[#17495e] dark:accent-[#e8b98a]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#838c89] dark:text-[#98abb6]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(session.durationSeconds)}</span>
            </div>
          </div>

          {/* Primary Audio Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Playback Speed */}
            <button
              onClick={handleRateChange}
              className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#e8b98a] hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Change Speed"
            >
              {playbackRate}x
            </button>

            {/* Skip Back 15s */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSkip(-15)}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Skip back 15s"
            >
              <RotateCcw size={15} />
            </motion.button>

            {/* PLAY / PAUSE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTogglePlay}
              className="w-13 h-13 rounded-2xl bg-[#17495e] dark:bg-[#e8b98a] text-[#e8b98a] dark:text-[#0b1317] flex items-center justify-center shadow-md hover:bg-[#1f5f78] dark:hover:bg-[#f2cfab] transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause size={22} className="fill-current" />
              ) : (
                <Play size={22} className="fill-current ml-0.5" />
              )}
            </motion.button>

            {/* Skip Forward 15s */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSkip(15)}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title="Skip forward 15s"
            >
              <RotateCw size={15} />
            </motion.button>

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full bg-[#f7f3ec] dark:bg-[#182933] text-[#17495e] dark:text-[#f1ede6] flex items-center justify-center hover:bg-[#efe9df] dark:hover:bg-[#203644] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* DEVELOPER / CREATOR AUDIO UPLOAD CARD */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#14232c] border border-dashed border-[#d9a44a]/60 dark:border-[#e8b98a]/60 space-y-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#17495e] dark:text-[#e8b98a] flex items-center gap-1.5">
              <Upload size={14} className="text-[#8e6724] dark:text-[#e8b98a]" />
              <span>Add Audio for this Session</span>
            </span>
            <span className="text-[10px] text-[#838c89] dark:text-[#98abb6] font-mono">
              MP3, WAV, M4A
            </span>
          </div>

          <p className="text-[11px] text-[#5a6663] dark:text-[#98abb6] leading-relaxed">
            Target storage destination: <code className="px-1.5 py-0.5 rounded bg-[#f7f3ec] dark:bg-[#0e181e] text-[#17495e] dark:text-[#e8b98a] text-[10px] font-mono">{session.expectedAssetPath || 'public/audio/...'}</code>
          </p>

          {uploadedFileName ? (
            <div className="p-2.5 rounded-xl bg-[#e8f1ec] dark:bg-[#153123] text-[#3c7858] dark:text-[#52a378] flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 truncate">
                <CheckCircle size={14} />
                <span className="truncate">{uploadedFileName}</span>
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="underline text-[10px] cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-[#efe9df] dark:bg-[#1b2f3d] hover:bg-[#e6dccb] dark:hover:bg-[#223d50] text-[#17495e] dark:text-[#e8b98a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload size={13} />
              <span>Select Audio File to Test Playback</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
