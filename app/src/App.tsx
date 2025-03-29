import Editor from "@/components/Editor/Editor.tsx";
import Sidebar from "@/components/sidebar/AppSidebar.tsx";
import PagesProvider from "@/components/sidebar/pages/PagesProvider.tsx";
import Header from "@/components/Editor/Header.tsx";
import Footer from "@/components/Editor/Footer.tsx";
import { SessionProvider } from "@/components/user/auth/SessionProvider.tsx";
import { cn, HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { infinity } from "ldrs";

const queryClient = new QueryClient();

infinity.register();

function App() {
  return (
    <div
      className={cn(
        `${import.meta.env.VITE_CHROME === "true" ? "min-h-[550px] min-w-[500px]" : ""}`,
        "dark text-foreground bg-background",
      )}
    >
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <SessionProvider>
            <PagesProvider>
              <Sidebar>
                <div
                  className={
                    "flex flex-col justify-between w-full rounded h-screen"
                  }
                >
                  <Header />
                  <Editor />
                  <Footer />
                </div>
              </Sidebar>
            </PagesProvider>
          </SessionProvider>
        </HeroUIProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
