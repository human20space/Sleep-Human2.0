import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle, Music, Sparkles, Lock, Clock } from 'lucide-react';
import {
  type SleepSectionItem,
  type SleepSection,
  formatDuration,
} from '../../services/sleepContentService';
import { AudioUpload } from './AudioUpload';

interface SectionAudioModalProps {
  item: SleepSectionItem | null;
  section: SleepSection | null;
  allSections?: SleepSection[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<SleepSectionItem>) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  existingCount?: number;
}

export const SectionAudioModal: React.FC<SectionAudioModalProps> = ({
  item,
  section,
  allSections = [],
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCount = 0,
}) => {
  const isEditing = Boolean(item);

  const [sectionId, setSectionId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [access, setAccess] = useState<'free' | 'paid'>('paid');
  const [durationFormatted, setDurationFormatted] = useState('15:00');
  const [durationSeconds, setDurationSeconds] = useState<number>(900);
  const [audioPath, setAudioPath] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (item) {
      setSectionId(item.sectionId || section?.id || '');
      setTitle(item.title || '');
      setSubtitle(item.subtitle || '');
      setDescription(item.description || '');
      setAccess(item.access || 'paid');
      setDurationFormatted(item.durationFormatted || formatDuration(item.durationSeconds || 0));
      setDurationSeconds(item.durationSeconds || 0);
      setAudioPath(item.audioPath || '');
      setSortOrder(item.sortOrder ?? 1);
      setIsPublished(item.isPublished !== false);
    } else {
      setSectionId(section?.id || (allSections[0]?.id ?? ''));
      setTitle('');
      setSubtitle('');
      setDescription('');
      // Default to paid, unless user wants free
      setAccess('paid');
      setDurationFormatted('15:00');
      setDurationSeconds(900);
      setAudioPath('');
      setAudioUrl('');
      setSortOrder(existingCount + 1);
      setIsPublished(true);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [item, section, allSections, isOpen, existingCount]);

  if (!isOpen) return null;

  const handleDurationFormattedChange = (val: string) => {
    setDurationFormatted(val);
    const parts = val.split(':').map((p) => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setDurationSeconds(parts[0] * 60 + parts[1]);
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      setDurationSeconds(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
  };

  const handleAudioUploaded = (info: {
    audioPath: string;
    audioUrl?: string;
    durationSeconds: number;
    fileName: string;
  }) => {
    setAudioPath(info.audioPath);
    if (info.audioUrl) setAudioUrl(info.audioUrl);
    if (info.durationSeconds > 0) {
      setDurationSeconds(info.durationSeconds);
      setDurationFormatted(formatDuration(info.durationSeconds));
    }
    if (!title) {
      const cleanTitle = info.fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanTitle);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Audio title is required.';
    }
    if (!sectionId) {
      errs.sectionId = 'Target section is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<SleepSectionItem> = {
        ...(item?.id ? { id: item.id } : {}),
        sectionId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        access,
        durationSeconds,
        durationFormatted: durationFormatted.trim() || formatDuration(durationSeconds),
        audioPath: audioPath.trim() || undefined,
        audioBucket: access === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro',
        sortOrder,
        isPublished,
      };

      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const targetSection = allSections.find((s) => s.id === sectionId) || section;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs antialiased">
      <div
        className="bg-white border border-[#E6DCCB] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E6DCCB] flex items-center justify-between bg-[#F7F3EC]/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1F5F78]/10 text-[#1F5F78] flex items-center justify-center border border-[#1F5F78]/20">
              <Music size={18} />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-lg text-[#1F2A28]">
                {isEditing ? `Edit Audio: ${item?.title}` : `Add Audio to ${targetSection?.title || 'Section'}`}
              </h2>
              <p className="text-xs text-[#5A6663]">
                Designate as Free or Paid audio, upload master file, and set duration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#5A6663] hover:text-[#1F2A28] hover:bg-[#EFE9DF] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="section-audio-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-[#1F2A28]">
          {/* 1. PARENT SECTION SELECTOR */}
          {allSections.length > 1 && (
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">
                Target Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden cursor-pointer"
              >
                {allSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.priceDisplay || s.priceAed || 'Standalone'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. AUDIO ACCESS TIER (CORE USER REQUIREMENT: FREE vs PAID) */}
          <div className="space-y-2">
            <label className="block font-semibold text-[#1F2A28]">
              Audio Access Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* FREE AUDIO CARD */}
              <button
                type="button"
                onClick={() => setAccess('free')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  access === 'free'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-950 shadow-xs'
                    : 'border-[#E6DCCB] bg-white hover:bg-[#F7F3EC] text-[#5A6663]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className={access === 'free' ? 'text-emerald-700' : 'text-stone-400'} />
                    <span className="font-bold text-xs">FREE AUDIO</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      access === 'free' ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Zero paywall
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Freely streamable by any user without payment or registration. Stored in public bucket{' '}
                  <code className="font-mono text-[10px]">sleep-audio-free</code>.
                </p>
              </button>

              {/* PAID AUDIO CARD */}
              <button
                type="button"
                onClick={() => setAccess('paid')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  access === 'paid'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20 text-amber-950 shadow-xs'
                    : 'border-[#E6DCCB] bg-white hover:bg-[#F7F3EC] text-[#5A6663]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lock size={16} className={access === 'paid' ? 'text-amber-700' : 'text-stone-400'} />
                    <span className="font-bold text-xs">PAID AUDIO</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      access === 'paid' ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Paid / Section unlock
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Requires purchase of {targetSection?.title || 'this section'} ({targetSection?.priceDisplay || 'paid'}).
                  Protected via bucket <code className="font-mono text-[10px]">sleep-audio-pro</code>.
                </p>
              </button>
            </div>
          </div>

          {/* 3. TITLE & SUBTITLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">
                Audio Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Restorative Yoga Nidra"
                className={`w-full px-3 py-2 rounded-xl border bg-white text-xs ${
                  errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-[#E6DCCB] focus:border-[#1F5F78]'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Subtitle / Technique</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Somatic nervous down-regulation"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden focus:ring-2 focus:ring-[#1F5F78]/10"
              />
            </div>
          </div>

          {/* 4. DURATION & SORT ORDER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">
                Duration (MM:SS) <span className="text-stone-400 font-normal">(Auto-detected on upload)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={durationFormatted}
                  onChange={(e) => handleDurationFormattedChange(e.target.value)}
                  placeholder="e.g. 18:45"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E6DCCB] bg-white font-mono text-xs focus:border-[#1F5F78] focus:outline-hidden"
                />
                <Clock size={14} className="absolute left-2.5 top-2.5 text-[#5A6663]" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Sort Order / Sequence</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white font-mono text-xs focus:border-[#1F5F78] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. DESCRIPTION */}
          <div>
            <label className="block font-semibold mb-1 text-[#1F2A28]">Audio Description / Clinical Context</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Guided somatic directions, frequency specs, or teacher notes..."
              className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden focus:ring-2 focus:ring-[#1F5F78]/10"
            />
          </div>

          {/* 6. AUDIO FILE UPLOAD & STORAGE BUCKET */}
          <div className="space-y-1.5">
            <AudioUpload
              audioPath={audioPath}
              audioUrl={audioUrl}
              access={access === 'free' ? 'free' : 'pro'}
              durationSeconds={durationSeconds}
              label={`Audio Master File (${access === 'free' ? 'Bucket: sleep-audio-free' : 'Bucket: sleep-audio-pro'})`}
              onAudioUploaded={handleAudioUploaded}
            />
          </div>

          {/* 7. PUBLISHED TOGGLE */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6DCCB] bg-white">
            <div>
              <div className="font-semibold text-xs text-[#1F2A28]">Track Publication Status</div>
              <div className="text-[11px] text-[#5A6663]">
                {isPublished
                  ? 'Published: Visible and playable in section'
                  : 'Draft: Hidden from consumer users'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                isPublished ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform ${
                  isPublished ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-rose-900">
                    Delete "{item?.title}" permanently?
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    This will remove this audio track from the section catalogue.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Audio'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E6DCCB] bg-[#F7F3EC]/50 flex items-center justify-between shrink-0">
          <div>
            {isEditing && onDelete && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Audio</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6DCCB] bg-white text-[#5A6663] hover:text-[#1F2A28] hover:bg-[#F7F3EC] font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="section-audio-form"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Audio'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
