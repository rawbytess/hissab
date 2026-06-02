import {
  ArrowUpRight,
  Compass,
  Keyboard,
  Paperclip,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDocsNavigation } from "@/lib/docsNav.ts";

interface NotebookStarterProps {
  /** Drop a prompt into the AI chat composer (does not auto-send). */
  onPickExample: (prompt: string) => void;
}

/** Real-world, AI-friendly word problems shown in the "try a problem" card. */
const EXAMPLES: { emoji: string; prompt: string }[] = [
  { emoji: "🏠", prompt: "Cost to repaint a 12×18 ft living room, two coats" },
  {
    emoji: "💸",
    prompt: "Mortgage refi at 5.4% if I move in 4 years — worth it?",
  },
  { emoji: "🚗", prompt: "EV vs gas over 5 years — 12k mi/yr, $0.18/kWh" },
  { emoji: "🌱", prompt: "Soil for an 8×4 ft raised bed, 12 inches deep" },
];

/** Explore pills → the matching in-app documentation page. */
const EXPLORE: { label: string; slug: string }[] = [
  { label: "Convert units", slug: "guide/unit-conversion" },
  { label: "Dates & time", slug: "science-data/date-time" },
  { label: "Percentages", slug: "guide/percentages" },
  { label: "Statistics", slug: "science-data/statistics" },
  { label: "Trigonometry", slug: "science-data/trigonometry" },
  { label: "Number systems", slug: "science-data/number-systems" },
  { label: "Bitwise", slug: "science-data/bitwise" },
  { label: "Colors", slug: "science-data/colors" },
];

/**
 * Getting-started panel for a fresh notebook. Sits between the playground and
 * the chat composer and explains the three ways to calculate. Rendered by
 * Notebook.tsx only while the notebook is empty; it disappears once the AI
 * chat starts (or the playground gets content).
 */
export function NotebookStarter({ onPickExample }: NotebookStarterProps) {
  const goToDocs = useDocsNavigation();

  return (
    <div className="nb-starter-card">
      <div className="nb-starter">
        <div className="nbs-head">
          <h3>Three ways to start</h3>
          <span className="sub">Type it, ask AI, or bring a document</span>
        </div>

        <div className="nbs-cards">
          <div className="nbs-card">
            <div className="ic">
              <Keyboard size={16} />
            </div>
            <div className="step">01 · Playground</div>
            <h4>Type it yourself</h4>
            <p>Build a calculation line by line in natural syntax.</p>
            <ul className="pts">
              <li>Mix math, units &amp; words</li>
              <li>
                Label lines with <code>=</code>, reuse with <code>prev</code>
              </li>
              <li>Everything stays live</li>
            </ul>
            <div className="demo">
              <span className="chip">
                <b className="chip-strong">13 kg</b> + 12 pounds
              </span>
            </div>
          </div>

          <div className="nbs-card ai">
            <div className="ic">
              <Sparkles size={15} />
            </div>
            <div className="step">02 · Ask AI</div>
            <h4>Let AI do the math with Hissab</h4>
            <p>Describe a wordy problem; AI writes it out for you.</p>
            <ul className="pts">
              <li>Plain-English questions</li>
              <li>Hissab Engine does the calculations</li>
              <li>Editable cells show the working</li>
              <li>Great for real-world, multi-step</li>
            </ul>
            <div className="demo">
              <span className="chip">Refi at 5.4% — worth it?</span>
            </div>
          </div>

          <div className="nbs-card">
            <div className="ic">
              <Paperclip size={15} />
            </div>
            <div className="step">03 · Documents</div>
            <h4>Bring your own</h4>
            <p>Attach a file and compute on top of its numbers.</p>
            <ul className="pts">
              <li>Reference figures inside a file</li>
              <li>Skip the manual retyping</li>
              <li>Invoices, reports, receipts</li>
            </ul>
            <div className="demo">
              <span className="chip">invoice.pdf → total</span>
            </div>
          </div>
        </div>

        <div className="nbs-examples">
          <div className="nbs-ex-head">
            <span className="lead">
              <span className="ic">
                <Sparkles size={15} />
              </span>
              Try a real-world problem
            </span>
            <span className="hint">Tap one to drop it into the chat</span>
          </div>
          <div className="nbs-ex-grid">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex.prompt}
                className="nbs-ex"
                onClick={() => onPickExample(ex.prompt)}
              >
                <span className="emo">{ex.emoji}</span>
                <span className="t">{ex.prompt}</span>
                <span className="go">
                  <ArrowUpRight size={13} />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="nbs-explore">
          <span className="lead">
            <span className="ic">
              <Compass size={15} />
            </span>
            Explore
          </span>
          <div className="pills">
            {EXPLORE.map((item) => (
              <button
                type="button"
                key={item.slug}
                className="nbs-pill"
                onClick={() => goToDocs(item.slug)}
              >
                <span className="d" /> {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="nbs-foot">
          <span className="priv">
            <span className="ic">
              <ShieldCheck size={13} />
            </span>
            Stored locally — your calculations stay on your device.
          </span>
          <button type="button" className="nbs-docs" onClick={() => goToDocs()}>
            Read the docs
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
