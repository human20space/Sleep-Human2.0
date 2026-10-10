import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Music,
  Sparkles,
  Lock,
  Clock,
} from 'lucide-react';
import {
  sleepContentService,
  type SleepSection,
  type SleepSectionItem,
} from '../../services/sleepContentService';
import { SectionEditorModal } from './SectionEditorModal';
import { SectionAudioModal } from './SectionAudioModal';
import { Toast, type ToastMessage } from './Toast';

export const SectionsView: React.FC = () => {
  const [sections, setSections] = useState<SleepSection[]>(() =>
    sleepContentService.getCachedSections()
  );
  const [allItems, setAllItems] = useState<SleepSectionItem[]>(() =>
    sleepContentService.getCachedSectionItems()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SleepSection | null>(null);

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [editingAudioItem, setEditingAudioItem] = useState<SleepSectionItem | null>(null);
  const [targetAudioSection, setTargetAudioSection] = useState<SleepSection | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const unsub = sleepContentService.subscribe(() => {
      setSections([...sleepContentService.getCachedSections()]);
      setAllItems([...sleepContentService.getCachedSectionItems()]);
    });

    sleepContentService.getSections(true).then((secs) => setSections([...secs]));
    sleepContentService.getSectionItems(undefined, true).then((items) => setAllItems([...items]));

    return unsub;
  }, []);

  // Filter sections
  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.subtitle?.toLowerCase().includes(q) ||
        s.priceDisplay?.toLowerCase().includes(q)
      );
    });
  }, [sections, searchQuery]);

  // Section Handlers
  const handleOpenNewSection = () => {
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: SleepSection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSection(sec);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (data: Partial<SleepSection>) => {
    try {
      const saved = await sleepContentService.saveSection(data);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Section "${saved.title}" saved successfully.`,
      });
      // Expand newly saved section
      setExpandedSectionId(saved.id);
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to save section.',
      });
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await sleepContentService.deleteSection(id);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: 'Section deleted.',
      });
      if (expandedSectionId === id) setExpandedSectionId(null);
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to delete section.',
      });
    }
  };

  const handleToggleSectionPublish = async (sec: SleepSection, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = !sec.isPublished;
      await sleepContentService.saveSection({ id: sec.id, isPublished: newStatus });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Section "${sec.title}" is now ${newStatus ? 'Published' : 'Draft'}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to toggle publication status.',
      });
    }
  };

  // Audio Handlers
  const handleOpenNewAudio = (sec: SleepSection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetAudioSection(sec);
    setEditingAudioItem(null);
    setIsAudioModalOpen(true);
  };

  const handleOpenEditAudio = (item: SleepSectionItem, sec: SleepSection) => {
    setTargetAudioSection(sec);
    setEditingAudioItem(item);
    setIsAudioModalOpen(true);
  };

  const handleSaveAudio = async (data: Partial<SleepSectionItem>) => {
    try {
      const saved = await sleepContentService.saveSectionItem(data);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Audio "${saved.title}" saved as ${saved.access.toUpperCase()}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to save audio item.',
      });
    }
  };

  const handleDeleteAudio = async (id: string) => {
    try {
      await sleepContentService.deleteSectionItem(id);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: 'Audio track deleted.',
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to delete audio item.',
      });
    }
  };

  const handleToggleAudioAccess = async (item: SleepSectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newAccess: 'free' | 'paid' = item.access === 'free' ? 'paid' : 'free';
      const newBucket = newAccess === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro';
      await sleepContentService.saveSectionItem({
        id: item.id,
        access: newAccess,
        audioBucket: newBucket,
      });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `"${item.title}" switched to ${newAccess === 'free' ? 'FREE' : 'PAID'}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to switch audio access level.',
      });
    }
  };

  const handleToggleAudioPublish = async (item: SleepSectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = !item.isPublished;
      await sleepContentService.saveSectionItem({ id: item.id, isPublished: newStatus });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Audio "${item.title}" is now ${newStatus ? 'Published' : 'Draft'}.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Failed to toggle audio publication status.',
      });
    }
  };

  const toggleSectionAccordion = (id: string) => {
    setExpandedSectionId(expandedSectionId === id ? null : id);
  };

  return (
    <div className="space-y-4 antialiased">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Header Card */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              Meditation & Audio Sections
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#1F5F78] font-mono font-bold text-xs">
              {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNewSection}
            className="px-4 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>New Section</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections by name, slug, pricing or topic..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 text-xs text-[#1F2A28] focus:border-[#1F5F78] focus:bg-white focus:outline-hidden transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#5A6663]" />
        </div>
      </div>

      {/* Sections List */}
      {filteredSections.length === 0 ? (
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3EC] text-[#5A6663] flex items-center justify-center mx-auto">
            <Layers size={24} />
          </div>
          <div>
            <h4 className="font-serif-title font-bold text-base text-[#1F2A28]">
              No meditation sections found
            </h4>
            <p className="text-xs text-[#5A6663] mt-1">
              {searchQuery
                ? `No sections matching "${searchQuery}".`
                : 'Create your first meditation section to offer specialized audio series.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNewSection}
            className="px-4 py-2 rounded-xl bg-[#1F5F78] text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#184c60]"
          >
            <Plus size={14} />
            <span>Create First Section</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((sec) => {
            const sectionItems = allItems.filter((i) => i.sectionId === sec.id);
            const freeItems = sectionItems.filter((i) => i.access === 'free');
            const paidItems = sectionItems.filter((i) => i.access === 'paid');
            const isExpanded = expandedSectionId === sec.id;

            return (
              <div
                key={sec.id}
                className="bg-white border border-[#E6DCCB] rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-[#1F5F78]/30"
              >
                {/* Section Summary Bar */}
                <div
                  onClick={() => toggleSectionAccordion(sec.id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none hover:bg-[#F7F3EC]/30 transition-colors"
                >
                  {/* Left: Section identity & metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#5A6663] px-2 py-0.5 rounded-md bg-[#F7F3EC] border border-[#E6DCCB]">
                        #{sec.sortOrder}
                      </span>
                      <h4 className="font-serif-title font-bold text-base text-[#1F2A28] truncate">
                        {sec.title}
                      </h4>
                      {sec.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          {sec.badge}
                        </span>
                      )}
                      <span
                        onClick={(e) => handleToggleSectionPublish(sec, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          sec.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {sec.isPublished ? '● Published' : '○ Draft'}
                      </span>
                    </div>

                    {sec.subtitle && (
                      <p className="text-xs text-[#5A6663] line-clamp-1">{sec.subtitle}</p>
                    )}

                    {sec.pricingTagline && (
                      <p className="text-[11px] text-[#1F5F78] font-medium flex items-center gap-1">
                        <span>Tagline:</span>
                        <span className="italic">{sec.pricingTagline}</span>
                      </p>
                    )}
                  </div>

                  {/* Center: Pricing Plan Pill (Key User Requirement) */}
                  <div className="flex flex-wrap items-center gap-2 lg:px-4">
                    <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCCB] text-center">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#5A6663]">
                        {sec.pricingType === 'standalone'
                          ? 'Standalone Section'
                          : sec.pricingType === 'subscription'
                          ? 'Included in Pro'
                          : 'Free Access'}
                      </div>
                      <div className="font-mono font-bold text-sm text-[#1F2A28] mt-0.5">
                        {sec.priceDisplay || sec.priceAed || 'AED 49'}
                      </div>
                      {sec.priceUsd && sec.pricingType === 'standalone' && (
                        <div className="text-[9px] text-[#5A6663] font-mono">{sec.priceUsd}</div>
                      )}
                    </div>

                    {/* Audio counts pills */}
                    <div className="flex flex-col gap-1 text-[11px] font-medium">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Sparkles size={11} className="text-emerald-600" />
                        <span>{freeItems.length} Free {freeItems.length === 1 ? 'Audio' : 'Audios'}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Lock size={11} className="text-amber-600" />
                        <span>{paidItems.length} Paid {paidItems.length === 1 ? 'Audio' : 'Audios'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenNewAudio(sec, e)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#1F5F78] text-[#1F5F78] hover:bg-[#1F5F78] hover:text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Plus size={13} />
                      <span>Add Audio</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenEditSection(sec, e)}
                      className="p-2 rounded-xl text-[#5A6663] hover:text-[#1F2A28] hover:bg-[#EFE9DF] transition-colors cursor-pointer"
                      title="Edit Section Settings & Pricing"
                    >
                      <Edit2 size={15} />
                    </button>

                    <div className="p-1 text-[#5A6663]">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Audio Items Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#E6DCCB] bg-[#FAF7F2]/60 p-5 space-y-4">
                    {/* Drawer Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DCCB]/60 pb-3">
                      <div>
                        <h5 className="font-serif-title font-bold text-sm text-[#1F2A28] flex items-center gap-2">
                          <Music size={15} className="text-[#1F5F78]" />
                          <span>Audios in {sec.title}</span>
                          <span className="text-xs text-[#5A6663] font-normal font-sans">
                            ({sectionItems.length} total: {freeItems.length} free, {paidItems.length} paid)
                          </span>
                        </h5>
                        <p className="text-[11px] text-[#5A6663] mt-0.5">
                          Toggle any audio between Free and Paid. Free audios stream publicly; Paid audios require purchase.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenNewAudio(sec)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs self-start sm:self-auto"
                      >
                        <Plus size={14} />
                        <span>Add Audio to Section</span>
                      </button>
                    </div>

                    {/* Audio items table / cards */}
                    {sectionItems.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#E6DCCB] space-y-2">
                        <Music size={20} className="mx-auto text-stone-400" />
                        <div className="text-xs font-semibold text-[#1F2A28]">
                          No audio tracks added to this section yet
                        </div>
                        <p className="text-[11px] text-[#5A6663]">
                          Add free sample audios to drive conversion, and paid audios for the full meditation series.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenNewAudio(sec)}
                          className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#1F5F78] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add Free or Paid Audio</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sectionItems
                          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                          .map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-[#E6DCCB] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1F5F78]/40 transition-all shadow-2xs"
                            >
                              {/* Audio info */}
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-[#F7F3EC] text-[#5A6663] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-[#E6DCCB]">
                                  {item.sortOrder}
                                </span>

                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-xs text-[#1F2A28] truncate">
                                      {item.title}
                                    </span>

                                    {/* FREE vs PAID TOGGLE BADGE */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleAudioAccess(item, e)}
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                                        item.access === 'free'
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                      }`}
                                      title="Click to switch between Free and Paid"
                                    >
                                      {item.access === 'free' ? (
                                        <>
                                          <Sparkles size={10} />
                                          <span>FREE AUDIO</span>
                                        </>
                                      ) : (
                                        <>
                                          <Lock size={10} />
                                          <span>PAID AUDIO</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Publication badge */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleAudioPublish(item, e)}
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                        item.isPublished
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-stone-100 text-stone-500'
                                      }`}
                                      title="Toggle published status"
                                    >
                                      {item.isPublished ? 'Live' : 'Draft'}
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5A6663]">
                                    {item.subtitle && <span>{item.subtitle}</span>}
                                    <span className="flex items-center gap-1 font-mono text-[10px]">
                                      <Clock size={11} />
                                      <span>{item.durationFormatted || '15:00'}</span>
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      {item.audioBucket || (item.access === 'free' ? 'sleep-audio-free' : 'sleep-audio-pro')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Audio Actions */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditAudio(item, sec)}
                                  className="p-1.5 rounded-lg text-[#5A6663] hover:text-[#1F2A28] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
                                  title="Edit audio details and upload file"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAudio(item.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete audio track"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Editor Modal */}
      {isSectionModalOpen && (
        <SectionEditorModal
          section={editingSection}
          isOpen={isSectionModalOpen}
          onClose={() => {
            setIsSectionModalOpen(false);
            setEditingSection(null);
          }}
          onSave={handleSaveSection}
          onDelete={editingSection ? handleDeleteSection : undefined}
          existingCount={sections.length}
        />
      )}

      {/* Section Audio Modal */}
      {isAudioModalOpen && (
        <SectionAudioModal
          item={editingAudioItem}
          section={targetAudioSection}
          allSections={sections}
          isOpen={isAudioModalOpen}
          onClose={() => {
            setIsAudioModalOpen(false);
            setEditingAudioItem(null);
            setTargetAudioSection(null);
          }}
          onSave={handleSaveAudio}
          onDelete={editingAudioItem ? handleDeleteAudio : undefined}
          existingCount={
            targetAudioSection
              ? allItems.filter((i) => i.sectionId === targetAudioSection.id).length
              : 0
          }
        />
      )}
    </div>
  );
};
