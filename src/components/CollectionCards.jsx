import React from "react";
import { Link } from "react-router-dom";

const CollectionCards = ({ collections }) => {
  // Split collections into rows of 4
  const rows = [];
  for (let i = 0; i < collections.length; i += 4) {
    rows.push(collections.slice(i, i + 4));
  }

  return (
    <section
      className="w-full pb-12 bg-[#faf6ee]"
      style={{ paddingLeft: 80, paddingRight: 80, paddingTop: 0 }}
    >
      <h2
        className="top-picks-heading pt-5 pb-2.5 font-semibold text-[27px] leading-[38px] text-black text-center mb-0"
        style={{ fontFamily: "'Abril Display', serif" }}
      >
        Shop by collection
      </h2>
      {rows.map((row, idx) => (
        <div key={idx} className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mt-0 mb-0">
          {row.map((col) => (
            <Link
              key={col.handle}
              to={`/collection/${col.handle}`}
              className="relative group block w-full flex justify-center items-center overflow-hidden"
            >
              <img
                src={col.image}
                alt={col.label || col.title}
                className="object-contain max-w-full max-h-full transition-transform duration-300 group-hover:scale-105"
                draggable="false"
              />
            </Link>
          ))}
        </div>
      ))}
      <div className="flex justify-center py-[50px]">
        <Link
          to="/collection/all-products"
          className="border border-black bg-[#faf6ee] text-black px-8 py-3 font-semibold text-base transition-colors duration-300 flex items-center gap-2 hover:bg-black hover:text-white"
        >
          VIEW ALL PRODUCTS
          <span className="text-xl flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 4.5L16.5 12L9 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
};

export default CollectionCards; 