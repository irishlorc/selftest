import { expect, test } from "@playwright/test";
import { storedSession } from "./helpers";

test.describe("keyboard and motion", () => {
  test.beforeEach(async ({}, info) => {
    test.skip(info.project.name === "mobile", "Keyboard-only flow is checked on desktop and tablet");
  });

  test("the questionnaire can be completed using only the keyboard", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/experience");
    // Skip link is the first focusable element.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

    const adult = page.getByLabel("I am 18 or over.");
    while (!(await adult.evaluate((el) => el === document.activeElement))) await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Begin" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");

    // Number shortcuts + Enter.
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press(String((i % 6) + 1));
      await page.keyboard.press("Enter");
    }
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
    const s = await storedSession(page);
    expect(Object.keys(s!.answers)).toHaveLength(24);
    expect(s!.answers["com-1"].frequency).toBe("never");
    expect(s!.answers["com-2"].frequency).toBe("rarely");

    // Focus is moved to the review heading and Finish is reachable by Tab.
    const finish = page.getByTestId("finish-button");
    for (let n = 0; n < 80 && !(await finish.evaluate((el) => el === document.activeElement)); n++) await page.keyboard.press("Tab");
    await expect(finish).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/results$/);
  });

  test("radio options respond to arrow keys and show a visible focus indicator", async ({ page }) => {
    await page.goto("/experience");
    await page.getByLabel("I am 18 or over.").check();
    await page.getByLabel(/I understand FRAME-24/).check();
    await page.getByRole("button", { name: "Begin" }).click();
    await page.keyboard.press("3");
    const sometimes = page.getByRole("radio", { name: "Sometimes", exact: true });
    await sometimes.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Often", exact: true })).toBeChecked();
    const outline = await page.locator("label", { has: page.getByRole("radio", { name: "Often", exact: true }) }).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  test("dialogs trap focus and close with Escape", async ({ page }) => {
    await page.goto("/privacy");
    await page.getByRole("button", { name: "Delete my data from this device" }).first().click();
    await expect(page.getByRole("button", { name: "Keep my data" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("respects the device reduced-motion setting", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const duration = await page.locator(".anim-settle").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });

  test("in-app reduce-motion and theme settings apply and persist", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
    await page.goto("/");
    const before = await page.locator(".anim-settle").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(before)).toBeGreaterThan(0.1);
    await page.getByRole("button", { name: "Display settings" }).click();
    await page.getByLabel("Reduce motion").check();
    await page.getByLabel("Dark").check();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.keyboard.press("Escape");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const after = await page.locator(".anim-settle").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(after)).toBeLessThan(0.01);
  });
});
