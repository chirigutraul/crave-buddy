import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { RecipesSidebar } from "@/components/RecipesSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/contexts/User";
import BackgroundImage from "@/assets/background-image.jpeg";
import { useViewTransition } from "@/hooks/use-view-transition";

interface RecipeLayoutProps {
  children: React.ReactNode;
}

const RecipeLayout = ({ children }: RecipeLayoutProps) => {
  const { user, loading } = useUser();
  const navigate = useViewTransition();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/register");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>
        <div className="relative text-center">
          <div className="bg-neutral-50/95 rounded-2xl border-1 border-neutral-400 shadow-xl p-8">
            <p className="text-neutral-800">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>
      <div className="relative min-h-screen flex flex-col">
        <Navbar inRecipePage />
        <SidebarProvider>
          <RecipesSidebar />
          <SidebarTrigger />
          <main className="pl-0 py-7 flex-1 overflow-hidden">{children}</main>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default RecipeLayout;
