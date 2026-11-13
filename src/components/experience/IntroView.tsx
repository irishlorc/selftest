"use client";

import { useState } from "react";
import Link from "next/link";
import { FRAMEWORK, QUESTIONS } from "@/config/questionnaire";
import { btn } from "@/lib/ui";

export function IntroView({ onStart }: { onStart: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
      <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.4rem)] font-[400] leading-[1.08] tracking-[-0.015em]">
        Before you begin
      </h1>
      <p className="mt-4 text-lg text-ink-2">
        {QUESTIONS.length} statements, one tap each — about {FRAMEWORK.estimatedMinutes} minutes. Skip anything, pause
        any time. Your answers stay on this device.
      </p>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!confirmed) {
            setError("Please confirm to begin.");
            return;
          }
          onStart();
        }}
      >
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4 has-[:checked]:border-ink">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              setError("");
            }}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--focus)]"
          />
          <span>
            I’m {FRAMEWORK.minimumAge} or over, and I understand this is a self-reflection tool — not a test or
            diagnosis.
          </span>
        </label>
        <p role="alert" className="mt-2 min-h-[1.5rem] text-sm font-semibold text-[#8f1d3c] dark:text-[#f2a7bf]">
          {error}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="submit" className={btn.primary}>
            Begin
          </button>
          <Link href="/privacy" className={btn.quiet}>
            How your data is handled
          </Link>
        </div>
      </form>

      <p className="mt-10 text-[0.95rem] text-ink-2">
        If anything brings up difficult feelings, Samaritans are free, any time, on{" "}
        <strong className="text-ink">116 123</strong>. In an emergency, call <strong className="text-ink">112</strong>{" "}
        or <strong className="text-ink">999</strong>.
      </p>
    </div>
  );
}
