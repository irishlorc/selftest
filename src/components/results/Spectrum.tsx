"use client";

import { useState } from "react";
import { FREQUENCY_LABEL, SCALE } from "@/config/questionnaire";
import type { DimensionResult } from "@/lib/results";
import { Glyph } from "../Glyph";
import { cx } from "@/lib/ui";

const pct = (position: number) => `${(position / 4) * 100}%`;

function Row({ d, index }: { d: DimensionResult; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `spectrum-${d.dimension.id}`;
  const answered = d.items.filter((i) => i.status === "answered" && i.position !== null);
  const gaps = d.notSure + d.skipped + d.unanswered;

  // Stack marks that share a position so none are hidden.
  const seen = new Map<number, number>();
  const marks = answered.map((i) => {
    const n = seen.get(i.position!) ?? 0;
    seen.set(i.position!, n + 1);
    return { item: i, stack: n };
  });

  const srSummary = answered.length
    ? `Your answers: ${answered.map((i) => i.frequencyLabel).join(", ")}.${gaps ? ` ${gaps} left out.` : ""}`
    : "No answers in this area.";

  return (
    <li data-dim={d.dimension.token} className="border-t border-line first:border-t-0" data-testid={`spectrum-row-${d.dimension.id}`}>
      <div className="grid items-center gap-x-6 gap-y-3 py-5 md:grid-cols-[14.5rem_1fr]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex items-center gap-3 rounded-xl text-left"
        >
          <span className="bg-dim grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <Glyph dimension={d.dimension.id} className="h-6 w-6 text-dim-deep" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
              {d.dimension.name}
            </span>
            <span className="block text-sm text-ink-3">
              {open ? "Hide statements" : "Show statements"}
              {gaps > 0 && <span data-testid="row-gaps">, {gaps} left out</span>}
            </span>
          </span>
          <span className="sr-only">. {srSummary}</span>
        </button>

        <div className="relative h-20" aria-hidden="true">
          {/* track */}
          <div
            className="absolute inset-x-0 top-[72%] h-3 -translate-y-1/2 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--surface-2), var(--dim) 45%, var(--dim-deep))", opacity: 0.9 }}
          />
          {SCALE.map((_, k) => (
            <span key={k} className="absolute top-[72%] h-5 w-px -translate-y-1/2 bg-line-strong" style={{ left: pct(k) }} />
          ))}
          {/* individual answers */}
          {marks.map(({ item, stack }) => (
            <span
              key={item.question.id}
              data-testid="spectrum-mark"
              data-position={item.position}
              className="spectrum-in absolute h-4 w-4 -translate-x-1/2 rounded-[30%] border-2 border-surface"
              style={{
                left: pct(item.position!),
                top: `calc(72% - 24px - ${stack * 11}px)`,
                background: "var(--dim-deep)",
                animationDelay: `${index * 70}ms`,
              }}
            />
          ))}
          {/* centre of answers */}
          {d.centre !== null && (
            <span
              data-testid="spectrum-centre"
              data-centre={d.centre.toFixed(2)}
              className="spectrum-in absolute top-[72%] grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-surface shadow-[0_2px_8px_rgba(34,29,51,0.25)]"
              style={{ left: pct(d.centre), background: "var(--dim-deep)", animationDelay: `${index * 70}ms` }}
            />
          )}
          {d.centre === null && (
            <span className="absolute inset-0 grid place-items-center text-sm text-ink-3">No answers here</span>
          )}
        </div>
      </div>

      <div id={panelId} hidden={!open} className="anim-reveal pb-6 md:pl-[15.5rem]">
        <ul className="grid gap-2 text-[0.95rem]">
          {d.items.map((i) => (
            <li key={i.question.id} className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 rounded-xl bg-surface-2 px-4 py-2.5" data-testid={`item-${i.question.id}`}>
              <span>{i.question.text}</span>
              <span className={cx("font-semibold", i.status !== "answered" && "font-normal text-ink-3")} data-testid="item-frequency">
                {i.frequencyLabel}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-2">{d.overlaps}</p>
      </div>
    </li>
  );
}

export function Spectrum({ dimensions }: { dimensions: DimensionResult[] }) {
  return (
    <div className="rounded-[var(--radius-tile)] border border-line bg-surface px-5 sm:px-8" data-testid="spectrum">
      <div className="-mx-5 grid border-b border-line px-5 py-3 sm:-mx-8 sm:px-8 md:grid-cols-[14.5rem_1fr] md:gap-x-6" aria-hidden="true">
        <span className="hidden md:block" />
        <div className="relative h-5 text-xs font-semibold text-ink-2">
          {SCALE.map((s, k) => (
            <span
              key={s}
              className={cx(
                "absolute top-0 whitespace-nowrap",
                k === 0 ? "translate-x-0" : k === SCALE.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
                (k === 1 || k === 3) && "hidden sm:inline",
              )}
              style={{ left: pct(k) }}
            >
              {FREQUENCY_LABEL[s]}
            </span>
          ))}
        </div>
      </div>
      <ul>
        {dimensions.map((d, i) => (
          <Row key={d.dimension.id} d={d} index={i} />
        ))}
      </ul>
    </div>
  );
}
