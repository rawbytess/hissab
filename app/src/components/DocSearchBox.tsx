import { DocSearch, type DocSearchProps } from "@docsearch/react";
import { type MouseEvent, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils.ts";

const DOCSEARCH_APP_ID = "MWV41FNTTM";
const DOCSEARCH_API_KEY = "1a55fc9a35a243cd7f5d88859192a860";
const DOCSEARCH_INDEX_NAME = "Hissab Docs";
const isExtension = import.meta.env.VITE_CHROME === "true";

type DocSearchNavigator = NonNullable<DocSearchProps["navigator"]>;
type DocSearchHitComponent = NonNullable<DocSearchProps["hitComponent"]>;

interface DocSearchBoxProps {
  className?: string;
}

function docsPathFromUrl(itemUrl: string) {
  try {
    const url = new URL(itemUrl, window.location.origin);
    if (url.pathname === "/docs" || url.pathname.startsWith("/docs/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }
  return null;
}

function browserUrlFor(itemUrl: string) {
  const docsPath = docsPathFromUrl(itemUrl);
  return docsPath
    ? new URL(docsPath, window.location.origin).toString()
    : itemUrl;
}

function openInNewBrowsingContext(itemUrl: string) {
  const windowReference = window.open(
    browserUrlFor(itemUrl),
    "_blank",
    "noopener,noreferrer",
  );
  windowReference?.focus();
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

export function DocSearchBox({ className }: DocSearchBoxProps) {
  const [, navigate] = useLocation();

  const navigateToResult = useCallback(
    (itemUrl: string) => {
      const docsPath = docsPathFromUrl(itemUrl);
      if (!docsPath) return false;
      navigate(docsPath);
      return true;
    },
    [navigate],
  );

  const navigator = useMemo<DocSearchNavigator>(
    () => ({
      navigate({ itemUrl }) {
        if (!navigateToResult(itemUrl)) {
          window.location.assign(itemUrl);
        }
      },
      navigateNewTab({ itemUrl }) {
        openInNewBrowsingContext(itemUrl);
      },
      navigateNewWindow({ itemUrl }) {
        openInNewBrowsingContext(itemUrl);
      },
    }),
    [navigateToResult],
  );

  const hitComponent = useMemo<DocSearchHitComponent>(
    () =>
      function HissabDocSearchHit({ hit, children }) {
        const href = browserUrlFor(hit.url);

        return (
          <a
            href={href}
            onClick={(event) => {
              if (isModifiedClick(event)) return;
              if (navigateToResult(hit.url)) event.preventDefault();
            }}
          >
            {children}
          </a>
        );
      },
    [navigateToResult],
  );

  if (isExtension) return null;

  return (
    <div className={cn("docsearch-box", className)}>
      <DocSearch
        appId={DOCSEARCH_APP_ID}
        apiKey={DOCSEARCH_API_KEY}
        indices={[DOCSEARCH_INDEX_NAME]}
        theme="dark"
        navigator={navigator}
        hitComponent={hitComponent}
        keyboardShortcuts={{ "/": false }}
        translations={{
          button: {
            buttonText: "Search docs",
            buttonAriaLabel: "Search documentation",
          },
          modal: {
            searchBox: {
              placeholderText: "Search docs",
              searchInputLabel: "Search documentation",
            },
          },
        }}
      />
    </div>
  );
}
