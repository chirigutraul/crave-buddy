import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="flex-1 max-w-[1512px] m-auto">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
