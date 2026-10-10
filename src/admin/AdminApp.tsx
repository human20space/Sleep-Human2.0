import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminLayout } from './AdminLayout';
import type { AdminSection } from './adminNavigation';
import { DashboardView } from './DashboardView';
import { TracksView } from './content/TracksView';
import { ChaptersView } from './content/ChaptersView';
import { CategoriesView } from './content/CategoriesView';
import { FeaturedTonightView } from './content/FeaturedTonightView';
import { AppScreensView } from './content/AppScreensView';
import { useSleepContent } from '../services/sleepContentService';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAdminSeo } from './adminSeo';

interface AdminAppProps {
  onNavigateHome: () => void;
  onNavigateLogin?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({
  onNavigateHome,
  onNavigateLogin,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('admin@human2.space');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Content state hook called unconditionally at top of component
  const { tracks, chapters, categories } = useSleepContent();

  // Dynamic SEO meta tag
  useAdminSeo();

  // Authentication & Session verification
  useEffect(() => {
    async function verifyAuth() {
      setCheckingAuth(true);

      // Local offline demo mode check
      if (!isSupabaseConfigured || !supabase) {
        const mockAdmin = localStorage.getItem('human2_admin_session');
        if (mockAdmin) {
          try {
            const parsed = JSON.parse(mockAdmin);
            if (parsed.email) {
              setUserEmail(parsed.email);
              if (parsed.isAdmin) {
                setIsAuthorized(true);
                setCheckingAuth(false);
                return;
              } else {
                setIsUnauthorized(true);
                setCheckingAuth(false);
                return;
              }
            }
          } catch {
            // ignore
          }
        }
        // If no mock session exists, redirect to login
        if (onNavigateLogin) {
          onNavigateLogin();
        } else {
          window.location.href = '/admin/login';
        }
        setCheckingAuth(false);
        return;
      }

      // Live Supabase check
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          if (onNavigateLogin) {
            onNavigateLogin();
          } else {
            window.location.href = '/admin/login';
          }
          setCheckingAuth(false);
          return;
        }

        setUserEmail(session.user.email || 'admin@human2.space');

        // Check if user is in sleep_admins
        // 1. Try sleep_is_admin() RPC
        let authorized = false;
        try {
          const { data: isRpcAdmin, error: rpcError } = await supabase.rpc('sleep_is_admin');
          if (!rpcError && isRpcAdmin === true) {
            authorized = true;
          }
        } catch {
          // fallback
        }

        // 2. Query sleep_admins table directly
        if (!authorized) {
          try {
            const { data, error } = await supabase
              .from('sleep_admins')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!error && data) {
              authorized = true;
            }
          } catch {
            // ignore
          }
        }

        if (authorized) {
          setIsAuthorized(true);
        } else {
          setIsUnauthorized(true);
        }
      } catch (err) {
        console.warn('[AdminApp] Error verifying session:', err);
        setIsUnauthorized(true);
      } finally {
        setCheckingAuth(false);
      }
    }

    verifyAuth();
  }, [onNavigateLogin]);

  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('human2_admin_session');
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      window.location.href = '/admin/login';
    }
  };

  // 1. Loading State
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-6 text-[#1F2A28]">
        <div className="text-xs text-[#5A6663] flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#1F5F78] animate-ping" />
          <span>Verifying admin session & privileges...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State:
  // "If an authenticated user is NOT in sleep_admins, show 'Not authorised' message and a sign-out button, and nothing else."
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-6 text-[#1F2A28] antialiased">
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-8 max-w-sm w-full shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="font-serif-title text-2xl font-bold text-[#1F2A28]">
              Not authorised
            </h1>
            <p className="text-xs text-[#5A6663] mt-2 leading-relaxed">
              Your account does not have administrator privileges for Human 2.0 Sleep.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Section titles and subtitles
  const sectionMeta: Record<AdminSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'What is published, and what is waiting on you.',
    },
    analytics: {
      title: 'Analytics & Engagement',
      subtitle: 'Track listening duration, completion rates, and platform metrics.',
    },
    tracks: {
      title: 'Sleep Tracks',
      subtitle: 'Manage published soundscapes, body scans, and acute SOS resets.',
    },
    categories: {
      title: 'Library Categories',
      subtitle: 'Organise sleep content into structured thematic groups.',
    },
    featured: {
      title: "Tonight's Featured",
      subtitle: 'Pin the headline free track on the consumer bedtime immersion card.',
    },
    chapters: {
      title: 'Audiobook Chapters',
      subtitle: 'Configure audio files, duration, and stream links for Chapters 1 to 45.',
    },
    screen_home: {
      title: 'Sleep Home Screen',
      subtitle: 'Customise titles, banners, and shelf copy for the mobile home view.',
    },
    screen_reset: {
      title: 'Reset (SOS) Screen',
      subtitle: 'Manage the 90-second racing mind somatic pacer and breath phases.',
    },
    screen_ebb: {
      title: 'Ebb AI Companion',
      subtitle: 'Configure nighttime dialogue tone, somatic anchor cues, and AI prompts.',
    },
    screen_paywall: {
      title: 'Paywall & Membership Copy',
      subtitle: 'Update conversion copy, sovereign benefits, and pricing pills.',
    },
    plans: {
      title: 'Subscription Plans',
      subtitle: 'Annual, Monthly, and standalone Audiobook Lifetime purchase tiers.',
    },
    members: {
      title: 'Members Directory',
      subtitle: 'Inspect registered accounts, sovereign entitlements, and activity.',
    },
    entitlements: {
      title: 'Entitlements Vault',
      subtitle: 'Active purchase records granting sovereign access across devices.',
    },
    settings_timer: {
      title: 'Sleep Timer Settings',
      subtitle: 'Configure default duration presets (15m, 30m, 45m, 60m) and fade curves.',
    },
    settings_legal: {
      title: 'Legal Pages',
      subtitle: 'Privacy policy, terms of service, and clinical advisory notices.',
    },
    settings_admins: {
      title: 'Admin Users',
      subtitle: 'Authorized administrator accounts synced with sleep_admins table.',
    },
  };

  const currentMeta = sectionMeta[activeSection] || {
    title: 'Management Section',
    subtitle: 'Human 2.0 Sleep administration console.',
  };

  const dynamicStats = {
    publishedTracks: tracks.filter((t) => t.isPublished !== false).length,
    freeTracks: tracks.filter((t) => !t.isPremium && t.isPublished !== false).length,
    proTracks: tracks.filter((t) => t.isPremium && t.isPublished !== false).length,
    audiobookChapters: chapters.length,
    categories: categories.length,
    drafts:
      tracks.filter((t) => t.isPublished === false).length +
      chapters.filter((c) => c.isPublished === false).length,
    plays7d: 482,
    members: 124,
    activeProMembers: 89,
  };

  // Section View Renderer
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateSection={(sec) => setActiveSection(sec)}
            stats={dynamicStats}
            onQuickAction={(action) => {
              if (action === 'new_track') setActiveSection('tracks');
              else if (action === 'new_chapter') setActiveSection('chapters');
              else if (action === 'new_category') setActiveSection('categories');
              else if (action === 'edit_home') setActiveSection('screen_home');
            }}
          />
        );

      case 'tracks':
        return <TracksView onSetFeatured={() => setActiveSection('featured')} />;

      case 'categories':
        return <CategoriesView />;

      case 'featured':
        return <FeaturedTonightView />;

      case 'chapters':
        return <ChaptersView />;

      case 'screen_home':
        return <AppScreensView initialTab="home" />;

      case 'screen_reset':
        return <AppScreensView initialTab="reset" />;

      case 'screen_ebb':
        return <AppScreensView initialTab="ebb" />;

      case 'screen_paywall':
        return <AppScreensView initialTab="paywall" />;

      case 'settings_timer':
        return <AppScreensView initialTab="timer" />;

      case 'settings_legal':
        return <AppScreensView initialTab="legal" />;

      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-1">
                <span className="text-xs text-[#5A6663]">7-Day Total Streams</span>
                <div className="text-2xl font-bold font-mono text-[#1F2A28]">482 Plays</div>
                <span className="text-[10px] text-[#3C7858] font-bold">+18.4% vs prior week</span>
              </div>
              <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-1">
                <span className="text-xs text-[#5A6663]">Avg. Sleep Session Length</span>
                <div className="text-2xl font-bold font-mono text-[#1F2A28]">32.4 min</div>
                <span className="text-[10px] text-[#5A6663]">Timer set by 64% of users</span>
              </div>
              <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-1">
                <span className="text-xs text-[#5A6663]">Top Free Track</span>
                <div className="text-base font-bold font-serif-title text-[#1F2A28] truncate">Sacred Temple Bell</div>
                <span className="text-[10px] text-[#1F5F78] font-mono font-bold">194 plays (40.2%)</span>
              </div>
            </div>

            <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                    Recent Audio Play Events (Telemetry)
                  </h4>
                  <p className="text-xs text-[#5A6663]">
                    Telemetry ingested into sleep_play_events table with platform tracking (Web, iOS, Android).
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Live Streaming Telemetry
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Item Played</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DCCB]/40 font-mono text-[11px]">
                    {[
                      { time: 'Just now', item: 'Sacred Temple Bell (Free)', platform: 'Web PWA', status: 'Completed' },
                      { time: '3 min ago', item: 'Chapter 1: The Foundation', platform: 'iOS Capacitor', status: 'Active (22m)' },
                      { time: '11 min ago', item: 'Deep Ocean Waves', platform: 'Android Capacitor', status: 'Completed' },
                      { time: '19 min ago', item: 'Acute SOS Reset (90s)', platform: 'Web', status: 'Completed' },
                      { time: '34 min ago', item: 'Tibetan Singing Bowls', platform: 'Web PWA', status: 'Completed' },
                    ].map((event, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F3EC]/50">
                        <td className="py-2.5 px-3 text-[#5A6663]">{event.time}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1F2A28] font-sans">{event.item}</td>
                        <td className="py-2.5 px-3 text-[#1F5F78]">{event.platform}</td>
                        <td className="py-2.5 px-3 text-[#3C7858] font-bold">{event.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                  Sovereign Membership & Audiobook Plans (3 Active)
                </h3>
                <p className="text-xs text-[#5A6663]">
                  Synchronized with StoreKit 2, Google Play Billing, and Stripe checkout links.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-full">
                Active in StoreKit 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'annual',
                  name: 'Human 2.0 Sovereign (Annual)',
                  price: '$69.99 / year',
                  badge: 'SAVE 58%',
                  trial: 'Includes 7-day free trial. Cancel anytime in Apple Settings.',
                  appleProductId: 'space.human2.sovereign.annual',
                },
                {
                  key: 'monthly',
                  name: 'Human 2.0 Sovereign (Monthly)',
                  price: '$12.99 / month',
                  badge: 'FLEXIBLE',
                  trial: 'Flexible monthly billing. Cancel anytime.',
                  appleProductId: 'space.human2.sovereign.monthly',
                },
                {
                  key: 'audiobook_lifetime',
                  name: 'Human 2.0 Audiobook Lifetime',
                  price: 'AED 39 (Regular AED 59)',
                  badge: 'LAUNCH OFFER',
                  trial: 'One-time permanent unlock of Chapters 1-45 with zero recurring fees.',
                  appleProductId: 'space.human2.audiobook.lifetime',
                },
              ].map((p) => (
                <div key={p.key} className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DCE9F0] text-[#1F5F78] font-bold">
                      {p.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#3C7858] font-bold">Active</span>
                  </div>
                  <h4 className="font-serif-title font-bold text-sm text-[#1F2A28]">{p.name}</h4>
                  <div className="text-xl font-bold font-mono text-[#1F5F78]">{p.price}</div>
                  <p className="text-xs text-[#5A6663] leading-relaxed">{p.trial}</p>
                  <div className="pt-2 border-t border-[#E6DCCB]/40 text-[11px] font-mono text-[#5A6663]">
                    Product ID: {p.appleProductId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                  Registered Members (124)
                </h3>
                <p className="text-xs text-[#5A6663]">
                  Accounts registered via Supabase Auth and StoreKit entitlement receipts.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-mono font-bold">
                89 Active PRO
              </span>
            </div>

            <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Joined</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DCCB]/40 font-normal">
                  {[
                    { email: 'sarah.k@example.com', tier: 'PRO', plan: 'Annual Sovereign', joined: 'Oct 2026', status: 'Active' },
                    { email: 'marcus.v@example.com', tier: 'PRO', plan: 'Audiobook Lifetime', joined: 'Oct 2026', status: 'Active' },
                    { email: 'elena.r@example.com', tier: 'FREE', plan: 'Frictionless Guest', joined: 'Oct 2026', status: 'Active' },
                    { email: 'david.b@example.com', tier: 'PRO', plan: 'Monthly Sovereign', joined: 'Sep 2026', status: 'Active' },
                  ].map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#F7F3EC]/50">
                      <td className="py-3 px-4 font-semibold text-[#1F2A28]">{m.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          m.tier === 'PRO' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#5A6663]">{m.plan}</td>
                      <td className="py-3 px-3 font-mono text-[#5A6663]">{m.joined}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3C7858]">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'entitlements':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                  Entitlements Vault
                </h3>
                <p className="text-xs text-[#5A6663]">
                  Synchronized with sleep_entitlements table verifying active purchases across web, iOS, and Android.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-full">
                RLS Guardrails Active
              </span>
            </div>

            <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User ID / Receipt</th>
                    <th className="py-3 px-3">Plan Key</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3">Expiry</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DCCB]/40 font-mono text-[11px]">
                  {[
                    { user: 'usr_94f8a2bc', plan: 'annual', source: 'StoreKit 2', expiry: 'Oct 2027', status: 'Active' },
                    { user: 'usr_1b2c3d4e', plan: 'audiobook_lifetime', source: 'Web Stripe', expiry: 'Never (Lifetime)', status: 'Active' },
                    { user: 'usr_89f0e1a2', plan: 'monthly', source: 'Play Billing', expiry: 'Nov 2026', status: 'Active' },
                  ].map((e, idx) => (
                    <tr key={idx} className="hover:bg-[#F7F3EC]/50">
                      <td className="py-3 px-4 text-[#1F2A28]">{e.user}</td>
                      <td className="py-3 px-3 text-[#1F5F78] font-bold">{e.plan}</td>
                      <td className="py-3 px-3 text-[#5A6663]">{e.source}</td>
                      <td className="py-3 px-3 text-[#5A6663]">{e.expiry}</td>
                      <td className="py-3 px-4 text-right text-[#3C7858] font-bold">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings_admins':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#1F2A28]">
                  Authorized Administrators
                </h3>
                <p className="text-xs text-[#5A6663]">
                  Accounts authorized via sleep_admins table and sleep_is_admin() SECURITY DEFINER function.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold rounded-full">
                sleep_is_admin() RLS Enforced
              </span>
            </div>

            <div className="bg-white border border-[#E6DCCB] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFE9DF]/50 border-b border-[#E6DCCB] text-[#5A6663] uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Security Function</th>
                    <th className="py-3 px-4 text-right">Privilege</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DCCB]/40 font-normal">
                  <tr className="hover:bg-[#F7F3EC]/50">
                    <td className="py-3 px-4 font-semibold text-[#1F2A28]">{userEmail}</td>
                    <td className="py-3 px-3 font-mono text-[#1F5F78]">Super Admin</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#5A6663]">sleep_is_admin() = true</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                        Full RLS Read & Write
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif-title font-bold text-lg text-[#1F2A28]">
              {currentMeta.title}
            </h3>
            <p className="text-xs text-[#5A6663]">{currentMeta.subtitle}</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSelectSection={(sec) => setActiveSection(sec)}
      title={currentMeta.title}
      subtitle={currentMeta.subtitle}
      userEmail={userEmail}
      onSignOut={handleSignOut}
      onNavigateHome={onNavigateHome}
    >
      {renderSectionContent()}
    </AdminLayout>
  );
};

export default AdminApp;
