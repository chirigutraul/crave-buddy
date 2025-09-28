import Button from "./Button";
import logo64 from "../assets/logo-64x64.png";

const Navbar = () => {
  const navLinks = [
    { label: "Home" },
    { label: "Features" },
    { label: "About" },
  ];

  return (
    <nav className="h-16 px-16 py-2 flex items-center justify-between border-b border-gray-200">
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
      />
    </nav>
  );
};

export default Navbar;
