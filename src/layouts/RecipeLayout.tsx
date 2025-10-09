import Navbar from "@/components/Navbar";
import { RecipesSidebar } from "@/components/RecipesSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import BackgroundImage from "@/assets/background-image.jpeg";

interface RecipeLayoutProps {
  children: React.ReactNode;
}

const RecipeLayout = ({ children }: RecipeLayoutProps) => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <SidebarProvider>
          <RecipesSidebar />
          <SidebarTrigger />
          <main className="pl-1 py-8">{children}</main>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default RecipeLayout;
