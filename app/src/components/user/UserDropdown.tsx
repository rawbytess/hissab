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
  const { session, logout, metadata, isPaid } = useContext(SessionContext);

  return (
    <div className="flex items-center gap-4 mt-10">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              className: "bg-purple-700 border-2 border-purple-500",
              isBordered: true,
              src: `https://robohash.org/${session?.user.email}.png`,
              fallback: session?.user.email,
            }}
            className="transition-transform "
            description={metadata?.subscription?.product_name || "Free Plan"}
            name={session?.user?.email}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" className={"text-gray-300"}>
          {isPaid ? (
            <DropdownItem key="manage_account" textValue={"Manage Account"}>
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
              <DropdownItem key="learn_hissab_ai" textValue={"Learn More"}>
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
              <DropdownItem key="but_hissab_ai" textValue={"Buy Hissab AI"}>
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
            textValue={"Log Out"}
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
