import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Play, Pause, RefreshCw, Music, CheckCircle2, Shield } from 'lucide-react';
import { uploadAudioFile, moveAudioFile, detectAudioDuration } from '../../services/sleepContentService';

interface AudioUploadProps {
  audioPath?: string;
  audioUrl?: string;
  access: 'free' | 'pro';
  durationSeconds?: number;
  label?: string;
  onAudioUploaded: (info: {
    audioPath: string;
    audioUrl?: string;
    durationSeconds: number;
    fileName: string;
  }) => void;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  audioPath,
  audioUrl,
  access,
  durationSeconds,
  label = 'Audio File & Storage',
  onAudioUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>(() => {
    if (audioPath) {
      return audioPath.split('/').pop() || audioPath;
    }
    return '';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevAccessRef = useRef<'free' | 'pro'>(access);

  const targetBucket: 'sleep-audio-free' | 'sleep-audio-pro' =
    access === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro';

  // Handle automatic file relocation if access tier changes between Free & PRO
  useEffect(() => {
    const prevAccess = prevAccessRef.current;
    if (prevAccess !== access && audioPath) {
      prevAccessRef.current = access;
      const fromBucket = prevAccess === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro';
      const toBucket = targetBucket;

      moveAudioFile(audioPath, fromBucket, toBucket).then((result) => {
        onAudioUploaded({
          audioPath: result.path,
          audioUrl: result.publicUrl || previewUrl,
          durationSeconds: durationSeconds || 0,
          fileName: currentFileName,
        });
      });
    } else {
      prevAccessRef.current = access;
    }
  }, [access, audioPath, currentFileName, durationSeconds, onAudioUploaded, previewUrl, targetBucket]);

  const effectivePreviewUrl = previewUrl || audioUrl;

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setCurrentFileName(file.name);

    try {
      // 1. Detect duration directly from file via HTML5 Audio metadata
      const detectedDuration = await detectAudioDuration(file);

      // 2. Upload to designated access tier bucket
      const uploadResult = await uploadAudioFile(file, targetBucket, (pct) => {
        setUploadProgress(pct);
      });

      const effectiveUrl = uploadResult.publicUrl || URL.createObjectURL(file);
      setPreviewUrl(effectiveUrl);

      // 3. Callback parent editor
      onAudioUploaded({
        audioPath: uploadResult.path,
        audioUrl: effectiveUrl,
        durationSeconds: uploadResult.durationSeconds || detectedDuration,
        fileName: file.name,
      });
    } catch (err) {
      console.warn('[AudioUpload] File upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const togglePlayPreview = () => {
    if (!audioRef.current && effectivePreviewUrl) {
      audioRef.current = new Audio(effectivePreviewUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1F2A28] flex items-center gap-1.5">
          <Music size={14} className="text-[#1F5F78]" />
          <span>{label}</span>
        </label>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            access === 'free'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {access === 'free' ? 'sleep-audio-free (Public CDN)' : 'sleep-audio-pro (Authenticated)'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Box / Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4.5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#1F5F78] bg-[#DCE9F0]/40'
            : 'border-[#E6DCCB] hover:border-[#1F5F78]/60 bg-[#F7F3EC]/50'
        }`}
      >
        {isUploading ? (
          <div className="space-y-2.5 py-2">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#1F5F78]">
              <RefreshCw size={15} className="animate-spin" />
              <span>Uploading to {targetBucket}... ({uploadProgress}%)</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-[#E6DCCB] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#1F5F78] h-full transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-[#5A6663]">Detecting audio duration and generating stream hash...</p>
          </div>
        ) : currentFileName || audioPath ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#DCE9F0] text-[#1F5F78] flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-[#3C7858]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1F2A28] truncate max-w-[240px]">
                  {currentFileName || audioPath}
                </div>
                <div className="text-[11px] text-[#5A6663] font-mono flex items-center gap-2">
                  <span>{durationSeconds ? formatTime(durationSeconds) : 'Auto-detected'}</span>
                  <span>·</span>
                  <span className="capitalize">{targetBucket}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {effectivePreviewUrl && (
                <button
                  type="button"
                  onClick={togglePlayPreview}
                  className="px-3 py-1.5 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={13} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Preview</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-[#E6DCCB] bg-white hover:bg-[#EFE9DF] text-[#1F2A28] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={12} />
                <span>Replace</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFE9DF] text-[#1F5F78] mx-auto flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F2A28]">
                Click or drag audio file here to upload
              </p>
              <p className="text-[11px] text-[#5A6663] mt-0.5">
                MP3, M4A, or WAV · Duration detected automatically via Web Audio
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10.5px] text-[#5A6663] px-1">
        <span className="flex items-center gap-1">
          <Shield size={11} className="text-[#3C7858]" />
          <span>Storage isolation by access tier</span>
        </span>
        <span className="font-mono">Max 100MB</span>
      </div>
    </div>
  );
};
