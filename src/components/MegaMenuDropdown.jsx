import React from "react";
import { Link } from "react-router-dom";

const MegaMenuDropdown = ({ megaMenu = [], topClass = "top-20", transition }) => (
  <div
    className={`fixed left-0 ${topClass} w-screen bg-white shadow-xl border-t border-gray-200 z-[9999] py-8
      ${transition ? 'transition-all duration-300 ease-in-out opacity-100 translate-y-0' : ''}`}
    style={{ minHeight: '220px' }}
  >
    <div className="flex gap-10 px-6 overflow-x-auto">
      {megaMenu.map((category, idx) => (
        <div
          key={category.heading}
          className={`flex flex-col min-w-[140px] pr-6 ${idx !== megaMenu.length - 1 ? 'border-r border-gray-200' : ''}`}
        >
          <Link
            to={`/collection/${category.handle}`}
            className="font-bold text-[15px] text-[#b9976f] mb-2 flex items-center gap-2 tracking-wide uppercase"
          >
            {category.heading}
            <span className="text-[#b9976f] text-base">&rarr;</span>
          </Link>
          <ul className="space-y-1">
            {category.links.map((link) => (
              <li key={link.handle}>
                <Link
                  to={`/collection/${link.handle}`}
                  className="text-gray-900 text-[13px] font-medium hover:text-[#b9976f] transition-colors"
                >
                  {link.subHeading}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export default MegaMenuDropdown; 