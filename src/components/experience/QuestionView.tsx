"use client";

import { useEffect, useRef } from "react";
import { DIMENSION_BY_ID, FREQUENCY_OPTIONS, QUESTIONS, type Frequency } from "@/config/questionnaire";
import type { Session } from "@/lib/session";
import { Glyph } from "../Glyph";
import { FILL, FrameTile } from "../FrameTile";
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
                className="aspect-square flex-1 !rounded-[28%]"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * One statement. Tapping or clicking an answer (or pressing 1–6) moves on
 * automatically. Arrow keys only change the selection, so keyboard users are
 * never moved on unexpectedly; they continue with Enter or Next.
 */
export function QuestionView({
  session,
  index,
  returnToReview,
  onAnswer,
  onBack,
  onNext,
  onSkip,
  onPause,
  hint,
}: {
  session: Session;
  index: number;
  returnToReview: boolean;
  onAnswer: (f: Frequency, advance: boolean) => void;
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
  const pointerRef = useRef(false);
  // Ignore taps in the first moments after a statement appears, so a double
  // tap on the previous statement can't accidentally answer this one.
  const shownAt = useRef(0);
  const isLast = index === QUESTIONS.length - 1;
  const answered = Boolean(answer?.frequency);
  const firstRender = useRef(true);

  // Move focus to the new statement so screen readers announce it.
  useEffect(() => {
    shownAt.current = performance.now();
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [index]);

  // Shortcuts: 1–6 answer and move on; Enter continues once answered.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type === "text"))) return;
      if (document.querySelector("dialog[open]")) return;
      const opt = FREQUENCY_OPTIONS.find((o) => o.key === e.key);
      if (opt) {
        e.preventDefault();
        onAnswer(opt.value, true);
        return;
      }
      if (e.key === "Enter" && answered && t?.tagName !== "BUTTON" && t?.tagName !== "A") {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [answered, onAnswer, onNext]);

  const choose = (value: Frequency, eventTime: number) => {
    const viaPointer = pointerRef.current;
    pointerRef.current = false;
    if (viaPointer && eventTime - shownAt.current < 450) return;
    onAnswer(value, viaPointer);
  };

  const scale = FREQUENCY_OPTIONS.filter((o) => o.value !== "not_sure");
  const notSure = FREQUENCY_OPTIONS.find((o) => o.value === "not_sure")!;
  const name = `q-${question.id}`;
  const focusRing =
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]";

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

      <section key={question.id} className="anim-enter mt-8 sm:mt-12" aria-labelledby="question-text">
        <p data-dim={dimension.token} className="bg-dim inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-sm font-semibold">
          <Glyph dimension={dimension.id} className="h-6 w-6 text-dim-deep" strokeWidth={2.2} />
          {dimension.name}
        </p>
        <h1
          id="question-text"
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-serif text-[clamp(1.6rem,1.15rem+2vw,2.6rem)] font-[400] leading-[1.18] tracking-[-0.012em] outline-none"
          data-testid="question-text"
        >
          {question.text}
        </h1>

        <div role="radiogroup" aria-labelledby="question-text" aria-describedby="freq-help" className="mt-7">
          <p id="freq-help" className="sr-only">
            How often does this fit your experience? Choosing an answer moves to the next statement.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-2.5">
            {scale.map((o) => {
              const checked = answer?.frequency === o.value;
              return (
                <label
                  key={o.value}
                  data-dim={dimension.token}
                  onPointerDown={() => (pointerRef.current = true)}
                  className={cx(
                    "group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-surface px-4 py-3 transition-colors sm:flex-col sm:items-start sm:gap-3 sm:py-4",
                    focusRing,
                    checked ? "border-ink bg-dim" : "border-line hover:border-line-strong",
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={o.value}
                    checked={checked}
                    onChange={() => {}}
                    onClick={(e) => choose(o.value, e.timeStamp)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cx("relative h-7 w-7 shrink-0 overflow-hidden rounded-[30%] border", checked ? "border-transparent bg-surface/70" : "border-line-strong")}
                  >
                    <span
                      className="absolute inset-x-0 bottom-0"
                      style={{ height: `${FILL[o.value as keyof typeof FILL] * 100}%`, background: "var(--dim-deep)", opacity: checked ? 0.9 : 0.35 }}
                    />
                  </span>
                  <span className="font-semibold leading-tight">{o.label}</span>
                  <span className="ml-auto hidden text-xs text-ink-3 sm:absolute sm:right-3 sm:top-3 sm:block" aria-hidden="true">
                    {o.key}
                  </span>
                </label>
              );
            })}
          </div>
          <label
            onPointerDown={() => (pointerRef.current = true)}
            className={cx(
              "mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed px-4 py-3",
              focusRing,
              answer?.frequency === "not_sure" ? "border-ink bg-surface-2" : "border-line-strong hover:border-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={notSure.value}
              checked={answer?.frequency === "not_sure"}
              onChange={() => {}}
              onClick={(e) => choose("not_sure", e.timeStamp)}
              className="sr-only"
            />
            <span className="font-semibold">{notSure.label}</span>
            <span className="ml-auto hidden text-xs text-ink-3 sm:block" aria-hidden="true">
              {notSure.key}
            </span>
          </label>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="button" onClick={onBack} className={btn.secondary} disabled={index === 0}>
          Back
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={onSkip} className={btn.quiet}>
            Skip
          </button>
          <button type="button" onClick={onNext} className={btn.primary} data-testid="next-button">
            {returnToReview ? "Back to review" : isLast ? "Review answers" : "Next"}
          </button>
        </div>
      </div>
      <p role="status" className="mt-3 min-h-[1.5rem] text-sm font-semibold text-ink" data-testid="question-hint">
        {hint}
      </p>
      <p className="mt-1 hidden text-sm text-ink-3 sm:block">
        Choosing an answer moves you on. Keyboard: press 1–6. Progress saves automatically.
      </p>
    </div>
  );
}
