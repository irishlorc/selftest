"use client";

import { useState } from "react";
import type { DimensionResult } from "@/lib/results";
import { Glyph } from "../Glyph";
import { FrameTile, ImpactSymbol } from "../FrameTile";
import { NoteField } from "./NoteField";
import { cx } from "@/lib/ui";

export function DimensionCard({
  result,
  note,
  onSaveNote,
}: {
  result: DimensionResult;
  note: string;
  onSaveNote: (v: string) => void;
}) {
  const d = result.dimension;
  const [open, setOpen] = useState(false);
  const panelId = `dim-${d.id}-more`;

  return (
    <article
      data-dim={d.token}
      aria-labelledby={`dim-${d.id}-title`}
      className="flex flex-col overflow-hidden rounded-[var(--radius-tile)] border border-line bg-surface"
      data-testid={`dimension-${d.id}`}
    >
      <div className="bg-dim relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id={`dim-${d.id}-title`} className="font-serif text-[1.65rem] font-[430] leading-tight">
              {d.name}
            </h3>
            <p className="mt-1.5 max-w-[34ch] text-[0.98rem] text-ink-2">{d.summary}</p>
          </div>
          <Glyph dimension={d.id} className="h-12 w-12 shrink-0 text-dim-deep" strokeWidth={1.9} />
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-surface/75 p-3">
            <dt className="text-ink-2">Often or almost always</dt>
            <dd className="mt-0.5 font-serif text-2xl" data-testid="stat-frequent">
              {result.frequent}
              <span className="text-base text-ink-2">/{result.total}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-surface/75 p-3">
            <dt className="text-ink-2">Marked difficult or mixed</dt>
            <dd className="mt-0.5 font-serif text-2xl" data-testid="stat-difficult">
              {result.impact.difficult + result.impact.mixed}
              <span className="text-base text-ink-2">/{result.total}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-surface/75 p-3">
            <dt className="text-ink-2">Left out</dt>
            <dd className="mt-0.5 font-serif text-2xl" data-testid="stat-gaps">
              {result.notSure + result.skipped + result.unanswered}
              <span className="text-base text-ink-2">/{result.total}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-7">
        <ul className="grid gap-3" aria-label={`Your responses in ${d.name}`}>
          {result.items.map((item) => (
            <li key={item.question.id} className="grid grid-cols-[2rem_1fr] items-center gap-3" data-testid={`item-${item.question.id}`}>
              <FrameTile token={d.token} state={item.status} frequency={item.frequency} impact={item.impact} className="h-8 w-8" />
              <div className="min-w-0">
                <p className="text-[0.95rem] leading-snug">{item.question.shortLabel}</p>
                <p className="flex flex-wrap items-center gap-x-2.5 text-sm text-ink-2">
                  <span className={cx(item.status === "answered" && "font-semibold text-ink")} data-testid="item-frequency">
                    {item.frequencyLabel}
                  </span>
                  {item.impact && (
                    <span className="inline-flex items-center gap-1" data-testid="item-impact">
                      <ImpactSymbol impact={item.impact} className="h-2.5 w-2.5 text-dim-deep" />
                      {item.impactLabel}
                    </span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-2 text-[0.98rem] text-ink-2" data-testid="patterns">
          {result.patterns.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-full text-[0.95rem] font-semibold underline-offset-4 hover:underline"
          >
            <svg viewBox="0 0 16 16" className={cx("h-4 w-4 transition-transform", open && "rotate-90")} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            About this area and the full statements
          </button>
          <div id={panelId} hidden={!open} className="anim-reveal mt-4 grid gap-3 text-[0.95rem] text-ink-2">
            <p>{result.about}</p>
            <p>{result.overlaps}</p>
            <ul className="grid gap-1.5 border-l-2 border-dim-deep pl-4">
              {result.items.map((item) => (
                <li key={item.question.id}>
                  “{item.question.text}” <span className="text-ink">— {item.frequencyLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-auto border-t border-line pt-5">
          <NoteField
            label="Your reflections on this area"
            value={note}
            onSave={onSaveNote}
            testId={`note-${d.id}`}
          />
        </div>
      </div>
    </article>
  );
}
