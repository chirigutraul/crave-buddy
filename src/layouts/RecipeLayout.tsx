import Navbar from "@/components/Navbar";
import { RecipesSidebar } from "@/components/RecipesSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface RecipeLayoutProps {
  children: React.ReactNode;
}

const RecipeLayout = ({ children }: RecipeLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <SidebarProvider>
        <RecipesSidebar />
        <SidebarTrigger />
        <main className="flex-1 pl-64">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default RecipeLayout;
