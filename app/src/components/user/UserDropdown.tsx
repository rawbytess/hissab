import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Divider,
} from "@heroui/react";
import { useContext } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { Icon } from "@iconify/react";

export default function UserDropdown() {
  const { session, pro, logout } = useContext(SessionContext);

  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: `https://robohash.org/${session?.user.email}.png`,
              fallback: session?.user.email,
            }}
            className="transition-transform"
            // description={session?.user?.email}
            name={session?.user?.email}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" className={"text-gray-300"}>
          {pro.plan ? (
            <DropdownItem key="manage_account">
              <a
                href={"https://hissab.io/faqs"}
                target={"_blank"}
                className="flex items-center justify-between"
              >
                Manage Account
                <Icon icon="lets-icons:external" width="20" height="20" />
              </a>
            </DropdownItem>
          ) : (
            <>
              <DropdownItem key="learn_hissab_ai">
                <a
                  href={"https://hissab.io/faqs"}
                  target={"_blank"}
                  className="flex items-center justify-between"
                >
                  Learn More about <br />
                  Hissab AI
                  <Icon icon="lets-icons:external" width="20" height="20" />
                </a>
              </DropdownItem>
              <DropdownItem key="but_hissab_ai">
                <a
                  href={"https://hissab.io/faqs"}
                  target={"_blank"}
                  className="flex items-center justify-between"
                >
                  Buy Hissab AI
                  <Icon icon="lets-icons:external" width="20" height="20" />
                </a>
              </DropdownItem>
            </>
          )}
          <DropdownItem
            key="logout"
            color="danger"
            className={"text-red-700"}
            onPress={logout}
          >
            <Divider className={"mb-2"} />
            Log Out
          </DropdownItem>
          {/*<DropdownItem key="logout" color="danger" className={"text-red-700"}>
            Delete Account
          </DropdownItem>*/}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
