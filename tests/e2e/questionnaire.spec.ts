import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../../src/config/questionnaire";
import { begin, choose, FREQ, IMPACT, next, storedSession } from "./helpers";

test.describe("questionnaire", () => {
  test("all 24 statements show six response options and record each choice", async ({ page }) => {
    test.setTimeout(90_000);
    await begin(page);
    for (let i = 0; i < QUESTIONS.length; i++) {
      await expect(page.getByTestId("progress-label")).toHaveText(`Question ${i + 1} of 24`);
      await expect(page.getByTestId("question-text")).toHaveText(QUESTIONS[i].text);
      const radios = page.getByRole("radiogroup").getByRole("radio");
      await expect(radios).toHaveCount(6);
      for (const label of FREQ) await expect(page.getByRole("radio", { name: label, exact: true })).toBeAttached();
      const label = FREQ[i % 6];
      await choose(page, label);
      const impactShown = label !== "Never" && label !== "Not sure or not applicable";
      await expect(page.getByTestId("impact-fieldset")).toHaveCount(impactShown ? 1 : 0);
      if (impactShown) {
        for (const l of IMPACT) await expect(page.getByRole("radio", { name: l, exact: true })).toBeAttached();
        await choose(page, IMPACT[i % 4]);
      }
      await next(page);
    }
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
    const s = await storedSession(page);
    const values = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    const impacts = ["helpful", "neutral", "difficult", "mixed"];
    QUESTIONS.forEach((q, i) => {
      expect(s!.answers[q.id].frequency).toBe(values[i % 6]);
      const eligible = i % 6 >= 1 && i % 6 <= 4;
      expect(s!.answers[q.id].impact).toBe(eligible ? impacts[i % 4] : undefined);
    });
  });

  test("Next needs an answer; Skip, Back and Change behave predictably", async ({ page }) => {
    await begin(page);
    await next(page);
    await expect(page.getByTestId("question-hint")).toHaveText("Choose a response, or select Skip to move on.");
    await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");

    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    await choose(page, "Often");
    await choose(page, "Mostly difficult");
    await next(page);
    await expect(page.getByTestId("progress-label")).toHaveText("Question 3 of 24");

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 2 of 24");
    await expect(page.getByRole("radio", { name: "Often", exact: true })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Mostly difficult", exact: true })).toBeChecked();

    // Changing to "Never" removes the impact follow-up and its stored value.
    await choose(page, "Never");
    await expect(page.getByTestId("impact-fieldset")).toHaveCount(0);
    let s = await storedSession(page);
    expect(s!.answers["com-2"]).toEqual({ frequency: "never" });

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 1 of 24");
    await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
    s = await storedSession(page);
    expect(s!.answers["com-1"]).toEqual({ skipped: true });

    // Skip Q1 again, keep Q2's answer with Next, then skip the rest.
    await page.getByRole("button", { name: "Skip" }).click();
    await next(page);
    for (let i = 2; i < 24; i++) await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
    await expect(page.getByTestId("review-summary")).toContainText("Answered1");
    await expect(page.getByTestId("review-summary")).toContainText("Skipped23");

    // Change from review returns to review.
    await page.getByTestId("review-row-sen-3").getByRole("button", { name: /Change/ }).click();
    await expect(page.getByTestId("progress-label")).toHaveText("Question 7 of 24");
    await choose(page, "Almost always");
    await expect(page.getByTestId("next-button")).toHaveText("Back to review");
    await next(page);
    await expect(page.getByTestId("review-row-sen-3").getByTestId("review-answer")).toHaveText("Almost always");
  });

  test("Start again clears answers after confirmation", async ({ page }) => {
    await begin(page);
    await choose(page, "Often");
    for (let i = 0; i < 24; i++) await page.getByRole("button", { name: "Skip" }).click();
    await page.getByRole("button", { name: "Start again" }).click();
    await page.getByRole("button", { name: "Keep my answers" }).click();
    expect((await storedSession(page))!.answers["com-1"]).toBeTruthy();
    await page.getByRole("button", { name: "Start again" }).click();
    await page.getByRole("button", { name: "Clear and start again" }).click();
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
    expect((await storedSession(page))!.answers).toEqual({});
  });

  test("Begin requires both confirmations", async ({ page }) => {
    await page.goto("/experience");
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.getByText("Please confirm both statements to begin.")).toBeVisible();
    await page.getByLabel("I am 18 or over.").check();
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  });
});
