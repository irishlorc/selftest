# FRAME-24 test report

Run on 12 November 2026 against a production build (`next build` + `next start`), in Google Chrome driven by Playwright. Everything below was actually executed. Anything that was not tested is listed under "Not tested".

## Summary

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Pass |
| ESLint (`src`, `tests`) | Pass, 0 problems |
| Unit tests (Vitest) | **17 / 17 passed** (3 files) |
| Production build | Pass, all 13 routes statically prerendered |
| End-to-end tests (Playwright) | **95 passed, 0 failed, 0 flaky**, 16 skipped by design |

The skipped tests run on one or two viewports only, on purpose: PDF content, link crawling and performance run on desktop only; keyboard-only flows run on desktop and tablet; the mobile menu test does not run on desktop. Viewports used: desktop 1366×900, tablet 820×1180 (touch), mobile Pixel 7 (412×839).

## Coverage against the brief

1. **All 24 questions and response options.** Every statement's text matches the config. Each shows six options. Each choice is selected and stored. The impact follow-up appears only for Rarely to Almost always, and all four impact values are stored. *Pass on all viewports.*
2. **Previous/next navigation and skipped questions.** Next without an answer shows guidance and does not move on. Skip moves on and records a skip. Back restores earlier answers. Changing an answer to Never clears its impact. Change from the review screen returns to the review. Start again needs confirmation. Begin needs both confirmations. *Pass.*
3. **Saving and restoring an interrupted session.** Reload resumes on the same question with answers intact. Pause returns home with "Continue where you left off". A new tab picks up the progress. Corrupted storage is ignored safely. *Pass.*
4. **Results reflect every answer.** A mixed session (with skips) is checked statement by statement: frequency, impact, per-area counts, pattern text, totals, and that the map places each statement exactly once. Notes persist across reloads. *Pass.*
5. **Missing answers and unusual combinations.** All skipped (no assumptions, an empty message for each area). All "not sure" (shown as gaps). All "almost always" and helpful (frequent is not counted as difficult). A partial session (in-progress banner). No session (empty state). 50 generated random combinations are checked in unit tests for banned wording (score, likelihood, risk, severity, threshold and similar). *Pass.*
6. **PDF generation and formatting.** The file downloads as `FRAME-24-report-YYYY-MM-DD.pdf`, A4. `pdfinfo` and `pdftotext` confirm it has at least 8 pages (12 for a full session), the cover, completion date, disclaimer, every statement, the appendix, the professional questions, important information, notes, and "Page N of N". Notes are left out when the box is unticked. In-progress reports are labelled as in progress. Page rendering was reviewed visually. *Pass.*
7. **Local data deletion and privacy.** The whole journey (24 answers, results, notes, PDF, every page) makes **zero requests to other origins, zero non-GET requests and sets no cookies**. Delete removes every `frame24:` key, with a "Keep my data" option. The CSP, Referrer-Policy and no `X-Powered-By` headers are present. The contribution feature shows no payment UI and no fake success state when it isn't configured, and never appears during the questionnaire. *Pass.*
8. **Responsiveness.** No horizontal overflow on any page at any of the three viewports. Answer touch targets are at least 44 px. The mobile menu works. Full-page screenshots are saved in `test-results/screens/`. *Pass.* (A 290 px overflow on mobile results was found and fixed during testing.)
9. **Keyboard and reduced motion.** The intro and all 24 questions can be completed with the keyboard alone (Tab, Space, 1–6, Enter). Arrow keys move between options. A visible focus outline of at least 2 px shows. Dialogs focus the safe option and close with Escape. The device reduced-motion setting is honoured, and the in-app Reduce motion and Dark settings apply and persist after reload. *Pass.*
   **Accessibility (axe-core, WCAG 2.0/2.1/2.2 A and AA tags):** 0 violations on all 10 routes (including 404), the intro, an unanswered question, an answered question with impact, the review screen, the confirmation dialog, results with expanded detail, the report page and the open display-settings panel. Checked in **both light and dark themes** on all three viewports. *Pass.*
10. **Performance, build and routes.** A crawl of every internal link returns 200. Results, report, sitemap, robots and icon return 200. Unknown routes return a 404 with a helpful page. Measured on desktop against the local production server:

```
/                      FCP 152ms  DCL 93ms   load 367ms  JS 502 KB uncompressed
/experience            FCP 84ms   DCL 41ms   load 103ms  JS 502 KB
/results               FCP 100ms  DCL 71ms   load 134ms  JS 532 KB
/report                FCP 76ms   DCL 41ms   load 60ms   JS 518 KB
/understanding-autism  FCP 60ms   DCL 44ms   load 44ms   JS 502 KB
/next-steps            FCP 168ms  DCL 119ms  load 119ms  JS 502 KB
```

The jsPDF chunk (about 130 KB gzipped) is loaded only when the download button is pressed.

## Issues found and fixed during testing

- Results overflowed horizontally on mobile. The cause was screen-reader text in the scrollable map escaping its container. Fixed.
- `aria-disabled` on Next and Begin marked those buttons as unavailable even though pressing them shows guidance. Removed, so the buttons now behave honestly.
- Resume button wording didn't match where the user landed. Changed to "Continue where you left off".
- PDF appendix rows overlapped when "Not sure or not applicable" wrapped. The PDF tile fills now clip to their rounded frame.
- A React lint error (ref written during render) in the note autosave. Fixed.
- The progress strip didn't distinguish unvisited from skipped questions. It now does.
- A focus ring showed on the review heading after programmatic focus. Removed.

## Not tested, and known limitations

- **Lighthouse scores and real-device or network performance** were not measured. The timings above come from a local server.
- **Firefox and Safari/WebKit** were not tested; only Chrome was available. Mobile and tablet were emulated, not real devices.
- **Screen readers** (NVDA, JAWS, VoiceOver) were not tested manually. axe and the keyboard tests do not replace this.
- **Automated contrast checks** passed, but palette perception has not been reviewed with users who have low vision.
- **Payments with a real Stripe link** were not tested; no provider is configured. Only the switched-off state was verified, plus validation of allowed hosts in code.
- **Vercel deployment** has not been done; only a local production build was tested.
- The clinical and regulatory items in `README.md` remain open.
