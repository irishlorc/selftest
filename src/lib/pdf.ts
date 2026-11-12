/**
 * Builds the FRAME-24 PDF report entirely on the user's device with jsPDF.
 * Nothing is uploaded. The builder takes a jsPDF instance so it can run in
 * the browser (download) or in Node (tests).
 */
import type { jsPDF as JsPDF } from "jspdf";
import {
  DIMENSIONS,
  FRAMEWORK,
  IMPACT_OPTIONS,
  QUESTIONS,
  type Frequency,
  type Impact,
} from "@/config/questionnaire";
import { COPY } from "@/config/interpretation";
import { ASSESSMENT_RESOURCES, RESOURCES_LAST_VERIFIED, URGENT_SUPPORT, SUPPORT_RESOURCES } from "@/config/resources";
import { computeResults, type ItemResult } from "./results";
import type { Session } from "./session";
import { formatDate } from "./format";

type RGB = [number, number, number];

const INK: RGB = [34, 29, 51];
const INK2: RGB = [72, 66, 92];
const INK3: RGB = [98, 92, 120];
const LINE: RGB = [221, 216, 232];
const PAPER: RGB = [246, 244, 250];
const SURFACE2: RGB = [239, 236, 246];

const DIM_COLOURS: Record<string, { soft: RGB; deep: RGB }> = {
  lavender: { soft: [220, 207, 248], deep: [75, 47, 168] },
  peach: { soft: [255, 220, 198], deep: [147, 56, 14] },
  mint: { soft: [194, 237, 214], deep: [27, 102, 70] },
  butter: { soft: [248, 234, 171], deep: [111, 82, 0] },
  rose: { soft: [249, 210, 229], deep: [150, 38, 88] },
  lime: { soft: [222, 243, 171], deep: [70, 98, 10] },
};

const FILL: Record<Exclude<Frequency, "not_sure">, number> = {
  never: 0.06,
  rarely: 0.25,
  sometimes: 0.5,
  often: 0.75,
  almost_always: 1,
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18; // margin
const CONTENT_W = PAGE_W - M * 2;
const FOOTER_SPACE = 16;

/** Standard PDF fonts use WinAnsi; normalise typographic characters safely. */
export function pdfSafe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/€/g, "EUR ")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ]/g, "");
}

export interface ReportOptions {
  includeNotes: boolean;
  generatedAt?: Date;
}

class Writer {
  y = M;
  constructor(public doc: JsPDF) {}

  newPage() {
    this.doc.addPage();
    this.y = M;
  }

  ensure(h: number) {
    if (this.y + h > PAGE_H - M - FOOTER_SPACE) this.newPage();
  }

  colour(c: RGB) {
    this.doc.setTextColor(c[0], c[1], c[2]);
  }

  fill(c: RGB) {
    this.doc.setFillColor(c[0], c[1], c[2]);
  }

  draw(c: RGB) {
    this.doc.setDrawColor(c[0], c[1], c[2]);
  }

  /** Writes wrapped text, breaking across pages line by line. */
  text(
    str: string,
    opts: { size?: number; style?: "normal" | "bold" | "italic"; colour?: RGB; x?: number; width?: number; lh?: number; after?: number } = {},
  ) {
    const { size = 10.5, style = "normal", colour = INK, x = M, width = CONTENT_W, lh = 1.45, after = 2 } = opts;
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.colour(colour);
    const lines = this.doc.splitTextToSize(pdfSafe(str), width) as string[];
    const lineH = (size * lh) / 2.835; // pt -> mm
    for (const line of lines) {
      this.ensure(lineH);
      this.doc.text(line, x, this.y + lineH * 0.78);
      this.y += lineH;
    }
    this.y += after;
  }

  heading(str: string, size = 18) {
    this.ensure(size * 0.9);
    this.text(str, { size, style: "bold", after: 3, lh: 1.2 });
  }

  rule(gapBefore = 2, gapAfter = 5) {
    this.y += gapBefore;
    this.draw(LINE);
    this.doc.setLineWidth(0.3);
    this.doc.line(M, this.y, PAGE_W - M, this.y);
    this.y += gapAfter;
  }
}

function tile(doc: JsPDF, x: number, y: number, size: number, token: string, item: Pick<ItemResult, "status" | "frequency" | "impact">) {
  const c = DIM_COLOURS[token];
  const r = size * 0.3;
  if (item.status === "skipped" || item.status === "unanswered") {
    doc.setDrawColor(189, 182, 207);
    doc.setLineWidth(0.35);
    doc.setLineDashPattern([0.9, 0.9], 0);
    doc.roundedRect(x, y, size, size, r, r, "S");
    doc.setLineDashPattern([], 0);
    return;
  }
  doc.setFillColor(c.soft[0], c.soft[1], c.soft[2]);
  doc.roundedRect(x, y, size, size, r, r, "F");
  if (item.status === "not_sure") {
    doc.setDrawColor(c.deep[0], c.deep[1], c.deep[2]);
    doc.setLineWidth(0.25);
    for (let k = -size; k < size; k += size / 4) {
      const x1 = Math.max(x, x + k);
      const y1 = y + (x1 - (x + k));
      const x2 = Math.min(x + size, x + k + size);
      const y2 = y + (x2 - (x + k));
      if (x2 > x1) doc.line(x1 + 0.4, y1 + 0.4, x2 - 0.4, y2 - 0.4);
    }
    return;
  }
  if (item.frequency && item.frequency !== "not_sure") {
    const h = Math.max(size * FILL[item.frequency], 0.5);
    doc.setFillColor(c.deep[0], c.deep[1], c.deep[2]);
    // Clip to the rounded frame, then fill from the bottom.
    doc.saveGraphicsState();
    doc.roundedRect(x, y, size, size, r, r, null);
    doc.clip();
    doc.discardPath();
    doc.rect(x, y + size - h, size, h, "F");
    doc.restoreGraphicsState();
  }
  if (item.impact) impactSymbol(doc, x + size - 3.2, y + 1.2, 2.2, item.impact, c.deep);
}

function impactSymbol(doc: JsPDF, x: number, y: number, s: number, impact: Impact, colour: RGB) {
  doc.setFillColor(255, 255, 255);
  doc.circle(x + s / 2, y + s / 2, s * 0.75, "F");
  doc.setFillColor(colour[0], colour[1], colour[2]);
  doc.setDrawColor(colour[0], colour[1], colour[2]);
  doc.setLineWidth(0.25);
  if (impact === "helpful") doc.circle(x + s / 2, y + s / 2, s * 0.42, "F");
  if (impact === "neutral") doc.rect(x + s * 0.1, y + s * 0.38, s * 0.8, s * 0.24, "F");
  if (impact === "difficult") doc.triangle(x + s / 2, y + s * 0.08, x + s * 0.95, y + s * 0.9, x + s * 0.05, y + s * 0.9, "F");
  if (impact === "mixed") {
    doc.circle(x + s / 2, y + s / 2, s * 0.42, "S");
    doc.rect(x + s / 2, y + s * 0.1, s * 0.4, s * 0.8, "F");
  }
}

/** Builds the full report into `doc` and returns it. */
export function buildReport(doc: JsPDF, session: Session, opts: ReportOptions): JsPDF {
  const results = computeResults(session);
  const w = new Writer(doc);
  const generated = opts.generatedAt ?? new Date();
  const dateLabel = session.completedAt ? formatDate(session.completedAt) : formatDate(generated.toISOString());

  doc.setProperties({
    title: "FRAME-24 personal reflection report",
    subject: "Self-reflection report (not a diagnostic document)",
    creator: "FRAME-24 (generated locally in the browser)",
  });

  // ---------------- Cover ----------------
  w.fill(PAPER);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Personal mosaic from the person's own answers.
  const tileSize = 15;
  const gap = 3.6;
  const gridX = PAGE_W - M - (tileSize * 6 + gap * 5);
  results.dimensions.forEach((d, col) => {
    d.items.forEach((item, row) => {
      tile(doc, gridX + col * (tileSize + gap), 34 + row * (tileSize + gap) + (col % 3) * 4, tileSize, d.dimension.token, item);
    });
  });

  w.y = 30;
  w.text("FRAME-24", { size: 13, style: "bold", width: 60 });
  w.y = 118;
  w.text("Personal reflection report", { size: 30, style: "bold", lh: 1.15, after: 4, width: 140 });
  w.text(session.completedAt ? `Completed ${dateLabel}` : `Generated ${dateLabel} (in progress)`, { size: 12, colour: INK2, after: 10 });

  const stats: Array<[string, number]> = [
    ["Statements answered", results.totals.reported],
    ["Often or almost always", results.totals.frequent],
    ["Marked difficult or mixed", results.totals.difficult + results.totals.mixed],
    ["Not sure, skipped or unanswered", results.totals.notSure + results.totals.skipped + results.totals.unanswered],
  ];
  const boxW = (CONTENT_W - 9) / 4;
  stats.forEach(([label, value], i) => {
    const x = M + i * (boxW + 3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, w.y, boxW, 26, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    w.colour(INK);
    doc.text(String(value), x + 4, w.y + 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    w.colour(INK2);
    doc.text(doc.splitTextToSize(label, boxW - 8), x + 4, w.y + 17);
  });
  w.y += 36;

  // Disclaimer box
  const discLines = doc.splitTextToSize(pdfSafe(COPY.nonDiagnostic), CONTENT_W - 12) as string[];
  const discH = 14 + discLines.length * 4.6;
  const discY = PAGE_H - M - discH - 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
  doc.roundedRect(M, discY, CONTENT_W, discH, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  w.colour(INK);
  doc.text("Not a diagnosis", M + 6, discY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  w.colour(INK2);
  doc.text(discLines, M + 6, discY + 14);

  // ---------------- About + overview ----------------
  w.newPage();
  w.heading("About this report", 20);
  w.text(
    "This report reflects your own responses to the 24 FRAME-24 statements, grouped into six areas of everyday experience. It describes what you reported. It does not score, rank or interpret your answers clinically.",
    { colour: INK2 },
  );
  w.text(COPY.frequencyVsDifficulty, { colour: INK2 });
  w.text(COPY.noAssumptions, { colour: INK2, after: 6 });

  w.heading("Your 24 frames", 15);
  w.text("Each frame is one statement. Fill height shows how often; a symbol shows how it affects you, where you said.", {
    colour: INK2,
    size: 9.5,
    after: 5,
  });
  for (const d of results.dimensions) {
    w.ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    w.colour(INK);
    doc.text(doc.splitTextToSize(pdfSafe(d.dimension.name), 62), M, w.y + 6);
    d.items.forEach((item, i) => tile(doc, M + 68 + i * 15, w.y, 12, d.dimension.token, item));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    w.colour(INK2);
    doc.text(`${d.frequent} of ${d.total} often or almost always`, M + 132, w.y + 5);
    doc.text(`${d.impact.difficult + d.impact.mixed} difficult or mixed`, M + 132, w.y + 9.5);
    w.y += 16;
  }

  // Legend
  w.y += 2;
  w.ensure(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  w.colour(INK);
  doc.text("Key", M, w.y + 3);
  w.y += 6;
  const legend: Array<[string, Pick<ItemResult, "status" | "frequency" | "impact">]> = [
    ["Never", { status: "answered", frequency: "never" }],
    ["Rarely", { status: "answered", frequency: "rarely" }],
    ["Sometimes", { status: "answered", frequency: "sometimes" }],
    ["Often", { status: "answered", frequency: "often" }],
    ["Almost always", { status: "answered", frequency: "almost_always" }],
    ["Not sure", { status: "not_sure", frequency: "not_sure" }],
    ["Skipped / unanswered", { status: "skipped" }],
  ];
  legend.forEach(([label, item], i) => {
    const x = M + (i % 4) * 44;
    const y = w.y + Math.floor(i / 4) * 9;
    tile(doc, x, y, 6, "lavender", item);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    w.colour(INK2);
    doc.text(label, x + 8, y + 4.5);
  });
  w.y += 20;
  IMPACT_OPTIONS.forEach((o, i) => {
    const x = M + i * 44;
    impactSymbol(doc, x + 1, w.y, 3.5, o.value, INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    w.colour(INK2);
    doc.text(o.label, x + 8, w.y + 3);
  });
  w.y += 10;

  // ---------------- Dimensions ----------------
  for (const d of results.dimensions) {
    const c = DIM_COLOURS[d.dimension.token];
    w.ensure(70);
    if (w.y > M + 1) w.y += 6;
    const bandH = 24;
    doc.setFillColor(c.soft[0], c.soft[1], c.soft[2]);
    doc.roundedRect(M, w.y, CONTENT_W, bandH, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    w.colour(INK);
    doc.text(pdfSafe(d.dimension.name), M + 7, w.y + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    w.colour(INK2);
    doc.text(pdfSafe(d.dimension.summary), M + 7, w.y + 17);
    d.items.forEach((item, i) => tile(doc, PAGE_W - M - 7 - (4 - i) * 9.5 + 1.5, w.y + 8, 8, d.dimension.token, item));
    w.y += bandH + 5;

    // Statement rows
    for (const item of d.items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(pdfSafe(item.question.text), CONTENT_W - 62) as string[];
      const rowH = Math.max(lines.length * 4.6 + 3, 10);
      w.ensure(rowH + 2);
      tile(doc, M, w.y, 7, d.dimension.token, item);
      w.colour(INK);
      doc.text(lines, M + 11, w.y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(pdfSafe(item.frequencyLabel), PAGE_W - M - 46, w.y + 4.5);
      if (item.impactLabel) {
        doc.setFont("helvetica", "normal");
        w.colour(INK2);
        doc.text(pdfSafe(item.impactLabel), PAGE_W - M - 46, w.y + 9);
      }
      w.y += rowH;
      w.draw(LINE);
      doc.setLineWidth(0.2);
      doc.line(M + 11, w.y, PAGE_W - M, w.y);
      w.y += 2.5;
    }
    w.y += 3;
    w.text("What you reported", { size: 10.5, style: "bold", after: 1 });
    for (const p of d.patterns) w.text(p, { colour: INK2, size: 10 });
    w.text(`${d.about} ${d.overlaps}`, { colour: INK3, size: 9, after: 3 });

    const note = session.notes[d.dimension.id];
    if (opts.includeNotes && note) {
      w.ensure(18);
      w.text("Your reflections", { size: 10.5, style: "bold", after: 1 });
      w.text(note, { colour: INK, size: 10, x: M + 4, width: CONTENT_W - 4, after: 3 });
    }
  }

  // ---------------- Patterns ----------------
  w.newPage();
  w.heading("Patterns across your answers", 20);
  const sections: Array<[string, string, ItemResult[]]> = [
    ["Frequent and difficult or mixed", "Reported often or almost always, and marked difficult or mixed.", results.highlights.frequentAndDifficult],
    ["Frequent and helpful", "Reported often or almost always, and marked mostly helpful.", results.highlights.frequentAndHelpful],
    [
      "Less frequent, but difficult or mixed",
      "Not frequent, yet marked difficult or mixed when it happens.",
      results.highlights.lessFrequentButDifficult,
    ],
  ];
  for (const [title, body, items] of sections) {
    w.ensure(22);
    w.text(title, { size: 12, style: "bold", after: 0.5 });
    w.text(body, { size: 9.5, colour: INK3, after: 2 });
    if (items.length === 0) w.text("None from your answers.", { colour: INK2, size: 10, after: 5 });
    else {
      for (const i of items) {
        w.text(`#${i.index + 1}  ${i.question.text} (${i.frequencyLabel}, ${i.impactLabel})`, { size: 10, x: M + 3, width: CONTENT_W - 3, after: 1.5 });
      }
      w.y += 4;
    }
  }

  w.y += 4;
  w.heading("Questions you might discuss with a professional", 15);
  w.text(
    "These prompts are based on the areas where you reported frequent or difficult experiences, plus some that are useful for everyone. Use any that feel relevant.",
    { colour: INK2, size: 10, after: 4 },
  );
  results.discussionPrompts.forEach((p, i) => {
    w.text(`${i + 1}.  ${p}`, { size: 10.5, x: M + 2, width: CONTENT_W - 2, after: 2.5 });
  });

  if (opts.includeNotes && session.overallNote) {
    w.y += 6;
    w.heading("Your overall reflections", 15);
    w.text(session.overallNote, { size: 10.5 });
  }

  // ---------------- Appendix ----------------
  w.newPage();
  w.heading("Appendix: your full responses", 20);
  w.text(`All ${QUESTIONS.length} statements in the order they were presented.`, { colour: INK2, size: 10, after: 4 });
  const cols = { n: M, s: M + 9, f: M + 120, i: M + 150 };
  const header = () => {
    w.fill(SURFACE2);
    doc.rect(M, w.y, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    w.colour(INK);
    doc.text("#", cols.n + 2, w.y + 4.8);
    doc.text("Statement", cols.s, w.y + 4.8);
    doc.text("Response", cols.f, w.y + 4.8);
    doc.text("Effect", cols.i, w.y + 4.8);
    w.y += 9;
  };
  header();
  let currentDim = "";
  for (const item of results.items) {
    const dim = DIMENSIONS.find((x) => x.id === item.question.dimension)!;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    const lines = doc.splitTextToSize(pdfSafe(item.question.text), 106) as string[];
    const freqLines = doc.splitTextToSize(pdfSafe(item.frequencyLabel), 28) as string[];
    const rowH = Math.max(lines.length, freqLines.length) * 3.8 + 2.6;
    const needsDim = currentDim !== dim.id;
    if (w.y + rowH + (needsDim ? 7 : 0) > PAGE_H - M - FOOTER_SPACE) {
      w.newPage();
      header();
      currentDim = "";
    }
    if (currentDim !== dim.id) {
      currentDim = dim.id;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      w.colour(DIM_COLOURS[dim.token].deep);
      doc.text(pdfSafe(dim.name), cols.s, w.y + 3.5);
      w.y += 5.5;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    w.colour(INK3);
    doc.text(String(item.index + 1), cols.n + 2, w.y + 3.4);
    w.colour(INK);
    doc.text(lines, cols.s, w.y + 3.4);
    doc.setFont("helvetica", item.status === "answered" ? "bold" : "normal");
    w.colour(item.status === "answered" ? INK : INK3);
    doc.text(freqLines, cols.f, w.y + 3.4);
    doc.setFont("helvetica", "normal");
    w.colour(INK2);
    doc.text(item.impactLabel ? pdfSafe(item.impactLabel) : "-", cols.i, w.y + 3.4);
    w.y += rowH;
    w.draw(LINE);
    doc.setLineWidth(0.15);
    doc.line(M, w.y - 1, PAGE_W - M, w.y - 1);
  }

  // ---------------- Important information ----------------
  w.newPage();
  w.heading("Important information", 20);
  w.text(COPY.nonDiagnostic, { size: 10.5 });
  w.text(
    `FRAME-24 is an original, experimental framework (version ${FRAMEWORK.version}). Its statements and areas are not established medical scales and have not been independently reviewed by clinicians. It does not calculate autism likelihood, diagnostic probability, severity, risk categories or clinical thresholds.`,
    { size: 10, colour: INK2 },
  );
  w.text(
    "Only a qualified professional (in Ireland, usually a psychologist or psychiatrist experienced in adult autism assessment) can assess whether someone is autistic. You are welcome to bring this report to that conversation as a record of your own reflections.",
    { size: 10, colour: INK2, after: 6 },
  );

  w.heading("If you need support now", 13);
  for (const r of URGENT_SUPPORT) {
    w.text(`${r.name}: ${(r.contact ?? []).join(", ")}`, { size: 10, style: "bold", after: 0.5 });
    w.text(r.description, { size: 9.5, colour: INK2, after: 2.5 });
  }
  w.y += 3;
  w.heading("Assessment and information in Ireland", 13);
  for (const r of [...ASSESSMENT_RESOURCES, ...SUPPORT_RESOURCES]) {
    w.ensure(14);
    w.text(r.name + (r.contact ? ` - ${r.contact.join(", ")}` : ""), { size: 10, style: "bold", after: 0.5 });
    w.text(`${r.description} ${r.url}`, { size: 9, colour: INK2, after: 2.5 });
  }
  w.text(
    `Resource details were checked on ${formatDate(RESOURCES_LAST_VERIFIED)}. Services and contact details change, so please confirm with the provider.`,
    { size: 9, colour: INK3, after: 4 },
  );
  w.text(
    `This report was generated on your own device on ${formatDate(generated.toISOString())}. FRAME-24 did not upload or store a copy.`,
    { size: 9, colour: INK3 },
  );

  // ---------------- Footers ----------------
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(INK3[0], INK3[1], INK3[2]);
    doc.text("FRAME-24 reflection report  |  Self-reflection only, not a diagnostic document", M, PAGE_H - 10);
    doc.text(`Page ${p} of ${pages}`, PAGE_W - M, PAGE_H - 10, { align: "right" });
  }
  return doc;
}

/** Browser entry point: builds and downloads the PDF. */
export async function downloadReport(session: Session, opts: ReportOptions): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  buildReport(doc, session, opts);
  const d = session.completedAt ? new Date(session.completedAt) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `FRAME-24-report-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.pdf`;
  doc.save(filename);
  return filename;
}
