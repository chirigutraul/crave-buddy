import logo128 from "../assets/logo-128x128.png";
export const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-orange-300 to-primary h-16 px-16 py-2 flex items-center justify-center text-white">
      <div className="flex items-center gap-2">
        <img src={logo128} alt="CraveBuddy Logo" className="h-10" />
        <a href="https://github.com/chirigutraul">
          <h6>CraveBuddy</h6>
        </a>
      </div>
    </footer>
  );
};
