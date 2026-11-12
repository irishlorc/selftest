import { DIMENSION_BY_ID, SCALE, FREQUENCY_LABEL, type Impact } from "@/config/questionnaire";
import type { ItemResult } from "@/lib/results";
import { ImpactSymbol } from "../FrameTile";

const ROWS: Array<{ key: Impact | "unrated"; label: string }> = [
  { key: "difficult", label: "Mostly difficult" },
  { key: "mixed", label: "Mixed" },
  { key: "neutral", label: "Neutral" },
  { key: "helpful", label: "Mostly helpful" },
  { key: "unrated", label: "Effect not given" },
];

/**
 * Frequency × impact map. A real table, so it reads well with a screen
 * reader: each cell lists the statements that sit there.
 */
export function ImpactMap({ items }: { items: ItemResult[] }) {
  const placed = items.filter((i) => i.status === "answered" && i.frequency !== "not_sure");
  const cell = (row: Impact | "unrated", freq: string) =>
    placed.filter(
      (i) => i.frequency === freq && (row === "unrated" ? !i.impact : i.impact === row),
    );

  return (
    <div role="region" aria-labelledby="map-caption" tabIndex={0} className="relative overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
      <table className="w-full min-w-[680px] table-fixed border-collapse text-sm" data-testid="impact-map">
        <caption id="map-caption" className="sr-only">
          Your statements placed by how often they happen (columns) and how they affect you (rows). Numbers are
          statement numbers.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-[10.5rem] p-3 text-left font-semibold text-ink-2">
              <span className="sr-only">Effect</span>
            </th>
            {SCALE.map((f) => (
              <th key={f} scope="col" className="p-3 text-left font-semibold">
                {FREQUENCY_LABEL[f]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-t border-line">
              <th scope="row" className="p-3 text-left font-semibold">
                <span className="flex items-center gap-2">
                  {row.key !== "unrated" ? (
                    <ImpactSymbol impact={row.key} className="h-3 w-3" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-dashed border-ink-3" aria-hidden="true" />
                  )}
                  {row.label}
                </span>
              </th>
              {SCALE.map((f) => {
                const here = cell(row.key, f);
                return (
                  <td key={f} className="p-2 align-top">
                    {here.length === 0 ? (
                      <span className="sr-only">None</span>
                    ) : (
                      <ul className="flex flex-wrap gap-1.5">
                        {here.map((i) => (
                          <li
                            key={i.question.id}
                            data-dim={DIMENSION_BY_ID[i.question.dimension].token}
                            title={i.question.shortLabel}
                            className="bg-dim grid h-8 min-w-8 place-items-center rounded-[30%] px-1.5 text-dim-deep font-semibold tabular-nums"
                          >
                            <span aria-hidden="true">{i.index + 1}</span>
                            <span className="sr-only">
                              Statement {i.index + 1}: {i.question.shortLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
