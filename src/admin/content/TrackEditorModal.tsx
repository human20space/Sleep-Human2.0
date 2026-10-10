import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';
import type { SleepTrack } from '../../types';
import { type SleepCategory } from '../../services/sleepContentService';
import { AudioUpload } from './AudioUpload';

interface TrackEditorModalProps {
  track: SleepTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (track: SleepTrack) => Promise<void>;
  onDelete?: (trackId: string) => Promise<void>;
  categories: SleepCategory[];
}

export const TrackEditorModal: React.FC<TrackEditorModalProps> = ({
  track,
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
}) => {
  const isEditing = Boolean(track);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'soundscape' | 'sos' | 'body_scan'>('soundscape');
  const [typeTag, setTypeTag] = useState<'SOUNDSCAPE' | 'SOS' | 'BODY_SCAN'>('SOUNDSCAPE');
  const [audioEngineType, setAudioEngineType] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(600);
  const [access, setAccess] = useState<'free' | 'pro'>('free');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isFreeShelf, setIsFreeShelf] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [audioPath, setAudioPath] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setSubtitle(track.subtitle || '');
      setDescription(track.description || '');
      setCategory(track.category || 'soundscape');
      setTypeTag((track.category?.toUpperCase() as any) || 'SOUNDSCAPE');
      setAudioEngineType(track.audioEngineType || '');
      setDurationSeconds(track.durationSeconds || 0);
      setAccess(track.isPremium ? 'pro' : 'free');
      setTagsInput((track.tags || []).join(', '));
      setIsFreeShelf(Boolean(track.isFreeShelf));
      setSortOrder(track.sortOrder ?? 1);
      setIsPublished(track.isPublished !== false);
      setAudioPath(track.audioPath || '');
      setAudioUrl(track.audioUrl);
    } else {
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCategory('soundscape');
      setTypeTag('SOUNDSCAPE');
      setAudioEngineType('');
      setDurationSeconds(600);
      setAccess('free');
      setTagsInput('Soundscape, Rest, Ambient');
      setIsFreeShelf(true);
      setSortOrder(1);
      setIsPublished(true);
      setAudioPath('');
      setAudioUrl(undefined);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [track, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Track title is required.';
    }
    if (durationSeconds < 0) {
      errs.duration = 'Duration must be 0 or greater.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'soundscape' | 'sos' | 'body_scan';
    setCategory(val);
    setTypeTag(val.toUpperCase() as any);
  };

  const handleAccessChange = (newAccess: 'free' | 'pro') => {
    setAccess(newAccess);
    if (newAccess === 'pro') {
      setIsFreeShelf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const trackPayload: SleepTrack = {
        id: track?.id || `track-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        dbId: track?.dbId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        category,
        durationSeconds,
        isPremium: access === 'pro',
        audioEngineType: (audioEngineType || undefined) as any,
        audioUrl,
        audioPath,
        tags: parsedTags,
        isFreeShelf,
        sortOrder,
        isPublished,
        isFeaturedTonight: track?.isFeaturedTonight || false,
        playCount: track?.playCount || 0,
      };

      await onSave(trackPayload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!track?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(track.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E6DCCB] rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E6DCCB] flex items-center justify-between bg-[#F7F3EC]/50">
          <div>
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              {isEditing ? `Edit Track: ${track?.title}` : 'New Sleep Track'}
            </h3>
            <p className="text-xs text-[#5A6663] mt-0.5">
              {isEditing ? 'Update track metadata, audio file and publication status.' : 'Configure and upload a new soundscape, SOS reset, or body scan.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5A6663] hover:text-[#1F2A28] rounded-xl hover:bg-[#EFE9DF] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sacred Temple Bell"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78] ${
                  errors.title ? 'border-red-500' : 'border-[#E6DCCB]'
                }`}
              />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Deep harmonic bell resonance for stillness and sleep"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the sonic landscape, clinical somatic intention, or frequencies..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          {/* Category, Type Tag & Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Type Tag
              </label>
              <select
                value={typeTag}
                onChange={(e) => setTypeTag(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              >
                <option value="SOUNDSCAPE">SOUNDSCAPE</option>
                <option value="SOS">SOS</option>
                <option value="BODY_SCAN">BODY_SCAN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Audio Engine Type
              </label>
              <select
                value={audioEngineType}
                onChange={(e) => setAudioEngineType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              >
                <option value="">Stream CDN (Default)</option>
                <option value="bell_sound">bell_sound (Temple Bell)</option>
                <option value="ocean_rain">ocean_rain (Procedural Rain)</option>
                <option value="sos_reset">sos_reset (Acute 90s Pacer)</option>
                <option value="delta_binaural">delta_binaural (Delta Sync)</option>
                <option value="solfeggio_432">solfeggio_432</option>
                <option value="solfeggio_528">solfeggio_528</option>
              </select>
            </div>
          </div>

          {/* Access Tier & Free Shelf Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1.5">
                Access Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAccessChange('free')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    access === 'free'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                      : 'border-[#E6DCCB] text-[#5A6663] hover:bg-[#F7F3EC]'
                  }`}
                >
                  FREE
                </button>
                <button
                  type="button"
                  onClick={() => handleAccessChange('pro')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    access === 'pro'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs font-bold'
                      : 'border-[#E6DCCB] text-[#5A6663] hover:bg-[#F7F3EC]'
                  }`}
                >
                  PRO
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Duration (Seconds)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
                />
                <span className="text-[11px] font-mono text-[#5A6663] whitespace-nowrap">
                  ({Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Bell, Temple, Free, Stillness"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          {/* Integrated Audio Upload */}
          <div className="p-4 rounded-2xl bg-[#F7F3EC] border border-[#E6DCCB]">
            <AudioUpload
              access={access}
              audioPath={audioPath}
              audioUrl={audioUrl}
              durationSeconds={durationSeconds}
              onAudioUploaded={(info) => {
                setAudioPath(info.audioPath);
                if (info.audioUrl) setAudioUrl(info.audioUrl);
                if (info.durationSeconds > 0) {
                  setDurationSeconds(info.durationSeconds);
                }
              }}
            />
          </div>

          {/* Toggles: Free Shelf & Published */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeShelf}
                onChange={(e) => setIsFreeShelf(e.target.checked)}
                className="w-4 h-4 rounded text-[#1F5F78] focus:ring-[#1F5F78] accent-[#1F5F78]"
              />
              <div>
                <span className="text-xs font-semibold text-[#1F2A28] block">Is Free Shelf</span>
                <span className="text-[10.5px] text-[#5A6663]">Highlight on Free Sleep Shelf on home</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#1F5F78] focus:ring-[#1F5F78] accent-[#1F5F78]"
              />
              <div>
                <span className="text-xs font-semibold text-[#1F2A28] block">Published</span>
                <span className="text-[10.5px] text-[#5A6663]">Make live and playable in mobile app</span>
              </div>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E6DCCB] bg-[#F7F3EC]/50 flex items-center justify-between">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete track</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-[#E6DCCB] hover:bg-[#EFE9DF] text-[#1F2A28] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save size={13} />
              <span>{isSaving ? 'Saving...' : 'Save Track'}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Submodal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E6DCCB] shadow-2xl space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                  Delete "{title}"?
                </h4>
                <p className="text-xs text-[#5A6663] mt-1 leading-relaxed">
                  Are you sure you want to delete this track? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs font-semibold text-[#1F2A28] hover:bg-[#EFE9DF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
