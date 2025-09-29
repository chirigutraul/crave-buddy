import Button from "./Button";
import logo64 from "../assets/logo-64x64.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navLinks = [
    { label: "Home" },
    { label: "Features" },
    { label: "About" },
  ];

  const navigate = useNavigate();

  return (
    <nav className="h-16 px-16 py-2 flex items-center justify-between border-b border-gray-200 bg-neutral-50">
      <img src={logo64} alt="CraveBuddy Logo" className="h-full" />

      <div className="flex gap-8">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href="#"
            className="no-underline text-gray-800 font-medium hover:text-gray-600"
          >
            {link.label}
          </a>
        ))}
      </div>

      <Button
        variant="small"
        title="Get started"
        className="bg-primary text-white hover:bg-green-500"
        onClick={() => navigate("/create-recipe")}
      />
    </nav>
  );
};

export default Navbar;
