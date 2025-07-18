import { Chip, cn, HeroUIProvider, ToastProvider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { infinity } from "ldrs";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useContext } from "react";
import Editor from "@/components/Editor/Editor.tsx";
import Footer from "@/components/Editor/Footer.tsx";
import Header from "@/components/Editor/Header.tsx";
import Sidebar from "@/components/sidebar/AppSidebar.tsx";
import PagesProvider, {
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import { AuthProvider } from "@/components/user/auth/AuthProvider.tsx";

infinity.register();

function App() {
  return (
    <div
      className={cn(
        `${import.meta.env.VITE_CHROME === "true" ? "min-h-[550px] min-w-[500px]" : ""}`,
        "dark text-foreground bg-background",
      )}
    >
      <AuthProvider>
        <NuqsAdapter>
          <HeroUIProvider>
            <ToastProvider toastOffset={50} disableAnimation />
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
          </HeroUIProvider>
        </NuqsAdapter>
      </AuthProvider>
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
