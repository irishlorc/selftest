import type { DimensionId } from "@/config/questionnaire";

/**
 * Abstract mark for each dimension. Decorative only (aria-hidden); the
 * dimension name always appears as text alongside it.
 */
export function Glyph({
  dimension,
  className,
  strokeWidth = 1.6,
}: {
  dimension: DimensionId;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      {dimension === "communication" && (
        <g {...common}>
          <circle cx="19" cy="22" r="11" />
          <circle cx="29" cy="26" r="11" />
        </g>
      )}
      {dimension === "sensory" && (
        <g {...common}>
          <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
          <path d="M14 14a14 14 0 0 0 0 20" />
          <path d="M34 14a14 14 0 0 1 0 20" />
          <path d="M8.5 9a21 21 0 0 0 0 30" opacity="0.55" />
          <path d="M39.5 9a21 21 0 0 1 0 30" opacity="0.55" />
        </g>
      )}
      {dimension === "predictability" && (
        <g {...common}>
          <path d="M7 33h9V24h9v-9h9v-6" />
          <circle cx="16" cy="33" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="25" cy="24" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="34" cy="15" r="2.2" fill="currentColor" stroke="none" />
        </g>
      )}
      {dimension === "attention" && (
        <g {...common}>
          <circle cx="24" cy="24" r="4.5" fill="currentColor" stroke="none" />
          <ellipse cx="24" cy="24" rx="17" ry="9" transform="rotate(-24 24 24)" />
        </g>
      )}
      {dimension === "social" && (
        <g {...common}>
          <path d="M6 28c4-8 8-8 12 0s8 8 12 0 8-8 12 0" />
          <path d="M6 19c4-5 8-5 12 0s8 5 12 0 8-5 12 0" opacity="0.55" />
        </g>
      )}
      {dimension === "daily" && (
        <g {...common}>
          <path d="M10 34h28" />
          <path d="M14 27h20" />
          <path d="M18 20h12" />
          <circle cx="24" cy="12" r="3" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}
