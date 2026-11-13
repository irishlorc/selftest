import { describe, expect, it } from "vitest";
import { QUESTIONS, DIMENSIONS, FREQUENCY_OPTIONS, type Frequency } from "@/config/questionnaire";
import { createSession, withFrequency, withSkip, type Session } from "@/lib/session";
import { computeResults } from "@/lib/results";

function sessionWith(entries: Array<[string, Frequency | "skip"]>): Session {
  let s = createSession(new Date("2026-11-12T10:00:00Z"));
  for (const [id, f] of entries) s = f === "skip" ? withSkip(s, id) : withFrequency(s, id, f);
  return s;
}

const FORBIDDEN = /\b(scored|likelihood|likely|probability|probable|severity|severe|risk|threshold|you are autistic|you are not autistic)\b/i;

describe("questionnaire configuration", () => {
  it("has 24 unique statements, four per dimension", () => {
    expect(QUESTIONS).toHaveLength(24);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(24);
    for (const d of DIMENSIONS) expect(QUESTIONS.filter((q) => q.dimension === d.id)).toHaveLength(4);
  });
  it("offers exactly six response options and no follow-up question", () => {
    expect(FREQUENCY_OPTIONS.map((o) => o.label)).toEqual([
      "Never", "Rarely", "Sometimes", "Often", "Almost always", "Not sure or not applicable",
    ]);
  });
});

describe("computeResults", () => {
  it("returns an all-gaps result for no session, assuming nothing", () => {
    const r = computeResults(null);
    expect(r.totals).toMatchObject({ statements: 24, reported: 0, unanswered: 24, frequent: 0 });
    for (const d of r.dimensions) {
      expect(d.reported).toBe(0);
      expect(d.centre).toBeNull();
    }
    expect(r.items.every((i) => i.position === null && i.frequencyLabel === "Not answered")).toBe(true);
  });

  it("places every answer at its exact spectrum position", () => {
    const freqs: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    const r = computeResults(sessionWith(QUESTIONS.map((q, i) => [q.id, freqs[i % 6]])));
    r.items.forEach((item, i) => {
      expect(item.frequency).toBe(freqs[i % 6]);
      expect(item.position).toBe(i % 6 === 5 ? null : i % 6);
    });
    expect(r.totals.reported).toBe(20);
    expect(r.totals.notSure).toBe(4);
    expect(r.totals.frequent).toBe(8);
  });

  it("centres each area on the middle of the reported answers only", () => {
    const r = computeResults(
      sessionWith([["com-1", "never"], ["com-2", "almost_always"], ["com-3", "not_sure"], ["com-4", "skip"]]),
    );
    const d = r.dimensions.find((x) => x.dimension.id === "communication")!;
    expect(d.centre).toBe(2);
    expect(d.reported).toBe(2);
    expect(d.notSure + d.skipped).toBe(2);
    expect(d.summary).toBe("You answered 2 of 4, with 1 as often or almost always; 2 left out.");
  });

  it("all 'almost always' sits at 4 and all 'never' at 0", () => {
    const hi = computeResults(sessionWith(QUESTIONS.map((q) => [q.id, "almost_always"])));
    const lo = computeResults(sessionWith(QUESTIONS.map((q) => [q.id, "never"])));
    expect(hi.dimensions.every((d) => d.centre === 4)).toBe(true);
    expect(lo.dimensions.every((d) => d.centre === 0)).toBe(true);
  });

  it("skipping replaces an earlier answer and removes it from the spectrum", () => {
    let s = sessionWith([["att-1", "often"]]);
    s = withSkip(s, "att-1");
    const r = computeResults(s);
    const item = r.items.find((i) => i.question.id === "att-1")!;
    expect(item.status).toBe("skipped");
    expect(item.position).toBeNull();
    expect(r.dimensions.find((d) => d.dimension.id === "attention")!.centre).toBeNull();
  });

  it("never produces an overall score or likelihood language", () => {
    const freqs: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    for (let seed = 0; seed < 50; seed++) {
      const r = computeResults(
        sessionWith(QUESTIONS.map((q, i) => ((i + seed) % 9 === 0 ? [q.id, "skip"] : [q.id, freqs[(i * 7 + seed * 3) % 6]]))),
      );
      const text = [...r.dimensions.map((d) => d.summary), ...r.discussionPrompts].join("\n");
      expect(text).not.toMatch(FORBIDDEN);
      expect(r).not.toHaveProperty("score");
      expect(r).not.toHaveProperty("centre");
      expect(r.totals).not.toHaveProperty("centre");
    }
  });

  it("includes discussion prompts only for areas with frequent answers, plus general prompts", () => {
    expect(computeResults(sessionWith([["day-1", "never"]])).discussionPrompts).toHaveLength(3);
    expect(computeResults(sessionWith([["day-3", "often"]])).discussionPrompts).toHaveLength(5);
  });
});
