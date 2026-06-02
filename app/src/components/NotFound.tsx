import { useLocation } from "wouter";

/**
 * Top-level fallback for unmatched paths under browser (History-API) routing.
 * Rendered by `Root()` when the location is neither home nor a `/docs/…` route.
 */
export function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div
      className="wb-app"
      style={{
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>404</h1>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          That page doesn't exist.
        </p>
        <button
          type="button"
          className="topbar-docs-btn"
          onClick={() => navigate("/")}
        >
          Back to calculator
        </button>
      </div>
    </div>
  );
}
