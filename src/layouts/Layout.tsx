import Navbar from "../components/Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
