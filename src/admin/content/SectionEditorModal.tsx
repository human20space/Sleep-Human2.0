import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle, Layers, DollarSign } from 'lucide-react';
import { type SleepSection } from '../../services/sleepContentService';

interface SectionEditorModalProps {
  section: SleepSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Partial<SleepSection>) => Promise<void>;
  onDelete?: (sectionId: string) => Promise<void>;
  existingCount?: number;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCount = 2,
}) => {
  const isEditing = Boolean(section);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [sectionType, setSectionType] = useState<SleepSection['sectionType']>('meditation');
  const [pricingType, setPricingType] = useState<SleepSection['pricingType']>('standalone');
  const [priceAed, setPriceAed] = useState('AED 49');
  const [priceUsd, setPriceUsd] = useState('$12.99');
  const [priceDisplay, setPriceDisplay] = useState('AED 49');
  const [pricingTagline, setPricingTagline] = useState('Unlock all sessions forever');
  const [badge, setBadge] = useState('Meditation');
  const [appleProductId, setAppleProductId] = useState('');
  const [googleProductId, setGoogleProductId] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setSlug(section.slug || '');
      setSubtitle(section.subtitle || '');
      setDescription(section.description || '');
      setSectionType(section.sectionType || 'meditation');
      setPricingType(section.pricingType || 'standalone');
      setPriceAed(section.priceAed || 'AED 49');
      setPriceUsd(section.priceUsd || '$12.99');
      setPriceDisplay(section.priceDisplay || 'AED 49');
      setPricingTagline(section.pricingTagline || 'Unlock all sessions forever');
      setBadge(section.badge || 'Meditation');
      setAppleProductId(section.appleProductId || '');
      setGoogleProductId(section.googleProductId || '');
      setSortOrder(section.sortOrder ?? 1);
      setIsPublished(section.isPublished !== false);
    } else {
      setTitle('');
      setSlug('');
      setSubtitle('');
      setDescription('');
      setSectionType('meditation');
      setPricingType('standalone');
      setPriceAed('AED 49');
      setPriceUsd('$12.99');
      setPriceDisplay('AED 49');
      setPricingTagline('Unlock all sessions forever');
      setBadge('Meditation');
      setAppleProductId('');
      setGoogleProductId('');
      setSortOrder(existingCount + 1);
      setIsPublished(true);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [section, isOpen, existingCount]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handlePriceAedChange = (val: string) => {
    setPriceAed(val);
    if (!isEditing || priceDisplay === priceAed) {
      setPriceDisplay(val);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Section title is required.';
    }
    if (!slug.trim()) {
      errs.slug = 'Slug is required (e.g. sleep-meditation, meditation-women).';
    }
    if (pricingType === 'standalone' && !priceAed.trim()) {
      errs.priceAed = 'Price (AED) is required for standalone priced sections.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<SleepSection> = {
        ...(section?.id ? { id: section.id } : {}),
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        subtitle: subtitle.trim(),
        description: description.trim(),
        sectionType,
        pricingType,
        priceAed: priceAed.trim(),
        priceUsd: priceUsd.trim(),
        priceDisplay: priceDisplay.trim() || priceAed.trim(),
        pricingTagline: pricingTagline.trim(),
        badge: badge.trim(),
        appleProductId: appleProductId.trim() || undefined,
        googleProductId: googleProductId.trim() || undefined,
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
    if (!section?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(section.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
              <Layers size={18} />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-lg text-[#1F2A28]">
                {isEditing ? `Edit Section: ${section?.title}` : 'Create New Meditation Section'}
              </h2>
              <p className="text-xs text-[#5A6663]">
                Configure section metadata, custom pricing model, and published visibility
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
        <form id="section-editor-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-[#1F2A28]">
          {/* 1. TITLE & SLUG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">
                Section Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Meditation for Women"
                className={`w-full px-3 py-2 rounded-xl border bg-white text-xs ${
                  errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-[#E6DCCB] focus:border-[#1F5F78]'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. meditation-women"
                className={`w-full px-3 py-2 rounded-xl border bg-white font-mono text-xs ${
                  errors.slug ? 'border-rose-400 focus:ring-rose-200' : 'border-[#E6DCCB] focus:border-[#1F5F78]'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.slug && <p className="text-rose-600 text-[11px] mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* 2. SUBTITLE & BADGE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-[#1F2A28]">Subtitle / Catchphrase</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Somatic hormonal & autonomic nervous reset"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden focus:ring-2 focus:ring-[#1F5F78]/10"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Card Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Women's Health, New"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden focus:ring-2 focus:ring-[#1F5F78]/10"
              />
            </div>
          </div>

          {/* 3. DESCRIPTION */}
          <div>
            <label className="block font-semibold mb-1 text-[#1F2A28]">Long Description / Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the purpose and clinical/somatic methodology of this meditation section..."
              className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden focus:ring-2 focus:ring-[#1F5F78]/10"
            />
          </div>

          {/* 4. SECTION TYPE & SORT ORDER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Section Classification</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value as SleepSection['sectionType'])}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden cursor-pointer"
              >
                <option value="meditation">Meditation Series (Specialized Guided Practices)</option>
                <option value="audiobook">Audiobook Series (Dedicated Chapters)</option>
                <option value="soundscape">Soundscape / Frequency Collection</option>
                <option value="custom">Custom Audio Collection</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Shelf Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs font-mono focus:border-[#1F5F78] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. PRICING CONFIGURATION (CORE USER REQUIREMENT) */}
          <div className="bg-[#FAF7F2] border border-[#E6DCCB] rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E6DCCB]/60 pb-2">
              <DollarSign size={16} className="text-[#1F5F78]" />
              <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                Custom Section Pricing Plan
              </h4>
              <span className="text-[10px] bg-[#1F5F78]/10 text-[#1F5F78] px-2 py-0.5 rounded-full font-mono font-medium">
                Independent Pricing
              </span>
            </div>

            {/* Pricing Model Selector */}
            <div>
              <label className="block font-semibold mb-1.5 text-[#1F2A28]">Pricing Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'standalone',
                    label: 'Standalone Purchase',
                    desc: 'User pays fixed price for this specific section',
                  },
                  {
                    id: 'subscription',
                    label: 'Pro Subscription',
                    desc: 'Included automatically in Human 2.0 Pro',
                  },
                  {
                    id: 'free',
                    label: '100% Free Section',
                    desc: 'All audios open without paywall',
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setPricingType(tier.id as SleepSection['pricingType'])}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      pricingType === tier.id
                        ? 'border-[#1F5F78] bg-[#1F5F78]/10 text-[#1F2A28] ring-1 ring-[#1F5F78]'
                        : 'border-[#E6DCCB] bg-white hover:bg-[#F7F3EC] text-[#5A6663]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#1F2A28]">{tier.label}</div>
                    <div className="text-[10px] text-[#5A6663] mt-0.5">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {pricingType !== 'free' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1 text-[#1F2A28]">
                    Price (AED) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={priceAed}
                    onChange={(e) => handlePriceAedChange(e.target.value)}
                    placeholder="e.g. AED 49 or AED 59"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white font-mono text-xs focus:border-[#1F5F78] focus:outline-hidden"
                  />
                  {errors.priceAed && <p className="text-rose-600 text-[11px] mt-1">{errors.priceAed}</p>}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#1F2A28]">Price (USD)</label>
                  <input
                    type="text"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="e.g. $12.99 or $15.99"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white font-mono text-xs focus:border-[#1F5F78] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#1F2A28]">Display Label</label>
                  <input
                    type="text"
                    value={priceDisplay}
                    onChange={(e) => setPriceDisplay(e.target.value)}
                    placeholder="e.g. AED 49 · Lifetime"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1 text-[#1F2A28]">Pricing Tagline / Paywall Pitch</label>
              <input
                type="text"
                value={pricingTagline}
                onChange={(e) => setPricingTagline(e.target.value)}
                placeholder="e.g. Unlock all 12 sessions forever · Sovereign lifetime access"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DCCB] bg-white text-xs focus:border-[#1F5F78] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 6. PUBLISHED TOGGLE */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6DCCB] bg-white">
            <div>
              <div className="font-semibold text-xs text-[#1F2A28]">Section Publication Status</div>
              <div className="text-[11px] text-[#5A6663]">
                {isPublished
                  ? 'Published: Visible to mobile and web app users'
                  : 'Draft: Hidden from consumer users, visible only in admin'}
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
                    Delete "{section?.title}" permanently?
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    This will delete this section and dissociate all child audio items. This action cannot be undone.
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
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Section'}
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
                <span>Delete Section</span>
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
              form="section-editor-form"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Section'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
