"use client";

import Link from "next/link";
import { QUESTIONS } from "@/config/questionnaire";
import { answeredCount, firstOpenIndex } from "@/lib/session";
import { useIsClient, useSession } from "@/lib/store";
import { btn, cx } from "@/lib/ui";

/** Start or resume, depending on what is saved in this browser. */
export function StartButton({ className }: { className?: string }) {
  const session = useSession();
  const isClient = useIsClient();

  if (isClient && session?.completedAt) {
    return (
      <div className={cx("flex flex-wrap items-center gap-3", className)}>
        <Link href="/results" className={btn.primary}>
          View your results
        </Link>
        <Link href="/experience" className={btn.secondary}>
          Review answers
        </Link>
      </div>
    );
  }

  if (isClient && session && session.consentedAt) {
    const open = firstOpenIndex(session);
    const n = answeredCount(session);
    return (
      <div className={cx("flex flex-wrap items-center gap-3", className)}>
        <Link href="/experience" className={btn.primary}>
          {open === null ? "Review and finish" : "Continue where you left off"}
        </Link>
        <p className="text-sm text-ink-2">
          {n} of {QUESTIONS.length} answered, saved on this device.
        </p>
      </div>
    );
  }

  return (
    <div className={cx("flex flex-wrap items-center gap-3", className)}>
      <Link href="/experience" className={btn.primary}>
        Start FRAME-24
      </Link>
      <Link href="/about" className={btn.quiet}>
        How it was made
      </Link>
    </div>
  );
}
