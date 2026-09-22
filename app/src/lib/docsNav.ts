import { useLocation } from "wouter";

/**
 * Returns a `goToDocs(slug?)` callback that navigates to the in-app docs route
 * (`/docs/…`).
 */
export function useDocsNavigation() {
  const [, navigate] = useLocation();
  return (slug?: string) => navigate(slug ? `/docs/${slug}` : "/docs");
}
