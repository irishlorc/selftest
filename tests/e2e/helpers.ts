import { expect, type Page } from "@playwright/test";
import type { Session } from "../../src/lib/session";

export const FREQ = ["Never", "Rarely", "Sometimes", "Often", "Almost always", "Not sure or not applicable"] as const;

export async function begin(page: Page) {
  await page.goto("/experience");
  await page.getByLabel(/18 or over/).check();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");
}

function labelFor(page: Page, label: string) {
  return page.locator("label").filter({ has: page.getByRole("radio", { name: label, exact: true }) });
}

/** Taps an answer on question number `current` (1-based); it moves on automatically, so wait for the next screen. */
export async function tap(page: Page, label: string, current: number) {
  // New statements ignore taps for their first 450ms (accidental double-tap guard).
  await page.waitForTimeout(470);
  await labelFor(page, label).click();
  if (current < 24) await expect(page.getByTestId("progress-label")).toHaveText(`Question ${current + 1} of 24`);
  else await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
}

/** Selects an answer with the keyboard (Space), which does not move on. */
export async function select(page: Page, label: string) {
  await page.getByRole("radio", { name: label, exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: label, exact: true })).toBeChecked();
}

export async function next(page: Page) {
  await page.getByTestId("next-button").click();
}

export async function seed(page: Page, session: Session) {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem("__seeded")) {
      localStorage.setItem("frame24:session", value);
      sessionStorage.setItem("__seeded", "1");
    }
  }, JSON.stringify(session));
}

export async function storageKeys(page: Page) {
  return page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("frame24:")));
}

export async function storedSession(page: Page): Promise<Session | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem("frame24:session");
    return raw ? JSON.parse(raw) : null;
  });
}
