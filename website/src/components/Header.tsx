import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={
          "h-12 w-full bg-[#530e97] flex flex-row items-center px-5 drop-shadow-xl justify-around fixed top-0 z-50" // Changed justify-around to justify-between
        }
      >
        <a href="/" className={"flex items-center gap-1 text-white"}>
          <img
            src="/img/logomark.svg"
            className={"w-8 drop-shadow"}
            alt="Hissab logo"
          />
          <h1 className={"shadow"}>Hissab</h1>
        </a>

        {/* Desktop Navigation Links - Hidden on small screens */}
        <div
          className={"hidden md:flex flex-row items-center align-middle gap-5"}
        >
          <a
            href={"/faqs"}
            className={
              "text-sm underline underline-offset-2 text-white hover:text-[#efefef]"
            }
          >
            Docs
          </a>
          <a
            href={"/pricing"}
            className={
              "text-sm underline underline-offset-2 text-white hover:text-[#efefef]"
            }
          >
            Pricing
          </a>
          <a
            href={"/roadmap"}
            className={
              "text-sm underline underline-offset-2 text-white hover:text-[#efefef]"
            }
          >
            Roadmap
          </a>
        </div>

        {/* Desktop App Link - Hidden on small screens */}
        <div className={"hidden md:block h-fit"}>
          <a
            href={"https://app.hissab.io"}
            target={"_blank"}
            className={
              "hissab-app-nav drop-shadow-2xl shadow-2xl h-10 p-2 text-white hover:text-[#efefef]"
            }
          >
            Hissab App
          </a>
        </div>

        {/* Hamburger Menu Button - Visible only on small screens */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {/* Simple Hamburger Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                } // Changes icon based on state
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu - Conditionally rendered */}
      <div
        className={`md:hidden fixed top-12 left-0 right-0 bg-[#530e97] shadow-lg z-40 transition-transform duration-300 ease-in-out transform ${
          // Added transform utility class
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full" // Rely solely on transform for visibility
        }`} // Removed conditional block/hidden
      >
        <div className="flex flex-col items-center px-5 py-4 gap-4">
          <a
            href={"/faqs"}
            className={"text-white hover:text-[#efefef]"}
            onClick={toggleMobileMenu} // Close menu on click
          >
            Docs
          </a>
          <a
            href={"/pricing"}
            className={"text-white hover:text-[#efefef]"}
            onClick={toggleMobileMenu} // Close menu on click
          >
            Pricing
          </a>
          <a
            href={"/roadmap"}
            className={"text-white hover:text-[#efefef]"}
            onClick={toggleMobileMenu} // Close menu on click
          >
            Roadmap
          </a>
          <a
            href={"https://app.hissab.io"}
            target={"_blank"}
            className={"hissab-app-nav p-2 text-white hover:text-[#efefef]"}
            onClick={toggleMobileMenu} // Close menu on click
          >
            Hissab App
          </a>
        </div>
      </div>
    </>
  );
}
