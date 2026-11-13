import { expect, test } from "@playwright/test";
import { begin, storageKeys, tap } from "./helpers";

test.describe("privacy", () => {
  test("a full session makes no third-party requests and sets no cookies", async ({ page, context, baseURL }) => {
    test.setTimeout(90_000); // whole journey: 24 answers, results, PDF and every page
    const origin = new URL(baseURL!).origin;
    const external: string[] = [];
    const posts: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (!["http:", "https:"].includes(u.protocol)) return;
      if (u.origin !== origin) external.push(r.url());
      if (r.method() !== "GET" && r.method() !== "HEAD") posts.push(`${r.method()} ${r.url()}`);
    });
    await begin(page);
    for (let i = 0; i < 24; i++) await tap(page, i % 2 ? "Often" : "Rarely", i + 1);
    await page.getByTestId("finish-button").click();
    await page.getByRole("button", { name: "Add a note for your report" }).click();
    await page.getByTestId("note-overall").fill("secret reflection");
    await page.getByTestId("note-overall").blur();
    await page.goto("/report");
    await Promise.all([page.waitForEvent("download"), page.getByTestId("download-pdf").click()]);
    for (const path of ["/", "/understanding-autism", "/next-steps", "/about", "/privacy", "/support"]) await page.goto(path);

    expect(external, "requests to other origins").toEqual([]);
    expect(posts, "non-GET requests (answers must never be sent)").toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test("delete control removes every FRAME-24 item from the browser", async ({ page }) => {
    await begin(page);
    await tap(page, "Often", 1);
    await page.goto("/privacy");
    expect((await storageKeys(page)).length).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Delete my data from this device" }).first().click();
    await expect(page.getByRole("dialog", { name: "Delete your FRAME-24 data?" })).toBeVisible();
    await page.getByRole("button", { name: "Keep my data" }).click();
    expect((await storageKeys(page)).length).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Delete my data from this device" }).first().click();
    await page.getByRole("button", { name: "Delete everything" }).click();
    expect(await storageKeys(page)).toEqual([]);
    await page.goto("/results");
    await expect(page.getByTestId("results-empty")).toBeVisible();
    await page.goto("/experience");
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  });

  test("security headers restrict where the page can send data", async ({ request }) => {
    const res = await request.get("/");
    const csp = res.headers()["content-security-policy"];
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(res.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });

  test("contribution never simulates payment when no provider is configured", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByTestId("contribution-unavailable")).toBeVisible();
    await expect(page.getByTestId("contribute-link")).toHaveCount(0);
    await expect(page.getByText(/thank you for your payment|payment (complete|successful)/i)).toHaveCount(0);
  });

  test("questionnaire is never interrupted by contribution prompts", async ({ page }) => {
    await begin(page);
    for (let i = 0; i < 24; i++) {
      await expect(page.getByText(/contribut|donat|support the project/i)).toHaveCount(0);
      await page.getByRole("button", { name: "Skip" }).click();
    }
  });
});
