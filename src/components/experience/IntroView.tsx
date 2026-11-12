"use client";

import { useState } from "react";
import Link from "next/link";
import { FRAMEWORK, QUESTIONS } from "@/config/questionnaire";
import { btn, cx } from "@/lib/ui";

export function IntroView({ onStart }: { onStart: () => void }) {
  const [adult, setAdult] = useState(false);
  const [understands, setUnderstands] = useState(false);
  const [error, setError] = useState("");
  const ready = adult && understands;

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
      <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.4rem)] font-[400] leading-[1.08] tracking-[-0.015em]">
        Before you begin
      </h1>
      <p className="mt-5 text-lg text-ink-2">
        You’ll see {QUESTIONS.length} statements, one at a time. For each, choose how often it fits your experience.
        There are no right answers, and it usually takes {FRAMEWORK.estimatedMinutes} minutes.
      </p>

      <ul className="mt-8 grid gap-3">
        {[
          ["Go at your own pace", "Pause at any time. Your progress is saved in this browser and you can continue later."],
          ["Skip anything", "Skip a statement or choose ‘not sure’. Nothing is assumed for statements you leave out."],
          ["Private by design", "Your answers stay on this device. Nothing is sent to us or anyone else."],
        ].map(([t, b]) => (
          <li key={t} className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-semibold">{t}</p>
            <p className="mt-1 text-ink-2">{b}</p>
          </li>
        ))}
      </ul>

      <form
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) {
            setError("Please confirm both statements to begin.");
            return;
          }
          onStart();
        }}
      >
        <fieldset className="grid gap-3">
          <legend className="mb-3 font-semibold">Please confirm</legend>
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4 has-[:checked]:border-ink">
            <input
              type="checkbox"
              checked={adult}
              onChange={(e) => {
                setAdult(e.target.checked);
                setError("");
              }}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--focus)]"
            />
            <span>I am {FRAMEWORK.minimumAge} or over.</span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4 has-[:checked]:border-ink">
            <input
              type="checkbox"
              checked={understands}
              onChange={(e) => {
                setUnderstands(e.target.checked);
                setError("");
              }}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--focus)]"
            />
            <span>
              I understand FRAME-24 is an unvalidated self-reflection tool. It is not a test, screening or diagnosis,
              and it can’t tell me whether I am autistic.
            </span>
          </label>
        </fieldset>
        <p role="alert" className="mt-3 min-h-[1.5rem] text-sm font-semibold text-[#8f1d3c] dark:text-[#f2a7bf]">
          {error}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="submit" className={cx(btn.primary)}>
            Begin
          </button>
          <Link href="/privacy" className={btn.quiet}>
            How your data is handled
          </Link>
        </div>
      </form>

      <p className="mt-10 rounded-2xl bg-surface-2 p-5 text-[0.95rem] text-ink-2">
        Some statements may bring up difficult feelings. If you need to talk to someone now, Samaritans are available
        free, any time, on <strong className="text-ink">116 123</strong>, or text HELLO to{" "}
        <strong className="text-ink">50808</strong>. In an emergency, call <strong className="text-ink">112</strong>{" "}
        or <strong className="text-ink">999</strong>.
      </p>
    </div>
  );
}
