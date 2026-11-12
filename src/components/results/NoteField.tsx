"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NOTE_MAX_LENGTH } from "@/lib/session";

/** Autosaving textarea. Saves to this device only, after a short pause in typing. */
export function NoteField({
  label,
  hint,
  value,
  onSave,
  testId,
}: {
  label: string;
  hint?: string;
  value: string;
  onSave: (v: string) => void;
  testId?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);

  // Keep in sync if the stored value changes elsewhere (e.g. deleted).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== draft) {
      setDraft(value);
    }
  }

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        onSave(latest.current);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-2">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        data-testid={testId}
        aria-describedby={hint ? `${id}-hint` : undefined}
        value={draft}
        maxLength={NOTE_MAX_LENGTH}
        rows={4}
        onChange={(e) => {
          const v = e.target.value;
          latest.current = v;
          setDraft(v);
          setStatus("saving");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            timer.current = null;
            onSave(v);
            setStatus("saved");
          }, 500);
        }}
        onBlur={() => {
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
            onSave(draft);
            setStatus("saved");
          }
        }}
        className="mt-2 w-full resize-y rounded-2xl border border-line-strong bg-paper p-4 text-[1rem] leading-relaxed placeholder:text-ink-3 focus:border-ink"
        placeholder="Write anything you’d like to remember or discuss. Only you can see this."
      />
      <p className="mt-1 flex justify-between text-xs text-ink-3" aria-live="polite">
        <span>{status === "saving" ? "Saving…" : status === "saved" ? "Saved on this device" : ""}</span>
        <span>
          {draft.length}/{NOTE_MAX_LENGTH}
        </span>
      </p>
    </div>
  );
}
