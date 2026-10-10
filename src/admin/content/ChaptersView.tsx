import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Headphones, Edit2, Trash2 } from 'lucide-react';
import type { AudioChapter } from '../../types';
import { sleepContentService } from '../../services/sleepContentService';
import { ChapterEditorModal } from './ChapterEditorModal';
import { Toast, type ToastMessage } from './Toast';

export const ChaptersView: React.FC = () => {
  const [chapters, setChapters] = useState<AudioChapter[]>(() =>
    sleepContentService.getCachedChapters()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [partFilter, setPartFilter] = useState<string>('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AudioChapter | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const unsub = sleepContentService.subscribe(() => {
      setChapters([...sleepContentService.getCachedChapters()]);
    });
    sleepContentService.getAudiobookChapters(true).then((ch) => setChapters([...ch]));
    return unsub;
  }, []);

  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.part.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.keyTakeaway?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.chapterNumber.toString().includes(searchQuery);

      const matchesPart =
        partFilter === 'all' || c.partNumber.toString() === partFilter;

      return matchesSearch && matchesPart;
    });
  }, [chapters, searchQuery, partFilter]);

  const handleOpenNew = () => {
    setEditingChapter(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (ch: AudioChapter) => {
    setEditingChapter(ch);
    setIsEditorOpen(true);
  };

  const handleSave = async (saved: AudioChapter) => {
    try {
      await sleepContentService.saveChapter(saved);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Chapter ${saved.chapterNumber}: "${saved.title}" saved.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to save chapter.',
      });
    }
  };

  const handleDelete = async (chapterId: string) => {
    try {
      await sleepContentService.deleteChapter(chapterId);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: 'Chapter deleted.',
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to delete chapter.',
      });
    }
  };

  const handleTogglePublish = async (ch: AudioChapter, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = await sleepContentService.toggleChapterPublished(ch.id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Chapter ${ch.chapterNumber} is now ${newStatus ? 'Published' : 'Draft'}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to toggle publication status.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Bar with Title, Count Badge, "+ New chapter", search, part filter */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              Audiobook Chapters
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#1F5F78] font-mono font-bold text-xs">
              {filteredChapters.length} of {chapters.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-3.5 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Plus size={14} />
            <span>+ New chapter</span>
          </button>
        </div>

        {/* Search & Part filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-8 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6663]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chapter number, title, takeaway or part..."
              className="w-full pl-8.5 pr-3.5 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            >
              <option value="all">All Parts (1 to 5)</option>
              <option value="1">Part 1: The Foundation</option>
              <option value="2">Part 2: Biological Rhythm</option>
              <option value="3">Part 3: Somatic Quieting</option>
              <option value="4">Part 4: Digital Boundaries</option>
              <option value="5">Part 5: Transcendent Sleep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
        {filteredChapters.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] text-[#1F5F78] flex items-center justify-center mx-auto">
              <Headphones size={22} />
            </div>
            <div>
              <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                Nothing here yet
              </h4>
              <p className="text-xs text-[#5A6663] mt-1">
                {searchQuery || partFilter !== 'all'
                  ? 'No audiobook chapters match your filter criteria.'
                  : 'Start publishing chapters for the Human 2.0 Audiobook.'}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOpenNew}
                className="text-xs font-semibold text-[#1F5F78] hover:underline cursor-pointer"
              >
                Add the first one →
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px] sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-4">CH #</th>
                  <th className="py-3 px-4">TITLE</th>
                  <th className="py-3 px-3">PART</th>
                  <th className="py-3 px-3">DURATION</th>
                  <th className="py-3 px-3">ACCESS</th>
                  <th className="py-3 px-3">PLAYS</th>
                  <th className="py-3 px-3">PUB</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCCB]/40">
                {filteredChapters.map((ch) => {
                  const isPub = ch.isPublished !== false;
                  const isFree = ch.access === 'free' || ch.chapterNumber === 1;

                  return (
                    <tr
                      key={ch.id}
                      onClick={() => handleOpenEdit(ch)}
                      className="hover:bg-[#F7F3EC]/50 transition-colors cursor-pointer group"
                    >
                      {/* CH # */}
                      <td className="py-2.5 px-4 font-mono font-bold text-[#5A6663]">
                        {ch.chapterNumber}
                      </td>

                      {/* TITLE */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors truncate max-w-xs">
                          {ch.title}
                        </div>
                        {ch.keyTakeaway && (
                          <div className="text-[10.5px] text-[#5A6663] truncate max-w-sm italic">
                            "{ch.keyTakeaway}"
                          </div>
                        )}
                      </td>

                      {/* PART */}
                      <td className="py-2.5 px-3 text-[#5A6663] text-[11px] truncate max-w-[150px]">
                        {ch.part}
                      </td>

                      {/* DURATION */}
                      <td className="py-2.5 px-3 font-mono text-[#5A6663]">
                        {ch.durationFormatted}
                      </td>

                      {/* ACCESS */}
                      <td className="py-2.5 px-3">
                        {isFree ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                            Free Sample
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                            PRO Locked
                          </span>
                        )}
                      </td>

                      {/* PLAYS */}
                      <td className="py-2.5 px-3 font-mono text-[#5A6663]">
                        {ch.playCount ?? 0}
                      </td>

                      {/* PUB */}
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublish(ch, e)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors cursor-pointer border ${
                            isPub
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {isPub ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td
                        className="py-2.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ch)}
                            className="p-1.5 rounded-lg text-[#1F5F78] hover:bg-[#DCE9F0] transition-colors cursor-pointer"
                            title="Edit chapter"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ch.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete chapter"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <ChapterEditorModal
        isOpen={isEditorOpen}
        chapter={editingChapter}
        existingCount={chapters.length}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
