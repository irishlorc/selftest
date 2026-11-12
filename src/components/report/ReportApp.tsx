"use client";

import Link from "next/link";
import { useState } from "react";
import { computeResults } from "@/lib/results";
import { useIsClient, useSession } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { DIMENSIONS } from "@/config/questionnaire";
import { FrameTile } from "../FrameTile";
import { btn, container, cx } from "@/lib/ui";

const CONTENTS = [
  "A cover page with your completion date and a mosaic drawn from your answers",
  "A six-area summary of your reported responses",
  "Each area in detail: your answers, how they affect you, and plain-language patterns",
  "Patterns across your answers, separating frequent from difficult",
  "Questions you might wish to discuss with a professional",
  "Your personal reflections (optional)",
  "An appendix with all 24 responses",
  "Important information, and verified support resources in Ireland",
];

export function ReportApp() {
  const isClient = useIsClient();
  const session = useSession();
  const [includeNotes, setIncludeNotes] = useState(true);
  const [status, setStatus] = useState<{ kind: "idle" | "working" | "done" | "error"; message: string }>({
    kind: "idle",
    message: "",
  });

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
        <div className="mx-auto max-w-xl text-center" data-testid="report-empty">
          <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.2rem)] font-[400] leading-[1.08]">
            Your report will appear here
          </h1>
          <p className="mt-4 text-lg text-ink-2">
            Respond to some statements first. The report is built from your answers, on this device.
          </p>
          <Link href="/experience" className={cx(btn.primary, "mt-8")}>
            Start FRAME-24
          </Link>
        </div>
      </div>
    );
  }

  const noteCount = Object.values(session.notes).filter(Boolean).length + (session.overallNote ? 1 : 0);

  return (
    <div className={cx(container, "grid gap-12 pb-10 pt-8 sm:pt-12 lg:grid-cols-[1fr_0.9fr] lg:items-start")}>
      <div>
        <h1 className="font-serif text-[clamp(2.4rem,1.6rem+3.2vw,3.8rem)] font-[380] leading-[1.04] tracking-[-0.02em]">
          Your free report
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-2">
          A multi-page PDF you can keep, print or bring to a professional. It’s created right here in your browser —
          nothing is uploaded, and it will always be free.
        </p>
        {!results.isComplete && (
          <p className="mt-6 rounded-2xl border border-line bg-surface p-4 text-[0.95rem]">
            You haven’t finished yet. The report will be marked as in progress.{" "}
            <Link href="/experience" className="font-semibold underline underline-offset-4">
              Continue the experience
            </Link>
          </p>
        )}

        <h2 className="mt-10 font-semibold">What’s inside</h2>
        <ul className="mt-3 grid gap-2 text-ink-2">
          {CONTENTS.map((c) => (
            <li key={c} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" />
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-[var(--radius-tile)] border border-line bg-surface p-6 sm:p-8">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--focus)]"
              data-testid="include-notes"
            />
            <span>
              <span className="font-semibold">Include my personal reflections</span>
              <span className="block text-sm text-ink-2">
                {noteCount === 0
                  ? "You haven’t written any notes yet. You can add them on your results page."
                  : `You have ${noteCount} ${noteCount === 1 ? "note" : "notes"}. Untick this if you’d rather share the report without them.`}
              </span>
            </span>
          </label>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={btn.primary}
              data-testid="download-pdf"
              disabled={status.kind === "working"}
              onClick={async () => {
                setStatus({ kind: "working", message: "Creating your report…" });
                try {
                  const { downloadReport } = await import("@/lib/pdf");
                  const name = await downloadReport(session, { includeNotes });
                  setStatus({ kind: "done", message: `Downloaded ${name}. It was created on this device.` });
                } catch {
                  setStatus({
                    kind: "error",
                    message: "The report couldn’t be created in this browser. Try again, or use a different browser.",
                  });
                }
              }}
            >
              {status.kind === "working" ? "Creating report…" : "Download PDF report"}
            </button>
            <Link href="/results" className={btn.quiet}>
              Back to results
            </Link>
          </div>
          <p role="status" className="mt-4 min-h-[1.5rem] text-[0.95rem] font-semibold" data-testid="download-status">
            {status.message}
          </p>
        </div>
      </div>

      <aside aria-label="Report preview" className="rounded-[var(--radius-tile)] border border-line bg-surface p-3 shadow-[0_30px_60px_-40px_rgba(34,29,51,0.45)]">
        <div className="rounded-[1.25rem] bg-paper p-7 sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <p className="text-sm font-semibold">FRAME-24</p>
            <div className="grid grid-cols-6 gap-1.5" aria-hidden="true">
              {results.dimensions.map((d, col) => (
                <div key={d.dimension.id} className="grid gap-1.5" style={{ marginTop: (col % 3) * 4 }}>
                  {d.items.map((i) => (
                    <FrameTile key={i.question.id} token={d.dimension.token} state={i.status} frequency={i.frequency} showImpact={false} className="h-5 w-5 sm:h-6 sm:w-6" />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-14 font-serif text-3xl leading-tight">Personal reflection report</p>
          <p className="mt-2 text-sm text-ink-2">
            {session.completedAt ? `Completed ${formatDate(session.completedAt)}` : "In progress"}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-surface p-3">
              <p className="font-serif text-2xl">{results.totals.reported}</p>
              <p className="text-ink-2">answered</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="font-serif text-2xl">{results.totals.frequent}</p>
              <p className="text-ink-2">often or almost always</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-ink-3">
            {results.items.length} statements across {DIMENSIONS.length} areas. Self-reflection only, not a diagnostic
            document.
          </p>
        </div>
      </aside>
    </div>
  );
}
