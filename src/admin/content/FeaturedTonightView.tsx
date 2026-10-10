import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, CheckCircle2, Volume2 } from 'lucide-react';
import type { SleepTrack } from '../../types';
import { sleepContentService } from '../../services/sleepContentService';
import { Toast, type ToastMessage } from './Toast';

export const FeaturedTonightView: React.FC = () => {
  const [tracks, setTracks] = useState<SleepTrack[]>(() =>
    sleepContentService.getCachedTracks()
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsub = sleepContentService.subscribe(() => {
      setTracks([...sleepContentService.getCachedTracks()]);
    });
    sleepContentService.getTracks(true).then((t) => setTracks([...t]));
    return unsub;
  }, []);

  const publishedTracks = tracks.filter((t) => t.isPublished !== false);
  const currentFeatured =
    publishedTracks.find((t) => t.isFeaturedTonight) ||
    publishedTracks.find((t) => !t.isPremium) ||
    publishedTracks[0];

  const handleSetFeatured = async (track: SleepTrack) => {
    try {
      await sleepContentService.setFeaturedTonightTrack(track.id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `"${track.title}" is now set as Tonight's Featured Hero Track!`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to update featured track.',
      });
    }
  };

  const handleTogglePlay = (track: SleepTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (playingTrackId === track.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingTrackId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const streamUrl = track.audioUrl || (track.audioPath?.startsWith('http') ? track.audioPath : undefined);
    if (streamUrl) {
      audioPlayerRef.current = new Audio(streamUrl);
      audioPlayerRef.current.onended = () => setPlayingTrackId(null);
      audioPlayerRef.current
        .play()
        .then(() => setPlayingTrackId(track.id))
        .catch(() => setPlayingTrackId(null));
    } else {
      // Procedural audio or simulation
      setPlayingTrackId(track.id);
      setTimeout(() => setPlayingTrackId(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Currently Featured Hero Card */}
      <div className="bg-gradient-to-br from-[#17495e] via-[#1c556d] to-[#123645] text-white rounded-3xl p-6 shadow-md border border-[#17495e]/50 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#e8b98a] bg-black/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#e8b98a]" />
            <span>Currently Featured on Consumer Home Hero</span>
          </span>
          <span className="text-xs text-[#e8b98a] font-mono font-semibold">
            {currentFeatured ? `${Math.floor(currentFeatured.durationSeconds / 60)} min` : '—'}
          </span>
        </div>

        {currentFeatured ? (
          <div className="space-y-3">
            <div>
              <h2 className="font-serif-title text-xl font-bold text-white">
                {currentFeatured.title}
              </h2>
              <p className="font-serif-quote italic text-xs text-white/85 mt-1 leading-relaxed">
                "{currentFeatured.subtitle}"
              </p>
              {currentFeatured.description && (
                <p className="text-xs text-white/70 mt-2 line-clamp-2">
                  {currentFeatured.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleTogglePlay(currentFeatured)}
                className="py-2.5 px-4.5 rounded-2xl bg-[#e8b98a] hover:bg-[#dfaf7f] text-[#0b1317] font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                {playingTrackId === currentFeatured.id ? (
                  <>
                    <Pause size={15} className="fill-current" />
                    <span>Pause Audio Preview</span>
                  </>
                ) : (
                  <>
                    <Play size={15} className="fill-current" />
                    <span>Play Audio Preview</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <span className="px-2 py-0.5 rounded bg-white/10">
                  {currentFeatured.isPremium ? 'PRO Tier' : '100% FREE'}
                </span>
                <span>·</span>
                <span className="capitalize">{currentFeatured.category.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/80">No published track currently designated.</p>
        )}
      </div>

      {/* Guidance Note */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4.5 shadow-2xs text-xs text-[#5A6663] space-y-1.5">
        <h4 className="font-serif-title font-bold text-sm text-[#1F2A28] flex items-center gap-2">
          <Volume2 size={15} className="text-[#1F5F78]" />
          <span>Frictionless First-Time Experience Requirement</span>
        </h4>
        <p className="leading-relaxed">
          The headline hero track is loaded directly by first-time visitors transitioning from the splash screen ("Begin awareness"). For maximum conversion and calm engagement, Tonight's Featured track should be a 100% Free soundscape (such as Relaxing Bell) that plays immediately with zero login or paywall popups.
        </p>
      </div>

      {/* Track Selector List */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
            Select Tonight's Featured Track
          </h3>
          <p className="text-xs text-[#5A6663] mt-0.5">
            Click "Set as Tonight's Featured" on any published track below to instantly update the consumer hero card.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {publishedTracks.map((track) => {
            const isFeatured = track.id === currentFeatured?.id;
            const isPlaying = playingTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isFeatured
                    ? 'border-[#1F5F78] bg-[#DCE9F0]/25 shadow-xs'
                    : 'border-[#E6DCCB] hover:border-[#1F5F78]/50 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F7F3EC] text-[#5A6663] font-semibold">
                      {track.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!track.isPremium ? (
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          100% FREE (Recommended)
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                    {track.title}
                  </h4>
                  <p className="text-xs text-[#5A6663] mt-0.5 line-clamp-2">
                    {track.subtitle}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6DCCB]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlay(track, e)}
                      className="p-2 rounded-xl bg-[#EFE9DF] hover:bg-[#DCE9F0] text-[#1F5F78] transition-colors cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Preview audio'}
                    >
                      {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <span className="text-[11px] font-mono text-[#5A6663]">
                      {Math.floor(track.durationSeconds / 60)} min
                    </span>
                  </div>

                  {isFeatured ? (
                    <span className="px-3 py-1.5 rounded-xl bg-[#3C7858] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 size={13} />
                      <span>Current Hero</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(track)}
                      className="px-3 py-1.5 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles size={12} />
                      <span>Set as Featured</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
