import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction } from "react";
import { Page } from "@/components/sidebar/pages/PagesProvider.tsx";

export default function PageOptions({
  pageID,
  deletePage,
  setEditing,
  setCurrentPage,
  notes,
  index,
}: {
  pageID: Page;
  deletePage: (id: string) => void;
  setEditing: Dispatch<SetStateAction<Page | undefined>>;
  setCurrentPage: Dispatch<SetStateAction<Page | undefined>>;
  notes: Page[];
  index: number;
}) {
  return (
    <Dropdown className={"bg-blue-950 text-gray-300"}>
      <DropdownTrigger>
        <Button variant="light" size={"sm"} className={"ml-auto justify-end"}>
          <Icon icon="iwwa:option" width="20" height="20" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dropdown menu with description" variant="flat">
        <DropdownSection>
          <DropdownItem
            color={"primary"}
            onPress={() => {
              setEditing(pageID);
            }}
            key="rename"
            startContent={<Icon icon="mdi:rename" width="16" height="16" />}
          >
            Rename Page
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            onPress={() => {
              deletePage(pageID.id);
              setCurrentPage(notes[index - 1] ?? notes[index + 1]);
              setEditing(undefined);
            }}
            color="danger"
            startContent={
              <Icon icon="fluent:delete-16-filled" width="16" height="16" />
            }
          >
            Delete page
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
