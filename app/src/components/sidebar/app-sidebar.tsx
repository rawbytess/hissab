import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import Pages from "@/components/pages/Pages.tsx";
import { ExternalLink } from "lucide-react";
import { DrawerDialogLogin } from "@/components/auth/Dialog.tsx";
import { useContext, useState } from "react";
import { LoginForm } from "@/components/auth/Login.tsx";
import { LogoutButton } from "@/components/auth/Logout.tsx";
import { SessionContext } from "@/components/auth/SessionProvider.tsx";

export default function AppSidebar() {
  const [open, setOpen] = useState(false);

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
        <SidebarGroup
          className={"fixed bottom-10 p-4 mb-5 w-[--sidebar-width]"}
        >
          <DrawerDialogLogin
            open={open}
            setOpen={setOpen}
            triggerButton={ProButton()}
          >
            <LoginForm setOpen={setOpen} />
          </DrawerDialogLogin>
        </SidebarGroup>
        <SidebarGroup className={"fixed bottom-0 p-4 w-fit"}>
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

function ProButton() {
  const { session } = useContext(SessionContext);

  if (session) {
    return <LogoutButton />;
  }
  return (
    <button
      className={
        "bg-blue-600 text-white rounded-xl p-2.5 w-full text-center text-sm"
      }
    >
      Go Pro!
    </button>
  );
}
