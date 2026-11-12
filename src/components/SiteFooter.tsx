import Link from "next/link";
import { NAV } from "@/config/site";
import { FRAMEWORK } from "@/config/questionnaire";
import { Wordmark } from "./Mark";
import { DeleteDataButton } from "./DeleteDataButton";
import { container, cx } from "@/lib/ui";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className={cx(container, "grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]")}>
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-[0.95rem] text-ink-2">
            A free, private space for adults to reflect on their experiences. FRAME-24 is not a diagnostic test and
            has not been clinically validated.
          </p>
          <p className="mt-4 text-[0.95rem] text-ink-2">
            If you need help now, call <strong className="text-ink">112</strong> or{" "}
            <strong className="text-ink">999</strong>, or Samaritans free on{" "}
            <strong className="text-ink">116 123</strong>.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 grid gap-2 text-[0.95rem]">
            <li>
              <Link className="text-ink-2 hover:text-ink hover:underline" href="/experience">
                Start FRAME-24
              </Link>
            </li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link className="text-ink-2 hover:text-ink hover:underline" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-ink-2 hover:text-ink hover:underline" href="/support">
                Support the project
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-semibold">Your data</h2>
          <p className="mt-3 text-[0.95rem] text-ink-2">
            Answers stay in this browser. There’s no account, no tracking and no upload.
          </p>
          <DeleteDataButton className="mt-4" />
        </div>
      </div>
      <div className={cx(container, "flex flex-wrap justify-between gap-3 border-t border-line py-6 text-sm text-ink-3")}>
        <p>
          Framework version {FRAMEWORK.version}. Awaiting independent clinical review.
        </p>
        <p>Made in Ireland.</p>
      </div>
    </footer>
  );
}
