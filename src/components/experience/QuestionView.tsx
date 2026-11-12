"use client";

import { useEffect, useRef } from "react";
import {
  DIMENSION_BY_ID,
  FREQUENCY_OPTIONS,
  IMPACT_ELIGIBLE,
  IMPACT_OPTIONS,
  QUESTIONS,
  type Frequency,
  type Impact,
} from "@/config/questionnaire";
import type { Session } from "@/lib/session";
import { Glyph } from "../Glyph";
import { FILL, FrameTile, ImpactSymbol } from "../FrameTile";
import { btn, cx } from "@/lib/ui";

export function ProgressStrip({ session, index }: { session: Session; index: number }) {
  return (
    <div className="flex gap-2 sm:gap-3" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((group) => (
        <div key={group} className="flex flex-1 gap-[3px] sm:gap-1">
          {QUESTIONS.slice(group * 4, group * 4 + 4).map((q, j) => {
            const i = group * 4 + j;
            const a = session.answers[q.id];
            const state = a?.frequency === "not_sure" ? "not_sure" : a?.frequency ? "answered" : a?.skipped ? "skipped" : "unvisited";
            return (
              <FrameTile
                key={q.id}
                token={DIMENSION_BY_ID[q.dimension].token}
                state={state}
                frequency={a?.frequency}
                current={i === index}
                showImpact={false}
                className="aspect-square flex-1 !rounded-[28%]"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function QuestionView({
  session,
  index,
  returnToReview,
  onFrequency,
  onImpact,
  onBack,
  onNext,
  onSkip,
  onPause,
  hint,
}: {
  session: Session;
  index: number;
  returnToReview: boolean;
  onFrequency: (f: Frequency) => void;
  onImpact: (i: Impact | undefined) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onPause: () => void;
  hint?: string;
}) {
  const question = QUESTIONS[index];
  const dimension = DIMENSION_BY_ID[question.dimension];
  const answer = session.answers[question.id];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isLast = index === QUESTIONS.length - 1;
  const answered = Boolean(answer?.frequency);
  const impactEligible = answer?.frequency ? IMPACT_ELIGIBLE.includes(answer.frequency) : false;
  const firstRender = useRef(true);

  // Move focus to the new statement so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [index]);

  // Shortcuts: 1–6 choose a response, Enter continues once answered.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type === "text"))) return;
      if (document.querySelector("dialog[open]")) return;
      const opt = FREQUENCY_OPTIONS.find((o) => o.key === e.key);
      if (opt) {
        e.preventDefault();
        onFrequency(opt.value);
        return;
      }
      if (e.key === "Enter" && answered && t?.tagName !== "BUTTON" && t?.tagName !== "A") {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [answered, onFrequency, onNext]);

  const scale = FREQUENCY_OPTIONS.filter((o) => o.value !== "not_sure");
  const notSure = FREQUENCY_OPTIONS.find((o) => o.value === "not_sure")!;
  const name = `q-${question.id}`;

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 pb-10 pt-4 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onPause} className={cx(btn.quiet, "-ml-4")}>
          Pause and save
        </button>
        <p className="text-sm font-semibold text-ink-2" aria-live="polite" data-testid="progress-label">
          Question {index + 1} of {QUESTIONS.length}
        </p>
      </div>
      <div className="mt-3">
        <ProgressStrip session={session} index={index} />
      </div>

      <section key={question.id} className="anim-enter mt-10 sm:mt-14" aria-labelledby="question-text">
        <p data-dim={dimension.token} className="bg-dim inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-sm font-semibold">
          <Glyph dimension={dimension.id} className="h-6 w-6 text-dim-deep" strokeWidth={2.2} />
          {dimension.name}
        </p>
        <h1
          id="question-text"
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 font-serif text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] font-[400] leading-[1.18] tracking-[-0.012em] outline-none"
          data-testid="question-text"
        >
          {question.text}
        </h1>

        <div role="radiogroup" aria-labelledby="question-text" aria-describedby="freq-help" className="mt-9">
          <p id="freq-help" className="mb-3 text-sm text-ink-2">
            How often does this fit your experience?
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {scale.map((o) => {
              const checked = answer?.frequency === o.value;
              return (
                <label
                  key={o.value}
                  data-dim={dimension.token}
                  className={cx(
                    "group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-surface px-4 py-3.5 transition-colors sm:flex-col sm:items-start sm:gap-3 sm:py-4",
                    "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
                    checked ? "border-ink bg-dim" : "border-line hover:border-line-strong",
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={o.value}
                    checked={checked}
                    onChange={() => onFrequency(o.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cx("relative h-8 w-8 shrink-0 overflow-hidden rounded-[30%] border", checked ? "border-transparent bg-surface/70" : "border-line-strong")}
                  >
                    <span
                      className="absolute inset-x-0 bottom-0"
                      style={{ height: `${FILL[o.value as keyof typeof FILL] * 100}%`, background: "var(--dim-deep)", opacity: checked ? 0.9 : 0.35 }}
                    />
                  </span>
                  <span className="font-semibold leading-tight">{o.label}</span>
                  <span className="ml-auto text-xs text-ink-3 sm:absolute sm:right-3 sm:top-3" aria-hidden="true">
                    {o.key}
                  </span>
                </label>
              );
            })}
          </div>
          <label
            className={cx(
              "mt-2.5 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed px-4 py-3.5",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
              answer?.frequency === "not_sure" ? "border-ink bg-surface-2" : "border-line-strong hover:border-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={notSure.value}
              checked={answer?.frequency === "not_sure"}
              onChange={() => onFrequency("not_sure")}
              className="sr-only"
            />
            <span className="font-semibold">{notSure.label}</span>
            <span className="ml-auto text-xs text-ink-3" aria-hidden="true">
              {notSure.key}
            </span>
          </label>
        </div>

        {impactEligible && (
          <fieldset className="anim-reveal mt-8 rounded-2xl border border-line bg-surface p-5" data-testid="impact-fieldset">
            <legend className="px-1 text-[0.95rem] font-semibold">
              How does this tend to affect you? <span className="font-normal text-ink-2">Optional</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {IMPACT_OPTIONS.map((o) => {
                const checked = answer?.impact === o.value;
                return (
                  <label
                    key={o.value}
                    data-dim={dimension.token}
                    className={cx(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[0.95rem]",
                      "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
                      checked ? "border-ink bg-dim font-semibold" : "border-line-strong hover:border-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${name}-impact`}
                      value={o.value}
                      checked={checked}
                      onChange={() => onImpact(o.value)}
                      className="sr-only"
                    />
                    <ImpactSymbol impact={o.value} className="h-3 w-3 text-dim-deep" />
                    {o.label}
                  </label>
                );
              })}
              {answer?.impact && (
                <button type="button" className={cx(btn.quiet, "py-2")} onClick={() => onImpact(undefined)}>
                  Clear
                </button>
              )}
            </div>
          </fieldset>
        )}
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="button" onClick={onBack} className={btn.secondary} disabled={index === 0}>
          Back
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={onSkip} className={btn.quiet}>
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className={btn.primary}
            data-testid="next-button"
          >
            {returnToReview ? "Back to review" : isLast ? "Review answers" : "Next"}
          </button>
        </div>
      </div>
      <p role="status" className="mt-3 min-h-[1.5rem] text-sm font-semibold text-ink" data-testid="question-hint">
        {hint}
      </p>
      <p className="mt-1 hidden text-sm text-ink-3 sm:block">
        Keyboard: press 1–6 to answer, Enter to continue. Your progress saves automatically.
      </p>
    </div>
  );
}
