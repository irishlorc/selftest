import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { CONTRIBUTION_AMOUNT, getContributionUrl } from "@/config/site";
import { btn, container, cx } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Support the project",
  description: "FRAME-24 is completely free. If it helped, you can optionally contribute €1 to support it.",
  alternates: { canonical: "/support" },
};

export default function Support() {
  const url = getContributionUrl();
  return (
    <>
      <PageIntro
        title="Support FRAME-24"
        lede="Everything in FRAME-24 is free — the experience, your results and your report. There’s nothing to unlock and there never will be."
      />
      <div className={cx(container, "pt-6")}>
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="contribute-title" className="rounded-[var(--radius-tile)] border border-line bg-surface p-8" data-testid="contribution">
            <h2 id="contribute-title" className="font-serif text-[1.9rem] font-[400] leading-tight">
              An optional {CONTRIBUTION_AMOUNT} contribution
            </h2>
            <p className="mt-3 text-ink-2">
              If FRAME-24 was useful, a small contribution helps cover hosting and future clinical review. It’s entirely
              optional and changes nothing about what you can use.
            </p>
            {url ? (
              <>
                <a href={url} rel="noopener noreferrer" target="_blank" className={cx(btn.primary, "mt-6")} data-testid="contribute-link">
                  Contribute {CONTRIBUTION_AMOUNT} with Stripe
                  <span className="sr-only"> (opens a secure Stripe page in a new tab)</span>
                </a>
                <p className="mt-4 text-sm text-ink-3">
                  You’ll complete payment on Stripe’s secure page. Stripe will confirm your payment; FRAME-24 never
                  sees your card details.
                </p>
              </>
            ) : (
              <p className="mt-6 rounded-2xl bg-surface-2 p-4 text-[0.95rem]" data-testid="contribution-unavailable">
                Contributions aren’t open yet. They’ll appear here once a secure payment provider is set up. Thank you
                for thinking of it.
              </p>
            )}
          </section>
          <section className="rounded-[var(--radius-tile)] bg-surface-2 p-8">
            <h2 className="font-semibold">Other ways to help</h2>
            <ul className="mt-3 grid gap-2 text-ink-2">
              <li>Share FRAME-24 with someone who might find it useful.</li>
              <li>Tell people it’s a reflection tool, not a test — that helps it be used well.</li>
            </ul>
            <Link href="/experience" className={cx(btn.secondary, "mt-6")}>
              Start FRAME-24
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
