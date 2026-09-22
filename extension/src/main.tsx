import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./styles.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  // Render synchronously instead of on React's next scheduler tick, so the
  // shell and the editor (mounted in a layout effect) are in the first frame.
  flushSync(() => root.render(<App />));
}
