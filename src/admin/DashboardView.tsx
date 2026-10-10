import React from 'react';
import {
  Music,
  Sparkles,
  Crown,
  Headphones,
  FolderTree,
  FileQuestion,
  Activity,
  Users,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { AdminSection } from './adminNavigation';

interface DashboardStats {
  publishedTracks: number;
  freeTracks: number;
  proTracks: number;
  audiobookChapters: number;
  categories: number;
  drafts: number;
  plays7d: number;
  members: number;
  activeProMembers: number;
}

export const DASHBOARD_SUBTITLE = 'What is published, and what is waiting on you.';

interface DashboardViewProps {
  onNavigateSection: (section: AdminSection) => void;
  stats?: Partial<DashboardStats>;
  onQuickAction?: (action: 'new_track' | 'new_chapter' | 'new_category' | 'edit_home') => void;
  subtitle?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateSection,
  stats: customStats,
  onQuickAction,
}) => {
  const stats: DashboardStats = {
    publishedTracks: customStats?.publishedTracks ?? 9,
    freeTracks: customStats?.freeTracks ?? 3,
    proTracks: customStats?.proTracks ?? 6,
    audiobookChapters: customStats?.audiobookChapters ?? 45,
    categories: customStats?.categories ?? 3,
    drafts: customStats?.drafts ?? 0,
    plays7d: customStats?.plays7d ?? 482,
    members: customStats?.members ?? 124,
    activeProMembers: customStats?.activeProMembers ?? 89,
  };

  const statCards: Array<{
    id: string;
    label: string;
    value: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    section: AdminSection;
    color: string;
    badge?: string;
  }> = [
    {
      id: 'published_tracks',
      label: 'Published tracks',
      value: stats.publishedTracks,
      icon: Music,
      section: 'tracks',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'free_tracks',
      label: 'Free tracks',
      value: stats.freeTracks,
      icon: Sparkles,
      section: 'tracks',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'Zero login',
    },
    {
      id: 'pro_tracks',
      label: 'PRO tracks',
      value: stats.proTracks,
      icon: Crown,
      section: 'tracks',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'Sovereign',
    },
    {
      id: 'audiobook_chapters',
      label: 'Audiobook chapters',
      value: stats.audiobookChapters,
      icon: Headphones,
      section: 'chapters',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badge: 'Ch 1-45',
    },
    {
      id: 'categories',
      label: 'Categories',
      value: stats.categories,
      icon: FolderTree,
      section: 'categories',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      id: 'drafts',
      label: 'Drafts',
      value: stats.drafts,
      icon: FileQuestion,
      section: 'tracks',
      color: 'bg-stone-100 text-stone-700 border-stone-200',
    },
    {
      id: 'plays_7d',
      label: 'Plays in the last 7 days',
      value: stats.plays7d,
      icon: Activity,
      section: 'analytics',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      id: 'members',
      label: 'Members',
      value: stats.members,
      icon: Users,
      section: 'members',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'active_pro_members',
      label: 'Active PRO members',
      value: stats.activeProMembers,
      icon: Award,
      section: 'members',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: '71.8% PRO',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. GRID OF STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={() => onNavigateSection(card.section)}
              className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-[#1F5F78]/40 transition-all text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#5A6663]">
                    {card.label}
                  </span>
                  {card.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#F7F3EC] text-[#5A6663] rounded border border-[#E6DCCB]">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold font-mono text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#1F5F78] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View in {card.section.replace('_', ' ')}</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${card.color}`}>
                <Icon size={20} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. "ADD SOMETHING" QUICK ACTIONS CARD */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DCCB]/60 pb-3">
          <div>
            <h3 className="font-serif-title font-bold text-lg text-[#1F2A28]">
              Add something
            </h3>
            <p className="text-xs text-[#5A6663]">
              Quickly create new catalogue content or adjust the consumer shell.
            </p>
          </div>
          <button
            onClick={() => {
              if (onQuickAction) onQuickAction('edit_home');
              else onNavigateSection('screen_home');
            }}
            className="text-xs font-semibold text-[#1F5F78] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Edit the home screen</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              if (onQuickAction) onQuickAction('new_track');
              else onNavigateSection('tracks');
            }}
            className="p-4 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 hover:bg-[#DCE9F0]/30 hover:border-[#1F5F78]/50 transition-all text-left flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="text-xs font-bold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors">
                New track
              </div>
              <div className="text-[11px] text-[#5A6663]">
                Upload soundscape, SOS, or body scan
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#1F5F78] text-white flex items-center justify-center shrink-0">
              <Plus size={16} />
            </div>
          </button>

          <button
            onClick={() => {
              if (onQuickAction) onQuickAction('new_chapter');
              else onNavigateSection('chapters');
            }}
            className="p-4 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 hover:bg-[#DCE9F0]/30 hover:border-[#1F5F78]/50 transition-all text-left flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="text-xs font-bold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors">
                New chapter
              </div>
              <div className="text-[11px] text-[#5A6663]">
                Add or re-link audiobook audio
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#1F5F78] text-white flex items-center justify-center shrink-0">
              <Plus size={16} />
            </div>
          </button>

          <button
            onClick={() => {
              if (onQuickAction) onQuickAction('new_category');
              else onNavigateSection('categories');
            }}
            className="p-4 rounded-xl border border-[#E6DCCB] bg-[#F7F3EC]/50 hover:bg-[#DCE9F0]/30 hover:border-[#1F5F78]/50 transition-all text-left flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="text-xs font-bold text-[#1F2A28] group-hover:text-[#1F5F78] transition-colors">
                New category
              </div>
              <div className="text-[11px] text-[#5A6663]">
                Create a library partition
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#1F5F78] text-white flex items-center justify-center shrink-0">
              <Plus size={16} />
            </div>
          </button>
        </div>
      </div>

      {/* 3. HEALTH & SYSTEM SUMMARY CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Curated Catalog Summary */}
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
              Curated Sleep Library Summary
            </h4>
            <span className="text-[10px] font-mono font-bold text-[#3C7858] bg-[#E8F1EC] px-2 py-0.5 rounded-full">
              Solfeggio & Sleepcasts Removed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Soundscapes & Nature</span>
              <span className="font-semibold font-mono text-[#1F2A28]">5 tracks</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Body Scan & Somatic</span>
              <span className="font-semibold font-mono text-[#1F2A28]">3 tracks</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Acute SOS (90s Mind Silencer)</span>
              <span className="font-semibold font-mono text-[#1F2A28]">1 track</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-[#1F2A28]">Total Active Catalog</span>
              <span className="font-bold font-mono text-[#1F5F78]">9 tracks (3 Free, 6 PRO)</span>
            </div>
          </div>
        </div>

        {/* Listening Engagement Pulse */}
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
              Audiobook & Engagement Pulse
            </h4>
            <span className="text-[10px] font-mono text-[#1F5F78] bg-[#DCE9F0] px-2 py-0.5 rounded-full font-semibold">
              Live Metrics
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Audiobook Total Chapters</span>
              <span className="font-semibold font-mono text-[#1F2A28]">45 Chapters (Parts 1-5)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Free Preview Chapter</span>
              <span className="font-semibold font-mono text-[#3C7858]">Chapter 1 (25m Sample)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E6DCCB]/40">
              <span className="text-[#5A6663]">Audiobook Launch Price</span>
              <span className="font-semibold font-mono text-[#8E6724]">AED 39 (Reg AED 59)</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-[#1F2A28]">Sovereign Conversion</span>
              <span className="font-bold font-mono text-[#1F5F78] flex items-center gap-1">
                <TrendingUp size={13} className="text-[#3C7858]" />
                71.8% PRO Member Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
