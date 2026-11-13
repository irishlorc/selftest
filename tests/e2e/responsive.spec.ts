import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../../src/config/questionnaire";
import { createSession, withFrequency } from "../../src/lib/session";
import { begin, seed } from "./helpers";

const ROUTES = ["/", "/understanding-autism", "/next-steps", "/about", "/privacy", "/support", "/results", "/report"];

function completed() {
  let s = createSession();
  QUESTIONS.forEach((q, i) => {
    s = withFrequency(s, q.id, (["rarely", "sometimes", "often", "almost_always"] as const)[i % 4]);
  });
  return { ...s, consentedAt: s.startedAt, completedAt: s.startedAt };
}

test("pages have no horizontal overflow and render at this viewport", async ({ page }, info) => {
  await seed(page, completed());
  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    const name = route === "/" ? "home" : route.slice(1);
    await page.screenshot({ path: `test-results/screens/${info.project.name}-${name}.png`, fullPage: true });
  }
  await page.goto("/experience");
  await page.screenshot({ path: `test-results/screens/${info.project.name}-review.png`, fullPage: true });
});

test("question screen fits the viewport and controls are reachable", async ({ page }, info) => {
  await begin(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  for (const name of ["Back", "Skip"]) await expect(page.getByRole("button", { name })).toBeVisible();
  await expect(page.getByTestId("next-button")).toBeVisible();
  // Touch targets for answers are at least 44px tall.
  const h = await page.locator("label", { has: page.getByRole("radio", { name: "Often", exact: true }) }).evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: `test-results/screens/${info.project.name}-question.png`, fullPage: true });
});

test("mobile menu opens, navigates and closes", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "Desktop shows the full navigation");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("#mobile-menu").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
});
