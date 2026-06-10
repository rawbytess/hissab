import { Provider, useAtom, useSetAtom, useStore } from "jotai";
import { parseAsString, useQueryState } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Router, useLocation } from "wouter";
import { NotFound } from "@/components/NotFound.tsx";
import { EmptyCanvas } from "@/components/notebook/EmptyCanvas.tsx";
import { Notebook } from "@/components/notebook/Notebook.tsx";
import { Topbar } from "@/components/notebook/Topbar.tsx";
import { AppSidebar } from "@/components/sidebar/AppSidebar.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import {
  asyncNotebooksAtom,
  notebookProgressAtom,
  notebooksAtom,
} from "@/lib/atoms/notebooks.ts";
import { cn } from "@/lib/utils.ts";

// Lazy-loaded: the Settings modal pulls in the provider forms + model
// discovery (incl. the openai SDK) and is never needed at first paint.
const Settings = lazy(() => import("@/components/Settings/Settings.tsx"));

// Lazy-loaded: the full docs view (shell + markdown renderer + content) is
// only needed once the user opens documentation, so it stays out of first
// paint just like Settings.
const DocsShell = lazy(() => import("@/components/docs/DocsShell.tsx"));

const LAST_NOTEBOOK_KEY = "hissab-last-notebook-id";
const SIDEBAR_COLLAPSE_QUERY = "(max-width: 1023px)";
const PRODUCT_HUNT_URL = "https://www.producthunt.com/posts/hissab-3";
// Jun 10, 2026 12:01 AM PST (UTC-08:00), shown for the 24-hour launch day.
const PRODUCT_HUNT_LAUNCH_START_MS = Date.UTC(2026, 5, 10, 8, 1);
const PRODUCT_HUNT_LAUNCH_END_MS =
  PRODUCT_HUNT_LAUNCH_START_MS + 24 * 60 * 60 * 1000;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

function isProductHuntBannerVisible(nowMs: number) {
  return (
    nowMs >= PRODUCT_HUNT_LAUNCH_START_MS &&
    nowMs < PRODUCT_HUNT_LAUNCH_END_MS
  );
}

function getNextProductHuntBannerTransition(nowMs: number) {
  if (nowMs < PRODUCT_HUNT_LAUNCH_START_MS) {
    return PRODUCT_HUNT_LAUNCH_START_MS;
  }
  if (nowMs < PRODUCT_HUNT_LAUNCH_END_MS) {
    return PRODUCT_HUNT_LAUNCH_END_MS;
  }
  return null;
}

function useProductHuntLaunchBanner() {
  const [isVisible, setIsVisible] = useState(() =>
    isProductHuntBannerVisible(Date.now()),
  );

  useEffect(() => {
    let timeoutId: number | undefined;

    const syncVisibility = () => {
      const nowMs = Date.now();
      setIsVisible(isProductHuntBannerVisible(nowMs));

      const nextTransition = getNextProductHuntBannerTransition(nowMs);
      if (nextTransition === null) return;

      timeoutId = window.setTimeout(
        syncVisibility,
        Math.min(Math.max(nextTransition - nowMs, 0), MAX_TIMER_DELAY_MS),
      );
    };

    syncVisibility();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return isVisible;
}

function ProductHuntLaunchBanner() {
  return (
    <aside
      className="ph-launch-banner"
      aria-label="Product Hunt launch announcement"
      aria-live="polite"
    >
      <div className="ph-launch-copy">
        <img
          className="ph-launch-logo"
          src="/product-hunt.svg"
          alt=""
          aria-hidden="true"
        />
        <span>
          <strong>Hissab is live on Product Hunt today.</strong> Check us out
          there and share your support.
        </span>
      </div>
      <a
        className="ph-launch-link"
        href={PRODUCT_HUNT_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Support us on Product Hunt
      </a>
    </aside>
  );
}

function AppShell() {
  const store = useStore();
  const [notebooksValue] = useAtom(notebooksAtom);
  const setNotebooks = useSetAtom(asyncNotebooksAtom);
  const [progress] = useAtom(notebookProgressAtom);
  const [pageId, setPageId] = useQueryState(
    "page",
    parseAsString.withDefault(""),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const showProductHuntBanner = useProductHuntLaunchBanner()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia(SIDEBAR_COLLAPSE_QUERY).matches;
  });

  useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener("open-settings", handler);
    return () => window.removeEventListener("open-settings", handler);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SIDEBAR_COLLAPSE_QUERY);
    const collapseOnSmallScreen = () => {
      if (mediaQuery.matches) setSidebarOpen(false);
    };

    collapseOnSmallScreen();
    mediaQuery.addEventListener("change", collapseOnSmallScreen);
    return () =>
      mediaQuery.removeEventListener("change", collapseOnSmallScreen);
  }, []);

  const notebooks =
    notebooksValue.state === "hasData" ? notebooksValue.data : [];
  const currentNotebook =
    notebooks.find((notebook) => notebook.id === pageId) ?? null;
  const currentNotebookId = currentNotebook?.id ?? null;

  useEffect(() => {
    if (notebooksValue.state !== "hasData") return;

    if (notebooks.length === 0) {
      localStorage.removeItem(LAST_NOTEBOOK_KEY);
      if (pageId) void setPageId(null, { history: "replace" });
      return;
    }

    const pageIdIsValid = pageId
      ? notebooks.some((notebook) => notebook.id === pageId)
      : false;
    if (pageIdIsValid) {
      localStorage.setItem(LAST_NOTEBOOK_KEY, pageId);
      return;
    }

    const lastNotebookId = localStorage.getItem(LAST_NOTEBOOK_KEY);
    const fallbackNotebook =
      notebooks.find((notebook) => notebook.id === lastNotebookId) ??
      notebooks[0];

    localStorage.setItem(LAST_NOTEBOOK_KEY, fallbackNotebook.id);
    void setPageId(fallbackNotebook.id, { history: "replace" });
  }, [notebooks, notebooksValue.state, pageId, setPageId]);

  const handleSelectNotebook = (id: string) => {
    localStorage.setItem(LAST_NOTEBOOK_KEY, id);
    void setPageId(id);
  };

  const handleRenameNotebook = (title: string) => {
    if (!currentNotebook) return;
    const nextTitle = title.trim() || "Untitled notebook";
    if (nextTitle === currentNotebook.title) return;

    setNotebooks(
      notebooks.map((notebook) =>
        notebook.id === currentNotebook.id
          ? { ...notebook, title: nextTitle, updatedAt: Date.now() }
          : notebook,
      ),
    );
  };

  const handleAskAI = (notebookId: string, prompt: string) => {
    // Dynamically import the agentic runner so it (and the MCP SDK + harness
    // it pulls in) stays out of the first-paint bundle.
    void (async () => {
      const { runNotebookAI } = await import("@/lib/agentic/notebookRunner.ts");
      await runNotebookAI(store, notebookId, prompt);
    })();
  };

  return (
    <div
      className={`wb-app${sidebarOpen ? "" : " sidebar-collapsed"}`}
      style={{ ["--sidebar-w" as string]: sidebarOpen ? "268px" : "0px" }}
    >
      {sidebarOpen && (
        <AppSidebar
          currentId={currentNotebookId}
          onSelect={handleSelectNotebook}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <div
        className={cn("wb-main", showProductHuntBanner && "has-launch-banner")}
      >
        <Topbar
          notebook={currentNotebook}
          onRenameNotebook={handleRenameNotebook}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
          isRunning={Object.values(progress).some(
            (p) => p.notebookId === currentNotebookId,
          )}
        />
        {showProductHuntBanner && <ProductHuntLaunchBanner />}
        <div className="wb-body layout-inline">
          {currentNotebookId ? (
            <Notebook notebookId={currentNotebookId} onAskAI={handleAskAI} />
          ) : (
            <EmptyCanvas onPick={() => {}} />
          )}
        </div>
      </div>

      {settingsOpen && (
        <Suspense fallback={null}>
          <Settings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

// Top-level view switch using browser (History-API) path routing, so docs get
// clean, shareable URLs (`/docs/...`) instead of hash fragments. The notebook's
// `?page=` query state lives in the search string, independent of the path.
// `/index.html` is treated as home for the Chrome extension popup, whose URL is
// `chrome-extension://…/index.html` rather than `/`.
function Root() {
  const [location] = useLocation();
  const isHome =
    location === "/" || location === "" || location === "/index.html";
  const inDocs = location === "/docs" || location.startsWith("/docs/");

  if (inDocs) {
    return (
      <Suspense
        fallback={
          <div
            className="wb-app"
            style={{ display: "grid", placeItems: "center" }}
          >
            Loading docs…
          </div>
        }
      >
        <DocsShell />
      </Suspense>
    );
  }
  if (isHome) return <AppShell />;
  return <NotFound />;
}

function App() {
  return (
    <div
      className={cn(
        `${import.meta.env.VITE_CHROME === "true" ? "min-h-[550px] min-w-[500px]" : ""}`,
      )}
    >
      <Provider>
        <Router>
          <NuqsAdapter>
            <Toaster richColors position="top-center" />
            <Root />
          </NuqsAdapter>
        </Router>
      </Provider>
    </div>
  );
}

export default App;
