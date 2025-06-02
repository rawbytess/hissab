import { roadmap } from "./roadmap";
import { Card, CardBody } from "@heroui/react";
import { cn } from "@/lib/utils.ts";
import { Icon } from "@iconify/react";

interface statusMapIf {
  [key: string]: {
    icon: string;
    title: string;
  };
}

const statusMap: statusMapIf = {
  exciting: {
    icon: "/resources/confetti.png",
    title: "",
  },
  completed: {
    icon: "/resources/check.png",
    title: "Done",
  },
  incomplete: {
    icon: "/resources/load.png",
    title: "todo",
  },
  wip: {
    icon: "/resources/wip.png",
    title: "In Progress",
  },
  considering: {
    icon: "/resources/considering.png",
    title: "Considering",
  },
};

export default function Roadmaps() {
  return (
    <section className={"flex flex-row flex-wrap gap-4 items-start w-full"}>
      {roadmap.map(
        (
          rm: {
            status: string;
            description: string;
            title: string;
          },
          oi: number,
        ) => (
          <RoadmapCard
            key={oi}
            title={rm.title}
            status={rm.status}
            description={rm.description}
          />
        ),
      )}
    </section>
  );
}

function RoadmapCard({
  status,
  title,
  description,
}: {
  status: string;
  title: string;
  description: string;
}) {
  return (
    <Card
      className={cn(
        "max-w-[25em] w-full bg-stone-800 ring-1 ring-stone-600 p-1",
        status === "completed" && "",
        status === "considering" && "",
        status === "wip" && "",
        status === "exciting" && "",
      )}
    >
      <CardBody className={"flex flex-col gap-4 p-2 relative"}>
        {status === "wip" && (
          <Icon
            icon={"nrk:progress"}
            width={24}
            color={"aqua"}
            className={"absolute right-0 top-0"}
          />
        )}
        {status === "considering" && (
          <Icon
            icon={"raphael:roadmap"}
            width={24}
            color={"yellow"}
            className={"absolute right-0 top-0"}
          />
        )}
        {status === "completed" && (
          <Icon
            icon={"weui:done2-filled"}
            width={24}
            color={"#66FF99"}
            className={"absolute right-0 top-0"}
          />
        )}
        {status === "exciting" && (
          <Icon
            icon={"noto:party-popper"}
            width={24}
            className={"absolute right-0 top-0"}
          />
        )}
        <div className={""}>{title}</div>
        <div className={"text-sm text-stone-400"}>{description}</div>
      </CardBody>
    </Card>
  );
}
