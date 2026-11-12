import { describe, expect, it } from "vitest";
import { QUESTIONS, DIMENSIONS, FREQUENCY_OPTIONS, IMPACT_OPTIONS, type Frequency, type Impact } from "@/config/questionnaire";
import { createSession, withFrequency, withImpact, withSkip, type Session } from "@/lib/session";
import { computeResults } from "@/lib/results";

function sessionWith(entries: Array<[string, Frequency | "skip", Impact?]>): Session {
  let s = createSession(new Date("2026-11-12T10:00:00Z"));
  for (const [id, f, impact] of entries) {
    if (f === "skip") s = withSkip(s, id);
    else {
      s = withFrequency(s, id, f);
      if (impact) s = withImpact(s, id, impact);
    }
  }
  return s;
}

const FORBIDDEN = /\b(score|scored|likelihood|likely|probability|probable|severity|severe|risk|threshold|diagnos(is|ed|e)\s+(you|confirmed)|you are autistic|you are not autistic)\b/i;

describe("questionnaire configuration", () => {
  it("has 24 unique statements, four per dimension", () => {
    expect(QUESTIONS).toHaveLength(24);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(24);
    for (const d of DIMENSIONS) expect(QUESTIONS.filter((q) => q.dimension === d.id)).toHaveLength(4);
  });
  it("offers six response options and four impact options", () => {
    expect(FREQUENCY_OPTIONS.map((o) => o.label)).toEqual([
      "Never", "Rarely", "Sometimes", "Often", "Almost always", "Not sure or not applicable",
    ]);
    expect(IMPACT_OPTIONS.map((o) => o.value)).toEqual(["helpful", "neutral", "difficult", "mixed"]);
  });
});

describe("computeResults", () => {
  it("returns an all-gaps result for no session, assuming nothing", () => {
    const r = computeResults(null);
    expect(r.totals).toMatchObject({ statements: 24, reported: 0, unanswered: 24, frequent: 0, difficult: 0 });
    for (const d of r.dimensions) {
      expect(d.reported).toBe(0);
      expect(Object.values(d.distribution).every((n) => n === 0)).toBe(true);
    }
    expect(r.items.every((i) => i.status === "unanswered" && i.frequencyLabel === "Not answered")).toBe(true);
  });

  it("reflects every answer exactly", () => {
    const freqs: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    const s = sessionWith(QUESTIONS.map((q, i) => [q.id, freqs[i % 6]]));
    const r = computeResults(s);
    r.items.forEach((item, i) => {
      expect(item.frequency).toBe(freqs[i % 6]);
      expect(item.status).toBe(freqs[i % 6] === "not_sure" ? "not_sure" : "answered");
    });
    expect(r.totals.reported).toBe(20);
    expect(r.totals.notSure).toBe(4);
    expect(r.totals.frequent).toBe(8);
    const sumDist = r.dimensions.reduce((a, d) => a + Object.values(d.distribution).reduce((x, y) => x + y, 0), 0);
    expect(sumDist).toBe(20);
  });

  it("counts frequency and impact independently", () => {
    const s = sessionWith([
      ["com-1", "almost_always", "helpful"],
      ["com-2", "rarely", "difficult"],
      ["com-3", "often", "mixed"],
      ["com-4", "never"],
    ]);
    const d = computeResults(s).dimensions.find((x) => x.dimension.id === "communication")!;
    expect(d.frequent).toBe(2);
    expect(d.impact).toEqual({ helpful: 1, neutral: 0, difficult: 1, mixed: 1 });
    const r = computeResults(s);
    expect(r.highlights.frequentAndHelpful.map((i) => i.question.id)).toEqual(["com-1"]);
    expect(r.highlights.frequentAndDifficult.map((i) => i.question.id)).toEqual(["com-3"]);
    expect(r.highlights.lessFrequentButDifficult.map((i) => i.question.id)).toEqual(["com-2"]);
  });

  it("treats skipped and not-sure statements as gaps, never as answers", () => {
    const s = sessionWith([["sen-1", "skip"], ["sen-2", "not_sure"], ["sen-3", "often", "difficult"]]);
    const d = computeResults(s).dimensions.find((x) => x.dimension.id === "sensory")!;
    expect(d.reported).toBe(1);
    expect(d.skipped).toBe(1);
    expect(d.notSure).toBe(1);
    expect(d.unanswered).toBe(1);
    expect(d.patterns.join(" ")).toMatch(/3 statements were skipped, unanswered or marked ‘not sure’/);
  });

  it("drops impact when the frequency changes to never or not sure", () => {
    let s = sessionWith([["pre-1", "often", "difficult"]]);
    s = withFrequency(s, "pre-1", "never");
    expect(s.answers["pre-1"]).toEqual({ frequency: "never" });
    s = withImpact(s, "pre-1", "helpful");
    expect(s.answers["pre-1"].impact).toBeUndefined();
    s = withFrequency(s, "pre-1", "sometimes");
    s = withImpact(s, "pre-1", "mixed");
    s = withFrequency(s, "pre-1", "often");
    expect(s.answers["pre-1"]).toEqual({ frequency: "often", impact: "mixed" });
  });

  it("skipping replaces an earlier answer", () => {
    let s = sessionWith([["att-1", "often", "helpful"]]);
    s = withSkip(s, "att-1");
    const item = computeResults(s).items.find((i) => i.question.id === "att-1")!;
    expect(item.status).toBe("skipped");
    expect(item.impact).toBeUndefined();
  });

  it("uses the empty-dimension message when nothing in an area has a frequency", () => {
    const s = sessionWith([["soc-1", "not_sure"], ["soc-2", "skip"]]);
    const d = computeResults(s).dimensions.find((x) => x.dimension.id === "social")!;
    expect(d.patterns).toHaveLength(1);
    expect(d.patterns[0]).toMatch(/nothing to reflect back/);
  });

  it("never produces scoring, likelihood or diagnostic language", () => {
    const freqs: Frequency[] = ["never", "rarely", "sometimes", "often", "almost_always", "not_sure"];
    const impacts: Impact[] = ["helpful", "neutral", "difficult", "mixed"];
    for (let seed = 0; seed < 50; seed++) {
      const s = sessionWith(
        QUESTIONS.map((q, i) => {
          const f = freqs[(i * 7 + seed * 3) % 6];
          return (i + seed) % 9 === 0 ? [q.id, "skip"] : [q.id, f, impacts[(i + seed) % 4]];
        }),
      );
      const r = computeResults(s);
      const text = [...r.dimensions.flatMap((d) => d.patterns), ...r.discussionPrompts].join("\n");
      expect(text).not.toMatch(FORBIDDEN);
      expect(r).not.toHaveProperty("score");
    }
  });

  it("includes discussion prompts only for areas with frequent or difficult reports, plus general prompts", () => {
    const none = computeResults(sessionWith([["day-1", "never"]]));
    expect(none.discussionPrompts).toHaveLength(3);
    const some = computeResults(sessionWith([["day-3", "rarely", "difficult"]]));
    expect(some.discussionPrompts.length).toBe(5);
  });
});
