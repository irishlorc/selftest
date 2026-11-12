import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { QUESTIONS } from "@/config/questionnaire";
import { buildReport, pdfSafe } from "@/lib/pdf";
import { createSession, withFrequency, withImpact, withSkip } from "@/lib/session";

describe("PDF report builder", () => {
  it("normalises typographic characters for standard PDF fonts", () => {
    expect(pdfSafe("‘It’s’ “quoted” — dash… €1 Seán")).toBe("'It's' \"quoted\" - dash... EUR 1 Seán");
  });

  it("builds a multi-page report for full, empty and partial sessions", () => {
    let full = createSession();
    QUESTIONS.forEach((q, i) => {
      full = withFrequency(full, q.id, (["never", "rarely", "sometimes", "often", "almost_always", "not_sure"] as const)[i % 6]);
      full = withImpact(full, q.id, "mixed");
    });
    full = { ...full, completedAt: new Date().toISOString(), notes: { sensory: "A long note. ".repeat(150) }, overallNote: "Overall." };
    let partial = withSkip(createSession(), "com-1");
    partial = withFrequency(partial, "com-2", "often");
    for (const s of [full, createSession(), partial]) {
      const doc = buildReport(new jsPDF({ unit: "mm", format: "a4" }), s, { includeNotes: true });
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(8);
      const bytes = doc.output("arraybuffer");
      expect(bytes.byteLength).toBeGreaterThan(10_000);
    }
  });
});
