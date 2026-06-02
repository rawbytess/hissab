import { useLocation } from "wouter";

// The docs live as in-app routes (`/docs/…`) on web/PWA. The Chrome extension
// loads from `chrome-extension://…/index.html` with no server fallback, so
// History-API paths can't be deep-linked there — instead it links out to the
// same docs on the hosted web app.
const WEB_DOCS_BASE = "https://hissab.io";
const isExtension = import.meta.env.VITE_CHROME === "true";

/**
 * Returns a `goToDocs(slug?)` callback: navigates to the in-app docs route on
 * web/PWA, or opens the hosted docs in a new tab inside the Chrome extension.
 */
export function useDocsNavigation() {
  const [, navigate] = useLocation();
  return (slug?: string) => {
    const path = slug ? `/docs/${slug}` : "/docs";
    if (isExtension) {
      window.open(`${WEB_DOCS_BASE}${path}`, "_blank", "noopener,noreferrer");
    } else {
      navigate(path);
    }
  };
}
