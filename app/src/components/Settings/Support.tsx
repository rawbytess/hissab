import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";

const GITHUB_URL = "https://github.com/rawbytess/hissab";
const ISSUES_URL = "https://github.com/rawbytess/hissab/issues/new";
const GITHUB_SPONSORS_BUTTON_URL = "https://github.com/sponsors/prenx4x/button";
const SHARE_URL =
  "https://twitter.com/intent/tweet?text=I%20found%20this%20amazing%20AI%20calculator%20called%20Hissab!&url=https%3A%2F%2Fhissab.io";

export function Support() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon icon="mdi:heart" width={16} height={16} />
            Support Hissab
          </h3>
          <p className="text-xs text-muted-foreground">
            If you find Hissab useful, please consider supporting the project.
            Your support helps us continue to improve and maintain it.
          </p>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon icon="mdi:star" width={16} height={16} />
            Star Hissab on GitHub
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Stars help more developers discover the project and make it easier
            for new contributors to find the repo.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <Button variant="secondary" size="sm" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Icon icon="mdi:github" width={14} />
              Open GitHub repo
            </a>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon icon="hugeicons:new-twitter" width={16} height={16} />
            Share Hissab
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A quick post helps Hissab reach people who need a notebook-style
            calculator for everyday math, conversions and AI-assisted work.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <Button variant="secondary" size="sm" asChild>
            <a href={SHARE_URL} target="_blank" rel="noopener noreferrer">
              <Icon icon="hugeicons:new-twitter" width={14} />
              Share on Twitter
            </a>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon icon="mdi:github" width={16} height={16} />
            Support development
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If Hissab saves you time, a small contribution helps cover project
            maintenance, hosting and future improvements.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <iframe
            src={GITHUB_SPONSORS_BUTTON_URL}
            title="Sponsor prenx4x"
            height="32"
            width="114"
            style={{ border: 0, borderRadius: "6px" }}
          />
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon icon="mdi:message-alert" width={16} height={16} />
            Feedback and issues
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bug reports, feature requests and workflow examples are useful. Open
            an issue with what you tried, what happened and what you expected.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <Button variant="secondary" size="sm" asChild>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              <Icon icon="mdi:github" width={14} />
              Open GitHub issue
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
