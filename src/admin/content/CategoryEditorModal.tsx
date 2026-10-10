import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';
import { type SleepCategory } from '../../services/sleepContentService';

interface CategoryEditorModalProps {
  category: SleepCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: SleepCategory) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
  existingCount?: number;
}

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCount = 3,
}) => {
  const isEditing = Boolean(category);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (category) {
      setTitle(category.title || '');
      setSlug(category.slug || '');
      setSubtitle(category.subtitle || '');
      setSortOrder(category.sortOrder ?? 1);
      setIsPublished(category.isPublished !== false);
    } else {
      setTitle('');
      setSlug('');
      setSubtitle('');
      setSortOrder(existingCount + 1);
      setIsPublished(true);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [category, isOpen, existingCount]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9_-]/g, '_'));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Category title is required.';
    }
    if (!slug.trim()) {
      errs.slug = 'Slug is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: SleepCategory = {
        id: category?.id || `cat-${Date.now()}`,
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
        title: title.trim(),
        subtitle: subtitle.trim(),
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
    if (!category?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E6DCCB] rounded-3xl max-w-lg w-full max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E6DCCB] flex items-center justify-between bg-[#F7F3EC]/50">
          <div>
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              {isEditing ? `Edit Category: ${category?.title}` : 'New Category'}
            </h3>
            <p className="text-xs text-[#5A6663] mt-0.5">
              Organise sleep tracks into structured library shelves.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Soundscapes & Nature"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78] ${
                errors.title ? 'border-red-500' : 'border-[#E6DCCB]'
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. soundscape"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78] ${
                errors.slug ? 'border-red-500' : 'border-[#E6DCCB]'
              }`}
            />
            {errors.slug && <p className="text-[11px] text-red-500 mt-1">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Acoustic nature sanctuaries and ambient textures"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
              Sort Order
            </label>
            <input
              type="number"
              min="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5F78]/20 focus:border-[#1F5F78]"
            />
          </div>

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
                Visible in consumer library exploration
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
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
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
              <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
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
                  Are you sure you want to delete this category? Associated tracks will have their category unlinked.
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
