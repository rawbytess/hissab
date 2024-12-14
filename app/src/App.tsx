import Editor from "@/components/Editor.tsx";
import Sidebar from "@/components/sidebar/Sidebar.tsx";
import PagesProvider from "@/components/pages/PagesProvider.tsx";
import Header from "@/components/header/Header.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import Footer from "@/components/footer/Footer.tsx";

function App() {
  return (
    <div
      className={`${import.meta.env.VITE_CHROME === "true" ? "min-h-[550px] min-w-[500px]" : ""}`}
    >
      <TooltipProvider>
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
      </TooltipProvider>
    </div>
  );
}

export default App;
