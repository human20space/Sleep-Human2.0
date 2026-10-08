import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Film } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasError(false);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e6dccb] overflow-hidden shadow-xs">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#dce9f0] text-[#17495e] flex items-center justify-center">
            <Film size={15} />
          </div>
          <div>
            <h4 className="text-xs font-serif-title font-bold text-[#17495e] leading-tight">
              {title}
            </h4>
            <p className="text-[10px] text-[#5a6663] -mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-[#0d1613] overflow-hidden group">
        <video
          ref={videoRef}
          src={defaultSrc}
          playsInline
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />

        {/* Placeholder / File Not Yet Present */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0d1613] to-[#17495e] flex flex-col items-center justify-center p-4 text-center text-white">
            <Film size={26} className="text-[#e8b98a] mb-2 animate-pulse" />
            <p className="text-xs font-serif-title font-semibold text-[#f7f3ec] mb-1">
              Author Video Introduction
            </p>
            <p className="text-[11px] text-white/80 max-w-xs font-serif-quote italic">
              "Bringing together two worlds — outer success and inner awareness."
            </p>
          </div>
        )}

        {/* Center Big Play Button (when paused) */}
        {!hasError && !isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-13 h-13 rounded-full bg-[#17495e]/90 text-[#e8b98a] border-2 border-[#e8b98a]/40 shadow-lg flex items-center justify-center pl-0.5"
            >
              <Play size={22} className="fill-current" />
            </motion.div>
          </div>
        )}

        {/* Video Control Bar */}
        {!hasError && (
          <div className="absolute left-0 right-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="hover:text-[#e8b98a] transition-colors">
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
              </button>
              <button onClick={toggleMute} className="hover:text-[#e8b98a] transition-colors">
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            <button onClick={handleFullscreen} className="hover:text-[#e8b98a] transition-colors">
              <Maximize2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
