import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ShoppingCart } from "lucide-react";
import { FaBolt } from "react-icons/fa6";
import CartSidebar from "../pages/Cart"; // Make sure this is the correct path to your Cart.jsx
import { useCart } from "../context/CartContext"; // Make sure this is the correct path

const Navbar = () => {
  const progressRef = useRef(null);

  // Cart logic
  const { getCartItemsCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => setIsCartOpen((open) => !open);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollableHeight) * 100;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        {/* Navbar */}
        <div className="w-full bg-white shadow-md py-6 px-8 flex items-center justify-between text-lg md:text-xl">
          {/* Logo */}
          <Link to="/" className="text-2xl font-semibold tracking-widest px-8" aria-label="Go to homepage">
            {/* You can use your SVG or image logo here */}
            NEEMAN'S
          </Link>

          {/* Center Links */}
          <div className="space-x-6 hidden lg:flex items-center">
            {["NEW", "MEN", "WOMEN", "ABOUT US", "OFFERS"].map((item) => (
              <button key={item} className="flex items-center gap-1 text-sm font-light ">
                {item}
                {(item === "NEW" || item === "MEN" || item === "WOMEN" || item === "OFFERS") && (
                  <span className="text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" height={18} width={18}>
                      <path fill="#000000" d="M9.0001125 11.325c-0.075 0 -0.1437 -0.0125 -0.20625 -0.0375 -0.0625 -0.025 -0.125 -0.0687 -0.1875 -0.13125l-3.7125 -3.7125c-0.1125 -0.1125 -0.1656 -0.24686 -0.15938 -0.40312 0.00626 -0.15626 0.06562 -0.29063 0.17812 -0.40312 0.1125 -0.1125 0.2469 -0.16875 0.40312 -0.16875 0.15626 0 0.29063 0.05625 0.40313 0.16875l3.28125 3.3 3.3 -3.3c0.1125 -0.1125 0.24375 -0.16564 0.39375 -0.15938 0.15 0.00626 0.28125 0.06562 0.39375 0.17812 0.1125 0.1125 0.16875 0.24686 0.16875 0.40312 0 0.15626 -0.05625 0.29063 -0.16875 0.40312l-3.69375 3.69375c-0.0625 0.0625 -0.125 0.10624 -0.1875 0.13125 -0.0625 0.025 -0.13125 0.0375 -0.20625 0.0375Z" strokeWidth={0.375} />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-1 cursor-pointer text-sm font-light">
              <Search className="w-4 h-4" />
              <span>SEARCH</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-sm font-light">
              <MapPin className="w-4 h-4" />
              <span>FIND STORES</span>
            </div>
            <div className="border-l h-4 border-gray-300"></div>
            <div className="flex items-center gap-1 cursor-pointer text-sm font-light">
              <FaBolt className="text-yellow-500" />
              <span>LOGIN</span>
            </div>
            {/* Cart Button */}
            <button
              className="relative flex items-center gap-1 cursor-pointer text-sm font-light focus:outline-none"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>CART</span>
              <span className="absolute -top-2 -right-2 bg-[#c5a97c] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {getCartItemsCount()}
              </span>
            </button>
          </div>
        </div>

        {/* Scroll Loader */}
        <div className="h-[4px] bg-gray-200 overflow-hidden">
          <div
            ref={progressRef}
            id="scroll-progress"
            className="h-full bg-[#c5a97c] transition-all ease-linear"
            style={{ width: "0%", border: '1px solid #BD9966' }}
          />
        </div>
      </div>
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Navbar;
