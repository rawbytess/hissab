import Editor from "@/components/Editor/Editor.tsx";
import Sidebar from "@/components/sidebar/AppSidebar.tsx";
import PagesProvider, {
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import Header from "@/components/Editor/Header.tsx";
import Footer from "@/components/Editor/Footer.tsx";
import { SessionProvider } from "@/components/user/auth/SessionProvider.tsx";
import { Chip, cn, HeroUIProvider, ToastProvider } from "@heroui/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { infinity } from "ldrs";
import { Icon } from "@iconify/react";
import { useContext } from "react";
import { PostHogProvider } from "posthog-js/react";

infinity.register();
const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? "",
};

function App() {
  return (
    <div
      className={cn(
        `${import.meta.env.VITE_CHROME === "true" ? "min-h-[550px] min-w-[500px]" : ""}`,
        "dark text-foreground bg-background",
      )}
    >
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? ""}
        options={options}
      >
        <NuqsAdapter>
          <HeroUIProvider>
            <ToastProvider toastOffset={50} disableAnimation />
            <SessionProvider>
              <PagesProvider>
                <Sidebar>
                  <div
                    className={
                      "grid grid-rows-[auto_auto_1fr_auto] grid-cols-1 justify-between w-full rounded"
                    }
                  >
                    <Header />
                    <AttachmentBar />
                    <Editor />
                    <Footer />
                  </div>
                </Sidebar>
              </PagesProvider>
            </SessionProvider>
          </HeroUIProvider>
        </NuqsAdapter>
      </PostHogProvider>
    </div>
  );
}

export default App;

export function AttachmentBar() {
  const { currentPage, updateNote } = useContext(PageContext);
  if (!currentPage) return null;
  const exptime = new Date(currentPage.file?.geminiFile?.expirationTime ?? 0);
  const now = new Date();

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 items-center justify-center w-fill text-[#dddddd] drop-shadow p-2 mt-11  fixed z-10",
        !currentPage.file ? "h-0 p-0" : "h-auto",
      )}
    >
      {currentPage.file && (
        <Chip
          key={currentPage.file.name}
          startContent={
            <Icon className={"mx-1"} icon={"solar:paperclip-linear"} />
          }
          size={"sm"}
          variant={exptime > now ? "solid" : "dot"}
          onClose={() => {
            updateNote(currentPage.id, "", currentPage?.type, null);
          }}
        >
          {currentPage.file.name}
        </Chip>
      )}
    </div>
  );
}
