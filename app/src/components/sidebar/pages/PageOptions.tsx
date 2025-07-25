import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Dispatch, SetStateAction } from "react";
import type { Page } from "@/components/sidebar/pages/PagesProvider.tsx";

export default function PageOptions({
  pageID,
  page,
  deletePage,
  setEditing,
  setCurrentPageNumber,
  notes,
  index,
}: {
  pageID: string;
  page: Page;
  deletePage: (id: string) => void;
  setEditing: Dispatch<SetStateAction<Page | undefined>>;
  setCurrentPageNumber: Dispatch<SetStateAction<string>>;
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
              setEditing(page);
            }}
            key="rename"
            startContent={<Icon icon="mdi:rename" width="16" height="16" />}
          >
            Rename {page.title}
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            onPress={() => {
              deletePage(pageID);
              setCurrentPageNumber(notes[index - 1].id ?? notes[index + 1].id);
              setEditing(undefined);
            }}
            color="danger"
            startContent={
              <Icon icon="fluent:delete-16-filled" width="16" height="16" />
            }
          >
            Delete {page.title}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
