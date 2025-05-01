import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  DropdownSection,
} from "@heroui/react";
import { useContext } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { Icon } from "@iconify/react";

export default function UserDropdown() {
  const { session, logout, isPremium } = useContext(SessionContext);

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
            description={isPremium ?? "Free Plan"}
            name={session?.user?.email}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" className={"text-gray-300"}>
          <DropdownSection showDivider>
            {isPremium ? (
              <DropdownItem key="manage_account" textValue={"Manage Account"}>
                <a
                  href={"https://hissab.io/faqs"}
                  target={"_blank"}
                  className="flex items-center justify-start gap-2"
                >
                  <Icon
                    icon="material-symbols:manage-accounts-outline-rounded"
                    width="16"
                    height="16"
                  />
                  <p>Manage Account</p>
                  <Icon
                    icon="lets-icons:external"
                    className={"ml-auto"}
                    width="16"
                    height="16"
                  />
                </a>
              </DropdownItem>
            ) : (
              <>
                <DropdownItem key="learn_hissab_ai" textValue={"Learn More"}>
                  <a
                    href={"https://hissab.io/faqs"}
                    target={"_blank"}
                    className="flex items-center justify-start gap-2"
                  >
                    <Icon icon="mdi:learn-outline" width="16" height="16" />
                    <p className="text-xs">Learn More about Hissab AI</p>
                    <Icon
                      icon="lets-icons:external"
                      className={"ml-auto"}
                      width="16"
                      height="16"
                    />
                  </a>
                </DropdownItem>
                <DropdownItem key="but_hissab_ai" textValue={"Buy Hissab AI"}>
                  <a
                    href={"https://hissab.io/faqs"}
                    target={"_blank"}
                    className="flex items-center justify-start gap-2"
                  >
                    <Icon icon="icon-park-outline:buy" width="16" height="16" />
                    <p>Buy Hissab AI</p>
                    <Icon
                      icon="lets-icons:external"
                      className={"ml-auto"}
                      width="16"
                      height="16"
                    />
                  </a>
                </DropdownItem>
              </>
            )}
          </DropdownSection>
          <DropdownSection>
            <DropdownItem
              key="logout"
              color="danger"
              className={"text-red-700"}
              onPress={logout}
              textValue={"Log Out"}
            >
              <div className={"flex items-center justify-start gap-2"}>
                <Icon icon="humbleicons:logout" width="16" height="16" />
                <p>Log Out</p>
              </div>
            </DropdownItem>

            {/*<DropdownItem key="logout" color="danger" className={"text-red-700"}>
            Delete Account
          </DropdownItem>*/}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
