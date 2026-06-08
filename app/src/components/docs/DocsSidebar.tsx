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
        <a
          href="/"
          className="sb-foot-btn"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to app</span>
        </a>
      </div>
      <nav className="sb-scroll scroll docs-nav">
        {docSections.map((section) => (
          <div className="docs-nav-section" key={section.title}>
            <div className="sb-section">{section.title}</div>
            {section.pages.map((page) => (
              <a
                href={`/docs/${page.slug}`}
                key={page.slug}
                className={`docs-nav-item${
                  page.slug === activeSlug ? " active" : ""
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(page.slug);
                }}
              >
                {page.title}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
