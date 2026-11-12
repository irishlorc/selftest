import Link from "next/link";
import { DIMENSIONS, FRAMEWORK, QUESTIONS } from "@/config/questionnaire";
import { HeroMosaic } from "@/components/HeroMosaic";
import { StartButton } from "@/components/StartButton";
import { Glyph } from "@/components/Glyph";
import { container, cx } from "@/lib/ui";

const FACTS = [
  { title: `${FRAMEWORK.estimatedMinutes} minutes`, body: "Pause whenever you like. Progress saves as you go." },
  { title: "No account", body: "Nothing to sign up for, and nothing to remember." },
  { title: "Stays on your device", body: "Answers are never sent to a server or analytics." },
  { title: "Free report", body: "A multi-page PDF, generated in your browser." },
];

const STEPS = [
  {
    title: "Respond to 24 statements",
    body: "Say how often each one fits your life, from never to almost always. Skip or choose ‘not sure’ whenever you need to.",
  },
  {
    title: "Note how it affects you",
    body: "Optionally mark whether an experience is mostly helpful, neutral, difficult or mixed. Frequency and difficulty are kept apart.",
  },
  {
    title: "Review before you finish",
    body: "See every answer in one place and change anything. Nothing is final until you say so.",
  },
  {
    title: "Explore and keep your reflection",
    body: "Look through six areas, add your own notes, and download a report to keep or bring to a professional.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="wash relative overflow-hidden">
        <div className={cx(container, "grid items-center gap-14 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28")}>
          <div>
            <h1 className="font-serif text-[clamp(2.6rem,1.6rem+4.2vw,4.6rem)] font-[380] leading-[1.02] tracking-[-0.02em]">
              Notice the patterns in how you experience the world.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg text-ink-2 sm:text-[1.2rem]">
              FRAME-24 is a free, private self-reflection for adults wondering about autistic traits.{" "}
              {QUESTIONS.length} statements across six areas of everyday life, and a personal report you can keep.
            </p>
            <StartButton className="mt-9" />
            <p className="mt-6 max-w-[34rem] text-sm text-ink-3">
              For adults aged {FRAMEWORK.minimumAge} and over. FRAME-24 is an original, unvalidated reflection tool —
              not a test, screening or diagnosis.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[520px] lg:max-w-none">
            <HeroMosaic />
          </div>
        </div>
      </section>

      {/* Facts */}
      <section aria-labelledby="facts-title" className={cx(container, "-mt-8 relative")}>
        <h2 id="facts-title" className="sr-only">
          At a glance
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <li key={f.title} className="bg-surface p-6">
              <p className="font-semibold">{f.title}</p>
              <p className="mt-1 text-[0.95rem] text-ink-2">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Dimensions */}
      <section aria-labelledby="areas-title" className={cx(container, "mt-28")}>
        <div className="max-w-2xl">
          <h2 id="areas-title" className="font-serif text-[clamp(2rem,1.4rem+2vw,2.9rem)] font-[400] leading-[1.1] tracking-[-0.015em]">
            Six areas of everyday experience
          </h2>
          <p className="mt-4 text-lg text-ink-2">
            Each area has four statements. Together they describe experiences many autistic adults talk about — and
            that plenty of other people share too.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d, i) => (
            <li
              key={d.id}
              data-dim={d.token}
              className={cx(
                "bg-dim relative flex min-h-[15rem] flex-col justify-between overflow-hidden p-7",
                i % 3 === 1 ? "rounded-[2.5rem]" : "rounded-[var(--radius-tile)]",
              )}
            >
              <Glyph dimension={d.id} className="h-14 w-14 text-dim-deep" strokeWidth={1.8} />
              <div className="mt-10">
                <h3 className="font-serif text-[1.6rem] font-[430] leading-tight">{d.name}</h3>
                <p className="mt-2 text-[0.98rem] text-ink-2">{d.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className={cx(container, "mt-28 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]")}>
        <div>
          <h2 id="how-title" className="font-serif text-[clamp(2rem,1.4rem+2vw,2.9rem)] font-[400] leading-[1.1] tracking-[-0.015em]">
            How it works
          </h2>
          <p className="mt-4 text-lg text-ink-2">
            Designed to be calm and predictable: one statement at a time, clear controls, and no surprises.
          </p>
        </div>
        <ol className="grid gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 font-serif text-xl" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Is / isn't */}
      <section aria-labelledby="is-title" className={cx(container, "mt-28")}>
        <h2 id="is-title" className="max-w-2xl font-serif text-[clamp(2rem,1.4rem+2vw,2.9rem)] font-[400] leading-[1.1] tracking-[-0.015em]">
          What FRAME-24 can and can’t do
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-tile)] border border-line bg-surface p-8">
            <h3 className="font-semibold">It can</h3>
            <ul className="mt-4 grid gap-3 text-ink-2">
              <li>Give you words and structure for experiences that can be hard to describe.</li>
              <li>Separate how often something happens from how much it affects you.</li>
              <li>Help you prepare for a conversation with a GP, psychologist or someone you trust.</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-tile)] bg-ink p-8 text-paper">
            <h3 className="font-semibold">It can’t</h3>
            <ul className="mt-4 grid gap-3 opacity-90">
              <li>Tell you whether you are autistic. Only a qualified professional assessment can do that.</li>
              <li>Score you, rank you or estimate a likelihood. It deliberately doesn’t.</li>
              <li>Rule anything in or out. These experiences overlap with many other parts of being human.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section aria-labelledby="privacy-title" className={cx(container, "mt-28")}>
        <div className="wash grid gap-10 overflow-hidden rounded-[2.5rem] border border-line p-8 sm:p-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 id="privacy-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.8vw,2.6rem)] font-[400] leading-[1.1]">
              Your reflections stay with you
            </h2>
            <p className="mt-4 text-lg text-ink-2">
              FRAME-24 runs entirely in your browser. There are no accounts, no advertising trackers and no analytics
              on your answers. Your report is created on your own device.
            </p>
            <Link href="/privacy" className="mt-6 inline-block font-semibold underline underline-offset-4">
              Read exactly how data is handled
            </Link>
          </div>
          <ul className="grid content-center gap-3">
            {[
              "Answers are saved in this browser’s local storage, nowhere else.",
              "One button deletes everything, at any time.",
              "The PDF is generated on your device — nothing is uploaded.",
            ].map((t) => (
              <li key={t} className="flex gap-3 rounded-2xl bg-surface/80 p-4">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m4.5 10.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing */}
      <section className={cx(container, "mt-28 text-center")}>
        <h2 className="mx-auto max-w-2xl font-serif text-[clamp(2rem,1.4rem+2vw,3rem)] font-[400] leading-[1.1]">
          Take it at your own pace.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
          You can pause at any point and come back later on this device.
        </p>
        <div className="mt-8 flex justify-center">
          <StartButton />
        </div>
      </section>
    </>
  );
}
