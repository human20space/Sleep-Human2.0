## 2026-10-08T01:57:29Z
You are teamwork_preview_test_writer.
Your working directory is: C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_test_writer_1
The project root is: C:\Users\annak\.gemini\antigravity\scratch\human2

MANDATORY: Read these files before doing anything else:
1. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\ORIGINAL_REQUEST.md
2. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\PROJECT.md
3. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\TEST_INFRA.md

Your Objective:
Design and implement the comprehensive, opaque-box E2E test suite in the project (under tests/e2e/) adhering to the 4-tier methodology outlined in TEST_INFRA.md:
- Tier 1: Feature Coverage (>=5 test cases per feature across all 17 features = >=85 tests)
- Tier 2: Boundary & Corner Cases (>=5 test cases per feature = >=85 tests)
- Tier 3: Cross-Feature Pairwise Combinations (>=17 tests)
- Tier 4: Real-World Application Scenarios (5 realistic end-user flows)
Total tests must be >= 192 test cases.

Technical Details:
- Set up an automated test runner (e.g. Vitest / Node test runner / tsx / custom test runner) with zero external server dependencies. Ensure test script in package.json (e.g. `npm run test:e2e`) runs smoothly.
- Tests should verify:
  1. Manifest validity, start_url, scope, display, colors, icons metadata.
  2. Icon files existence, dimensions, aspect ratio, PNG headers.
  3. Service Worker syntax, precache logic, explicit audio/video exclusion, message handlers.
  4. Update toast trigger and custom install hooks behavior.
  5. Sleep catalog (16 tracks: 4 free, 12 sovereign, audio types, durations).
  6. Zero-login playback for free tracks vs Sovereign gated tracks.
  7. Sovereign simulation unlock flow, localStorage vault keys (human2_is_premium, human2_favorites, human2_continue_listening).
  8. Standalone "Listen" audiobook section with chapters 1-45.
  9. Procedural audio engine generators (432Hz, 528Hz, delta binaurals, ocean rain, SOS reset).
  10. 360px zero horizontal scroll, >=44px touch targets, >=16px input font size, safe area insets.
  11. Build exit code 0 and single dist/ output.
  12. Environment variables (VITE_*).

When complete:
- Publish C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\TEST_READY.md with the runner command and coverage metrics table.
- Write your handoff report to: C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_test_writer_1\handoff.md
- Send a completion message back to the orchestrator.
