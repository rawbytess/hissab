import { ArrowLeft } from "lucide-react";
import { docSections } from "@/docs/registry.ts";

interface DocsSidebarProps {
  activeSlug: string;
  onNavigate: (slug: string) => void;
  onBack: () => void;
}

export function DocsSidebar({
  activeSlug,
  onNavigate,
  onBack,
}: DocsSidebarProps) {
  return (
    <aside className="sidebar docs-sidebar">
      <div className="sb-head docs-sidebar-head">
        <span className="sb-brand">
          <span className="logo-mark" />
          <span>Hissab</span>
        </span>
      </div>
      <div className="docs-sb-head">
        <button type="button" className="sb-foot-btn" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to app</span>
        </button>
      </div>
      <nav className="sb-scroll scroll docs-nav">
        {docSections.map((section) => (
          <div className="docs-nav-section" key={section.title}>
            <div className="sb-section">{section.title}</div>
            {section.pages.map((page) => (
              <button
                type="button"
                key={page.slug}
                className={`docs-nav-item${
                  page.slug === activeSlug ? " active" : ""
                }`}
                onClick={() => onNavigate(page.slug)}
              >
                {page.title}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
