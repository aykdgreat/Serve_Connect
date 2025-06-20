import logo from "../assets/logo.png";
import NavBar from "./NavBar";

const Header = () => {
  return (
    <header className="mb-8 mt-4 flex items-center bg-white justify-between shadow-lg p-4 sm:px-6 mx-4 md:mx-12 border-b border-gray-200">
      {/* Logo and Brand Name - Left Side */}
      <div className="flex items-center align-middle">
        <img src={logo} alt="Logo" className="h-12 w-14 inline-block" />
        <span className="text-[22px] sm:text-3xl font-bold text-black">
          ServeConnect
        </span>
      </div>

      {/* Navigation Links - Right Side - Hamburger menu for mobile */}
      <NavBar />
    </header>
  );
};

export default Header;
