import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { roadmap } from "./roadmap";

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
    <Table className={"border-0"}>
      <Thead>
        <Tr>
          <Th>Status</Th>
          <Th>Title</Th>
          <Th>Description</Th>
        </Tr>
      </Thead>

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
            <Tbody key={oi}>
              <Tr>
                <Td className={" text-center"}>
                  <img
                    src={statusMap[rm.status].icon}
                    alt={statusMap[rm.status].title}
                    className={"w-6 h-6"}
                  />
                  <div>{statusMap[rm.status].title}</div>
                </Td>

                <Td>{rm.title}</Td>
                <Td>{rm.description}</Td>
              </Tr>
            </Tbody>
          );
        },
      )}
    </Table>
  );
}
