/**
 * FRAME-24 descriptive results engine.
 *
 * This engine COUNTS and DESCRIBES a person's own answers. By design it does
 * not compute any score, likelihood, probability, severity, risk category or
 * threshold, and it never infers an answer for a skipped statement.
 */
import {
  DIMENSIONS,
  FREQUENCY_LABEL,
  IMPACT_LABEL,
  QUESTIONS,
  SCALE,
  questionsFor,
  type Dimension,
  type Frequency,
  type Impact,
  type Question,
} from "@/config/questionnaire";
import {
  COPY,
  DIMENSION_INTERPRETATION,
  GENERAL_DISCUSSION_PROMPTS,
} from "@/config/interpretation";
import type { Session } from "./session";

export type ItemStatus = "answered" | "not_sure" | "skipped" | "unanswered";

export interface ItemResult {
  question: Question;
  index: number; // 0-based position in the questionnaire
  status: ItemStatus;
  frequency?: Frequency;
  impact?: Impact;
  frequencyLabel: string;
  impactLabel: string | null;
  /** Often or almost always. */
  frequent: boolean;
}

export interface DimensionResult {
  dimension: Dimension;
  items: ItemResult[];
  total: number;
  /** Statements with a frequency on the scale (excludes "not sure"). */
  reported: number;
  notSure: number;
  skipped: number;
  unanswered: number;
  distribution: Record<(typeof SCALE)[number], number>;
  frequent: number;
  impact: Record<Impact, number>;
  impactUnrated: number;
  patterns: string[];
  about: string;
  overlaps: string;
}

export interface Results {
  dimensions: DimensionResult[];
  items: ItemResult[];
  totals: {
    statements: number;
    reported: number;
    notSure: number;
    skipped: number;
    unanswered: number;
    frequent: number;
    difficult: number;
    mixed: number;
    helpful: number;
  };
  highlights: {
    frequentAndDifficult: ItemResult[];
    frequentAndHelpful: ItemResult[];
    lessFrequentButDifficult: ItemResult[];
  };
  discussionPrompts: string[];
  isComplete: boolean;
}

function itemResult(session: Session | null, question: Question, index: number): ItemResult {
  const answer = session?.answers[question.id];
  let status: ItemStatus = "unanswered";
  if (answer?.frequency === "not_sure") status = "not_sure";
  else if (answer?.frequency) status = "answered";
  else if (answer?.skipped) status = "skipped";

  const frequency = answer?.frequency;
  const impact = status === "answered" ? answer?.impact : undefined;
  return {
    question,
    index,
    status,
    frequency,
    impact,
    frequencyLabel:
      status === "skipped" ? "Skipped" : status === "unanswered" ? "Not answered" : FREQUENCY_LABEL[frequency!],
    impactLabel: impact ? IMPACT_LABEL[impact] : null,
    frequent: frequency === "often" || frequency === "almost_always",
  };
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function quoteList(items: ItemResult[]): string {
  const labels = items.map((i) => `“${i.question.shortLabel.toLowerCase()}”`);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** Plain-language sentences that reflect what the person reported. */
export function describeDimension(d: Omit<DimensionResult, "patterns">): string[] {
  if (d.reported === 0) return [COPY.emptyDimension];

  const lines: string[] = [];
  lines.push(
    `You gave a frequency for ${d.reported} of ${d.total} statements in this area. ${
      d.frequent > 0
        ? `You reported ${plural(d.frequent, "of them", "of them")} as happening often or almost always.`
        : "None of them were reported as happening often or almost always."
    }`,
  );

  const answered = d.items.filter((i) => i.status === "answered");
  const difficult = answered.filter((i) => i.impact === "difficult");
  const mixed = answered.filter((i) => i.impact === "mixed");
  const helpful = answered.filter((i) => i.impact === "helpful");

  if (difficult.length) {
    lines.push(`You described ${quoteList(difficult)} as mostly difficult.`);
  }
  if (mixed.length) {
    lines.push(`You described ${quoteList(mixed)} as having a mixed effect.`);
  }
  if (helpful.length) {
    lines.push(`You described ${quoteList(helpful)} as mostly helpful.`);
  }

  const gaps = d.notSure + d.skipped + d.unanswered;
  if (gaps > 0) {
    lines.push(
      `${plural(gaps, "statement was", "statements were")} skipped, unanswered or marked ‘not sure’, and ${
        gaps === 1 ? "is" : "are"
      } left out rather than assumed.`,
    );
  }
  return lines;
}

export function computeResults(session: Session | null): Results {
  const items = QUESTIONS.map((q, i) => itemResult(session, q, i));
  const byId = new Map(items.map((i) => [i.question.id, i]));

  const dimensions: DimensionResult[] = DIMENSIONS.map((dimension) => {
    const dItems = questionsFor(dimension.id).map((q) => byId.get(q.id)!);
    const distribution = Object.fromEntries(SCALE.map((s) => [s, 0])) as DimensionResult["distribution"];
    const impact: Record<Impact, number> = { helpful: 0, neutral: 0, difficult: 0, mixed: 0 };
    let impactUnrated = 0;

    for (const item of dItems) {
      if (item.status === "answered" && item.frequency && item.frequency !== "not_sure") {
        distribution[item.frequency] += 1;
        if (item.impact) impact[item.impact] += 1;
        else if (item.frequency !== "never") impactUnrated += 1;
      }
    }

    const base = {
      dimension,
      items: dItems,
      total: dItems.length,
      reported: dItems.filter((i) => i.status === "answered").length,
      notSure: dItems.filter((i) => i.status === "not_sure").length,
      skipped: dItems.filter((i) => i.status === "skipped").length,
      unanswered: dItems.filter((i) => i.status === "unanswered").length,
      distribution,
      frequent: dItems.filter((i) => i.frequent).length,
      impact,
      impactUnrated,
      about: DIMENSION_INTERPRETATION[dimension.id].about,
      overlaps: DIMENSION_INTERPRETATION[dimension.id].overlaps,
    };
    return { ...base, patterns: describeDimension(base) };
  });

  const answered = items.filter((i) => i.status === "answered");
  const frequentAndDifficult = answered.filter(
    (i) => i.frequent && (i.impact === "difficult" || i.impact === "mixed"),
  );
  const frequentAndHelpful = answered.filter((i) => i.frequent && i.impact === "helpful");
  const lessFrequentButDifficult = answered.filter(
    (i) => !i.frequent && i.frequency !== "never" && (i.impact === "difficult" || i.impact === "mixed"),
  );

  // Discussion prompts: from areas where the person reported frequent or
  // difficult experiences, then general prompts. No ranking implied.
  const prompts: string[] = [];
  for (const d of dimensions) {
    const relevant =
      d.frequent > 0 || d.impact.difficult > 0 || d.impact.mixed > 0;
    if (relevant) prompts.push(...DIMENSION_INTERPRETATION[d.dimension.id].discussionPrompts);
  }
  prompts.push(...GENERAL_DISCUSSION_PROMPTS);

  return {
    dimensions,
    items,
    totals: {
      statements: items.length,
      reported: answered.length,
      notSure: items.filter((i) => i.status === "not_sure").length,
      skipped: items.filter((i) => i.status === "skipped").length,
      unanswered: items.filter((i) => i.status === "unanswered").length,
      frequent: items.filter((i) => i.frequent).length,
      difficult: answered.filter((i) => i.impact === "difficult").length,
      mixed: answered.filter((i) => i.impact === "mixed").length,
      helpful: answered.filter((i) => i.impact === "helpful").length,
    },
    highlights: { frequentAndDifficult, frequentAndHelpful, lessFrequentButDifficult },
    discussionPrompts: prompts,
    isComplete: Boolean(session?.completedAt),
  };
}
