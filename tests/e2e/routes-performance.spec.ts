import { expect, test } from "@playwright/test";
import fs from "node:fs";

test.describe("routes and performance", () => {
  test.beforeEach(async ({}, info) => {
    test.skip(info.project.name !== "desktop", "Checked once");
  });

  test("every internal link resolves, and unknown routes show a helpful 404", async ({ page, request }) => {
    const seen = new Set<string>();
    const queue = ["/"];
    while (queue.length) {
      const path = queue.shift()!;
      if (seen.has(path)) continue;
      seen.add(path);
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      const links = await page.$$eval("a[href^='/']", (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
      for (const l of links) {
        const clean = l.split("#")[0].split("?")[0];
        if (!seen.has(clean)) queue.push(clean);
      }
    }
    expect([...seen].sort()).toEqual(
      ["/", "/about", "/experience", "/next-steps", "/privacy", "/support", "/understanding-autism"].sort(),
    );
    for (const p of ["/results", "/report", "/sitemap.xml", "/robots.txt", "/icon.svg"]) {
      expect((await request.get(p)).status(), p).toBe(200);
    }
    const missing = await page.goto("/definitely-missing");
    expect(missing?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page doesn’t exist" })).toBeVisible();
  });

  test("pages load quickly with a small JavaScript payload", async ({ page }) => {
    const rows: string[] = [];
    for (const route of ["/", "/experience", "/results", "/report", "/understanding-autism", "/next-steps"]) {
      let js = 0;
      const onResponse = async (r: import("@playwright/test").Response) => {
        if (r.url().endsWith(".js") || r.request().resourceType() === "script") {
          const len = Number(r.headers()["content-length"] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
          js += len;
        }
      };
      page.on("response", onResponse);
      await page.goto(route, { waitUntil: "networkidle" });
      page.off("response", onResponse);
      const t = await page.evaluate(() => {
        const n = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
        return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), fcp: Math.round(fcp) };
      });
      rows.push(`${route}\tFCP ${t.fcp}ms\tDCL ${t.dcl}ms\tload ${t.load}ms\tJS ${(js / 1024).toFixed(0)} KB (uncompressed)`);
      expect(t.fcp).toBeLessThan(1500);
      expect(js).toBeLessThan(700 * 1024);
    }
    fs.mkdirSync("test-results", { recursive: true });
    fs.writeFileSync("test-results/performance.txt", rows.join("\n") + "\n");
    console.log(rows.join("\n"));
  });
});
