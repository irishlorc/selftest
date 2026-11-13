/**
 * Session model and validation. Pure functions only — safe to unit test and
 * safe to run on the server (no browser APIs here).
 */
import {
  FRAMEWORK,
  FREQUENCY_OPTIONS,
  QUESTIONS,
  type Frequency,
} from "@/config/questionnaire";

export const NOTE_MAX_LENGTH = 2000;

export interface Answer {
  frequency?: Frequency;
  /** True when the person explicitly chose "Skip" for this statement. */
  skipped?: boolean;
}

export interface Session {
  schema: 1;
  frameworkVersion: string;
  startedAt: string;
  updatedAt: string;
  consentedAt?: string;
  completedAt?: string;
  currentIndex: number;
  answers: Record<string, Answer>;
  overallNote?: string;
}

const FREQUENCIES = new Set<string>(FREQUENCY_OPTIONS.map((o) => o.value));
const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

export function createSession(now = new Date()): Session {
  const iso = now.toISOString();
  return {
    schema: 1,
    frameworkVersion: FRAMEWORK.version,
    startedAt: iso,
    updatedAt: iso,
    currentIndex: 0,
    answers: {},
  };
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v));
}

function cleanNote(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.slice(0, NOTE_MAX_LENGTH);
  return trimmed.length ? trimmed : undefined;
}

/**
 * Accepts anything (e.g. JSON parsed from localStorage) and returns a valid
 * Session or null. Unknown fields, unknown question ids and invalid values
 * are dropped rather than trusted.
 */
export function sanitizeSession(input: unknown): Session | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (raw.schema !== 1) return null;
  if (!isIsoDate(raw.startedAt)) return null;

  const answers: Record<string, Answer> = {};
  if (raw.answers && typeof raw.answers === "object") {
    for (const [id, value] of Object.entries(raw.answers as Record<string, unknown>)) {
      if (!QUESTION_IDS.has(id) || !value || typeof value !== "object") continue;
      const a = value as Record<string, unknown>;
      const answer: Answer = {};
      if (typeof a.frequency === "string" && FREQUENCIES.has(a.frequency)) {
        answer.frequency = a.frequency as Frequency;
      }
      if (!answer.frequency && a.skipped === true) answer.skipped = true;
      if (answer.frequency || answer.skipped) answers[id] = answer;
    }
  }

  const idx = typeof raw.currentIndex === "number" ? Math.floor(raw.currentIndex) : 0;

  return {
    schema: 1,
    frameworkVersion:
      typeof raw.frameworkVersion === "string" ? raw.frameworkVersion.slice(0, 40) : FRAMEWORK.version,
    startedAt: raw.startedAt,
    updatedAt: isIsoDate(raw.updatedAt) ? raw.updatedAt : raw.startedAt,
    consentedAt: isIsoDate(raw.consentedAt) ? raw.consentedAt : undefined,
    completedAt: isIsoDate(raw.completedAt) ? raw.completedAt : undefined,
    currentIndex: Math.min(Math.max(idx, 0), QUESTIONS.length - 1),
    answers,
    overallNote: cleanNote(raw.overallNote),
  };
}

/** Apply a frequency choice. */
export function withFrequency(session: Session, questionId: string, frequency: Frequency): Session {
  return { ...session, answers: { ...session.answers, [questionId]: { frequency } } };
}

/** Mark a statement as skipped. Removes any earlier answer for it. */
export function withSkip(session: Session, questionId: string): Session {
  return { ...session, answers: { ...session.answers, [questionId]: { skipped: true } } };
}

export function answeredCount(session: Session | null): number {
  if (!session) return 0;
  return QUESTIONS.filter((q) => session.answers[q.id]?.frequency).length;
}

/** The first statement without a frequency or skip, or null when all are visited. */
export function firstOpenIndex(session: Session): number | null {
  const i = QUESTIONS.findIndex((q) => {
    const a = session.answers[q.id];
    return !a?.frequency && !a?.skipped;
  });
  return i === -1 ? null : i;
}
