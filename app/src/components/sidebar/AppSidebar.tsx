import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Pages from "@/components/sidebar/pages/Pages.tsx";
import UserDropdown from "@/components/user/UserDropdown.tsx";
import GetStarted from "@/components/user/GetStarted.tsx";
import { Divider } from "@heroui/react";
import { ExternalLink } from "lucide-react";
import { useContext } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, metadata } = useContext(SessionContext);
  const status = metadata?.subscription?.status;
  return (
    <SidebarProvider>
      <Sidebar
        variant={"sidebar"}
        collapsible={"offcanvas"}
        className={"text-white border-stone-950 bg-stone-950"}
      >
        <SidebarContent>
          <SidebarGroup>
            <Pages />
          </SidebarGroup>
          <SidebarGroup
            className={"fixed bottom-10 p-4 mb-5 w-[--sidebar-width]"}
          >
            {status !== "past_due" && status !== "active" && (
              <>
                <GetStarted />
              </>
            )}
            {session && <UserDropdown />}
          </SidebarGroup>

          <SidebarGroup
            className={
              "fixed bottom-0 w-[--sidebar-width] h-12 bg-gray-950 pt-2"
            }
          >
            <ul className={"flex gap-4 justify-start mx-3"}>
              <li>
                <a
                  href={"https://hissab.io/faqs"}
                  target={"_blank"}
                  className={"text-sm"}
                >
                  <div className={"flex gap-1 items-center"}>
                    <ExternalLink className={"w-4"} />
                    Help
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={"https://hissab.io/privacy-app"}
                  target={"_blank"}
                  className={"text-sm"}
                >
                  <div className={"flex gap-1 items-center"}>
                    <ExternalLink className={"w-4"} />
                    Privacy
                  </div>
                </a>
              </li>
            </ul>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className={"w-full h-full"}>{children}</main>
    </SidebarProvider>
  );
}
