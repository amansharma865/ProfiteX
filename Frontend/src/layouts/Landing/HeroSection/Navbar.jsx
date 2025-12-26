import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [navbarFixed, setNavbarFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarFixed(true);
      } else {
        setNavbarFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`p-4 w-full z-50 transition-all duration-500 ease-in-out overflow-x-hidden animate-fade-down ${
        navbarFixed
          ? "fixed top-0 bg-white text-black shadow-lg"
          : "absolute top-2 bg-transparent text-white"
      }`}
    >
      <div className="container mx-auto flex items-center animate-fade-down">
        {/* Left Side: Logo with conditional invert filter */}
        <div className="flex items-center flex-grow w-32 animate-slide-right-l">
          <img
            src="https://res.cloudinary.com/ddwxpd7yp/image/upload/v1725320759/whitelogo_gk9qyv.svg"
            alt="Logo"
            className={`w-80 -ml-20 transition duration-500 ${
              navbarFixed ? "invert" : ""
            }`}
          />
        </div>

        {/* Center: Navigation Links */}
        {/* <ul className="flex space-x-16 flex-grow justify-center">
          <li>
            <a href="#Home" className="text-l font-medium  hover:underline ">
              Home
            </a>
          </li>
          <li>
            <a href="#About" className="text-l font-medium  hover:underline">
              Features
            </a>
          </li>
          <li>
            <a href="#Services" className="text-l font-medium  hover:underline">
              Pricing
            </a>
          </li>
          <li>
            <a href="#Contact" className="text-l font-medium hover:underline">
              FAQ
            </a>
          </li>
        </ul> */}

        {/* Right Side: Sign In Button */}
        <div className="flex items-center flex-grow justify-end animate-slide-left-l">
          <Link
            to={'auth/sign-up'}
            className="bg-green-800 mix-blend-multiply text-white py-2 px-4 rounded-3xl transform hover:bg-green-700 transition duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;