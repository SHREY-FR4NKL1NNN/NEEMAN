import React from "react";

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
            <a
              key={col.handle}
              href={`/${col.handle}`}
              className="relative group block w-full flex justify-center items-center overflow-hidden"
            >
              <img
                src={col.image}
                alt={col.label || col.title}
                className="object-contain max-w-full max-h-full transition-transform duration-300 group-hover:scale-105"
                draggable="false"
              />
            </a>
          ))}
        </div>
      ))}
      <div className="flex justify-center py-[50px]">
        <a
          href="/all-products"
          className="border border-black px-8 py-3 font-semibold text-black flex items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          VIEW ALL PRODUCTS
          <span className="inline-block text-xl font-bold">&#8594;</span>
        </a>
      </div>
    </section>
  );
};

export default CollectionCards; 