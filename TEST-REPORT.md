# FRAME-24 test report

Run on 13 November 2026 against a production build (`next build` + `next start`) in Google Chrome, driven by Playwright. Everything listed was actually executed. Anything not tested is listed at the end.

This run covers the faster flow (no follow-up question, tap-to-advance) and the visual spectrum results.

## Summary

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Pass |
| ESLint (`src`, `tests`) | Pass, 0 problems |
| Unit tests (Vitest) | **15 / 15 passed** |
| Production build | Pass, all routes statically prerendered |
| End-to-end (Playwright) | **101 passed, 0 failed, 0 flaky**, 16 skipped by design |

Skips are intentional. The PDF, link-crawl and performance tests run on desktop only, and the keyboard-only flows run on desktop and tablet. Viewports: desktop 1366×900, tablet 820×1180 (touch), mobile Pixel 7.

## What was verified

1. **All 24 statements and options.** Each statement's text matches the config and shows six options. Tapping records the answer and moves to the next statement. No follow-up question appears. Stored answers contain only the frequency.
2. **Speed and controls.**
   - Tap-to-advance works.
   - A quick double tap moves on only one statement. Taps in the first 450 ms of a new statement are ignored.
   - Keyboard selection (Space and arrow keys) changes the answer without moving on.
   - Next without an answer shows guidance.
   - Skip, Back, Change-from-review, Start again (with confirmation) and the single-checkbox Begin all work.
3. **Save and resume.** Progress survives a reload and a new tab. Pause offers "Continue where you left off". Corrupted storage is ignored safely.
4. **Spectrum results reflect every answer.**
   - For each area, the number of marks equals the number of answers given.
   - Every mark sits at the correct position.
   - The centre marker equals the average of the answers given.
   - Expanding an area shows each statement's exact answer.
   - The default view stays under 260 words.
5. **Missing and unusual answers.**
   - Everything skipped or "not sure": nothing is placed, and every area shows "No answers here".
   - All "almost always": centres at the far end. All "never": centres at the start.
   - A partial session shows an in-progress banner; no session shows an empty state.
   - 50 random combinations were checked for score or likelihood language.
6. **PDF.** A4, 4–6 pages (6 for a full session). Text extraction confirms the cover, completion date, spectrum page, professional questions, every statement in the appendix, the note (and its removal when unticked), the important-information page and "Page N of N". In-progress reports are labelled.
7. **Privacy.** A full journey makes zero requests to other origins and zero non-GET requests, and sets no cookies. Delete removes every `frame24:` key. The CSP and other security headers are present. Contributions show no payment UI when they aren't configured and never appear during the questionnaire.
8. **Responsiveness.** No horizontal overflow on any page at all three viewports. Answer targets are at least 44 px tall. The mobile menu works.
9. **Keyboard, motion and accessibility.**
   - The questionnaire can be completed with the keyboard alone (1–6 to answer).
   - Focus outlines are visible, and dialogs close with Escape.
   - Device and in-app reduced-motion settings are honoured.
   - axe-core (WCAG 2.0/2.1/2.2 A and AA) reports **0 violations** on every page and questionnaire state, including the expanded spectrum and the note panel, in light and dark themes, at all three viewports.
10. **Routes and performance.** Every internal link returns 200, and unknown routes return a helpful 404. Local first contentful paint is 84–308 ms. The jsPDF code loads only when the report is downloaded.

## Not tested, and known limitations

- No Lighthouse scores, real devices, real networks, Firefox or Safari.
- No manual screen-reader testing (NVDA, JAWS or VoiceOver).
- No live Stripe payment, and no Vercel deployment.
- The clinical, regulatory and privacy reviews listed in `README.md` are still open.
