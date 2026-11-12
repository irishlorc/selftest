import { DIMENSIONS } from "@/config/questionnaire";
import { Glyph } from "./Glyph";

/**
 * Decorative 24-frame composition for the homepage. Each column is one
 * dimension; the varying fills hint at how results are drawn later.
 */
const FILLS = [
  [0.0, 0.5, 1, 0.25],
  [0.75, 0, 0.5, 1],
  [0.25, 1, 0, 0.5],
  [1, 0.5, 0.25, 0],
  [0, 0.75, 1, 0.5],
  [0.5, 0, 0.75, 0.25],
];
const GLYPH_ROW = [0, 2, 1, 3, 0, 2];

export function HeroMosaic() {
  return (
    <div className="grid grid-cols-6 gap-2.5 sm:gap-3.5" aria-hidden="true">
      {DIMENSIONS.map((d, col) => (
        <div key={d.id} className="grid gap-2.5 sm:gap-3.5" style={{ marginTop: `${(col % 3) * 18}px` }}>
          {FILLS[col].map((fill, row) => {
            const isGlyph = GLYPH_ROW[col] === row;
            const delay = (col * 4 + row) * 35;
            return (
              <div
                key={row}
                data-dim={d.token}
                className="anim-settle relative aspect-square overflow-hidden bg-dim"
                style={{
                  animationDelay: `${delay}ms`,
                  borderRadius: isGlyph ? "50%" : row % 2 ? "28%" : "36%",
                }}
              >
                {isGlyph ? (
                  <Glyph dimension={d.id} className="absolute inset-[18%] text-dim-deep" strokeWidth={2} />
                ) : (
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{ height: `${fill * 100}%`, background: "var(--dim-deep)", opacity: 0.1 + fill * 0.32 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
