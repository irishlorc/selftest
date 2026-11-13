import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../../src/config/questionnaire";
import { begin, FREQ, next, select, storedSession, tap } from "./helpers";

test.describe("questionnaire", () => {
  test("all 24 statements show six options; tapping records the answer and moves on", async ({ page }) => {
    test.setTimeout(90_000);
    await begin(page);
    for (let i = 0; i < QUESTIONS.length; i++) {
      await expect(page.getByTestId("question-text")).toHaveText(QUESTIONS[i].text);
      await expect(page.getByRole("radiogroup").getByRole("radio")).toHaveCount(6);
      for (const label of FREQ) await expect(page.getByRole("radio", { name: label, exact: true })).toBeAttached();
      await tap(page, FREQ[i % 6], i + 1);
    }
    const s = await storedSession(page);
    const values = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    QUESTIONS.forEach((q, i) => expect(s!.answers[q.id]).toEqual({ frequency: values[i % 6] }));
  });

  test("there is no follow-up question after answering", async ({ page }) => {
    await begin(page);
    await select(page, "Often");
    await expect(page.getByText(/affect you/i)).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(6);
  });

  test("a quick double tap moves on only one statement", async ({ page }) => {
    await begin(page);
    const often = page.locator("label").filter({ has: page.getByRole("radio", { name: "Often", exact: true }) });
    await page.waitForTimeout(500);
    await often.dblclick();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    await page.waitForTimeout(700);
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
  });

  test("Next needs an answer; Skip, Back and Change behave predictably", async ({ page }) => {
    await begin(page);
    await next(page);
    await expect(page.getByTestId("question-hint")).toHaveText("Choose a response, or select Skip to move on.");
    await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");

    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    await tap(page, "Often", 2);

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    await expect(page.getByRole("radio", { name: "Often", exact: true })).toBeChecked();

    // Keyboard selection changes the answer without moving on.
    await select(page, "Never");
    await page.waitForTimeout(500);
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    expect((await storedSession(page))!.answers["com-2"]).toEqual({ frequency: "never" });

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
    expect((await storedSession(page))!.answers["com-1"]).toEqual({ skipped: true });

    // Skip Q1 again, keep Q2's answer with Next, skip the rest.
    await page.getByRole("button", { name: "Skip" }).click();
    await next(page);
    for (let i = 2; i < 24; i++) await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
    await expect(page.getByTestId("review-summary")).toContainText("Answered1");
    await expect(page.getByTestId("review-summary")).toContainText("Skipped23");

    // Change from review: tapping an answer returns to the review.
    await page.getByTestId("review-row-sen-3").getByRole("button", { name: /Change/ }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 7 of 24");
    await expect(page.getByTestId("next-button")).toHaveText("Back to review");
    await page.waitForTimeout(470);
    await page.locator("label").filter({ has: page.getByRole("radio", { name: "Almost always", exact: true }) }).click();
    await expect(page.getByTestId("review-row-sen-3").getByTestId("review-answer")).toHaveText("Almost always");
  });

  test("Start again clears answers after confirmation", async ({ page }) => {
    await begin(page);
    await tap(page, "Often", 1);
    for (let i = 1; i < 24; i++) await page.getByRole("button", { name: "Skip" }).click();
    await page.getByRole("button", { name: "Start again" }).click();
    await page.getByRole("button", { name: "Keep my answers" }).click();
    expect((await storedSession(page))!.answers["com-1"]).toBeTruthy();
    await page.getByRole("button", { name: "Start again" }).click();
    await page.getByRole("button", { name: "Clear and start again" }).click();
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
    expect((await storedSession(page))!.answers).toEqual({});
  });

  test("Begin requires confirmation", async ({ page }) => {
    await page.goto("/experience");
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.getByText("Please confirm to begin.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  });
});
