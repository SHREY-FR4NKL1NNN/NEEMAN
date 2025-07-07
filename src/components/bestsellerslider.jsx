import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import './ProductSliderCustom.css';

function extractBaseNameAndColor(title) {
  const [base, color] = title.split(' : ');
  return { baseName: base.trim(), color: color ? color.trim() : '' };
}

function getUniqueProductsByBaseName(products) {
  const seen = new Set();
  return products.filter((product) => {
    const { baseName } = extractBaseNameAndColor(product.title);
    if (seen.has(baseName.toLowerCase())) return false;
    seen.add(baseName.toLowerCase());
    return true;
  });
}

const bestProductSlider = ({ handles = {} }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]); // unique products for slider
  const [scrollIndex, setScrollIndex] = useState(0);
  const [colorVariantsMap, setColorVariantsMap] = useState({});
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeVariants, setActiveVariants] = useState({}); // { idx: variantProduct }
  const [swatchScroll, setSwatchScroll] = useState({}); // { idx: scrollIndex }
  const visibleCount = 4;
  const swatchVisibleCount = 3;

  // Fetch all products for color variants and unique slider products
  useEffect(() => {
    const fetchAllProducts = async () => {
      let page = 1;
      let fetched = [];
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(`https://neemans.com/collections/best-selling-products/products.json?page=${page}`);
        const data = await res.json();
        if (!data.products || data.products.length === 0) {
          hasMore = false;
        } else {
          fetched = [...fetched, ...data.products];
          page += 1;
        }
      }
      setAllProducts(fetched);
      // Set unique products for slider
      const unique = getUniqueProductsByBaseName(fetched).slice(0, 12).map((product) => {
        const lastVariant = product.variants[product.variants.length - 1];
        return {
          ...product,
          id: product.id,
          title: product.title,
          image: lastVariant?.featured_image?.src || '',
          price: lastVariant?.price || '',
          compare_at_price: lastVariant?.compare_at_price || '',
          tags: product.tags || [],
        };
      });
      setProducts(unique);
    };
    fetchAllProducts();
  }, []);

  // Build color variants map for quick lookup
  useEffect(() => {
    if (allProducts.length > 0 && products.length > 0) {
      const map = {};
      products.forEach((prod) => {
        const { baseName } = extractBaseNameAndColor(prod.title);
        map[prod.id] = allProducts.filter((p) => {
          const { baseName: otherBase } = extractBaseNameAndColor(p.title);
          return otherBase.toLowerCase() === baseName.toLowerCase();
        });
      });
      setColorVariantsMap(map);
    }
  }, [allProducts, products]);

  const getDiscount = (price, compareAt) => {
    if (!price || !compareAt || Number(compareAt) <= Number(price)) return null;
    const discount = Math.round(((Number(compareAt) - Number(price)) / Number(compareAt)) * 100);
    return discount;
  };

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(prev - 1, 0));
  };
  const handleNext = () => {
    setScrollIndex((prev) => Math.min(prev + 1, products.length - visibleCount));
  };

  // Swatch scroll handlers per card
  const handleSwatchPrev = (idx, max) => {
    setSwatchScroll((prev) => ({
      ...prev,
      [idx]: Math.max((prev[idx] || 0) - 1, 0),
    }));
  };
  const handleSwatchNext = (idx, max) => {
    setSwatchScroll((prev) => ({
      ...prev,
      [idx]: Math.min((prev[idx] || 0) + 1, max - swatchVisibleCount),
    }));
  };

  return (
    <div className="relative py-14 bg-white">
      {/* Trending Slider Heading and Arrows in one row */}
      <div className="flex items-center justify-between mb-5 mt-6">
        <h2 className="text-4xl font-bold text-black ml-16">Best Seller</h2>
        <div className="flex items-center mr-21">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow"
            onClick={handlePrev}
            disabled={scrollIndex === 0}
            aria-label="Previous"
          >
            <svg className="arrow-svg aish19 -scale-x-100" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_319_616)"><path className="path-class" d="M17.5609 15.999L10.9609 9.39904L12.8463 7.51371L21.3316 15.999L12.8463 24.4844L10.9609 22.599L17.5609 15.999Z" fill="black"></path></g>
              <defs><clipPath id="clip0_319_616"><rect width="32" height="32" fill="white" transform="translate(0 32) rotate(-90)"></rect></clipPath></defs>
            </svg>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow ml-2"
            onClick={handleNext}
            disabled={scrollIndex >= products.length - visibleCount}
            aria-label="Next"
          >
            <svg className="arrow-svg aish19" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_319_616)"><path className="path-class" d="M17.5609 15.999L10.9609 9.39904L12.8463 7.51371L21.3316 15.999L12.8463 24.4844L10.9609 22.599L17.5609 15.999Z" fill="black"></path></g>
              <defs><clipPath id="clip0_319_616"><rect width="32" height="32" fill="white" transform="translate(0 32) rotate(-90)"></rect></clipPath></defs>
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-3 transition-transform duration-300"
          style={{ transform: `translateX(-${scrollIndex * (100 / visibleCount)}%)` }}
        >
          {products.map((product, idx) => {
            const active = activeVariants[idx] || product;
            const discount = getDiscount(active.price, active.compare_at_price);
            const isNew = active.tags.includes('badge_new');
            const colorVariants = colorVariantsMap[product.id] || [];
            const swatchIdx = swatchScroll[idx] || 0;
            const showSwatchArrows = colorVariants.length > swatchVisibleCount;
            // Add initial left margin to the first card only when at the start
            const cardMargin = scrollIndex === 0 && idx === 0 ? 'ml-16' : '';
            // Get handle from props if available
            const baseName = active.title.split(' : ')[0]?.trim().toLowerCase();
            const handle = handles[baseName];
            return (
              <div
                className={`flex-shrink-0 w-1/4 ${cardMargin}`}
                key={active.id + idx}
                style={{ maxWidth: '22%' }}
              >
                <div
                  className="bg-white border border-gray-200 rounded-md flex flex-col min-h-[500px] h-full shadow-sm group"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Full strip with NEW badge */}
                  <div className="w-full h-6 flex bg-gray-50 rounded-tl-md rounded-tr-md relative z-10" style={{marginTop:0,paddingTop:0,borderTopLeftRadius:'8px',borderTopRightRadius:'8px'}}>
                    {isNew && (
                      <div className="w-16 h-6 flex justify-center bg-gradient-to-r from-green-600 to-green-400 text-white font-bold text-sm uppercase tracking-wider ml-0" style={{marginTop:0,paddingTop:0}}>
                        NEW
                      </div>
                    )}
                  </div>
                  <Link to={handle ? `/collection/${handle}` : '#'} className="block w-full h-full">
                    <div className="relative flex-1 flex flex-col h-full">
                      <div className="relative bg-gray-50 min-h-[350px] h-80 flex items-center justify-center pb-10">
                        {/* Swatch row absolutely at bottom, only on hover */}
                        <div className={`absolute left-0 right-0 bottom-0 flex items-center justify-center gap-2 transition-all duration-300 z-20 bg-white ${hoveredIdx === idx ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'}`}
                          style={{ height: '44px' }}>
                          {/* Always show arrows, but disable if not scrollable */}
                          <button
                            className="w-8 h-8 flex items-center justify-center mr-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => handleSwatchPrev(idx, colorVariants.length)}
                            disabled={swatchIdx === 0}
                            tabIndex={-1}
                          >
                            <svg className="arrow-svg aish19 -scale-x-100" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clipPath="url(#clip0_319_616)"><path className="path-class" d="M17.5609 15.999L10.9609 9.39904L12.8463 7.51371L21.3316 15.999L12.8463 24.4844L10.9609 22.599L17.5609 15.999Z" fill="black"></path></g>
                              <defs><clipPath id="clip0_319_616"><rect width="32" height="32" fill="white" transform="translate(0 32) rotate(-90)"></rect></clipPath></defs>
                            </svg>
                          </button>
                          {colorVariants.length > 1 && colorVariants.slice(swatchIdx, swatchIdx + swatchVisibleCount).map((variant) => {
                            const lastVariant = variant.variants[variant.variants.length - 1];
                            const isSelected = active.id === variant.id;
                            return (
                              <div
                                key={variant.id}
                                className={
                                  isSelected
                                    ? 'w-10 h-10 border-2 border-gray-300 bg-white box-content'
                                    : 'w-10 h-10 box-content transition-colors duration-200'
                                }
                                onMouseEnter={e => {
                                  if (!isSelected) e.currentTarget.classList.add('bg-gray-100');
                                }}
                                onMouseLeave={e => {
                                  if (!isSelected) e.currentTarget.classList.remove('bg-gray-100');
                                }}
                              >
                                <img
                                  src={lastVariant?.featured_image?.src || ''}
                                  alt={variant.title}
                                  className={`w-10 h-10 object-contain cursor-pointer bg-white`}
                                  onClick={() => setActiveVariants((prev) => ({ ...prev, [idx]: {
                                    ...variant,
                                    image: lastVariant?.featured_image?.src || '',
                                    price: lastVariant?.price || '',
                                    compare_at_price: lastVariant?.compare_at_price || '',
                                    tags: variant.tags || [],
                                  }}))}
                                />
                              </div>
                            );
                          })}
                          <button
                            className="w-8 h-8 flex items-center justify-center ml-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => handleSwatchNext(idx, colorVariants.length)}
                            disabled={swatchIdx >= colorVariants.length - swatchVisibleCount}
                            tabIndex={-1}
                          >
                            <svg className="arrow-svg aish19" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clipPath="url(#clip0_319_616)"><path className="path-class" d="M17.5609 15.999L10.9609 9.39904L12.8463 7.51371L21.3316 15.999L12.8463 24.4844L10.9609 22.599L17.5609 15.999Z" fill="black"></path></g>
                              <defs><clipPath id="clip0_319_616"><rect width="32" height="32" fill="white" transform="translate(0 32) rotate(-90)"></rect></clipPath></defs>
                            </svg>
                          </button>
                        </div>
                        <div className={`relative w-full h-full z-0 flex items-center justify-center transition-transform duration-300 ${hoveredIdx === idx ? '-translate-y-8' : ''}`}>
                          <img
                            src={active.image}
                            alt={active.title}
                            className="object-contain h-72 w-full scale-130"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col gap-1">
                    <div className="truncate font-medium text-black" style={{ fontSize: '14px', fontFamily: 'Open Sans, sans-serif' }} title={active.title}>{active.title}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-black">Rs. {Number(active.price).toLocaleString()}</span>
                      {active.compare_at_price && (
                        <span className="text-gray-400 line-through text-base">Rs. {Number(active.compare_at_price).toLocaleString()}</span>
                      )}
                      {discount && (
                        <span className="text-green-600 text-base font-semibold">{discount}% OFF</span>
                      )}
                    </div>
                    <button className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white py-3  font-semibold text-base hover:bg-gray-900 transition">
                      <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.7395 18.959C7.42986 18.959 7.9895 18.3993 7.9895 17.709C7.9895 17.0186 7.42986 16.459 6.7395 16.459C6.04915 16.459 5.4895 17.0186 5.4895 17.709C5.4895 18.3993 6.04915 18.959 6.7395 18.959Z" fill="white"></path>
                        <path d="M14.8645 18.959C15.5549 18.959 16.1145 18.3993 16.1145 17.709C16.1145 17.0186 15.5549 16.459 14.8645 16.459C14.1741 16.459 13.6145 17.0186 13.6145 17.709C13.6145 18.3993 14.1741 18.959 14.8645 18.959Z" fill="white"></path>
                        <path d="M3.79341 6.45898H10.8915M1.1145 3.33398H2.42856C2.56433 3.33401 2.6964 3.37825 2.80479 3.46C2.91318 3.54175 2.99201 3.65658 3.02935 3.78711L5.85513 13.6777C5.92984 13.9389 6.0876 14.1687 6.30455 14.3322C6.52149 14.4957 6.7858 14.5841 7.05747 14.584H14.5661C14.8334 14.5841 15.0938 14.4985 15.309 14.3398C15.5241 14.181 15.6827 13.9575 15.7614 13.702L16.2979 11.9578" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M14.0208 6H18.8333" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M16.3542 3.66675V8.47925" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                      </svg>
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Link to="/collection/all-products" className="border border-black bg-white text-black px-8 py-3 font-semibold text-base transition-colors duration-300 flex items-center gap-2 hover:bg-black hover:text-white">
          VIEW ALL PRODUCTS
          <span className="text-xl flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 4.5L16.5 12L9 19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default bestProductSlider;