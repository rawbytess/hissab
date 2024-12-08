import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import AppSidebar from "@/components/sidebar/app-sidebar.tsx";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className={"w-full h-full"}>{children}</main>
    </SidebarProvider>
  );
}
