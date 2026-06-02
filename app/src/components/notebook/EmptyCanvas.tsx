import { Plus } from "lucide-react";

interface EmptyCanvasProps {
  onPick: (text: string) => void;
}

const EXAMPLES: { ic: string; t: string }[] = [
  { ic: "🏠", t: "Cost to repaint a 12×18 ft living room, two coats" },
  { ic: "💸", t: "Mortgage refi at 5.4% if I move in 4 years — worth it?" },
  { ic: "🌱", t: "Soil for an 8×4 ft raised bed, 12 inches deep" },
  { ic: "🚗", t: "EV vs gas over 5 years — 12k mi/yr, $0.18/kWh" },
];

export function EmptyCanvas({ onPick }: EmptyCanvasProps) {
  return (
    <div className="empty">
      <div className="mark">✦</div>
      <h2>New notebook</h2>
      <p>
        Type math directly into the expression editor — or describe what you
        want and let AI write the math for you.
      </p>

      <div className="empty-scratch">
        <div className="t-cell scratch">
          <div className="cell-head">
            <span>Expressions</span>
            <span className="spacer" />
            <span className="cell-head-hint">Click to start typing</span>
          </div>
          <div className="cm-grid">
            <div className="cm-ln">1</div>
            <div className="cm-src placeholder">
              <span className="dim">e.g. </span>
              <span className="example">
                monthly_savings = (gas_cost − ev_cost) × 12
              </span>
              <span className="cm-cursor" />
            </div>
            <div className="cm-res" />
          </div>
        </div>
      </div>

      <div className="empty-or">
        <span className="ln" />
        <span>or ask AI</span>
        <span className="ln" />
      </div>

      <div className="examples">
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex.t}
            className="ex"
            onClick={() => onPick(ex.t)}
          >
            <span className="ic">{ex.ic}</span>
            <span>{ex.t}</span>
            <span className="grow" />
            <span className="ic-go">
              <Plus size={10} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
