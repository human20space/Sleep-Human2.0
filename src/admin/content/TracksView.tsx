import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Music,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { SleepTrack } from '../../types';
import {
  sleepContentService,
  type SleepCategory,
} from '../../services/sleepContentService';
import { TrackEditorModal } from './TrackEditorModal';
import { Toast, type ToastMessage } from './Toast';

interface TracksViewProps {
  onSetFeatured?: (trackId: string) => void;
}

export const TracksView: React.FC<TracksViewProps> = () => {
  const [tracks, setTracks] = useState<SleepTrack[]>(() =>
    sleepContentService.getCachedTracks()
  );
  const [categories, setCategories] = useState<SleepCategory[]>(() =>
    sleepContentService.getCachedCategories()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<SleepTrack | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsub = sleepContentService.subscribe(() => {
      setTracks([...sleepContentService.getCachedTracks()]);
      setCategories([...sleepContentService.getCachedCategories()]);
    });

    sleepContentService.getTracks(true).then((t) => setTracks([...t]));
    sleepContentService.getCategories(true).then((c) => setCategories([...c]));

    return unsub;
  }, []);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        categoryFilter === 'all' || t.category === categoryFilter;

      // Access
      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'free' && !t.isPremium) ||
        (accessFilter === 'pro' && t.isPremium);

      return matchesSearch && matchesCategory && matchesAccess;
    });
  }, [tracks, searchQuery, categoryFilter, accessFilter]);

  const handleOpenNew = () => {
    setEditingTrack(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (track: SleepTrack) => {
    setEditingTrack(track);
    setIsEditorOpen(true);
  };

  const handleSave = async (saved: SleepTrack) => {
    try {
      await sleepContentService.saveTrack(saved);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Track "${saved.title}" saved successfully.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to save track.',
      });
    }
  };

  const handleDelete = async (trackId: string) => {
    try {
      await sleepContentService.deleteTrack(trackId);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: 'Track deleted.',
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to delete track.',
      });
    }
  };

  const handleTogglePublish = async (track: SleepTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = await sleepContentService.toggleTrackPublished(track.id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `"${track.title}" is now ${newStatus ? 'Published' : 'Draft'}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to update publication status.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Bar with Title, Count Badge, "+ New track", Search and Filters */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              Sleep Tracks
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#1F5F78] font-mono font-bold text-xs">
              {filteredTracks.length} of {tracks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-3.5 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Plus size={14} />
            <span>+ New track</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6663]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subtitle, or tags..."
              className="w-full pl-8.5 pr-3.5 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          {/* Filter by Category */}
          <div className="sm:col-span-3 relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Access */}
          <div className="sm:col-span-3 relative">
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            >
              <option value="all">All Access Tiers</option>
              <option value="free">Free Only</option>
              <option value="pro">PRO Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
        {filteredTracks.length === 0 ? (
          /* Empty state */
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] text-[#1F5F78] flex items-center justify-center mx-auto">
              <Music size={22} />
            </div>
            <div>
              <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                Nothing here yet
              </h4>
              <p className="text-xs text-[#5A6663] mt-1">
                {searchQuery || categoryFilter !== 'all' || accessFilter !== 'all'
                  ? 'No tracks match your current filter criteria.'
                  : 'Get started by creating your first sleep soundscape or acute reset.'}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">TITLE</th>
                  <th className="py-3 px-3">CATEGORY</th>
                  <th className="py-3 px-3">ACCESS</th>
                  <th className="py-3 px-3">DURATION</th>
                  <th className="py-3 px-3">PLAYS</th>
                  <th className="py-3 px-3">PUB</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCCB]/40 font-normal">
                {filteredTracks.map((track) => {
                  const isPub = track.isPublished !== false;

                  return (
                    <tr
                      key={track.id}
                      onClick={() => handleOpenEdit(track)}
                      className="hover:bg-[#F7F3EC]/50 transition-colors cursor-pointer group"
                    >
                      {/* TITLE */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {track.isFeaturedTonight && (
                            <span
                              title="Tonight's Featured Hero"
                              className="text-amber-500 shrink-0"
                            >
                              <Sparkles size={13} className="fill-amber-400" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors truncate max-w-xs">
                              {track.title}
                            </div>
                            <div className="text-[11px] text-[#5A6663] truncate max-w-sm">
                              {track.subtitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3 px-3">
                        <span className="font-mono capitalize px-2 py-0.5 rounded-md bg-[#F7F3EC] text-[#5A6663] text-[10.5px]">
                          {track.category?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* ACCESS */}
                      <td className="py-3 px-3">
                        {track.isPremium ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                            PRO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                            FREE
                          </span>
                        )}
                      </td>

                      {/* DURATION */}
                      <td className="py-3 px-3 font-mono text-[#1F2A28]">
                        {Math.floor(track.durationSeconds / 60)} min
                      </td>

                      {/* PLAYS */}
                      <td className="py-3 px-3 font-mono text-[#5A6663]">
                        {track.playCount ?? 0}
                      </td>

                      {/* PUB (Published / Draft toggle) */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublish(track, e)}
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
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(track)}
                            className="p-1.5 rounded-lg text-[#1F5F78] hover:bg-[#DCE9F0] transition-colors cursor-pointer"
                            title="Edit track"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(track.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete track"
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

      {/* Track Editor Drawer/Modal */}
      <TrackEditorModal
        isOpen={isEditorOpen}
        track={editingTrack}
        categories={categories}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
