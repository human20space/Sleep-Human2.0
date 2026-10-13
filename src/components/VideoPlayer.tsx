import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Film, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  defaultSrc?: string;
  title?: string;
  subtitle?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  defaultSrc = '/videos/intro.mp4',
  title = 'HUMAN 2.0 — An Introduction',
  subtitle = 'Vinay Kapoor on awareness in an AI-driven world',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('[VideoPlayer] Play interrupted or blocked, trying muted fallback:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasError(false);
              })
              .catch(() => {
                setHasError(true);
              });
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const target = Number(e.target.value);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-[#101b22] rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] overflow-hidden shadow-xs">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dce9f0] dark:bg-[#17495e]/40 text-[#17495e] dark:text-[#e8b98a] flex items-center justify-center">
            <Film size={15} />
          </div>
          <div>
            <h4 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#e8b98a] leading-tight">
              {title}
            </h4>
            <p className="text-[10px] text-[#5a6663] dark:text-[#9eb2be] -mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div
        className="relative aspect-video bg-[#070b0e] overflow-hidden group cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={defaultSrc}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current && videoRef.current.duration) {
              setDuration(videoRef.current.duration);
              setHasError(false);
            }
          }}
          onError={() => {
            console.warn('[VideoPlayer] Video failed to load source:', defaultSrc);
            setHasError(true);
          }}
          className="w-full h-full object-cover"
        />

        {/* Error Fallback with Retry */}
        {hasError && (
          <div
            className="absolute inset-0 bg-gradient-to-tr from-[#0d1613] to-[#17495e] flex flex-col items-center justify-center p-4 text-center text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Film size={26} className="text-[#e8b98a] mb-2" />
            <p className="text-xs font-serif-title font-semibold text-[#f7f3ec] mb-1">
              Author Video Message
            </p>
            <p className="text-[11px] text-white/80 max-w-xs font-serif-quote italic mb-3">
              "Bringing together two worlds — outer success and inner awareness."
            </p>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                  togglePlay();
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#e8b98a] text-[#070b0e] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:brightness-110"
            >
              <RotateCcw size={13} />
              <span>Retry Video</span>
            </button>
          </div>
        )}

        {/* Big Center Play Button (visible when paused) */}
        {!hasError && !isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all z-10 pointer-events-none">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-[#17495e]/90 text-[#e8b98a] border-2 border-[#e8b98a]/50 shadow-xl flex items-center justify-center pl-0.5"
            >
              <Play size={24} className="fill-current" />
            </motion.div>
          </div>
        )}

        {/* Always Accessible Control Bar */}
        {!hasError && (
          <div
            className={`absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-1 text-white transition-opacity z-10 ${
              isPlaying ? 'opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrubber Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#e8b98a]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <span className="text-[10px] font-mono text-white/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                className="hover:text-[#e8b98a] transition-colors p-1 cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
