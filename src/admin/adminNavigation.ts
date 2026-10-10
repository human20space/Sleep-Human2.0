import type React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Music,
  FolderTree,
  Sparkles,
  Headphones,
  Home,
  Zap,
  Bot,
  CreditCard,
  Award,
  Users,
  Key,
  Moon,
  FileText,
  Shield,
  Layers,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'analytics'
  | 'tracks'
  | 'categories'
  | 'featured'
  | 'sections'
  | 'chapters'
  | 'screen_home'
  | 'screen_reset'
  | 'screen_ebb'
  | 'screen_paywall'
  | 'plans'
  | 'members'
  | 'entitlements'
  | 'settings_timer'
  | 'settings_legal'
  | 'settings_admins';

export interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'SLEEP LIBRARY',
    items: [
      { id: 'tracks', label: 'Tracks', icon: Music },
      { id: 'categories', label: 'Categories', icon: FolderTree },
      { id: 'featured', label: "Tonight's Featured", icon: Sparkles },
    ],
  },
  {
    group: 'LISTEN',
    items: [
      { id: 'sections', label: 'Meditation Sections', icon: Layers },
      { id: 'chapters', label: 'Audiobook Chapters', icon: Headphones },
    ],
  },
  {
    group: 'APP SCREENS',
    items: [
      { id: 'screen_home', label: 'Sleep Home', icon: Home },
      { id: 'screen_reset', label: 'Reset (SOS)', icon: Zap },
      { id: 'screen_ebb', label: 'Ebb AI', icon: Bot },
      { id: 'screen_paywall', label: 'Paywall', icon: CreditCard },
    ],
  },
  {
    group: 'MEMBERSHIP',
    items: [
      { id: 'plans', label: 'Plans', icon: Award },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'entitlements', label: 'Entitlements', icon: Key },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { id: 'settings_timer', label: 'Sleep Timer', icon: Moon },
      { id: 'settings_legal', label: 'Legal Pages', icon: FileText },
      { id: 'settings_admins', label: 'Admin Users', icon: Shield },
    ],
  },
];
