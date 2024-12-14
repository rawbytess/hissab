import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import Pages from "@/components/pages/Pages.tsx";
import { ExternalLink } from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar
      variant={"sidebar"}
      collapsible={"offcanvas"}
      className={"text-white border-stone-950 bg-stone-950"}
    >
      <SidebarContent>
        <SidebarGroup>
          <Pages />
        </SidebarGroup>
        <SidebarGroup className={"fixed bottom-0 p-4"}>
          <ul className={"flex gap-10 justify-start"}>
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
  );
}
