import { describe, expect, it } from "vitest";
import { createSession, firstOpenIndex, sanitizeSession, NOTE_MAX_LENGTH } from "@/lib/session";

describe("sanitizeSession", () => {
  it("rejects non-objects and wrong schema", () => {
    expect(sanitizeSession(null)).toBeNull();
    expect(sanitizeSession("x")).toBeNull();
    expect(sanitizeSession({ schema: 2, startedAt: new Date().toISOString() })).toBeNull();
    expect(sanitizeSession({ schema: 1 })).toBeNull();
  });

  it("round-trips a valid session", () => {
    const s = { ...createSession(), answers: { "com-1": { frequency: "often", impact: "mixed" } }, notes: { sensory: "hi" } };
    expect(sanitizeSession(JSON.parse(JSON.stringify(s)))).toEqual({ ...s, overallNote: undefined, consentedAt: undefined, completedAt: undefined });
  });

  it("drops unknown ids, invalid values and ineligible impacts", () => {
    const out = sanitizeSession({
      schema: 1,
      startedAt: "2026-11-12T10:00:00.000Z",
      currentIndex: 999,
      answers: {
        "com-1": { frequency: "sometimes", impact: "bogus" },
        "com-2": { frequency: "never", impact: "difficult" },
        "com-3": { frequency: "extremely" },
        "xxx": { frequency: "often" },
        "com-4": { skipped: true },
        "sen-1": { frequency: "not_sure", skipped: true },
      },
      notes: { sensory: "a".repeat(NOTE_MAX_LENGTH + 50), hacker: "x", social: 5 },
    })!;
    expect(out.answers).toEqual({
      "com-1": { frequency: "sometimes" },
      "com-2": { frequency: "never" },
      "com-4": { skipped: true },
      "sen-1": { frequency: "not_sure" },
    });
    expect(out.notes.sensory).toHaveLength(NOTE_MAX_LENGTH);
    expect(Object.keys(out.notes)).toEqual(["sensory"]);
    expect(out.currentIndex).toBe(23);
  });

  it("finds the first open statement", () => {
    const s = createSession();
    expect(firstOpenIndex(s)).toBe(0);
    s.answers["com-1"] = { frequency: "never" };
    s.answers["com-2"] = { skipped: true };
    expect(firstOpenIndex(s)).toBe(2);
  });
});
