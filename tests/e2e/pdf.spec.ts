import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { QUESTIONS, type Frequency } from "../../src/config/questionnaire";
import { createSession, withFrequency, withSkip } from "../../src/lib/session";
import { pdfSafe } from "../../src/lib/pdf";
import { seed } from "./helpers";

test.beforeEach(async ({}, info) => {
  test.skip(info.project.name !== "desktop", "PDF content is checked once, on desktop");
});

const norm = (s: string) => pdfSafe(s).replace(/\s+/g, " ").trim();

function session() {
  let s = createSession();
  const f: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
  QUESTIONS.forEach((q, i) => (s = i === 10 ? withSkip(s, q.id) : withFrequency(s, q.id, f[i % 6])));
  return { ...s, consentedAt: s.startedAt, completedAt: "2026-11-12T12:00:00.000Z", overallNote: "PRIVATE-OVERALL-NOTE — cafés" };
}

test("PDF downloads, is short and contains the full report", async ({ page }, info) => {
  await seed(page, session());
  await page.goto("/report");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("download-pdf").click()]);
  expect(download.suggestedFilename()).toBe("FRAME-24-report-2026-11-12.pdf");
  const file = info.outputPath("report.pdf");
  await download.saveAs(file);
  await expect(page.getByTestId("download-status")).toContainText("created on this device");

  const meta = execFileSync("pdfinfo", [file]).toString();
  const pages = Number(/Pages:\s+(\d+)/.exec(meta)![1]);
  expect(pages).toBeGreaterThanOrEqual(4);
  expect(pages).toBeLessThanOrEqual(6);
  expect(meta).toMatch(/A4/);

  const text = execFileSync("pdftotext", ["-layout", file, "-"]).toString().replace(/\s+/g, " ");
  for (const t of [
    "Personal reflection report",
    "Completed 12 November 2026",
    "Not a diagnosis",
    "Your spectrum",
    "Questions you might bring to a professional",
    "Appendix: your full responses",
    "Important information",
    "PRIVATE-OVERALL-NOTE - cafés",
    `Page ${pages} of ${pages}`,
  ])
    expect(text).toContain(t);
  const raw = execFileSync("pdftotext", [file, "-"]).toString().replace(/\s+/g, " ");
  for (const q of QUESTIONS) expect(raw).toContain(norm(q.text).slice(0, 40));
  expect(raw).not.toMatch(/likelihood of|your score|risk level|difficult or mixed/i);
  fs.mkdirSync("test-results", { recursive: true });
  fs.copyFileSync(file, "test-results/sample-report.pdf");
});

test("the note can be left out of the PDF", async ({ page }, info) => {
  await seed(page, session());
  await page.goto("/report");
  await page.getByTestId("include-notes").uncheck();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("download-pdf").click()]);
  const file = info.outputPath("report-no-notes.pdf");
  await download.saveAs(file);
  expect(execFileSync("pdftotext", [file, "-"]).toString()).not.toContain("PRIVATE-OVERALL-NOTE");
});

test("an in-progress session still produces a report, marked as in progress", async ({ page }, info) => {
  let s = withFrequency(createSession(), "att-1", "often");
  s = { ...s, consentedAt: s.startedAt };
  await seed(page, s);
  await page.goto("/report");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("download-pdf").click()]);
  const file = info.outputPath("partial.pdf");
  await download.saveAs(file);
  const text = execFileSync("pdftotext", [file, "-"]).toString();
  expect(text).toContain("(in progress)");
  expect(text).toContain("Not answered");
});
