"use client";

import Link from "next/link";
import { useState } from "react";
import { COPY } from "@/config/interpretation";
import { computeResults } from "@/lib/results";
import { updateSession, useIsClient, useSession } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { DeleteDataButton } from "../DeleteDataButton";
import { NoteField } from "./NoteField";
import { Spectrum } from "./Spectrum";
import { btn, container, cx } from "@/lib/ui";

export function ResultsApp() {
  const isClient = useIsClient();
  const session = useSession();
  const [noteOpen, setNoteOpen] = useState(false);

  if (!isClient) {
    return (
      <div className={cx(container, "py-24 text-ink-2")} aria-busy="true">
        Loading…
      </div>
    );
  }

  const results = computeResults(session);
  const hasAny = results.totals.reported + results.totals.notSure + results.totals.skipped > 0;

  if (!session || !hasAny) {
    return (
      <div className={cx(container, "py-20")}>
        <div className="mx-auto max-w-xl text-center" data-testid="results-empty">
          <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.2rem)] font-[400] leading-[1.08]">
            Nothing to show yet
          </h1>
          <p className="mt-4 text-lg text-ink-2">Answer some statements and your spectrum appears here.</p>
          <Link href="/experience" className={cx(btn.primary, "mt-8")}>
            Start FRAME-24
          </Link>
        </div>
      </div>
    );
  }

  const { totals } = results;
  const gaps = totals.notSure + totals.skipped + totals.unanswered;

  return (
    <div className={cx(container, "pt-6 sm:pt-10")}>
      {!results.isComplete && (
        <p className="mb-6 rounded-2xl border border-line bg-surface p-4 text-[0.95rem]" data-testid="incomplete-banner">
          You haven’t finished, so this shows your answers so far.{" "}
          <Link href="/experience" className="font-semibold underline underline-offset-4">
            Continue
          </Link>
        </p>
      )}

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-serif text-[clamp(2.4rem,1.6rem+3.2vw,3.8rem)] font-[380] leading-[1.04] tracking-[-0.02em]">
            Your spectrum
          </h1>
          <p className="mt-2 text-ink-2">
            {session.completedAt ? formatDate(session.completedAt) : "In progress"}
            <span className="mx-2 text-line-strong" aria-hidden="true">/</span>
            <span data-testid="total-answered">{totals.reported}</span> answered
            {gaps > 0 && (
              <>
                <span className="mx-2 text-line-strong" aria-hidden="true">/</span>
                <span data-testid="total-gaps">{gaps}</span> left out
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/report" className={btn.primary}>
            Download report
          </Link>
          <Link href="/experience" className={btn.secondary}>
            Change answers
          </Link>
        </div>
      </header>

      <p className="mt-5 max-w-3xl text-[0.98rem] text-ink-2" data-testid="non-diagnostic">
        {COPY.nonDiagnosticShort}{" "}
        <Link href="/about" className="underline underline-offset-4">
          Why
        </Link>
      </p>

      <div className="mt-8">
        <Spectrum dimensions={results.dimensions} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-2" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[30%] bg-ink-2" /> One answer
        </span>
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full border-[3px] border-surface bg-ink-2 shadow" /> Middle of your answers
        </span>
        <span>Skipped and ‘not sure’ answers are left off.</span>
      </div>
      <p className="sr-only">{COPY.spectrum} {COPY.noAssumptions}</p>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <button
            type="button"
            aria-expanded={noteOpen}
            aria-controls="note-panel"
            onClick={() => setNoteOpen((o) => !o)}
            className="font-semibold underline-offset-4 hover:underline"
          >
            {session.overallNote ? "Edit your note" : "Add a note for your report"}
          </button>
          <p className="mt-1 text-sm text-ink-2">Optional. Saved on this device and added to your PDF.</p>
          <div id="note-panel" hidden={!noteOpen} className="mt-4">
            <NoteField
              label="Your note"
              value={session.overallNote ?? ""}
              onSave={(v) => updateSession((s) => ({ ...s, overallNote: v || undefined }))}
              testId="note-overall"
            />
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <p className="font-semibold">Want to explore further?</p>
          <p className="mt-1 text-sm text-ink-2">How adult assessment and support work in Ireland.</p>
          <Link href="/next-steps" className={cx(btn.small, "mt-4")}>
            Next steps in Ireland
          </Link>
        </div>
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[0.95rem] text-ink-2">
        <p>
          FRAME-24 is free. If it helped, you can{" "}
          <Link href="/support" className="font-semibold text-ink underline underline-offset-4">
            support the project
          </Link>
          .
        </p>
        <DeleteDataButton />
      </section>
    </div>
  );
}
