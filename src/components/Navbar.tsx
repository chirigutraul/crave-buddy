import logo64 from "../assets/logo-64x64.png";
import { Button } from "./ui/button";
import { useUser } from "@/contexts/User";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useViewTransition } from "@/hooks/use-view-transition";

const Navbar = ({ inRecipePage = false }: { inRecipePage?: boolean }) => {
  const { user, isLoggedIn } = useUser();
  const navLinks = [
    { label: "Home" },
    { label: "Features" },
    { label: "About" },
  ];

  const userLinks = [
    { label: "Generate meal", link: "/create-recipe" },
    { label: "My week", link: "/my-week" },
  ];

  const navigate = useViewTransition();

  return (
    <nav className="h-16 px-16 py-2 flex items-center justify-between border-b border-gray-200 bg-neutral-50">
      <img src={logo64} alt="CraveBuddy Logo" className="h-full" />

      <div className="flex gap-8">
        {inRecipePage
          ? userLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.link)}
                className="no-underline text-gray-800 font-medium hover:text-gray-600 transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ))
          : navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.label.toLowerCase()}`}
                className="no-underline text-gray-800 font-medium hover:text-gray-600 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
      </div>

      {isLoggedIn ? (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <span className="text-[14px] text-gray-700 font-medium">
            {user?.name}
          </span>
          <Avatar>
            <AvatarImage
              src={`https://avatar.iran.liara.run/public/${
                user?.sex === "male" ? "boy" : "girl"
              }?username=${user?.name.split(" ")[0]}`}
            />
            <AvatarFallback>
              {user?.name.split(" ")[0].charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <Button variant="default" onClick={() => navigate("/create-recipe")}>
          Get started
        </Button>
      )}
    </nav>
  );
};

export default Navbar;
