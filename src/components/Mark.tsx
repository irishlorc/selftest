import { DIMENSIONS } from "@/config/questionnaire";

/** The FRAME-24 mark: six small frames, one per dimension. */
export function Mark({ className = "h-7 w-[2.6rem]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 39 26" className={className} aria-hidden="true" focusable="false">
      {DIMENSIONS.map((d, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <rect
            key={d.id}
            x={col * 13 + 0.5}
            y={row * 13 + 0.5}
            width="12"
            height="12"
            rx={i === 1 || i === 5 ? 6 : 3.5}
            style={{ fill: `var(--dim-${d.token})`, stroke: `var(--dim-${d.token}-deep)` }}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark />
      <span className="font-semibold tracking-[-0.01em] text-[1.05rem]">FRAME-24</span>
    </span>
  );
}
