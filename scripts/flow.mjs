// Dev helper: walk through the experience and capture screenshots.
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "/tmp/shots";
const w = +(process.argv[4] ?? 1280), h = +(process.argv[5] ?? 900);
const theme = process.argv[6] ?? "light";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: theme, acceptDownloads: true });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(base + "/experience");
await p.getByLabel(/18 or over/).check();
await p.getByRole("button", { name: "Begin" }).click();
const freqs = ["Never","Rarely","Sometimes","Often","Almost always","Not sure or not applicable"];
for (let i = 0; i < 24; i++) {
  await p.getByTestId("progress-label").filter({ hasText: `Question ${i + 1} of 24` }).waitFor();
  if (i === 5 || i === 17) { await p.getByRole("button", { name: "Skip" }).click(); continue; }
  const f = freqs[(i * 7 + (i % 4)) % 6];
  if (i === 2) { await p.waitForTimeout(300); await p.screenshot({ path: `${out}/q-${w}-${theme}.png`, fullPage: true }); }
  await p.waitForTimeout(470);
  await p.locator("label").filter({ hasText: new RegExp(`^${f}`) }).first().click();
}
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/review-${w}-${theme}.png`, fullPage: true });
await p.getByTestId("finish-button").click();
await p.waitForURL("**/results");
await p.getByRole("button", { name: "Add a note for your report" }).click();
await p.getByTestId("note-overall").fill("I want to bring this to my GP.");
await p.waitForTimeout(1300);
await p.screenshot({ path: `${out}/results-${w}-${theme}.png`, fullPage: true });
await p.goto(base + "/report");
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/report-${w}-${theme}.png`, fullPage: true });
const [dl] = await Promise.all([p.waitForEvent("download"), p.getByTestId("download-pdf").click()]);
await dl.saveAs(`${out}/report-${theme}.pdf`);
console.log("errors:", errors);
await b.close();
