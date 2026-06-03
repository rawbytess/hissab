import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { defaultDocSlug, docSections, findDoc } from "@/docs/registry.ts";
import "@/styles/docs.css";
import { DocsMarkdown } from "./DocsMarkdown.tsx";
import { DocsSidebar } from "./DocsSidebar.tsx";

// Loaded markdown is cached so re-visiting a page is instant and doesn't
// re-trigger its dynamic import.
const contentCache = new Map<string, string>();

function formatCrumbTitle(title: string) {
  return title.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export default function DocsShell() {
  const [location, navigate] = useLocation();
  const rawSlug = location.replace(/^\/docs\/?/, "");
  const slug = rawSlug || defaultDocSlug;
  const page = findDoc(slug);
  const section = docSections.find((docSection) =>
    docSection.pages.some((docPage) => docPage.slug === page?.slug),
  );
  const [content, setContent] = useState<string | null>(() =>
    page ? (contentCache.get(page.slug) ?? null) : null,
  );

  // Normalise "/docs" → the default page and redirect unknown slugs.
  useEffect(() => {
    if (!rawSlug || !page) {
      navigate(`/docs/${defaultDocSlug}`, { replace: true });
    }
  }, [rawSlug, page, navigate]);

  // Load (and cache) the page markdown whenever the active page changes.
  useEffect(() => {
    if (!page) return;
    const cached = contentCache.get(page.slug);
    if (cached !== undefined) {
      setContent(cached);
      return;
    }
    let cancelled = false;
    setContent(null);
    void page.load().then((mod) => {
      contentCache.set(page.slug, mod.default);
      if (!cancelled) setContent(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="wb-app docs-shell">
      <DocsSidebar
        activeSlug={page?.slug ?? defaultDocSlug}
        onNavigate={(s) => navigate(`/docs/${s}`)}
        onBack={() => navigate("/")}
      />
      <div className="wb-main">
        <header className="topbar docs-topbar">
          <div className="docs-topbar-title">
            <BookOpen size={16} />
            <span>Documentation</span>
            {section && (
              <span className="docs-topbar-crumb">
                {formatCrumbTitle(section.title)}
              </span>
            )}
            <span className="docs-topbar-crumb">
              {page?.title ?? "Loading"}
            </span>
          </div>
        </header>
        <div className="wb-body">
          <article className="docs-canvas scroll">
            {content !== null ? (
              <DocsMarkdown>{content}</DocsMarkdown>
            ) : (
              <div className="docs-loading">Loading…</div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
