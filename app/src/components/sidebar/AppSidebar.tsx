import { ExternalLink } from "lucide-react";
import { useContext } from "react";
import Pages from "@/components/sidebar/pages/Pages.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/user/auth/AuthProvider.tsx";
import GetStarted from "@/components/user/GetStarted.tsx";
import UserDropdown from "@/components/user/UserDropdown.tsx";

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPremium, isAuthenticated, user } = useAuth();

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
            {!isPremium && (
              <>
                <GetStarted />
              </>
            )}
            {isAuthenticated && <UserDropdown />}
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
                  rel="noopener"
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
                  rel="noopener"
                >
                  <div className={"flex gap-1 items-center"}>
                    <ExternalLink className={"w-4"} />
                    Privacy
                  </div>
                </a>
              </li>
              <li>
                <a
                    href={"https://hissab.io/mcp"}
                    target={"_blank"}
                    className={"text-sm"}
                    rel="noopener"
                >
                  <div className={"flex gap-1 items-center"}>
                    <ExternalLink className={"w-4"} />
                    MCP
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
