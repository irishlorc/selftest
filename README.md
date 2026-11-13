# FRAME-24

A free, private autism self-exploration experience for adults, designed initially for people in Ireland.

FRAME-24 is an **original, unvalidated self-reflection framework**. It is not a screening instrument, a test or a diagnosis, and it does not score answers or estimate likelihood.

## Stack

- Next.js 16 (App Router, all routes statically prerendered), React 19, TypeScript, Tailwind CSS 4
- jsPDF, which generates the report in the browser. It is loaded only when someone downloads the report.
- Vitest for unit tests; Playwright with axe-core for end-to-end and accessibility tests
- No backend, database, accounts, analytics, AI APIs or external medical APIs

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` to set the site URL or switch on contributions.

## Testing

```bash
npm run typecheck
npm run lint
npm run test:unit      # results engine, storage validation, PDF builder
npm run test:e2e       # builds, starts the app and runs Playwright on desktop, tablet and mobile viewports
```

Playwright uses `/usr/bin/google-chrome` locally. Set `CHROME_PATH` to point at another browser, or run `npx playwright install chromium` and set `CI=1`. The PDF tests need `pdfinfo` and `pdftotext` (from poppler-utils). See `TEST-REPORT.md` for the latest results.

## Where things live

| What | File |
| --- | --- |
| The 24 statements, dimensions, response options and framework status | `src/config/questionnaire.ts` |
| All interpretation text, discussion prompts and disclaimers | `src/config/interpretation.ts` |
| Irish resources (with last-verified date) | `src/config/resources.ts` |
| Navigation and the contribution setting | `src/config/site.ts` |
| Descriptive results engine (per-area spectrum positions, no overall score) | `src/lib/results.ts` |
| Session model and validation of stored data | `src/lib/session.ts` |
| Browser-local storage, delete-all and display preferences | `src/lib/store.ts` |
| PDF report builder | `src/lib/pdf.ts` |

Clinical reviewers can edit wording in the config files without changing application code. If a statement's meaning changes, give it a new `id` so that answers saved under the old wording are not reinterpreted.

## Privacy model

- Answers, the optional note and preferences are kept in `localStorage` under `frame24:` keys and are never transmitted.
- A Content-Security-Policy with `connect-src 'self'` stops the browser from sending data to any other server.
- One control deletes every `frame24:` key.
- `/experience`, `/results` and `/report` are marked `noindex` and disallowed in `robots.txt`.

## Optional €1 contribution

Contributions are **off** until `NEXT_PUBLIC_CONTRIBUTION_URL` is set to a hosted Stripe link (a Payment Link is the simplest option). The app only links out to Stripe. It never handles card details and never shows a "payment complete" state of its own. Stripe's own page confirms the payment.

## Before public launch

These items need to be done before FRAME-24 is released or marketed:

1. **Clinical review.** Qualified clinicians with experience of adult autism assessment, ideally working with autistic adults, should review the statements, the interpretation text and the "Understanding autism" page. Record the outcome in `FRAMEWORK.clinicalReview`.
2. **Regulatory assessment.** FRAME-24 is designed as a non-medical reflection tool. Any use or marketing as a screening or diagnostic product needs assessment under the EU Medical Device Regulation (EU) 2017/745.
3. **Privacy review.** A data protection professional should review the Privacy page, including what the hosting provider logs.
4. **Re-verify resources.** Check every entry in `src/config/resources.ts` and update `RESOURCES_LAST_VERIFIED`. The HSE adult assessment situation was changing in 2026.
5. **Accessibility testing with real users.** Automated checks pass, but testing with disabled and autistic users is still needed.
6. **Contact route.** Add a contact for accessibility and content feedback.

## Deploying to Vercel

Import the repository into Vercel. No build settings are needed; set the two environment variables if you want them. Every route is static.
