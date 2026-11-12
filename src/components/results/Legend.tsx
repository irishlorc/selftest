import { IMPACT_OPTIONS } from "@/config/questionnaire";
import { FrameTile, ImpactSymbol } from "../FrameTile";

/** Explains how frames encode answers. Shape and fill, never colour alone. */
export function Legend() {
  const freq: Array<[string, Parameters<typeof FrameTile>[0]]> = [
    ["Never", { token: "lavender", state: "answered", frequency: "never" }],
    ["Rarely", { token: "lavender", state: "answered", frequency: "rarely" }],
    ["Sometimes", { token: "lavender", state: "answered", frequency: "sometimes" }],
    ["Often", { token: "lavender", state: "answered", frequency: "often" }],
    ["Almost always", { token: "lavender", state: "answered", frequency: "almost_always" }],
    ["Not sure", { token: "lavender", state: "not_sure", frequency: "not_sure" }],
    ["Skipped or unanswered", { token: "lavender", state: "skipped" }],
  ];
  return (
    <div className="grid gap-4 text-sm text-ink-2 md:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="mb-2 font-semibold text-ink">How often (fill height)</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {freq.map(([label, props]) => (
            <li key={label} className="flex items-center gap-2">
              <FrameTile {...props} className="h-5 w-5" />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-semibold text-ink">How it affects you (symbol)</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {IMPACT_OPTIONS.map((o) => (
            <li key={o.value} className="flex items-center gap-2">
              <ImpactSymbol impact={o.value} className="h-3 w-3 text-ink" />
              {o.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
