import { roadmap } from "./roadmap";
import { Card, CardBody } from "@heroui/react";

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
    <section className={"flex flex-col items-start gap-4"}>
      {roadmap.map(
        (
          rm: {
            status: string;
            description: string;
            title: string;
          },
          oi: number,
        ) => {
          return (
            <RoadmapCard
              title={rm.title}
              status={rm.status}
              description={rm.description}
            />
          );
        },
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
    <Card className={"w-full max-w-[40em] bg-stone-800 ring-2 ring-stone-600"}>
      <CardBody className={"flex flex-row gap-4 p-2"}>
        <div
          className={"flex flex-col gap-2 items-center justify-center min-w-24"}
        >
          <img
            src={statusMap[status].icon}
            alt={statusMap[status].title}
            className={"w-5 h-5"}
          />
          <div className={"text-center text-sm"}>{statusMap[status].title}</div>
        </div>
        <div>
          <div>{title}</div>
          <div className={"text-sm text-stone-400"}>{description}</div>
        </div>
      </CardBody>
    </Card>
  );
}
