import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";

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

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.open(
                "https://twitter.com/intent/tweet?text=I%20found%20this%20amazing%20AI%20calculator%20called%20Hissab!%20Check%20it%20out%20at%20https://hissab.io",
                "_blank",
              );
            }}
          >
            <Icon icon="hugeicons:new-twitter" width={14} />
            Share on Twitter
          </Button>

          <a href="https://ko-fi.com/H2H017GQK4" target="_blank" rel="noopener">
            <img
              height="32"
              style={{ border: "0px", height: "32px" }}
              src="https://storage.ko-fi.com/cdn/kofi4.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Hissab is open source. If you want to submit a feature request, bug
          report or general feedback please open a GitHub issue.
        </p>
      </section>
    </div>
  );
}
