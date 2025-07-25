import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/components/user/auth/AuthProvider";

const customerPortalURL = import.meta.env.VITE_POLAR_PORTAL_URL;

export default function UserDropdown() {
  const { user, logout, isPremium } = useAuth();

  return (
    <div className="flex items-center gap-4 mt-10">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              className: "bg-purple-700 border-2 border-purple-500",
              isBordered: true,
              src: `https://robohash.org/${user?.email}.png`,
              fallback: user?.name || user?.email,
            }}
            className="transition-transform "
            description={isPremium ?? "Free Plan"}
            name={user?.name || user?.email}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" className={"text-gray-300"}>
          <DropdownSection showDivider={!!isPremium}>
            {isPremium ? (
              <DropdownItem key="manage_account" textValue={"Manage Account"}>
                <a
                  href={customerPortalURL}
                  target={"_blank"}
                  className="flex items-center justify-start gap-2"
                  rel="noopener"
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
            ) : null}
          </DropdownSection>
          <DropdownSection>
            <DropdownItem
              key="logout"
              color="danger"
              className={"text-red-700"}
              onPress={logout}
              textValue={"Log Out"}
              description={user?.email}
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
