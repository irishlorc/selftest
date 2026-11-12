import type { Frequency, Impact } from "@/config/questionnaire";
import { cx } from "@/lib/ui";

/** Fill height for each frequency. Shape, not colour alone, carries meaning. */
export const FILL: Record<Exclude<Frequency, "not_sure">, number> = {
  never: 0.06,
  rarely: 0.25,
  sometimes: 0.5,
  often: 0.75,
  almost_always: 1,
};

export type TileState = "answered" | "not_sure" | "skipped" | "unanswered" | "unvisited";

export function ImpactSymbol({ impact, className }: { impact: Impact; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true" focusable="false">
      {impact === "helpful" && <circle cx="6" cy="6" r="4.2" fill="currentColor" />}
      {impact === "neutral" && <rect x="1.5" y="4.6" width="9" height="2.8" rx="1.4" fill="currentColor" />}
      {impact === "difficult" && <path d="M6 1.4 10.8 10H1.2Z" fill="currentColor" />}
      {impact === "mixed" && (
        <>
          <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 1.8a4.2 4.2 0 0 1 0 8.4Z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/**
 * One "frame": a rounded tile whose fill height shows reported frequency.
 * Not sure = hatched; skipped or unanswered = dashed outline, left empty.
 */
export function FrameTile({
  token,
  state,
  frequency,
  impact,
  current = false,
  className,
  showImpact = true,
}: {
  token: string;
  state: TileState;
  frequency?: Frequency;
  impact?: Impact;
  current?: boolean;
  className?: string;
  showImpact?: boolean;
}) {
  const fill = state === "answered" && frequency && frequency !== "not_sure" ? FILL[frequency] : 0;
  return (
    <span
      data-dim={token}
      data-state={state}
      className={cx(
        "relative block overflow-hidden rounded-[30%]",
        state === "answered" && "bg-dim",
        state === "not_sure" && "bg-dim",
        (state === "skipped" || state === "unanswered") && "border-[1.5px] border-dashed border-line-strong bg-transparent",
        state === "unvisited" && "border border-line bg-surface-2",
        current && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
        className,
      )}
      aria-hidden="true"
    >
      {state === "answered" && (
        <span
          className="absolute inset-x-0 bottom-0 transition-[height] duration-300"
          style={{ height: `${fill * 100}%`, background: "var(--dim-deep)", opacity: 0.85 }}
        />
      )}
      {state === "not_sure" && (
        <span
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--dim-deep) 0 1.5px, transparent 1.5px 6px)",
            opacity: 0.45,
          }}
        />
      )}
      {showImpact && impact && (
        <span className="absolute right-[12%] top-[12%] grid place-items-center rounded-full bg-surface/90 p-[2px] text-dim-deep">
          <ImpactSymbol impact={impact} className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}
