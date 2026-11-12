"use client";

import { useRef } from "react";
import { DIMENSIONS, QUESTIONS, questionsFor } from "@/config/questionnaire";
import { computeResults } from "@/lib/results";
import type { Session } from "@/lib/session";
import { Glyph } from "../Glyph";
import { FrameTile, ImpactSymbol } from "../FrameTile";
import { btn, cx } from "@/lib/ui";

export function ReviewView({
  session,
  onEdit,
  onFinish,
  onRestart,
}: {
  session: Session;
  onEdit: (index: number) => void;
  onFinish: () => void;
  onRestart: () => void;
}) {
  const results = computeResults(session);
  const { totals } = results;
  const restartRef = useRef<HTMLDialogElement>(null);
  const gaps = totals.skipped + totals.unanswered;

  return (
    <div className="mx-auto w-full max-w-[860px] px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
      <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.4rem)] font-[400] leading-[1.08] tracking-[-0.015em] outline-none" tabIndex={-1} id="review-title">
        Review your answers
      </h1>
      <p className="mt-4 text-lg text-ink-2">
        Change anything you like. When you’re ready, continue to your results.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4" data-testid="review-summary">
        {[
          ["Answered", totals.reported],
          ["Not sure", totals.notSure],
          ["Skipped", totals.skipped],
          ["Not yet answered", totals.unanswered],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-4">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="mt-1 font-serif text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      {gaps > 0 && (
        <p className="mt-4 text-[0.95rem] text-ink-2">
          You can leave statements unanswered. They will appear as gaps in your results, never as assumed answers.
        </p>
      )}

      <div className="mt-10 grid gap-8">
        {DIMENSIONS.map((d) => (
          <section key={d.id} aria-labelledby={`rev-${d.id}`}>
            <h2 id={`rev-${d.id}`} data-dim={d.token} className="flex items-center gap-2.5 font-semibold">
              <span className="bg-dim grid h-9 w-9 place-items-center rounded-xl">
                <Glyph dimension={d.id} className="h-6 w-6 text-dim-deep" strokeWidth={2.2} />
              </span>
              {d.name}
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {questionsFor(d.id).map((q) => {
                const index = QUESTIONS.findIndex((x) => x.id === q.id);
                const item = results.items[index];
                return (
                  <li key={q.id} className="grid gap-3 p-4 sm:grid-cols-[2.25rem_1fr_auto] sm:items-center sm:gap-4" data-testid={`review-row-${q.id}`}>
                    <FrameTile
                      token={d.token}
                      state={item.status}
                      frequency={item.frequency}
                      impact={item.impact}
                      className="hidden h-9 w-9 sm:block"
                    />
                    <div>
                      <p className="text-[0.98rem]">
                        <span className="sr-only">Statement {index + 1}: </span>
                        {q.text}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className={cx("font-semibold", item.status !== "answered" && "text-ink-2")} data-testid="review-answer">
                          {item.frequencyLabel}
                        </span>
                        {item.impact && (
                          <span data-dim={d.token} className="inline-flex items-center gap-1.5 text-ink-2">
                            <ImpactSymbol impact={item.impact} className="h-3 w-3 text-dim-deep" />
                            {item.impactLabel}
                          </span>
                        )}
                      </p>
                    </div>
                    <button type="button" className={cx(btn.small, "justify-self-start")} onClick={() => onEdit(index)}>
                      Change<span className="sr-only"> answer to statement {index + 1}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="button" className={btn.quiet} onClick={() => restartRef.current?.showModal()}>
          Start again
        </button>
        <button type="button" className={cx(btn.primary, "ml-auto")} onClick={onFinish} data-testid="finish-button">
          See my results
        </button>
      </div>

      <dialog
        ref={restartRef}
        aria-labelledby="restart-title"
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-line bg-surface p-0 text-ink backdrop:bg-[rgba(20,18,28,0.55)]"
      >
        <div className="p-6 sm:p-8">
          <h2 id="restart-title" className="font-serif text-2xl">
            Start again?
          </h2>
          <p className="mt-3 text-ink-2">This clears all of your answers and notes on this device.</p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className={btn.secondary} onClick={() => restartRef.current?.close()} autoFocus>
              Keep my answers
            </button>
            <button
              type="button"
              className={btn.danger}
              onClick={() => {
                restartRef.current?.close();
                onRestart();
              }}
            >
              Clear and start again
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
