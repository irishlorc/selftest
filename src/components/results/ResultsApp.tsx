"use client";

import Link from "next/link";
import { COPY } from "@/config/interpretation";
import { DIMENSIONS, DIMENSION_BY_ID, type DimensionId } from "@/config/questionnaire";
import { computeResults, type ItemResult } from "@/lib/results";
import { updateSession, useIsClient, useSession } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { FrameTile } from "../FrameTile";
import { DeleteDataButton } from "../DeleteDataButton";
import { DimensionCard } from "./DimensionCard";
import { ImpactMap } from "./ImpactMap";
import { Legend } from "./Legend";
import { NoteField } from "./NoteField";
import { btn, container, cx } from "@/lib/ui";

function HighlightList({ title, body, items, testId }: { title: string; body: string; items: ItemResult[]; testId: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6" data-testid={testId}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-2">{body}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-[0.95rem] text-ink-3">None from your answers.</p>
      ) : (
        <ul className="mt-4 grid gap-2.5">
          {items.map((i) => {
            const dim = DIMENSION_BY_ID[i.question.dimension];
            return (
              <li key={i.question.id} className="flex items-center gap-3 text-[0.95rem]">
                <FrameTile token={dim.token} state={i.status} frequency={i.frequency} impact={i.impact} className="h-7 w-7 shrink-0" />
                <span>
                  {i.question.shortLabel}
                  <span className="text-ink-2"> — {i.frequencyLabel.toLowerCase()}, {i.impactLabel?.toLowerCase()}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ResultsApp() {
  const isClient = useIsClient();
  const session = useSession();

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
          <p className="mt-4 text-lg text-ink-2">
            Your results appear here after you respond to some statements. Everything stays on this device.
          </p>
          <Link href="/experience" className={cx(btn.primary, "mt-8")}>
            Start FRAME-24
          </Link>
        </div>
      </div>
    );
  }

  const { totals } = results;
  const saveNote = (id: DimensionId) => (v: string) =>
    updateSession((s) => ({ ...s, notes: { ...s.notes, [id]: v || undefined } }));

  return (
    <div>
      <section className="wash">
        <div className={cx(container, "pb-14 pt-8 sm:pt-12")}>
          {!results.isComplete && (
            <p className="mb-6 rounded-2xl border border-line bg-surface p-4 text-[0.95rem]" data-testid="incomplete-banner">
              You haven’t finished yet, so this reflects your answers so far.{" "}
              <Link href="/experience" className="font-semibold underline underline-offset-4">
                Continue where you left off
              </Link>
            </p>
          )}
          <h1 className="font-serif text-[clamp(2.4rem,1.6rem+3.2vw,4rem)] font-[380] leading-[1.04] tracking-[-0.02em]">
            Your reflection
          </h1>
          <p className="mt-3 text-ink-2">
            {session.completedAt ? `Completed ${formatDate(session.completedAt)}` : `Started ${formatDate(session.startedAt)}`}
          </p>
          <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4" data-testid="results-totals">
            {[
              ["Answered", totals.reported, "total-answered"],
              ["Often or almost always", totals.frequent, "total-frequent"],
              ["Marked difficult or mixed", totals.difficult + totals.mixed, "total-difficult"],
              ["Not sure, skipped or unanswered", totals.notSure + totals.skipped + totals.unanswered, "total-gaps"],
            ].map(([label, value, id]) => (
              <div key={label} className="bg-surface p-4">
                <dt className="text-sm text-ink-2">{label}</dt>
                <dd className="mt-1 font-serif text-3xl" data-testid={id}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className={cx(container, "mt-10 grid gap-16 [&>*]:min-w-0")}>
        <section aria-labelledby="read-title" className="grid gap-6 rounded-[var(--radius-tile)] border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 id="read-title" className="font-serif text-[1.9rem] font-[400] leading-tight">
            Reading your reflection
          </h2>
          <div className="grid gap-3 text-ink-2" data-testid="non-diagnostic">
            <p>{COPY.nonDiagnostic}</p>
            <p>{COPY.frequencyVsDifficulty}</p>
            <p>{COPY.noAssumptions}</p>
          </div>
        </section>

        <section aria-labelledby="glance-title">
          <h2 id="glance-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] font-[400] leading-tight">
            Your 24 frames
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            Each frame is one statement. The fill shows how often you said it happens; the symbol shows how it
            affects you, if you said.
          </p>
          <div className="mt-6 grid gap-3 rounded-[var(--radius-tile)] border border-line bg-surface p-5 sm:p-7">
            {results.dimensions.map((d) => (
              <div key={d.dimension.id} className="grid items-center gap-3 sm:grid-cols-[15rem_1fr]">
                <p className="font-semibold">{d.dimension.name}</p>
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  {d.items.map((i) => (
                    <FrameTile
                      key={i.question.id}
                      token={d.dimension.token}
                      state={i.status}
                      frequency={i.frequency}
                      impact={i.impact}
                      className="h-11 w-11 sm:h-14 sm:w-14"
                    />
                  ))}
                  <p className="sr-only">
                    {d.items.map((i) => `${i.question.shortLabel}: ${i.frequencyLabel}${i.impactLabel ? `, ${i.impactLabel}` : ""}`).join(". ")}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-4 border-t border-line pt-5">
              <Legend />
            </div>
          </div>
        </section>

        <section aria-labelledby="map-title">
          <h2 id="map-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] font-[400] leading-tight">
            How often, and how it affects you
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            Frequent isn’t the same as difficult. This map places each numbered statement by both, so you can see
            where they line up and where they don’t.
          </p>
          <div className="mt-6">
            <ImpactMap items={results.items} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <HighlightList
              testId="hl-frequent-difficult"
              title="Frequent and difficult or mixed"
              body="Often or almost always, and marked difficult or mixed."
              items={results.highlights.frequentAndDifficult}
            />
            <HighlightList
              testId="hl-frequent-helpful"
              title="Frequent and helpful"
              body="Often or almost always, and marked mostly helpful."
              items={results.highlights.frequentAndHelpful}
            />
            <HighlightList
              testId="hl-less-frequent-difficult"
              title="Less frequent, but difficult or mixed"
              body="Not frequent, yet marked difficult or mixed when it happens."
              items={results.highlights.lessFrequentButDifficult}
            />
          </div>
        </section>

        <section aria-labelledby="areas-title">
          <h2 id="areas-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] font-[400] leading-tight">
            Six areas, in your words
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            Notes you add are saved on this device and included in your report if you choose.
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {DIMENSIONS.map((dim) => {
              const r = results.dimensions.find((x) => x.dimension.id === dim.id)!;
              return (
                <DimensionCard
                  key={dim.id}
                  result={r}
                  note={session.notes[dim.id] ?? ""}
                  onSaveNote={saveNote(dim.id)}
                />
              );
            })}
          </div>
        </section>

        <section aria-labelledby="overall-title" className="rounded-[var(--radius-tile)] border border-line bg-surface p-6 sm:p-8">
          <h2 id="overall-title" className="font-serif text-[1.9rem] font-[400] leading-tight">
            Anything else?
          </h2>
          <div className="mt-4 max-w-3xl">
            <NoteField
              label="Overall reflections"
              hint="For example, what stood out, what surprised you, or what you’d like to talk about with someone."
              value={session.overallNote ?? ""}
              onSave={(v) => updateSession((s) => ({ ...s, overallNote: v || undefined }))}
              testId="note-overall"
            />
          </div>
        </section>

        <section aria-labelledby="next-title" className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[var(--radius-tile)] bg-ink p-8 text-paper">
            <h2 id="next-title" className="font-serif text-[1.9rem] font-[400] leading-tight">
              Keep your reflection
            </h2>
            <p className="mt-3 opacity-90">
              Download a free, multi-page report with your answers, notes and questions you might bring to a
              professional. It’s created on this device.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/report" className={cx(btn.primary, "bg-paper text-ink")}>
                Get my report
              </Link>
              <Link href="/experience" className={cx(btn.quiet, "text-paper/90 hover:bg-white/10 hover:text-paper")}>
                Change my answers
              </Link>
            </div>
          </div>
          <div className="rounded-[var(--radius-tile)] border border-line bg-surface p-8">
            <h2 className="font-semibold">If you want to explore further</h2>
            <p className="mt-2 text-ink-2">
              See how adult autism assessment and support work in Ireland, and where to find trusted information.
            </p>
            <Link href="/next-steps" className={cx(btn.secondary, "mt-5")}>
              Next steps in Ireland
            </Link>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-[0.95rem] text-ink-2">
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
    </div>
  );
}
