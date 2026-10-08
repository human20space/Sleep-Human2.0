# Execution Plan: Human 2.0 PWA & Sleep Supporting Mobile App

## 0. Survey Phase
- Spawn 3 Explorers in parallel:
  - Explorer 1: Inspect existing project files, build setup, dependencies, scripts, entry points (`index.html`, `vite.config.ts`, `package.json`, etc.).
  - Explorer 2: Inspect existing UI screens, navigation flow in `src/App.tsx`, audio player implementation, local storage vault, theme handling.
  - Explorer 3: Investigate PWA requirements: manifest format, service worker strategies, icons generation/assets, update toast, install banners, and mobile safe areas.
- Synthesize findings into `PROJECT.md` (Architecture, Feature Inventory, Milestones, Code Layout, Interface Contracts).

## 1. Milestone Decomposition & Dual Track Setup
- Track A: Implementation Track
  - Milestone 1: PWA Engine, Manifest, Icons & Service Worker Update Flow
  - Milestone 2: Streamline into "Sleep Supporting Mobile App" (Catalog, Free tier, Sovereign plan simulation, Audiobook section, Favourites & Continue listening)
  - Milestone 3: Mobile UI Polish & Native Wrapper Readiness (360px responsiveness, safe-area insets, touch targets, env URLs)
  - Milestone 4: Final Milestone (100% E2E test pass + Tier 5 Adversarial Coverage Hardening)
- Track B: E2E Testing Track (Independent, requirement-driven, opaque-box)
  - Test runner & infrastructure
  - Test suite covering Tiers 1-4 (>=11*N test cases)
  - Publish `TEST_READY.md`

## 2. Iteration Loop Execution
For each milestone:
1. 3 Explorers analyze technical details and design implementation strategy
2. 1 Worker implements source code, runs build & tests, verifies output
3. 2 Reviewers independently evaluate correctness, completeness, and edge cases
4. 2 Challengers run adversarial testing and verify functionality
5. 1 Forensic Auditor verifies authenticity and integrity
6. Gate check: Strict AND across all criteria.
