"use client";

import { useEffect, useId, useRef, useState } from "react";
import { setPrefs, usePrefs, type MotionPref, type ThemePref } from "@/lib/store";
import { cx } from "@/lib/ui";

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "system", label: "Match device" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
const MOTION: { value: MotionPref; label: string }[] = [
  { value: "system", label: "Match device" },
  { value: "reduce", label: "Reduce motion" },
];

export function DisplaySettings() {
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Follow device changes while "Match device" is selected.
  useEffect(() => {
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setPrefs({});
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs.theme]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink"
      >
        <span className="sr-only">Display settings</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Display settings"
          className="anim-reveal absolute right-0 top-12 z-50 w-64 rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_50px_-20px_rgba(34,29,51,0.35)]"
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Appearance</legend>
            <div className="grid gap-1">
              {THEMES.map((t) => (
                <label key={t.value} className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2", prefs.theme === t.value && "font-semibold")}>
                  <input
                    type="radio"
                    name="theme"
                    value={t.value}
                    checked={prefs.theme === t.value}
                    onChange={() => setPrefs({ theme: t.value })}
                    className="accent-[var(--focus)]"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Motion</legend>
            <div className="grid gap-1">
              {MOTION.map((m) => (
                <label key={m.value} className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2", prefs.motion === m.value && "font-semibold")}>
                  <input
                    type="radio"
                    name="motion"
                    value={m.value}
                    checked={prefs.motion === m.value}
                    onChange={() => setPrefs({ motion: m.value })}
                    className="accent-[var(--focus)]"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-3 text-xs text-ink-3">Saved on this device only.</p>
        </div>
      )}
    </div>
  );
}
