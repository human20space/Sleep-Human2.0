import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, FolderTree, Edit2, Trash2 } from 'lucide-react';
import {
  sleepContentService,
  type SleepCategory,
} from '../../services/sleepContentService';
import { CategoryEditorModal } from './CategoryEditorModal';
import { Toast, type ToastMessage } from './Toast';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<SleepCategory[]>(() =>
    sleepContentService.getCachedCategories()
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SleepCategory | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const unsub = sleepContentService.subscribe(() => {
      setCategories([...sleepContentService.getCachedCategories()]);
    });
    sleepContentService.getCategories(true).then((cats) => setCategories([...cats]));
    return unsub;
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q)
      );
    });
  }, [categories, searchQuery]);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (cat: SleepCategory) => {
    setEditingCategory(cat);
    setIsEditorOpen(true);
  };

  const handleSave = async (saved: SleepCategory) => {
    try {
      await sleepContentService.saveCategory(saved);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Category "${saved.title}" saved successfully.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to save category.',
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await sleepContentService.deleteCategory(categoryId);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: 'Category deleted.',
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to delete category.',
      });
    }
  };

  const handleTogglePublish = async (cat: SleepCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = await sleepContentService.toggleCategoryPublished(cat.id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Category "${cat.title}" is now ${newStatus ? 'Published' : 'Draft'}.`,
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

      {/* Top Bar with Title, Count Badge, "+ New category", search */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              Library Categories
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#1F5F78] font-mono font-bold text-xs">
              {filteredCategories.length} of {categories.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-3.5 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Plus size={14} />
            <span>+ New category</span>
          </button>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6663]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by title, slug or subtitle..."
            className="w-full pl-8.5 pr-3.5 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-[#F7F3EC]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
        {filteredCategories.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] text-[#1F5F78] flex items-center justify-center mx-auto">
              <FolderTree size={22} />
            </div>
            <div>
              <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                Nothing here yet
              </h4>
              <p className="text-xs text-[#5A6663] mt-1">
                {searchQuery
                  ? 'No categories match your search term.'
                  : 'Organise sleep tracks by creating your first category.'}
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
                  <th className="py-3 px-3">SLUG</th>
                  <th className="py-3 px-3">SUBTITLE</th>
                  <th className="py-3 px-3">ORDER</th>
                  <th className="py-3 px-3">TRACKS COUNT</th>
                  <th className="py-3 px-3">PUB</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCCB]/40 font-normal">
                {filteredCategories.map((cat) => {
                  const isPub = cat.isPublished !== false;

                  return (
                    <tr
                      key={cat.id}
                      onClick={() => handleOpenEdit(cat)}
                      className="hover:bg-[#F7F3EC]/50 transition-colors cursor-pointer group"
                    >
                      {/* TITLE */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors">
                          {cat.title}
                        </span>
                      </td>

                      {/* SLUG */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-[#1F5F78] bg-[#DCE9F0]/60 px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                      </td>

                      {/* SUBTITLE */}
                      <td className="py-3 px-3 text-[#5A6663] text-[11px] max-w-xs truncate">
                        {cat.subtitle || '—'}
                      </td>

                      {/* ORDER */}
                      <td className="py-3 px-3 font-mono font-bold text-[#5A6663]">
                        #{cat.sortOrder}
                      </td>

                      {/* TRACKS COUNT */}
                      <td className="py-3 px-3 font-mono text-[#1F2A28]">
                        {cat.tracksCount ?? 0} tracks
                      </td>

                      {/* PUB */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublish(cat, e)}
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
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg text-[#1F5F78] hover:bg-[#DCE9F0] transition-colors cursor-pointer"
                            title="Edit category"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete category"
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

      <CategoryEditorModal
        isOpen={isEditorOpen}
        category={editingCategory}
        existingCount={categories.length}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
