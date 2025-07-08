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
          className="btn relative inline-flex items-center justify-start overflow-hidden font-medium transition-all bg-[#faf6ee] border border-black group py-3 px-8"
        >
          <span className="w-full h-full bg-black absolute top-0 right-0 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></span>
          <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white flex items-center gap-1 z-10 text-base">
            <span className="text-sm font-semibold">VIEW ALL PRODUCTS</span>
            <span className="text-lg flex items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 4.5L16.5 12L9 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
};

export default CollectionCards; 