import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ADMIN_NAV_GROUPS, type AdminSection } from '../../src/admin/adminNavigation.ts';
import { syncAdminRobotsMeta } from '../../src/admin/adminSeo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Phase 2 Verification: Admin Shell & Console Architecture', () => {

  test('1. Admin Routes Lazy-Loading & Shell Isolation Outside PhoneFrame', () => {
    const appTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/App.tsx'), 'utf-8');

    // Verify React.lazy() code splitting for Admin routes
    assert.ok(
      appTsx.includes("React.lazy(() => import('./admin/AdminApp'))"),
      'AdminApp must be loaded via React.lazy dynamic import'
    );
    assert.ok(
      appTsx.includes("React.lazy(() => import('./admin/AdminLogin'))"),
      'AdminLogin must be loaded via React.lazy dynamic import'
    );

    // Verify Suspense boundaries with fallback
    assert.ok(appTsx.includes('<Suspense'), 'Admin routes must be wrapped in Suspense');

    // Verify PhoneFrame is only inside AppContent (consumer app), NOT wrapping Admin routes
    assert.ok(appTsx.includes('<PhoneFrame'), 'PhoneFrame must exist for consumer app');
    assert.ok(
      !appTsx.includes('<PhoneFrame>\n        <AdminApp') &&
      !appTsx.includes('<PhoneFrame><AdminApp'),
      'AdminApp must NOT be wrapped inside PhoneFrame'
    );
    assert.ok(
      !appTsx.includes('<PhoneFrame>\n        <AdminLogin') &&
      !appTsx.includes('<PhoneFrame><AdminLogin'),
      'AdminLogin must NOT be wrapped inside PhoneFrame'
    );

    // Verify routes handling /admin and /admin/login
    assert.ok(appTsx.includes("'/admin/login'"), 'Must handle /admin/login route');
    assert.ok(appTsx.includes("'/admin'"), 'Must handle /admin route');
  });

  test('2. Service Worker Bypass for /admin requests', () => {
    const swJs = fs.readFileSync(path.join(PROJECT_ROOT, 'public/sw.js'), 'utf-8');

    // Verify Service Worker bypass on /admin
    assert.ok(
      swJs.includes("url.pathname.startsWith('/admin')"),
      'sw.js must explicitly check for url.pathname.startsWith("/admin")'
    );

    // Verify it returns immediately without intercepting or caching
    const bypassIndex = swJs.indexOf("url.pathname.startsWith('/admin')");
    assert.ok(bypassIndex > 0, 'Bypass check must exist in sw.js');
    const snippet = swJs.slice(bypassIndex, bypassIndex + 120);
    assert.ok(snippet.includes('return;'), 'Bypass check must return immediately');
  });

  test('3. Dynamic SEO Robots Meta Tag Management', () => {
    const seoTs = fs.readFileSync(path.join(PROJECT_ROOT, 'src/admin/adminSeo.ts'), 'utf-8');
    assert.ok(seoTs.includes('noindex, nofollow'), 'adminSeo must specify noindex, nofollow');
    assert.ok(seoTs.includes("meta.name = 'robots'"), 'adminSeo must configure robots meta tag');

    // Simulate DOM environment if in Node
    const mockHead = {
      elements: [] as Array<{ name: string; content: string; remove: () => void }>,
      appendChild(el: any) {
        this.elements.push(el);
      },
      querySelector(selector: string) {
        if (selector === 'meta[name="robots"]') {
          return this.elements.find(e => e.name === 'robots') || null;
        }
        return null;
      },
    };

    (globalThis as any).document = {
      createElement(tag: string) {
        const el: any = { name: '', content: '' };
        el.remove = () => {
          const idx = mockHead.elements.indexOf(el);
          if (idx >= 0) mockHead.elements.splice(idx, 1);
        };
        return el;
      },
      head: mockHead,
      querySelector: (sel: string) => mockHead.querySelector(sel),
    };

    // When on admin route: must create noindex tag
    syncAdminRobotsMeta(true);
    let robotsTag = (globalThis as any).document.querySelector('meta[name="robots"]');
    assert.ok(robotsTag, 'Robots meta tag must exist on admin route');
    assert.equal(robotsTag.content, 'noindex, nofollow');

    // When leaving admin route: must clean up tag
    syncAdminRobotsMeta(false);
    robotsTag = (globalThis as any).document.querySelector('meta[name="robots"]');
    assert.equal(robotsTag, null, 'Robots meta tag must be removed when leaving admin route');
  });

  test('4. Authentication & Authorization Guardrails in AdminLogin and AdminApp', () => {
    const loginTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/admin/AdminLogin.tsx'), 'utf-8');
    const appTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/admin/AdminApp.tsx'), 'utf-8');

    // Verify signInWithPassword usage
    assert.ok(
      loginTsx.includes('supabase.auth.signInWithPassword'),
      'AdminLogin must authenticate with supabase.auth.signInWithPassword'
    );

    // Verify sleep_is_admin() and sleep_admins checks
    assert.ok(loginTsx.includes("rpc('sleep_is_admin')"), 'AdminLogin must check sleep_is_admin RPC');
    assert.ok(loginTsx.includes("from('sleep_admins')"), 'AdminLogin must check sleep_admins table');
    assert.ok(appTsx.includes("rpc('sleep_is_admin')"), 'AdminApp must verify sleep_is_admin RPC');
    assert.ok(appTsx.includes("from('sleep_admins')"), 'AdminApp must verify sleep_admins table');

    // Verify unauthorized state copy: "Not authorised" and sign-out button
    assert.ok(loginTsx.includes('Not authorised'), 'AdminLogin must render "Not authorised" on non-admin user');
    assert.ok(loginTsx.includes('Sign out'), 'AdminLogin unauthorized state must include a sign-out button');
    assert.ok(appTsx.includes('Not authorised'), 'AdminApp must render "Not authorised" on non-admin user');
    assert.ok(appTsx.includes('Sign out'), 'AdminApp unauthorized state must include a sign-out button');
  });

  test('5. Admin Layout Design Tokens & Navigation Groups', () => {
    const layoutTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/admin/AdminLayout.tsx'), 'utf-8');

    // Fixed sidebar 228px width
    assert.ok(layoutTsx.includes('228px'), 'AdminLayout must enforce 228px sidebar width');

    // Color tokens
    assert.ok(layoutTsx.includes('#EFE9DF'), 'Sidebar background must be #EFE9DF');
    assert.ok(layoutTsx.includes('#DCE9F0'), 'Active pill background must be #DCE9F0');
    assert.ok(layoutTsx.includes('#1F5F78'), 'Accent/text color must be #1F5F78');
    assert.ok(layoutTsx.includes('#F7F3EC'), 'Page background must be #F7F3EC');
    assert.ok(layoutTsx.includes('#E6DCCB'), 'Border color must be #E6DCCB');
    assert.ok(layoutTsx.includes('#5A6663'), 'Muted text color must be #5A6663');

    // Brand and top bar controls
    assert.ok(layoutTsx.includes('Human 2.0 Sleep'), 'Header must include brand title Human 2.0 Sleep');
    assert.ok(layoutTsx.includes('Ctrl+K'), 'Top bar must include Ctrl+K search shortcut');
    assert.ok(layoutTsx.includes('View site'), 'Top bar must include "View site" link');
    assert.ok(layoutTsx.includes('Sign out'), 'Top bar must include sign-out button');

    // Navigation groups verification
    const expectedGroups = [
      'OVERVIEW',
      'SLEEP LIBRARY',
      'LISTEN',
      'APP SCREENS',
      'MEMBERSHIP',
      'SETTINGS',
    ];

    assert.equal(ADMIN_NAV_GROUPS.length, 6, 'Must define exactly 6 navigation groups');
    for (let i = 0; i < expectedGroups.length; i++) {
      assert.equal(ADMIN_NAV_GROUPS[i].group, expectedGroups[i], `Group ${i} must match ${expectedGroups[i]}`);
    }

    // Verify all 16 navigation sections
    const allSections = ADMIN_NAV_GROUPS.flatMap(g => g.items.map(item => item.id));
    const expectedSections: AdminSection[] = [
      'dashboard',
      'analytics',
      'tracks',
      'categories',
      'featured',
      'chapters',
      'screen_home',
      'screen_reset',
      'screen_ebb',
      'screen_paywall',
      'plans',
      'members',
      'entitlements',
      'settings_timer',
      'settings_legal',
      'settings_admins',
    ];

    assert.equal(allSections.length, 16, 'Must have exactly 16 admin sections');
    assert.deepEqual(allSections, expectedSections);
  });

  test('6. Dashboard View Metrics & "Add something" Quick Actions Card', () => {
    const dashTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/admin/DashboardView.tsx'), 'utf-8');

    // Subtitle requirement
    assert.ok(
      dashTsx.includes('What is published, and what is waiting on you.'),
      'DashboardView must display exact subtitle "What is published, and what is waiting on you."'
    );

    // 9 stat card labels
    const expectedLabels = [
      'Published tracks',
      'Free tracks',
      'PRO tracks',
      'Audiobook chapters',
      'Categories',
      'Drafts',
      'Plays in the last 7 days',
      'Members',
      'Active PRO members',
    ];

    for (const label of expectedLabels) {
      assert.ok(dashTsx.includes(label), `DashboardView must include stat card "${label}"`);
    }

    // "Add something" quick actions
    assert.ok(dashTsx.includes('Add something'), 'Must include "Add something" card');
    assert.ok(dashTsx.includes('New track'), 'Must include "New track" quick action');
    assert.ok(dashTsx.includes('New chapter'), 'Must include "New chapter" quick action');
    assert.ok(dashTsx.includes('New category'), 'Must include "New category" quick action');
    assert.ok(dashTsx.includes('Edit the home screen'), 'Must include "Edit the home screen" quick action');
  });

  test('7. Content Catalog & Screen Removals Completeness', () => {
    const catalogTs = fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/sleepCatalogData.ts'), 'utf-8');
    const extMindfulnessTs = fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/extendedMindfulnessData.ts'), 'utf-8');
    const homeScreenTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/HomeScreen.tsx'), 'utf-8');

    // Zero Solfeggio or Sleepcast tracks in SLEEP_TRACKS
    assert.ok(!catalogTs.includes("'solfeggio'"), 'sleepCatalogData.ts must not have category solfeggio');
    assert.ok(!catalogTs.includes("'sleepcast'"), 'sleepCatalogData.ts must not have category sleepcast');
    assert.ok(!catalogTs.includes('432Hz Miracle Tone'), 'sleepCatalogData.ts must not contain 432Hz Miracle Tone');
    assert.ok(!catalogTs.includes('528Hz Cellular Repair'), 'sleepCatalogData.ts must not contain 528Hz Cellular Repair');

    // Zero Solfeggio or Sleepcasts in extendedMindfulnessData.ts
    assert.ok(!extMindfulnessTs.includes('masterclass-sleep-science'), 'Night masterclass must be removed');
    assert.ok(!extMindfulnessTs.includes('sleepcast-kyoto-rain'), 'Sleepcast kyoto rain must be removed');
    assert.ok(!extMindfulnessTs.includes('sleepcast-alpine-train'), 'Sleepcast alpine train must be removed');
    assert.ok(!extMindfulnessTs.includes('sleepcast-desert-observatory'), 'Sleepcast desert observatory must be removed');
    assert.ok(!extMindfulnessTs.includes('soundscape-theta-waves'), '432Hz theta waves must be removed');

    // Zero Solfeggio or Sleepcast shelves in HomeScreen.tsx
    assert.ok(!homeScreenTsx.includes('Solfeggio Frequencies'), 'HomeScreen must not contain Solfeggio shelf');
    assert.ok(!homeScreenTsx.includes('Sleepcasts & Night Masterclasses'), 'HomeScreen must not contain Sleepcast shelf');
  });
});
