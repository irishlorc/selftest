import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { QUESTIONS } from "@/config/questionnaire";
import { buildReport, pdfSafe } from "@/lib/pdf";
import { createSession, withFrequency, withSkip } from "@/lib/session";

describe("PDF report builder", () => {
  it("normalises typographic characters for standard PDF fonts", () => {
    expect(pdfSafe("‘It’s’ “quoted” — dash… €1 Seán")).toBe("'It's' \"quoted\" - dash... EUR 1 Seán");
  });

  it("builds a short report for full, empty and partial sessions", () => {
    let full = createSession();
    QUESTIONS.forEach((q, i) => {
      full = withFrequency(full, q.id, (["never", "rarely", "sometimes", "often", "almost_always", "not_sure"] as const)[i % 6]);
    });
    full = { ...full, completedAt: new Date().toISOString(), overallNote: "A long note. ".repeat(150) };
    let partial = withSkip(createSession(), "com-1");
    partial = withFrequency(partial, "com-2", "often");
    for (const s of [full, createSession(), partial]) {
      const doc = buildReport(new jsPDF({ unit: "mm", format: "a4" }), s, { includeNotes: true });
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(4);
      expect(doc.getNumberOfPages()).toBeLessThanOrEqual(7);
      expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(8_000);
    }
  });
});
