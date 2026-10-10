import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';
import type { AudioChapter } from '../../types';
import { AudioUpload } from './AudioUpload';

const PARTS_MAP: Record<number, string> = {
  1: 'Part 1: The Foundation of Awareness',
  2: 'Part 2: The Biological Rhythm & Circadian Alignment',
  3: 'Part 3: Somatic Quieting & Autonomic Regulation',
  4: 'Part 4: Psychological Sovereignty & Digital Boundaries',
  5: 'Part 5: Transcendent Sleep & The Human 2.0 Shift',
};

interface ChapterEditorModalProps {
  chapter: AudioChapter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapter: AudioChapter) => Promise<void>;
  onDelete?: (chapterId: string) => Promise<void>;
  existingCount?: number;
}

export const ChapterEditorModal: React.FC<ChapterEditorModalProps> = ({
  chapter,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCount = 45,
}) => {
  const isEditing = Boolean(chapter);

  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [partNumber, setPartNumber] = useState<number>(1);
  const [partTitle, setPartTitle] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(600);
  const [description, setDescription] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [access, setAccess] = useState<'free' | 'pro'>('pro');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [audioPath, setAudioPath] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (chapter) {
      setChapterNumber(chapter.chapterNumber || 1);
      setTitle(chapter.title || '');
      const pNum = chapter.partNumber || 1;
      setPartNumber(pNum);
      setPartTitle(chapter.part || PARTS_MAP[pNum] || 'Part 1');
      setDurationSeconds(chapter.durationSeconds || (chapter.durationMinutes ? chapter.durationMinutes * 60 : 600));
      setDescription(chapter.description || '');
      setKeyTakeaway(chapter.keyTakeaway || '');
      setAccess(chapter.access || (chapter.chapterNumber === 1 ? 'free' : 'pro'));
      setIsPublished(chapter.isPublished !== false);
      setAudioPath(chapter.audioPath || chapter.fileName || '');
      setStreamUrl(chapter.streamUrl);
    } else {
      const nextNum = existingCount + 1;
      setChapterNumber(nextNum);
      setTitle('');
      setPartNumber(1);
      setPartTitle(PARTS_MAP[1]);
      setDurationSeconds(900);
      setDescription('');
      setKeyTakeaway('');
      setAccess(nextNum === 1 ? 'free' : 'pro');
      setIsPublished(true);
      setAudioPath('');
      setStreamUrl(undefined);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [chapter, isOpen, existingCount]);

  if (!isOpen) return null;

  const handlePartNumberChange = (num: number) => {
    setPartNumber(num);
    setPartTitle(PARTS_MAP[num] || `Part ${num}`);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Chapter title is required.';
    }
    if (chapterNumber < 1) {
      errs.chapterNumber = 'Chapter number must be 1 or higher.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const durationMins = Math.max(1, Math.round(durationSeconds / 60));
      const minsStr = Math.floor(durationSeconds / 60);
      const secsStr = (durationSeconds % 60).toString().padStart(2, '0');
      const formatted = `${minsStr}:${secsStr}`;

      const payload: AudioChapter = {
        id: chapter?.id || `ch-${chapterNumber}`,
        dbId: chapter?.dbId,
        chapterNumber,
        title: title.trim(),
        part: partTitle.trim() || PARTS_MAP[partNumber] || `Part ${partNumber}`,
        partNumber,
        durationMinutes: durationMins,
        durationFormatted: formatted,
        durationSeconds,
        description: description.trim(),
        keyTakeaway: keyTakeaway.trim(),
        fileName: `Chapter ${chapterNumber}.mp3`,
        driveUrl: chapter?.driveUrl || 'https://drive.google.com/drive/folders/1OqZnx9-aUMwhhaqYRzULuLjnT0iWQJ_0',
        driveId: chapter?.driveId,
        streamUrl,
        audioPath,
        access,
        isPublished,
        playCount: chapter?.playCount || 0,
      };

      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!chapter?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(chapter.id);
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
              {isEditing ? `Edit Chapter ${chapter?.chapterNumber}: ${chapter?.title}` : 'New Audiobook Chapter'}
            </h3>
            <p className="text-xs text-[#5A6663] mt-0.5">
              Audiobook 45 Chapters collection · Chapter 1 is free sample, Chapters 2-45 PRO.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Chapter #, Title & Access */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Chapter # <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={chapterNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setChapterNumber(val);
                  if (val === 1) setAccess('free');
                }}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78] ${
                  errors.chapterNumber ? 'border-red-500' : 'border-[#E6DCCB]'
                }`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Architecture of Awareness"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78] ${
                  errors.title ? 'border-red-500' : 'border-[#E6DCCB]'
                }`}
              />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Access
              </label>
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value as 'free' | 'pro')}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              >
                <option value="free">FREE Sample</option>
                <option value="pro">PRO Locked</option>
              </select>
            </div>
          </div>

          {/* Part Number & Part Title */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Part Number
              </label>
              <select
                value={partNumber}
                onChange={(e) => handlePartNumberChange(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>
                    Part {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Part Title
              </label>
              <input
                type="text"
                value={partTitle}
                onChange={(e) => setPartTitle(e.target.value)}
                placeholder="e.g. Part 1: The Foundation of Awareness"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                Duration (Sec)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Description / Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chapter narrative synopsis and thematic overview..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          {/* Key Takeaway */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Key Takeaway
            </label>
            <textarea
              rows={2}
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="Core realization or somatic reminder from this chapter..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          {/* Integrated Audio Upload */}
          <div className="p-4 rounded-2xl bg-[#F7F3EC] border border-[#E6DCCB]">
            <AudioUpload
              label="Audiobook MP3 File"
              access={access}
              audioPath={audioPath}
              audioUrl={streamUrl}
              durationSeconds={durationSeconds}
              onAudioUploaded={(info) => {
                setAudioPath(info.audioPath);
                if (info.audioUrl) setStreamUrl(info.audioUrl);
                if (info.durationSeconds > 0) {
                  setDurationSeconds(info.durationSeconds);
                }
              }}
            />
          </div>

          {/* Published Toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5F78] focus:ring-[#1F5F78] accent-[#1F5F78]"
            />
            <div>
              <span className="text-xs font-semibold text-[#1F2A28] block">Published</span>
              <span className="text-[10.5px] text-[#5A6663]">
                Visible in the Listen audiobook chapter listing
              </span>
            </div>
          </label>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E6DCCB] bg-[#F7F3EC]/50 flex items-center justify-between">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete chapter</span>
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
              <span>{isSaving ? 'Saving...' : 'Save Chapter'}</span>
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
                  Delete Chapter {chapterNumber}?
                </h4>
                <p className="text-xs text-[#5A6663] mt-1 leading-relaxed">
                  Are you sure you want to remove Chapter {chapterNumber}: "{title}"?
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
