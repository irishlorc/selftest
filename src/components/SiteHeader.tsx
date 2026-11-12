"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/config/site";
import { Wordmark } from "./Mark";
import { DisplaySettings } from "./DisplaySettings";
import { btn, container, cx } from "@/lib/ui";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const inExperience = pathname === "/experience";

  // Close the mobile menu after navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="relative z-40">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-3 z-50 rounded-full bg-ink px-4 py-2 text-paper"
      >
        Skip to content
      </a>
      <div className={cx(container, "flex h-[72px] items-center justify-between gap-4")}>
        <Link href="/" className="rounded-md" aria-label="FRAME-24 home">
          <Wordmark />
        </Link>

        {!inExperience && (
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "rounded-full px-3.5 py-2 text-[0.95rem] text-ink-2 hover:bg-surface-2 hover:text-ink",
                        active && "bg-surface-2 font-semibold text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-1.5">
          <DisplaySettings />
          {!inExperience && (
            <Link href="/experience" className={cx(btn.primary, "hidden px-5 py-2.5 sm:inline-flex")}>
              Start
            </Link>
          )}
          {!inExperience && (
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          )}
        </div>
      </div>

      {menuOpen && !inExperience && (
        <nav id="mobile-menu" aria-label="Main" className="anim-reveal border-y border-line bg-surface lg:hidden">
          <ul className={cx(container, "grid gap-1 py-4")}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block rounded-xl px-3 py-3 text-ink hover:bg-surface-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Link href="/experience" className={cx(btn.primary, "w-full")}>
                Start FRAME-24
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
