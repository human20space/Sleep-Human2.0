import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  ExternalLink,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS, type AdminSection } from './adminNavigation';

import { useAdminSeo } from './adminSeo';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  title: string;
  subtitle: string;
  userEmail?: string;
  onSignOut: () => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeSection,
  onSelectSection,
  title,
  subtitle,
  userEmail = 'admin@human2.space',
  onSignOut,
  onNavigateHome,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic SEO meta tag
  useAdminSeo();

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setJumpModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && jumpModalOpen) {
        setJumpModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jumpModalOpen]);

  // All nav items flattened for search
  const allNavItems = ADMIN_NAV_GROUPS.flatMap((g) =>
    g.items.map((i) => ({ ...i, group: g.group }))
  );

  const filteredNavItems = searchQuery.trim()
    ? allNavItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.group.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNavItems;

  const handleSelectFromJump = (section: AdminSection) => {
    onSelectSection(section);
    setJumpModalOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1F2A28] flex flex-col font-sans select-none antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* MOBILE DRAWER OVERLAY */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50
            bg-[#EFE9DF] border-r border-[#E6DCCB]
            flex flex-col justify-between
            transition-all duration-200 ease-in-out
            ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${sidebarCollapsed ? 'md:w-16' : 'w-[228px] shrink-0'}
          `}
        >
          {/* Top Brand Header */}
          <div className="p-4 border-b border-[#E6DCCB] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#1F5F78] text-[#F7F3EC] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                H2
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-serif-title font-bold text-sm text-[#1F2A28] block truncate">
                    Human 2.0 Sleep
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#5A6663]">
                    Admin Console
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden text-[#5A6663] hover:text-[#1F2A28] p-1"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                {!sidebarCollapsed ? (
                  <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6663] px-2.5 pt-2 pb-1">
                    {group.group}
                  </h3>
                ) : (
                  <div className="h-2" />
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectSection(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`
                          w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                          transition-colors cursor-pointer text-left
                          ${
                            isActive
                              ? 'bg-[#DCE9F0] text-[#1F5F78] font-semibold'
                              : 'text-[#1F2A28] hover:bg-[#E6DCCB]/60'
                          }
                          ${sidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                      >
                        <Icon size={16} className={isActive ? 'text-[#1F5F78]' : 'text-[#5A6663]'} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer with Collapse Toggle */}
          <div className="p-3 border-t border-[#E6DCCB] hidden md:flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[10px] text-[#5A6663] font-mono">v2.0-admin</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#5A6663] hover:text-[#1F2A28] p-1.5 rounded-lg hover:bg-[#E6DCCB]/70 transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOP BAR */}
          <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-[#E6DCCB] px-4 md:px-6 flex items-center justify-between gap-3 shrink-0 z-10">
            {/* Left: Mobile Drawer Trigger / Desktop Collapse */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden text-[#1F2A28] p-1.5 rounded-lg hover:bg-[#EFE9DF] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex text-[#5A6663] hover:text-[#1F2A28] p-1.5 rounded-lg hover:bg-[#EFE9DF] transition-colors cursor-pointer"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>

            {/* Center: "Jump to..." Search Box (Ctrl+K) */}
            <div className="flex-1 max-w-md mx-2">
              <button
                onClick={() => setJumpModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F7F3EC] border border-[#E6DCCB] text-xs text-[#5A6663] hover:border-[#1F5F78]/50 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search size={14} className="text-[#5A6663]" />
                  <span>Jump to section...</span>
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E6DCCB] rounded text-[#5A6663]">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Right: View Site, User Email, Sign Out */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1F5F78] hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-[#DCE9F0]/40 transition-colors"
                title="Return to Human 2.0 app"
              >
                <span>View site</span>
                <ExternalLink size={13} />
              </button>

              <div className="hidden lg:block text-xs text-[#5A6663] font-mono px-2.5 py-1 bg-[#EFE9DF] border border-[#E6DCCB] rounded-lg max-w-[180px] truncate">
                {userEmail}
              </div>

              <button
                onClick={onSignOut}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6DCCB] text-xs font-medium text-[#1F2A28] hover:bg-[#EFE9DF] transition-colors cursor-pointer"
                title="Sign out of Admin Console"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>

          {/* PAGE BODY */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F7F3EC]">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* PAGE HEADER */}
              <div className="border-b border-[#E6DCCB]/60 pb-4">
                <h1 className="font-serif-title text-2xl md:text-3xl font-bold text-[#1F2A28] leading-tight">
                  {title}
                </h1>
                <p className="text-xs md:text-sm text-[#5A6663] mt-1">
                  {subtitle}
                </p>
              </div>

              {/* VIEW CONTENT */}
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* JUMP TO MODAL (CTRL+K) */}
      {jumpModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4 backdrop-blur-2xs">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-[#E6DCCB] rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-[#E6DCCB] flex items-center gap-2.5 bg-[#F7F3EC]/50">
              <Search size={16} className="text-[#5A6663]" />
              <input
                type="text"
                autoFocus
                placeholder="Search admin sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-[#1F2A28] placeholder-[#5A6663] focus:outline-none"
              />
              <button
                onClick={() => setJumpModalOpen(false)}
                className="text-[#5A6663] hover:text-[#1F2A28] p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-[#E6DCCB]/30">
              {filteredNavItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#5A6663]">
                  No matching admin sections found
                </div>
              ) : (
                filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectFromJump(item.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#DCE9F0]/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#EFE9DF] text-[#1F5F78] flex items-center justify-center">
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#1F2A28]">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-[#5A6663]">
                            {item.group}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-[#5A6663] group-hover:text-[#1F5F78] transition-colors" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-2.5 border-t border-[#E6DCCB] bg-[#F7F3EC] text-[10px] text-[#5A6663] flex items-center justify-between">
              <span>Use ↑ ↓ to navigate, ESC to close</span>
              <span className="font-mono">{filteredNavItems.length} sections</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
