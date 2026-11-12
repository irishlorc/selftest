import { expect, type Page } from "@playwright/test";
import type { Session } from "../../src/lib/session";

export const FREQ = ["Never", "Rarely", "Sometimes", "Often", "Almost always", "Not sure or not applicable"] as const;
export const IMPACT = ["Mostly helpful", "Neutral", "Mostly difficult", "Mixed"] as const;

export async function begin(page: Page) {
  await page.goto("/experience");
  await page.getByLabel("I am 18 or over.").check();
  await page.getByLabel(/I understand FRAME-24/).check();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");
}

/** Clicks the visible label for a (visually hidden) radio input. */
export async function choose(page: Page, label: string) {
  await page.locator("label").filter({ has: page.getByRole("radio", { name: label, exact: true }) }).click();
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
