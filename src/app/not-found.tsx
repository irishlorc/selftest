import Link from "next/link";
import { btn, container, cx } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className={cx(container, "py-24")}>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-serif text-[clamp(2.2rem,1.5rem+2.6vw,3.2rem)] font-[400] leading-[1.08]">
          This page doesn’t exist
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          The link may be out of date. Your saved answers are not affected.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={btn.primary}>
            Go to the homepage
          </Link>
          <Link href="/experience" className={btn.secondary}>
            Continue FRAME-24
          </Link>
        </div>
      </div>
    </div>
  );
}
