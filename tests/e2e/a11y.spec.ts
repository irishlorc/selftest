import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { QUESTIONS } from "../../src/config/questionnaire";
import { createSession, withFrequency } from "../../src/lib/session";
import { begin, seed, select } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const ROUTES = ["/", "/understanding-autism", "/next-steps", "/about", "/privacy", "/support", "/experience", "/results", "/report", "/does-not-exist"];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => `${label}: ${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

function completed() {
  let s = createSession();
  QUESTIONS.forEach((q, i) => {
    s = withFrequency(s, q.id, (["never", "rarely", "sometimes", "often", "almost_always", "not_sure"] as const)[i % 6]);
  });
  return { ...s, consentedAt: s.startedAt, completedAt: s.startedAt, overallNote: "note" };
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`axe (${theme})`, () => {
    test.use({ colorScheme: theme });
    test.describe.configure({ timeout: 90_000 });

    test("static and empty-state pages have no WCAG 2.2 AA violations", async ({ page }) => {
      for (const route of ROUTES) {
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await audit(page, `${route} [${theme}]`);
      }
    });

    test("questionnaire states have no violations", async ({ page }) => {
      await page.goto("/experience");
      await audit(page, `intro [${theme}]`);
      await begin(page);
      await audit(page, `question [${theme}]`);
      await select(page, "Often");
      await audit(page, `question answered [${theme}]`);
      for (let i = 0; i < 24; i++) await page.getByRole("button", { name: "Skip" }).click();
      await audit(page, `review [${theme}]`);
      await page.getByRole("button", { name: "Start again" }).click();
      await audit(page, `dialog [${theme}]`);
    });

    test("results and report pages with data have no violations", async ({ page }) => {
      await seed(page, completed());
      await page.goto("/results");
      await page.getByTestId("spectrum-row-sensory").getByRole("button").first().click();
      await page.getByRole("button", { name: "Edit your note" }).click();
      await audit(page, `results [${theme}]`);
      await page.goto("/report");
      await audit(page, `report [${theme}]`);
      await page.goto("/");
      await page.getByRole("button", { name: "Display settings" }).click();
      await audit(page, `display settings open [${theme}]`);
    });
  });
}
