import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface RecipeLayoutProps {
  children: React.ReactNode;
}

const RecipeLayout = ({ children }: RecipeLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar />
      <main className="flex-1 pl-64">{children}</main>
    </div>
  );
};

export default RecipeLayout;
