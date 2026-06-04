// Custom click-to-edit popovers for the editor's structured tokens.
//
// The editor (plain CodeMirror) renders a swatch / calendar glyph and dispatches
// a `hissab-token-interact` CustomEvent on click; the notebook cell catches it
// and renders this component. We anchor a base-ui popover to the rect that came
// with the event (a virtual element), let the user pick, and hand the new source
// string back via `onCommit` — the cell writes it into the document.

import { Popover } from "@base-ui/react/popover";
import { useMemo, useState } from "react";
import type { TokenInteractionDetail } from "@/lib/editor/tokenDecorations.ts";
import "@/styles/token-popovers.css";

interface Props {
  interaction: TokenInteractionDetail | null;
  onClose: () => void;
  onCommit: (from: number, to: number, text: string) => void;
}

const MONTHS_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Named CSS colours offered as one-click presets. Picking one writes the *name*
// back (`red`), so the source stays readable; the hex field / colour input write
// hex.
const COLOR_PRESETS = [
  "red",
  "orange",
  "gold",
  "green",
  "teal",
  "blue",
  "navy",
  "purple",
  "magenta",
  "pink",
  "brown",
  "black",
  "gray",
  "white",
];

const pad = (n: number) => String(n).padStart(2, "0");

// Resolve any CSS colour string (named, #rgb, rgb()) to a 6-digit hex the native
// colour input understands. The canvas trick normalises whatever the browser
// accepts; falls back to black.
function toHex(input: string): string {
  const v = input.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillStyle = v;
      if (/^#[0-9a-f]{6}$/i.test(ctx.fillStyle))
        return ctx.fillStyle.toLowerCase();
    }
  } catch {
    // ignore — fall through to default
  }
  return "#000000";
}

interface SeedDate {
  year: number;
  month: number; // 0-11
  day: number;
  hour: number;
  minute: number;
}

// Best-effort parse of the existing date source so the calendar opens on it.
// Handles the two common written forms plus anything `Date` can read; otherwise
// seeds today.
function parseSeed(value: string): SeedDate {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hour = 0;
  let minute = 0;
  const v = value.trim();

  const dmy = /^(\d{1,2})\s+([a-zA-Z]{3,})\s+(\d{4})/.exec(v);
  const ymd = /^(\d{4})\.(\d{1,2})\.(\d{1,2})/.exec(v);
  if (dmy) {
    day = +dmy[1];
    const mi = MONTHS_SHORT.indexOf(dmy[2].slice(0, 3).toLowerCase());
    if (mi >= 0) month = mi;
    year = +dmy[3];
  } else if (ymd) {
    year = +ymd[1];
    month = +ymd[2] - 1;
    day = +ymd[3];
  } else {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
      hour = d.getHours();
      minute = d.getMinutes();
    }
  }
  const tm = /(\d{1,2}):(\d{2})/.exec(v);
  if (tm) {
    hour = Math.min(23, +tm[1]);
    minute = Math.min(59, +tm[2]);
  }
  return {
    year,
    month: Math.min(11, Math.max(0, month)),
    day,
    hour,
    minute,
  };
}

function ColorPicker({
  value,
  onPick,
}: {
  value: string;
  onPick: (text: string) => void;
}) {
  const [hex, setHex] = useState(() => toHex(value));
  return (
    <div className="hissab-color-picker">
      <div className="hcp-presets">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            className="hcp-swatch"
            style={{ background: c }}
            title={c}
            onClick={() => onPick(c)}
          />
        ))}
      </div>
      <div className="hcp-custom">
        <input
          type="color"
          aria-label="Custom colour"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
        />
        <input
          className="hcp-hex"
          aria-label="Hex value"
          value={hex}
          spellCheck={false}
          onChange={(e) => setHex(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onPick(hex);
          }}
        />
        <button type="button" className="hcp-apply" onClick={() => onPick(hex)}>
          Apply
        </button>
      </div>
    </div>
  );
}

function DateTimePicker({
  value,
  onPick,
}: {
  value: string;
  onPick: (text: string) => void;
}) {
  const seed = useMemo(() => parseSeed(value), [value]);
  const [view, setView] = useState({ year: seed.year, month: seed.month });
  const [sel, setSel] = useState({
    year: seed.year,
    month: seed.month,
    day: seed.day,
  });
  const [hour, setHour] = useState(seed.hour);
  const [minute, setMinute] = useState(seed.minute);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const step = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const commit = () => {
    let out = `${sel.day} ${MONTHS_SHORT[sel.month]} ${sel.year}`;
    if (hour !== 0 || minute !== 0) out += ` ${pad(hour)}:${pad(minute)}`;
    onPick(out);
  };

  return (
    <div className="hissab-date-picker">
      <div className="hdp-header">
        <button type="button" className="hdp-nav" onClick={() => step(-1)}>
          ‹
        </button>
        <span className="hdp-title">
          {MONTHS_SHORT[view.month].toUpperCase()} {view.year}
        </span>
        <button type="button" className="hdp-nav" onClick={() => step(1)}>
          ›
        </button>
      </div>
      <div className="hdp-grid">
        {WEEKDAYS.map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed weekday header
          <span key={`wd-${i}`} className="hdp-weekday">
            {w}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: padding cell
            <span key={`pad-${i}`} className="hdp-empty" />
          ) : (
            <button
              key={`d-${d}`}
              type="button"
              className={
                sel.day === d &&
                sel.month === view.month &&
                sel.year === view.year
                  ? "hdp-day is-selected"
                  : "hdp-day"
              }
              onClick={() =>
                setSel({ year: view.year, month: view.month, day: d })
              }
            >
              {d}
            </button>
          ),
        )}
      </div>
      <div className="hdp-time">
        <input
          type="number"
          min={0}
          max={23}
          aria-label="Hour"
          value={hour}
          onChange={(e) =>
            setHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))
          }
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          max={59}
          aria-label="Minute"
          value={minute}
          onChange={(e) =>
            setMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))
          }
        />
        <button type="button" className="hdp-apply" onClick={commit}>
          Apply
        </button>
      </div>
    </div>
  );
}

export function TokenInteractionPopover({
  interaction,
  onClose,
  onCommit,
}: Props) {
  const anchor = useMemo(
    () =>
      interaction
        ? { getBoundingClientRect: () => interaction.rect }
        : undefined,
    [interaction],
  );

  const commit = (text: string) => {
    if (interaction) onCommit(interaction.from, interaction.to, text);
    onClose();
  };

  return (
    <Popover.Root
      open={interaction !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Popover.Portal>
        <Popover.Positioner anchor={anchor} side="bottom" sideOffset={6}>
          <Popover.Popup className="hissab-token-popup">
            {interaction?.kind === "color" && (
              <ColorPicker value={interaction.value} onPick={commit} />
            )}
            {interaction?.kind === "date" && (
              <DateTimePicker value={interaction.value} onPick={commit} />
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
