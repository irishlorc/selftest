/**
 * FRAME-24 questionnaire configuration.
 *
 * This file is the single source of truth for the statements people see.
 * It is deliberately plain data so that qualified reviewers can edit wording,
 * add notes or re-group statements without touching application code.
 *
 * STATUS: Original, experimental draft. NOT clinically validated.
 * Before FRAME-24 is marketed or used as a medical screening or diagnostic
 * product it requires review by qualified clinicians (for example clinical
 * psychologists with adult autism assessment experience) and an assessment
 * of its status under the EU Medical Device Regulation (EU) 2017/745.
 *
 * If you change a statement's meaning, give it a new `id` so that answers
 * saved under the old wording are not silently re-interpreted.
 */

export const FRAMEWORK = {
  name: "FRAME-24",
  version: "0.1.0-draft",
  status: "unvalidated-draft" as const,
  clinicalReview: {
    reviewed: false,
    reviewedBy: null as string | null,
    reviewDate: null as string | null,
    notes:
      "Awaiting review by qualified professionals. Regulatory assessment (EU MDR) required before any use as a screening or diagnostic product.",
  },
  minimumAge: 18,
  estimatedMinutes: "4–6",
};

export type DimensionId =
  | "communication"
  | "sensory"
  | "predictability"
  | "attention"
  | "social"
  | "daily";

export type Frequency =
  | "never"
  | "rarely"
  | "sometimes"
  | "often"
  | "almost_always"
  | "not_sure";

export interface Question {
  id: string;
  dimension: DimensionId;
  text: string;
  /** Short label used in charts, the report appendix and screen-reader summaries. */
  shortLabel: string;
}

export interface Dimension {
  id: DimensionId;
  name: string;
  /** One line, shown on cards and the question screen. */
  summary: string;
  /** Colour token name defined in globals.css (--dim-<token>). */
  token: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "communication",
    name: "Communication & interpretation",
    summary: "How you take in, interpret and prepare for communication.",
    token: "lavender",
  },
  {
    id: "sensory",
    name: "Sensory experiences",
    summary: "How sound, light, texture, smell and surroundings register for you.",
    token: "peach",
  },
  {
    id: "predictability",
    name: "Predictability & transitions",
    summary: "How change, plans and moving between activities feel.",
    token: "mint",
  },
  {
    id: "attention",
    name: "Attention & interests",
    summary: "How you focus, what absorbs you, and what helps you regulate.",
    token: "butter",
  },
  {
    id: "social",
    name: "Social energy & adaptation",
    summary: "The effort and energy that social situations involve for you.",
    token: "rose",
  },
  {
    id: "daily",
    name: "Daily functioning & recovery",
    summary: "How demands add up across a day, and what helps you manage.",
    token: "lime",
  },
];

export const QUESTIONS: Question[] = [
  // 1. Communication & interpretation
  {
    id: "com-1",
    dimension: "communication",
    text: "I need extra processing time when someone communicates indirectly.",
    shortLabel: "Processing indirect communication",
  },
  {
    id: "com-2",
    dimension: "communication",
    text: "In group conversations, finding a natural moment to speak takes conscious effort.",
    shortLabel: "Timing in group conversation",
  },
  {
    id: "com-3",
    dimension: "communication",
    text: "I find conversations easier when expectations are made explicit.",
    shortLabel: "Explicit expectations help",
  },
  {
    id: "com-4",
    dimension: "communication",
    text: "I sometimes prepare possible responses before an interaction.",
    shortLabel: "Preparing responses in advance",
  },
  // 2. Sensory experiences
  {
    id: "sen-1",
    dimension: "sensory",
    text: "Background sounds can compete for my attention even when they seem unimportant to others.",
    shortLabel: "Background sounds compete",
  },
  {
    id: "sen-2",
    dimension: "sensory",
    text: "Lighting, textures or smells can influence whether I feel comfortable somewhere.",
    shortLabel: "Light, texture, smell and comfort",
  },
  {
    id: "sen-3",
    dimension: "sensory",
    text: "I notice subtle changes in my surroundings that other people may not mention.",
    shortLabel: "Noticing subtle changes",
  },
  {
    id: "sen-4",
    dimension: "sensory",
    text: "I sometimes need to leave or adjust an environment because of how it feels to my senses.",
    shortLabel: "Leaving or adjusting environments",
  },
  // 3. Predictability & transitions
  {
    id: "pre-1",
    dimension: "predictability",
    text: "Unexpected changes to plans can take significant effort for me to adjust to.",
    shortLabel: "Adjusting to changed plans",
  },
  {
    id: "pre-2",
    dimension: "predictability",
    text: "Knowing what will happen in advance helps me feel settled.",
    shortLabel: "Knowing in advance helps",
  },
  {
    id: "pre-3",
    dimension: "predictability",
    text: "Moving abruptly from one activity to another can be difficult.",
    shortLabel: "Abrupt transitions",
  },
  {
    id: "pre-4",
    dimension: "predictability",
    text: "I create personal routines that help me manage everyday demands.",
    shortLabel: "Personal routines",
  },
  // 4. Attention & interests
  {
    id: "att-1",
    dimension: "attention",
    text: "I can become deeply absorbed in subjects that interest me.",
    shortLabel: "Deep absorption in interests",
  },
  {
    id: "att-2",
    dimension: "attention",
    text: "Being interrupted during an absorbing activity can be particularly disruptive.",
    shortLabel: "Interruptions disrupt",
  },
  {
    id: "att-3",
    dimension: "attention",
    text: "I enjoy exploring some topics in much greater detail than people expect.",
    shortLabel: "Exploring topics in depth",
  },
  {
    id: "att-4",
    dimension: "attention",
    text: "Repeating particular actions or movements can help me feel regulated.",
    shortLabel: "Repeated actions help regulate",
  },
  // 5. Social energy & adaptation
  {
    id: "soc-1",
    dimension: "social",
    text: "I consciously adjust how I speak or behave to fit different social situations.",
    shortLabel: "Consciously adjusting behaviour",
  },
  {
    id: "soc-2",
    dimension: "social",
    text: "An enjoyable social occasion can still leave me needing time alone.",
    shortLabel: "Needing time alone after socialising",
  },
  {
    id: "soc-3",
    dimension: "social",
    text: "I sometimes review conversations afterwards to understand how they went.",
    shortLabel: "Reviewing conversations afterwards",
  },
  {
    id: "soc-4",
    dimension: "social",
    text: "People may not realise how much effort I put into appearing comfortable.",
    shortLabel: "Hidden effort to appear comfortable",
  },
  // 6. Daily functioning & recovery
  {
    id: "day-1",
    dimension: "daily",
    text: "I have developed workarounds that make difficult situations easier to manage.",
    shortLabel: "Workarounds for difficult situations",
  },
  {
    id: "day-2",
    dimension: "daily",
    text: "I can function well in one environment but struggle with similar demands elsewhere.",
    shortLabel: "Varies by environment",
  },
  {
    id: "day-3",
    dimension: "daily",
    text: "Several small demands occurring together can become overwhelming.",
    shortLabel: "Small demands adding up",
  },
  {
    id: "day-4",
    dimension: "daily",
    text: "Having control over my surroundings can make a substantial difference to how I manage my day.",
    shortLabel: "Control over surroundings",
  },
];

export interface ResponseOption<T extends string> {
  value: T;
  label: string;
  /** Keyboard shortcut shown in the interface. */
  key?: string;
}

export const FREQUENCY_OPTIONS: ResponseOption<Frequency>[] = [
  { value: "never", label: "Never", key: "1" },
  { value: "rarely", label: "Rarely", key: "2" },
  { value: "sometimes", label: "Sometimes", key: "3" },
  { value: "often", label: "Often", key: "4" },
  { value: "almost_always", label: "Almost always", key: "5" },
  { value: "not_sure", label: "Not sure or not applicable", key: "6" },
];

/** Frequencies on the reported scale, in order (excludes "not sure"). */
export const SCALE: Exclude<Frequency, "not_sure">[] = [
  "never",
  "rarely",
  "sometimes",
  "often",
  "almost_always",
];

/** Position of each response on the 0–4 spectrum used in results. */
export const SCALE_POSITION: Record<(typeof SCALE)[number], number> = {
  never: 0,
  rarely: 1,
  sometimes: 2,
  often: 3,
  almost_always: 4,
};

export const FREQUENCY_LABEL: Record<Frequency, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Frequency, string>;

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const DIMENSION_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>;

export function questionsFor(dimension: DimensionId): Question[] {
  return QUESTIONS.filter((q) => q.dimension === dimension);
}
