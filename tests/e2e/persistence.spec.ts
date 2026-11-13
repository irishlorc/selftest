import { expect, test } from "@playwright/test";
import { begin, storedSession, tap } from "./helpers";

test.describe("saving and restoring", () => {
  test("an interrupted session resumes where it stopped, with answers intact", async ({ page }) => {
    await begin(page);
    const picks = ["Never", "Rarely", "Sometimes", "Often", "Almost always"];
    for (let i = 0; i < picks.length; i++) await tap(page, picks[i], i + 1);

    await page.reload();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 6 of 24");
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("radio", { name: "Almost always", exact: true })).toBeChecked();

    await page.getByRole("button", { name: "Pause and save" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("5 of 24 answered, saved on this device.").first()).toBeVisible();
    await page.getByRole("link", { name: "Continue where you left off" }).first().click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 5 of 24");
  });

  test("progress survives a brand-new tab in the same browser", async ({ context, page }) => {
    await begin(page);
    await tap(page, "Often", 1);
    await page.close();
    const page2 = await context.newPage();
    await page2.goto("/experience");
    await expect(page2.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    expect((await storedSession(page2))!.answers["com-1"]).toEqual({ frequency: "often" });
  });

  test("corrupted or tampered storage is ignored safely", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("frame24:session", "{not json"));
    await page.goto("/experience");
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
    await page.goto("/results");
    await expect(page.getByTestId("results-empty")).toBeVisible();
  });
});
