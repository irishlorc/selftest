import { expect, test } from "@playwright/test";
import { DIMENSIONS, QUESTIONS, FREQUENCY_LABEL, type Frequency } from "../../src/config/questionnaire";
import { createSession, withFrequency, withSkip, type Session } from "../../src/lib/session";
import { computeResults } from "../../src/lib/results";
import { seed } from "./helpers";

const FREQS: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
const done = (s: Session): Session => ({ ...s, consentedAt: s.startedAt, completedAt: "2026-11-12T12:00:00.000Z" });

function mixedSession(): Session {
  let s = createSession();
  QUESTIONS.forEach((q, i) => {
    s = i % 7 === 3 ? withSkip(s, q.id) : withFrequency(s, q.id, FREQS[(i * 5) % 6]);
  });
  return done(s);
}

test.describe("results spectrum", () => {
  test("every answer is placed on the right spectrum, at the right point", async ({ page }) => {
    const session = mixedSession();
    const expected = computeResults(session);
    await seed(page, session);
    await page.goto("/results");
    await expect(page.getByRole("heading", { name: "Your spectrum", exact: true })).toBeVisible();
    await expect(page.getByText("12 November 2026")).toBeVisible();
    await expect(page.getByTestId("total-answered")).toHaveText(String(expected.totals.reported));
    await expect(page.getByTestId("non-diagnostic")).toContainText("can’t tell you whether you’re autistic");

    for (const d of expected.dimensions) {
      const row = page.getByTestId(`spectrum-row-${d.dimension.id}`);
      const marks = row.getByTestId("spectrum-mark");
      await expect(marks).toHaveCount(d.reported);
      const positions = (await marks.evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-position"))))).sort();
      expect(positions).toEqual(d.items.filter((i) => i.position !== null).map((i) => i.position!).sort());
      if (d.centre === null) await expect(row.getByTestId("spectrum-centre")).toHaveCount(0);
      else await expect(row.getByTestId("spectrum-centre")).toHaveAttribute("data-centre", d.centre.toFixed(2));

      // Expanding the row shows each statement with its exact answer.
      await row.getByRole("button").first().click();
      for (const item of d.items) {
        const a = session.answers[item.question.id];
        const label = a?.skipped ? "Skipped" : FREQUENCY_LABEL[a!.frequency!];
        await expect(page.getByTestId(`item-${item.question.id}`).getByTestId("item-frequency")).toHaveText(label);
      }
    }
  });

  test("results stay short: no long interpretive text by default", async ({ page }) => {
    await seed(page, mixedSession());
    await page.goto("/results");
    const words = await page.locator("main").evaluate((m) => {
      const visible = [...m.querySelectorAll("p, li, h1, h2, h3, span, a, button")].filter(
        (el) => (el as HTMLElement).offsetParent !== null && el.children.length === 0,
      );
      return visible.map((el) => el.textContent ?? "").join(" ").split(/\s+/).filter(Boolean).length;
    });
    expect(words).toBeLessThan(260);
  });

  test("the note saves locally and persists after reload", async ({ page }) => {
    await seed(page, mixedSession());
    await page.goto("/results");
    await page.getByRole("button", { name: "Add a note for your report" }).click();
    await page.getByTestId("note-overall").fill("Bring to GP.");
    await page.getByTestId("note-overall").blur();
    await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Edit your note" }).click();
    await expect(page.getByTestId("note-overall")).toHaveValue("Bring to GP.");
  });

  test("everything skipped or 'not sure': nothing is placed or assumed", async ({ page }) => {
    let s = createSession();
    QUESTIONS.forEach((q, i) => (s = i % 2 ? withSkip(s, q.id) : withFrequency(s, q.id, "not_sure")));
    await seed(page, done(s));
    await page.goto("/results");
    await expect(page.getByTestId("total-answered")).toHaveText("0");
    await expect(page.getByTestId("total-gaps")).toHaveText("24");
    await expect(page.getByTestId("spectrum-mark")).toHaveCount(0);
    await expect(page.getByTestId("spectrum-centre")).toHaveCount(0);
    await expect(page.getByText("No answers here")).toHaveCount(DIMENSIONS.length);
  });

  test("all 'almost always' sits at the far end; all 'never' at the start", async ({ page }) => {
    let s = createSession();
    QUESTIONS.forEach((q, i) => (s = withFrequency(s, q.id, i < 12 ? "almost_always" : "never")));
    await seed(page, done(s));
    await page.goto("/results");
    const centres = await page.getByTestId("spectrum-centre").evaluateAll((els) => els.map((e) => e.getAttribute("data-centre")));
    expect(centres).toEqual(["4.00", "4.00", "4.00", "0.00", "0.00", "0.00"]);
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
