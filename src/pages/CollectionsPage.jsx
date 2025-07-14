import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import CartSidebar from '../pages/Cart'; // Import your CartSidebar

const genderOptions = ['Men', 'Women'];
const productTypeOptions = [
    'Clogs', 'Flats', 'Flip Flops', 'Loafers', 'Oxfords', 'Sandals', 'Slides', 'Slip On', 'Sneakers'
];
const collectionOptions = [
    'Casual', 'Chunky', 'Daily Use', 'Extra Soft', 'Formal', 'Outdoor', 'Retro', 'Signature', 'Sports', 'Trendy', 'Walking'
];
const colorOptions = [
    'Beige', 'Berry', 'Black', 'Blue', 'Brown', 'Green', 'Grey', 'Ivory', 'Ivory Brown', 'Multicolor', 'Neon', 'Olive', 'Olive Green', 'Orange', 'Pink', 'Purple', 'Red', 'Tan', 'Teal', 'White', 'Yellow'
];
const sizeOptions = ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
const discountOptions = [
    { label: '30% and above', value: '30' },
    { label: '40% and above', value: '40' },
    { label: '50% and above', value: '50' },
    { label: '60% and above', value: '60' },
    { label: '70% and above', value: '70' }
];

function Collections() {
    const { handle } = useParams();
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    const [filterCounts, setFilterCounts] = useState({
        gender: {},
        productType: {},
        collection: {},
        color: {},
        size: {},
        discount: {},
        total: 0,
    });

    const [showSizeModal, setShowSizeModal] = useState(false);
    const [sizeModalProduct, setSizeModalProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { addToCart, isInCart, getItemQuantity } = useCart();

    // Add this state for sidebar
    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const title = handle.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    const fetchProductsPage = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        let url = `https://neemans.com/collections/${handle}/products.json?page=${pageNum}`;
        const res = await axios.get(url);
        let fetched = res.data.products || [];
        setProducts(prev => reset ? fetched : [...prev, ...fetched]);
        setAllProducts(prev => reset ? fetched : [...prev, ...fetched]);
        setHasMore(fetched.length > 0);
        setLoading(false);
    }, [handle]);

    // Fetch all products for filter counts (runs once per collection)
    // Instead of storing all products, accumulate counts for each filter as you fetch each page
    const computeCounts = (products, prevCounts) => {
        // Helper to increment counts
        const inc = (obj, key) => {
            obj[key] = (obj[key] || 0) + 1;
        };
        const counts = prevCounts
            ? JSON.parse(JSON.stringify(prevCounts))
            : {
                gender: {},
                productType: {},
                collection: {},
                color: {},
                size: {},
                discount: {},
                total: 0,
            };
        products.forEach(p => {
            // Gender: increment for each gender option if product tags include it
            genderOptions.forEach(opt => {
                if ((p.tags || []).some(tag => tag.toLowerCase().includes(opt.toLowerCase()))) {
                    inc(counts.gender, opt);
                }
            });
            inc(counts.gender, ''); // All

            // Product Type: increment if product_type matches option
            productTypeOptions.forEach(opt => {
                if ((p.product_type || '') === opt) inc(counts.productType, opt);
            });
            inc(counts.productType, '');

            // Collection: increment for each collection option if product tags include it
            collectionOptions.forEach(opt => {
                if ((p.tags || []).some(tag => tag.toLowerCase().includes(opt.toLowerCase()))) {
                    inc(counts.collection, opt);
                }
            });
            inc(counts.collection, '');

            // Color: increment for each color option if product tags or title include it
            colorOptions.forEach(opt => {
                if (
                    (p.tags || []).some(tag => tag.toLowerCase().includes(opt.toLowerCase())) ||
                    (p.title || '').toLowerCase().includes(opt.toLowerCase())
                ) {
                    inc(counts.color, opt);
                }
            });
            inc(counts.color, '');

            // Size: increment for each size option if any variant title includes it
            sizeOptions.forEach(opt => {
                if ((p.variants || []).some(v => v.title && v.title.includes(opt))) {
                    inc(counts.size, opt);
                }
            });
            inc(counts.size, '');

            // Discount: increment for each discount option if discount threshold is met
            discountOptions.forEach(opt => {
                const variant = (p.variants && p.variants[0]) || null;
                if (!variant) return;
                const price = parseFloat(variant.price);
                const compare = parseFloat(variant.compare_at_price || price);
                if (!compare || compare <= price) return;
                const disc = Math.round(((compare - price) / compare) * 100);
                if (disc >= parseInt(opt.value)) {
                    inc(counts.discount, opt.value);
                }
            });
            inc(counts.discount, '');

            counts.total++;
        });
        return counts;
    };

    const fetchAllCollectionCounts = useCallback(async () => {
        let pageNum = 1;
        let keepFetching = true;
        let counts = {
            gender: {},
            productType: {},
            collection: {},
            color: {},
            size: {},
            discount: {},
            total: 0,
        };
        while (keepFetching) {
            const url = `https://neemans.com/collections/${handle}/products.json?page=${pageNum}`;
            const res = await axios.get(url);
            const fetched = res.data.products || [];
            if (fetched.length === 0) {
                keepFetching = false;
            } else {
                counts = computeCounts(fetched, counts);
                pageNum++;
            }
        }
        setFilterCounts(counts);
    }, [handle, genderOptions, productTypeOptions, collectionOptions, colorOptions, sizeOptions, discountOptions]);

    useEffect(() => {
        fetchAllCollectionCounts();
    }, [fetchAllCollectionCounts]);

    useEffect(() => {
        setProducts([]);
        setAllProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProductsPage(1, true);
    }, [handle, fetchProductsPage]);

    useEffect(() => {
        if (inView && hasMore && !loading && page > 1) {
            fetchProductsPage(page);
        }
    }, [inView, hasMore, loading]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    }, [inView, hasMore, loading]);

    // Dropdown open/close state for each filter
    const [openDropdown, setOpenDropdown] = useState('');
    // Change selectedFilters to support multiple values per filter (array for each)
    const [selectedFilters, setSelectedFilters] = useState({
        gender: [],
        productType: [],
        collection: [],
        color: [],
        size: [],
        discount: [],
    });

    // Close dropdowns when clicking outside
    const sidebarRef = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpenDropdown('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Handler for radio selection
    const handleFilterSelect = (filter, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filter]: prev[filter] === value ? '' : value
        }));
        setOpenDropdown('');
    };

    // Handler for checkbox selection (multi-select)
    const handleFilterToggle = (filter, value) => {
        setSelectedFilters(prev => {
            const arr = prev[filter];
            if (arr.includes(value)) {
                // Remove value
                return { ...prev, [filter]: arr.filter(v => v !== value) };
            } else {
                // Add value
                return { ...prev, [filter]: [...arr, value] };
            }
        });
        setOpenDropdown('');
    };

    // Handler for removing a single filter from the bubble bar
    const handleRemoveFilter = (filter, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filter]: prev[filter].filter(v => v !== value)
        }));
    };

    // Handler for clearing all filters
    const clearAllFilters = () => {
        setSelectedFilters({
            gender: [],
            productType: [],
            collection: [],
            color: [],
            size: [],
            discount: [],
        });
        setSortBy('featured');
    };

    useEffect(() => {
        let filtered = [...allProducts];

        // Update filter logic to support arrays (multi-select)
        if (selectedFilters.gender.length) {
            filtered = filtered.filter(p =>
                selectedFilters.gender.some(g =>
                    (p.tags || []).some(tag => tag.toLowerCase().includes(g.toLowerCase()))
                )
            );
        }

        if (selectedFilters.productType.length) {
            filtered = filtered.filter(p =>
                selectedFilters.productType.includes(p.product_type)
            );
        }

        if (selectedFilters.collection.length) {
            filtered = filtered.filter(p =>
                selectedFilters.collection.some(c =>
                    (p.tags || []).some(tag => tag.toLowerCase().includes(c.toLowerCase()))
                )
            );
        }

        if (selectedFilters.color.length) {
            filtered = filtered.filter(p =>
                selectedFilters.color.some(c =>
                    (p.tags || []).some(tag => tag.toLowerCase().includes(c.toLowerCase())) ||
                    (p.title || '').toLowerCase().includes(c.toLowerCase())
                )
            );
        }

        if (selectedFilters.size.length) {
            filtered = filtered.filter(p =>
                selectedFilters.size.some(s =>
                    (p.variants || []).some(v => v.title && v.title.includes(s))
                )
            );
        }

        if (selectedFilters.discount.length) {
            filtered = filtered.filter(p =>
                selectedFilters.discount.some(d => {
                    const variant = (p.variants && p.variants[0]) || null;
                    if (!variant) return false;
                    const price = parseFloat(variant.price);
                    const compare = parseFloat(variant.compare_at_price || price);
                    if (!compare || compare <= price) return false;
                    const disc = Math.round(((compare - price) / compare) * 100);
                    return disc >= parseInt(d);
                })
            );
        }

        setFilteredProducts(filtered);
    }, [allProducts, selectedFilters]);

    useEffect(() => {
        let sorted = [...filteredProducts];

        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => parseFloat(a.variants[0]?.price || 0) - parseFloat(b.variants[0]?.price || 0));
                break;
            case 'price-desc':
                sorted.sort((a, b) => parseFloat(b.variants[0]?.price || 0) - parseFloat(a.variants[0]?.price || 0));
                break;
            case 'title-asc':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                break;
            default:
                break;
        }

        setProducts(sorted);
    }, [filteredProducts, sortBy]);

    // Scroll to top when handle changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [handle]);

    // Handler that adds to cart and opens sidebar
    const handleAddToCart = (product) => {
        setSizeModalProduct(product);
        setShowSizeModal(true);
        setSelectedVariant(null);
    };

    return (
        <>
            <div className='pb-15'>
                <Navbar />
            </div>
            <div>
                <h3 className="text-2xl font-[550] px-10 pt-15 font-[Abril]">{title}</h3>
            </div>
            <div className="flex flex-col lg:flex-row w-full">
                {/* Sidebar */}
                <aside
                    ref={sidebarRef}
                    className="w-full lg:w-64 px-10 pt-10 border-gray-200 bg-white flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto"
                >
                    <div className="mb-4">
                    </div>
                        {Object.values(selectedFilters).flat().length > 1 && (
                            <div className="flex justify-between items-center mb-4">
                            <h5 className="text-xs">Sort & Filter</h5>
                            <button
                                type='click'
                                className="text-[#d3b289] text-xs justify-end"
                                aria-label="Clear all filters"
                                onClick={clearAllFilters}
                            >
                                Clear All
                            </button>
                            </div>
                        )}
                    {Object.entries(selectedFilters).some(([, arr]) => arr.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(selectedFilters).map(([key, arr]) =>
                                arr.map((val) => (
                                    <div
                                        key={key + val}
                                        className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-0.75 flex items-center gap-2"
                                    >
                                        <span>
                                            {key === 'discount'
                                                ? discountOptions.find((o) => o.value === val)?.label || val
                                                : val}
                                        </span>
                                        <button
                                            aria-label="Remove filter"
                                            onClick={() => handleRemoveFilter(key, val)}
                                            className="text-gray-500 hover:text-black"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Filter Groups */}
                    {[
                        { label: 'Gender', key: 'gender', options: genderOptions },
                        { label: 'Product Type', key: 'productType', options: productTypeOptions },
                        { label: 'Collection', key: 'collection', options: collectionOptions },
                        { label: 'Color', key: 'color', options: colorOptions },
                        { label: 'Size', key: 'size', options: sizeOptions },
                        { label: 'Discount', key: 'discount', options: discountOptions },
                    ].map((group) => (
                        <div key={group.key}>
                            <button
                                className="w-full flex justify-between items-center text-left font-bold text-xs py-3 border-b border-gray-200"
                                type="button"
                                onClick={() =>
                                    setOpenDropdown(openDropdown === group.key ? '' : group.key)
                                }
                            >
                                {group.label}
                                <span
                                    className={`transform transition-transform duration-200 ${openDropdown === group.key ? '-rotate-180' : '-rotate-0'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Keyboard-Arrow-Down--Streamline-Rounded-Material" height={24} width={24} ><desc>{"\n    Keyboard Arrow Down Streamline Icon: https://streamlinehq.com\n  "}</desc><path fill="#000000" d="M12.00015 15.1c-0.1 0 -0.19165 -0.01665 -0.275 -0.05 -0.0833 -0.03335 -0.16665 -0.09165 -0.25 -0.175l-4.95 -4.95c-0.15 -0.15 -0.2208 -0.32915 -0.2125 -0.5375 0.00835 -0.20835 0.0875 -0.3875 0.2375 -0.5375 0.15 -0.15 0.3292 -0.225 0.5375 -0.225 0.20835 0 0.3875 0.075 0.5375 0.225l4.375 4.4 4.4 -4.4c0.15 -0.15 0.325 -0.22085 0.525 -0.2125 0.2 0.00835 0.375 0.0875 0.525 0.2375 0.15 0.15 0.225 0.32915 0.225 0.5375 0 0.20835 -0.075 0.3875 -0.225 0.5375l-4.925 4.925c-0.0833 0.08335 -0.16665 0.14165 -0.25 0.175 -0.0833 0.03335 -0.175 0.05 -0.275 0.05Z" strokeWidth={0.5} /></svg>
                                </span>
                            </button>
                            {openDropdown === group.key && (
                                <ul className="mt-2 space-y-2">
                                    {group.options.map((opt) => {
                                        const value = group.key === 'discount' ? opt.value : opt;
                                        const label = group.key === 'discount' ? opt.label : opt;
                                        return filterCounts[group.key][value] > 0 ? (
                                            <li key={value}>
                                                <label className="flex items-center gap-2 text-xs py-1">
                                                    <input
                                                        type="checkbox"
                                                        className="accent-white"
                                                        checked={selectedFilters[group.key].includes(value)}
                                                        onChange={() =>
                                                            handleFilterToggle(group.key, value)
                                                        }
                                                    />
                                                    {label}
                                                    <span className="ml-auto text-gray-500 text-xs">
                                                        {"(" + filterCounts[group.key][value] + ")"}
                                                    </span>
                                                </label>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            )}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4">
                    <div className="flex justify-end items-center mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-xs">Sort by:</label>
                            <select
                                className="px-1 py-1 text-xs focus:outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">Featured</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="title-asc">Name: A-Z</option>
                                <option value="title-desc">Name: Z-A</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={() => {
                                setSizeModalProduct(product);
                                setShowSizeModal(true);
                                setSelectedVariant(null);
                                }}
                                isInCart={isInCart}
                                getItemQuantity={getItemQuantity}
                            />
                        )
                        )}
                    </div>

                    {hasMore && <div ref={sentinelRef} className="h-12" />}
                    {loading && (
                        <div className="text-center py-4 text-gray-500">Loading...</div>
                    )}
                </main>
            </div>
            <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
            {showSizeModal && sizeModalProduct && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={() => setShowSizeModal(false)}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: 24,
        minWidth: 280,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        position: 'relative',
      }}
      onClick={e => e.stopPropagation()}
    >
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Select Size</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {sizeModalProduct.variants.map(variant => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: selectedVariant?.id === variant.id ? '2px solid #808080' : '2px solid black',
              background: selectedVariant?.id === variant.id ? '#f9f5f0' : '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {variant.title}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (selectedVariant) {
            addToCart({
              id: sizeModalProduct.id,
              variant_id: selectedVariant.id,
              variant_title: selectedVariant.title,
              handle: sizeModalProduct.handle,
              title: sizeModalProduct.title,
              price: Number(selectedVariant.price),
              compare_at_price: Number(selectedVariant.compare_at_price) || Number(selectedVariant.price),
              image: selectedVariant.featured_image?.src || sizeModalProduct.images?.[0]?.src || '',
            });
            setShowSizeModal(false);
            setSelectedVariant(null);
            setSizeModalProduct(null);
            openCart();
          }
        }}
        disabled={!selectedVariant}
        style={{
          width: '100%',
          background: 'black',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '10px 0',
          fontWeight: 700,
          fontSize: 16,
          cursor: selectedVariant ? 'pointer' : 'not-allowed',
          opacity: selectedVariant ? 1 : 0.6,
        }}
      >
        
        Add to Cart
      </button>
      <button
        onClick={() => setShowSizeModal(false)}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          color: '#888',
        }}
      >
        ×
      </button>
    </div>
  </div>
)}
        </>
    );
}


export default Collections;