import { expect, test } from "@playwright/test";
import { DIMENSIONS, QUESTIONS, FREQUENCY_LABEL, IMPACT_LABEL, type Frequency, type Impact } from "../../src/config/questionnaire";
import { createSession, withFrequency, withImpact, withSkip, type Session } from "../../src/lib/session";
import { computeResults } from "../../src/lib/results";
import { seed } from "./helpers";

const FREQS: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
const IMPACTS: Impact[] = ["helpful", "neutral", "difficult", "mixed"];

function mixedSession(): Session {
  let s = createSession();
  QUESTIONS.forEach((q, i) => {
    if (i % 7 === 3) s = withSkip(s, q.id);
    else {
      s = withFrequency(s, q.id, FREQS[(i * 5) % 6]);
      s = withImpact(s, q.id, IMPACTS[i % 4]);
    }
  });
  return { ...s, consentedAt: s.startedAt, completedAt: "2026-11-12T12:00:00.000Z" };
}

test.describe("results", () => {
  test("every answer is reflected exactly on the results page", async ({ page }) => {
    const session = mixedSession();
    const expected = computeResults(session);
    await seed(page, session);
    await page.goto("/results");
    await expect(page.getByRole("heading", { name: "Your reflection", exact: true })).toBeVisible();
    await expect(page.getByText("Completed 12 November 2026")).toBeVisible();

    await expect(page.getByTestId("total-answered")).toHaveText(String(expected.totals.reported));
    await expect(page.getByTestId("total-frequent")).toHaveText(String(expected.totals.frequent));
    await expect(page.getByTestId("total-difficult")).toHaveText(String(expected.totals.difficult + expected.totals.mixed));

    for (const q of QUESTIONS) {
      const a = session.answers[q.id];
      const row = page.getByTestId(`item-${q.id}`);
      const label = a.skipped ? "Skipped" : FREQUENCY_LABEL[a.frequency!];
      await expect(row.getByTestId("item-frequency")).toHaveText(label);
      if (a.impact) await expect(row.getByTestId("item-impact")).toHaveText(IMPACT_LABEL[a.impact]);
      else await expect(row.getByTestId("item-impact")).toHaveCount(0);
    }
    for (const d of expected.dimensions) {
      const card = page.getByTestId(`dimension-${d.dimension.id}`);
      await expect(card.getByTestId("stat-frequent")).toHaveText(`${d.frequent}/4`);
      await expect(card.getByTestId("stat-difficult")).toHaveText(`${d.impact.difficult + d.impact.mixed}/4`);
      await expect(card.getByTestId("stat-gaps")).toHaveText(`${d.notSure + d.skipped + d.unanswered}/4`);
      for (const p of d.patterns) await expect(card.getByTestId("patterns")).toContainText(p);
    }
    // The map places each answered statement exactly once.
    const chips = page.getByTestId("impact-map").locator("li");
    const placed = expected.items.filter((i) => i.status === "answered").length;
    await expect(chips).toHaveCount(placed);
    await expect(page.getByTestId("non-diagnostic")).toContainText("cannot tell you whether you are autistic");
  });

  test("notes save locally and persist after reload", async ({ page }) => {
    await seed(page, mixedSession());
    await page.goto("/results");
    await page.getByTestId("note-sensory").fill("Supermarkets on Saturdays.");
    await page.getByTestId("note-overall").fill("Bring to GP.");
    await page.getByTestId("note-overall").blur();
    await expect(page.getByText("Saved on this device").first()).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("note-sensory")).toHaveValue("Supermarkets on Saturdays.");
    await expect(page.getByTestId("note-overall")).toHaveValue("Bring to GP.");
  });

  test("everything skipped: nothing is assumed", async ({ page }) => {
    let s = createSession();
    for (const q of QUESTIONS) s = withSkip(s, q.id);
    await seed(page, { ...s, consentedAt: s.startedAt, completedAt: s.startedAt });
    await page.goto("/results");
    await expect(page.getByTestId("total-answered")).toHaveText("0");
    await expect(page.getByTestId("total-frequent")).toHaveText("0");
    await expect(page.getByTestId("total-gaps")).toHaveText("24");
    await expect(page.getByTestId("impact-map").locator("li")).toHaveCount(0);
    for (const d of DIMENSIONS) {
      await expect(page.getByTestId(`dimension-${d.id}`).getByTestId("patterns")).toContainText("nothing to reflect back");
    }
  });

  test("everything 'not sure': shown as gaps, not as answers", async ({ page }) => {
    let s = createSession();
    for (const q of QUESTIONS) s = withFrequency(s, q.id, "not_sure");
    await seed(page, { ...s, consentedAt: s.startedAt, completedAt: s.startedAt });
    await page.goto("/results");
    await expect(page.getByTestId("total-answered")).toHaveText("0");
    await expect(page.getByTestId("total-gaps")).toHaveText("24");
  });

  test("everything 'almost always' and helpful: frequent is not treated as difficult", async ({ page }) => {
    let s = createSession();
    for (const q of QUESTIONS) {
      s = withFrequency(s, q.id, "almost_always");
      s = withImpact(s, q.id, "helpful");
    }
    await seed(page, { ...s, consentedAt: s.startedAt, completedAt: s.startedAt });
    await page.goto("/results");
    await expect(page.getByTestId("total-frequent")).toHaveText("24");
    await expect(page.getByTestId("total-difficult")).toHaveText("0");
    await expect(page.getByTestId("hl-frequent-difficult")).toContainText("None from your answers.");
    await expect(page.getByTestId("hl-frequent-helpful").locator("li")).toHaveCount(24);
  });

  test("partial session shows an in-progress banner; no session shows an empty state", async ({ page }) => {
    let s = withFrequency(createSession(), "com-1", "often");
    s = { ...s, consentedAt: s.startedAt };
    await seed(page, s);
    await page.goto("/results");
    await expect(page.getByTestId("incomplete-banner")).toBeVisible();
    await expect(page.getByTestId("total-answered")).toHaveText("1");
    await expect(page.getByTestId("total-gaps")).toHaveText("23");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("results-empty")).toBeVisible();
  });
});
