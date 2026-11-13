/**
 * FRAME-24 descriptive results engine.
 *
 * This engine COUNTS and DESCRIBES a person's own answers and places them on a
 * per-area spectrum from "Never" to "Almost always". By design it does not
 * compute an overall score, likelihood, probability, severity, risk category
 * or threshold, and it never infers an answer for a skipped statement.
 */
import {
  DIMENSIONS,
  FREQUENCY_LABEL,
  QUESTIONS,
  SCALE,
  SCALE_POSITION,
  questionsFor,
  type Dimension,
  type Frequency,
  type Question,
} from "@/config/questionnaire";
import { COPY, DIMENSION_INTERPRETATION, GENERAL_DISCUSSION_PROMPTS } from "@/config/interpretation";
import type { Session } from "./session";

export type ItemStatus = "answered" | "not_sure" | "skipped" | "unanswered";

export interface ItemResult {
  question: Question;
  index: number; // 0-based position in the questionnaire
  status: ItemStatus;
  frequency?: Frequency;
  frequencyLabel: string;
  /** 0 (never) to 4 (almost always); null when not on the scale. */
  position: number | null;
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
  /**
   * Middle of the reported answers on the 0–4 spectrum (their average).
   * null when nothing in the area was reported. Descriptive only: there are
   * no zones, cut-offs or categories attached to it.
   */
  centre: number | null;
  summary: string;
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
  return {
    question,
    index,
    status,
    frequency,
    frequencyLabel:
      status === "skipped" ? "Skipped" : status === "unanswered" ? "Not answered" : FREQUENCY_LABEL[frequency!],
    position: status === "answered" ? SCALE_POSITION[frequency as (typeof SCALE)[number]] : null,
    frequent: frequency === "often" || frequency === "almost_always",
  };
}

/** One plain-language sentence describing what was reported in an area. */
export function describeDimension(d: Pick<DimensionResult, "reported" | "total" | "frequent" | "notSure" | "skipped" | "unanswered">): string {
  if (d.reported === 0) return COPY.emptyDimension;
  const gaps = d.notSure + d.skipped + d.unanswered;
  const freq =
    d.frequent === 0
      ? "none as often or almost always"
      : `${d.frequent} as often or almost always`;
  return `You answered ${d.reported} of ${d.total}, with ${freq}${gaps ? `; ${gaps} left out` : ""}.`;
}

export function computeResults(session: Session | null): Results {
  const items = QUESTIONS.map((q, i) => itemResult(session, q, i));
  const byId = new Map(items.map((i) => [i.question.id, i]));

  const dimensions: DimensionResult[] = DIMENSIONS.map((dimension) => {
    const dItems = questionsFor(dimension.id).map((q) => byId.get(q.id)!);
    const distribution = Object.fromEntries(SCALE.map((s) => [s, 0])) as DimensionResult["distribution"];
    const positions: number[] = [];
    for (const item of dItems) {
      if (item.status === "answered" && item.position !== null) {
        distribution[item.frequency as (typeof SCALE)[number]] += 1;
        positions.push(item.position);
      }
    }
    const base = {
      reported: positions.length,
      total: dItems.length,
      notSure: dItems.filter((i) => i.status === "not_sure").length,
      skipped: dItems.filter((i) => i.status === "skipped").length,
      unanswered: dItems.filter((i) => i.status === "unanswered").length,
      frequent: dItems.filter((i) => i.frequent).length,
    };
    return {
      dimension,
      items: dItems,
      ...base,
      distribution,
      centre: positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null,
      summary: describeDimension(base),
      about: DIMENSION_INTERPRETATION[dimension.id].about,
      overlaps: DIMENSION_INTERPRETATION[dimension.id].overlaps,
    };
  });

  // Prompts from areas with frequent experiences, then general prompts.
  const prompts: string[] = [];
  for (const d of dimensions) {
    if (d.frequent > 0) prompts.push(...DIMENSION_INTERPRETATION[d.dimension.id].discussionPrompts);
  }
  prompts.push(...GENERAL_DISCUSSION_PROMPTS);

  return {
    dimensions,
    items,
    totals: {
      statements: items.length,
      reported: items.filter((i) => i.status === "answered").length,
      notSure: items.filter((i) => i.status === "not_sure").length,
      skipped: items.filter((i) => i.status === "skipped").length,
      unanswered: items.filter((i) => i.status === "unanswered").length,
      frequent: items.filter((i) => i.frequent).length,
    },
    discussionPrompts: prompts,
    isComplete: Boolean(session?.completedAt),
  };
}
