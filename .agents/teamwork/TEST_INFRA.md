# E2E Test Infra: Human 2.0 PWA & Sleep Supporting Mobile App

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md`.
- No dependency on internal implementation designs.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinations + Real-World Workload Scenarios.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Web App Manifest Validation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Brand Icons Suite Compliance | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | iOS Standalone Meta Tags | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Service Worker App Shell Precache | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | Instant Update Notification Flow | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | Custom Install Experience | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 7 | Curated Sleep Catalog (12-20 tracks) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Frictionless Free Tier (Zero Login) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | Single Sovereign Paid Plan Simulation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 10 | Standalone Audiobook Section ("Listen") | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 11 | Favourites & Continue Listening Storage | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 12 | 360px Mobile Zero-Scroll Layout | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 13 | Touch Targets >= 44x44px Bounding Box | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 14 | Form Inputs >= 16px Font Size | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 15 | Safe Area Insets (Notch/Home Indicator)| ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 16 | Clean Static Build Output in dist/ | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 17 | Environment-Driven URLs (VITE_*) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Vitest / Node test runner
- Test files located under `tests/e2e/`:
  - `tier1_features.test.ts`
  - `tier2_boundaries.test.ts`
  - `tier3_combinations.test.ts`
  - `tier4_scenarios.test.ts`
- Pass/fail semantics: All assertions must pass with exit code 0.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Bedtime Immersion: First-time user opens app, immediately plays free sleepcast without login modal | F7, F8, F10, F13, F15 | Medium |
| 2 | Emergency SOS 90s Reset: Distressed user launches SOS panic silencer, verifies breathing pacing & timer | F7, F8, F12, F13 | Medium |
| 3 | Sovereign Plan Unlock: User taps locked premium track, triggers 1-tap simulation, unlocks vault with 528Hz chime | F9, F11, F13, F14 | High |
| 4 | Offline Commute / Sleep Flight: User is offline, launches PWA shell, resumes audiobook from vault | F4, F6, F11, F14, F18 | High |
| 5 | PWA Instant OTA Update: App is open, new SW version deployed, update toast triggers tap-to-refresh without data loss | F4, F5, F14 | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature (17 features × 5 = 85 tests)
- Tier 2: ≥5 per feature (17 features × 5 = 85 tests)
- Tier 3: pairwise coverage of major feature interactions (≥17 tests)
- Tier 4: ≥5 realistic application scenarios (5 tests)
- **Total minimum: ≥192 test cases**
