import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { AudioChapter, SleepTrack, PlayableTrack, ContinueListeningItem } from '../types';
import { AUDIO_CHAPTERS } from '../data/audioChaptersData';
import { audioEngine } from '../utils/audioEngine';
import { hapticsEngine } from '../utils/haptics';

interface AudioContextType {
  currentChapter: AudioChapter;
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isMuted: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerSecondsLeft: number | null;
  showMiniPlayer: boolean;
  favorites: string[];
  continueListening: ContinueListeningItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  playChapter: (chapter: AudioChapter) => void;
  playSleepTrack: (track: SleepTrack) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setRate: (rate: number) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: number | null) => void;
  dismissMiniPlayer: () => void;
  restoreMiniPlayer: () => void;
  hasAudiobook: boolean;
  showAudiobookPaywall: boolean;
  setShowAudiobookPaywall: (show: boolean) => void;
  triggerAudiobookPaywall: () => void;
  unlockAudiobook: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const STORAGE_LAST_CHAPTER_ID = 'human2_last_chapter_id';
const STORAGE_LAST_TIME = 'human2_last_timestamp';
const STORAGE_FAVORITES = 'human2_favorites';
const STORAGE_CONTINUE_LISTENING = 'human2_continue_listening';
const STORAGE_HAS_AUDIOBOOK = 'human2_has_audiobook';
const STORAGE_IS_PREMIUM = 'human2_is_premium';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Audiobook entitlement state
  const [hasAudiobook, setHasAudiobook] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_HAS_AUDIOBOOK) === 'true' ||
        localStorage.getItem(STORAGE_IS_PREMIUM) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [showAudiobookPaywall, setShowAudiobookPaywall] = useState<boolean>(false);

  const triggerAudiobookPaywall = useCallback(() => {
    hapticsEngine.trigger('tap');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setShowAudiobookPaywall(true);
  }, []);

  const unlockAudiobook = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_HAS_AUDIOBOOK, 'true');
    } catch {
      // ignore
    }
    setHasAudiobook(true);
    setShowAudiobookPaywall(false);
  }, []);

  // Load initial chapter from localStorage or default to Chapter 1
  const [currentChapter, setCurrentChapter] = useState<AudioChapter>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_LAST_CHAPTER_ID);
      if (savedId) {
        const found = AUDIO_CHAPTERS.find((c) => c.id === savedId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return AUDIO_CHAPTERS[0];
  });

  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(AUDIO_CHAPTERS[0].durationMinutes * 60);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);

  // Favorites & Continue Listening Local Storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return ['sleep-free-1', 'sleep-free-2'];
  });

  const [continueListening, setContinueListening] = useState<ContinueListeningItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CONTINUE_LISTENING);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'sleep-free-1',
        type: 'sleep_track',
        title: 'Sacred Temple Bell',
        subtitle: 'Harmonic bell resonance',
        positionSeconds: 340,
        durationSeconds: 1200,
        updatedAt: Date.now() - 3600000,
      },
    ];
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentChapterRef = useRef<AudioChapter>(currentChapter);
  const sleepIntervalRef = useRef<number | null>(null);
  const proceduralTimerRef = useRef<number | null>(null);

  useEffect(() => {
    currentChapterRef.current = currentChapter;
  }, [currentChapter]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    hapticsEngine.trigger('tap');
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const recordContinueListening = useCallback(
    (item: { id: string; type: 'sleep_track' | 'audiobook'; title: string; subtitle: string; position: number; duration: number }) => {
      setContinueListening((prev) => {
        const clampedPos = Math.max(0, Math.min(item.duration, item.position));
        const filtered = prev.filter((i) => i.id !== item.id);
        const updatedItem: ContinueListeningItem = {
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          positionSeconds: Math.round(clampedPos),
          durationSeconds: item.duration,
          updatedAt: Date.now(),
        };
        const next = [updatedItem, ...filtered].slice(0, 10);
        try {
          localStorage.setItem(STORAGE_CONTINUE_LISTENING, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  // Set audio source safely
  const setSourceForChapter = useCallback((chapter: AudioChapter) => {
    if (!audioRef.current) return;
    const localUrl = `/audio/${encodeURIComponent(chapter.fileName)}`;
    audioRef.current.src = localUrl;
    audioRef.current.load();
  }, []);

  // Initialize audio element once on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    let initialTime = 0;
    try {
      const savedTime = localStorage.getItem(STORAGE_LAST_TIME);
      if (savedTime) initialTime = parseFloat(savedTime);
    } catch {
      // ignore
    }

    const localUrl = `/audio/${encodeURIComponent(currentChapter.fileName)}`;
    audio.src = localUrl;
    if (initialTime > 0) {
      audio.currentTime = initialTime;
      setCurrentTime(initialTime);
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        try {
          localStorage.setItem(STORAGE_LAST_TIME, audio.currentTime.toString());
        } catch {
          // ignore
        }

        // When 1st 25 mins is over on free chapter, pause and ask for payment!
        const isChapter1 = currentChapterRef.current?.chapterNumber === 1;
        const isUnlocked =
          localStorage.getItem(STORAGE_HAS_AUDIOBOOK) === 'true' ||
          localStorage.getItem(STORAGE_IS_PREMIUM) === 'true';

        // 25 minutes = 1500 seconds
        if (isChapter1 && !isUnlocked && audio.currentTime >= 25 * 60) {
          audio.pause();
          setIsPlaying(false);
          setShowAudiobookPaywall(true);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audio && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      const isChapter1 = currentChapterRef.current?.chapterNumber === 1;
      const isUnlocked =
        localStorage.getItem(STORAGE_HAS_AUDIOBOOK) === 'true' ||
        localStorage.getItem(STORAGE_IS_PREMIUM) === 'true';

      // When the 1st free chapter ends, immediately ask for payment!
      if (isChapter1 && !isUnlocked) {
        setShowAudiobookPaywall(true);
      } else {
        nextChapter();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Sleep Timer Tick
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
      return;
    }

    if (sleepTimerSecondsLeft <= 0) {
      if (audioRef.current) audioRef.current.pause();
      audioEngine.stopProceduralSound();
      setIsPlaying(false);
      setSleepTimerMinutesState(null);
      setSleepTimerSecondsLeft(null);
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
      return;
    }

    sleepIntervalRef.current = window.setInterval(() => {
      setSleepTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (audioRef.current) audioRef.current.pause();
          audioEngine.stopProceduralSound();
          setIsPlaying(false);
          setSleepTimerMinutesState(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    };
  }, [sleepTimerSecondsLeft]);

  // Set Sleep Timer
  const setSleepTimer = (minutes: number | null) => {
    hapticsEngine.trigger('tap');
    setSleepTimerMinutesState(minutes);
    if (minutes === null) {
      setSleepTimerSecondsLeft(null);
    } else {
      setSleepTimerSecondsLeft(minutes * 60);
    }
  };

  // Play an Audiobook Chapter
  const playChapter = (chapter: AudioChapter) => {
    hapticsEngine.trigger('tap');
    audioEngine.stopProceduralSound();
    if (proceduralTimerRef.current) clearInterval(proceduralTimerRef.current);

    const isUnlocked =
      hasAudiobook ||
      localStorage.getItem(STORAGE_HAS_AUDIOBOOK) === 'true' ||
      localStorage.getItem(STORAGE_IS_PREMIUM) === 'true';

    // Chapters 2-45 require Audiobook purchase or Sovereign membership
    if (chapter.chapterNumber > 1 && !isUnlocked) {
      triggerAudiobookPaywall();
      return;
    }

    setCurrentChapter(chapter);
    currentChapterRef.current = chapter;
    setCurrentTrack({ ...chapter, type: 'audiobook', isPremium: chapter.chapterNumber > 1 });
    setShowMiniPlayer(true);
    setSourceForChapter(chapter);

    try {
      localStorage.setItem(STORAGE_LAST_CHAPTER_ID, chapter.id);
    } catch {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    recordContinueListening({
      id: chapter.id,
      type: 'audiobook',
      title: `Ch. ${chapter.chapterNumber}: ${chapter.title}`,
      subtitle: chapter.part,
      position: 0,
      duration: chapter.durationMinutes * 60,
    });
  };

  // Play a Curated Sleep Track (Polymorphic HTML5 or Web Audio Synthesizer)
  const playSleepTrack = (track: SleepTrack) => {
    hapticsEngine.trigger('tap');

    // Pause any playing chapter
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (proceduralTimerRef.current) {
      clearInterval(proceduralTimerRef.current);
    }

    setCurrentTrack({ ...track, type: 'sleep_track' });
    setShowMiniPlayer(true);
    setCurrentTime(0);
    setDuration(track.durationSeconds);

    // If track uses procedural audio synthesis
    if (track.audioEngineType) {
      if (track.audioEngineType === 'solfeggio_432') {
        audioEngine.toggleSolfeggioTone(432);
      } else if (track.audioEngineType === 'solfeggio_528') {
        audioEngine.toggleSolfeggioTone(528);
      } else if (track.audioEngineType === 'delta_binaural') {
        audioEngine.toggleBinauralBeat(200, 2);
      } else if (track.audioEngineType === 'ocean_rain') {
        audioEngine.toggleOceanRainNoise();
      } else if (track.audioEngineType === 'sos_reset') {
        audioEngine.playSosBreathPacer();
      } else if (track.audioEngineType === 'bell_sound') {
        audioEngine.toggleBellSound();
      }

      setIsPlaying(true);

      // Track synthesized elapsed time
      proceduralTimerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= track.durationSeconds) {
            audioEngine.stopProceduralSound();
            setIsPlaying(false);
            if (proceduralTimerRef.current) clearInterval(proceduralTimerRef.current);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else if (track.audioUrl) {
      // Play HTML5 file
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }

    recordContinueListening({
      id: track.id,
      type: 'sleep_track',
      title: track.title,
      subtitle: track.subtitle,
      position: 0,
      duration: track.durationSeconds,
    });
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    hapticsEngine.trigger('tap');

    if (currentTrack && currentTrack.type === 'sleep_track' && currentTrack.audioEngineType) {
      if (isPlaying) {
        audioEngine.stopProceduralSound();
        setIsPlaying(false);
        if (proceduralTimerRef.current) clearInterval(proceduralTimerRef.current);
      } else {
        playSleepTrack(currentTrack);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Seek
  const seek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Skip forward / backward
  const skip = (seconds: number) => {
    hapticsEngine.trigger('tap');
    if (!audioRef.current) return;
    const maxDur = audioRef.current.duration || duration;
    const target = Math.max(0, Math.min(maxDur, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Next / Previous Chapter
  const nextChapter = () => {
    const currentIndex = AUDIO_CHAPTERS.findIndex((c) => c.id === currentChapter.id);
    const nextIndex = (currentIndex + 1) % AUDIO_CHAPTERS.length;
    const nextChap = AUDIO_CHAPTERS[nextIndex];
    const isUnlocked =
      hasAudiobook ||
      localStorage.getItem(STORAGE_HAS_AUDIOBOOK) === 'true' ||
      localStorage.getItem(STORAGE_IS_PREMIUM) === 'true';

    if (nextChap.chapterNumber > 1 && !isUnlocked) {
      triggerAudiobookPaywall();
      return;
    }
    playChapter(nextChap);
  };

  const prevChapter = () => {
    const currentIndex = AUDIO_CHAPTERS.findIndex((c) => c.id === currentChapter.id);
    const prevIndex = (currentIndex - 1 + AUDIO_CHAPTERS.length) % AUDIO_CHAPTERS.length;
    playChapter(AUDIO_CHAPTERS[prevIndex]);
  };

  // Playback Rate
  const setRate = (rate: number) => {
    hapticsEngine.trigger('tap');
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Mute Toggle
  const toggleMute = () => {
    hapticsEngine.trigger('tap');
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const dismissMiniPlayer = () => {
    setShowMiniPlayer(false);
  };

  const restoreMiniPlayer = () => {
    setShowMiniPlayer(true);
  };

  return (
    <AudioContext.Provider
      value={{
        currentChapter,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        isMuted,
        sleepTimerMinutes,
        sleepTimerSecondsLeft,
        showMiniPlayer,
        favorites,
        continueListening,
        isFavorite,
        toggleFavorite,
        playChapter,
        playSleepTrack,
        togglePlay,
        seek,
        skip,
        nextChapter,
        prevChapter,
        setRate,
        toggleMute,
        setSleepTimer,
        dismissMiniPlayer,
        restoreMiniPlayer,
        hasAudiobook,
        showAudiobookPaywall,
        setShowAudiobookPaywall,
        triggerAudiobookPaywall,
        unlockAudiobook,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
