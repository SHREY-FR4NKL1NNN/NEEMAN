import React, { useState, useEffect, useRef } from "react";
import ProductTabsNavbar from '../components/ProductTabsNavbar';

// Add custom CSS for scrollbar hiding
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const ProductPage = () => {
  // const { productId } = useParams();
  // const navigate = useNavigate();
  const productId = 'elevate-low-top'; // Hardcoded for standalone testing
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [windowIndex, setWindowIndex] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const mainImageScrollRef = useRef(null);
  const detailsRef = useRef(null);
  const isThumbnailScrolling = useRef(false);
  const mainImageStackRef = useRef(null);
  const thumbnailStackRef = useRef(null);
  const [mainImageTransition, setMainImageTransition] = useState(true);
  const [thumbnailTransition, setThumbnailTransition] = useState(true);
  const [thumbTransition, setThumbTransition] = useState(true);
  const thumbStackRef = useRef();
  const offersRef = useRef(null);
  
  const VISIBLE_THUMBNAILS = 5;
  const THUMBNAIL_DUPLICATION = 20;
  const DUPLICATION = 5; // 5x for seamless off-screen reset

  // State for color variants
  const [colorVariants, setColorVariants] = useState([]);
  const [colorLoading, setColorLoading] = useState(true);

  const getTopStart = (selectedImage, product) => {
    if (!product?.images) return 0;
    const totalImages = product.images.length;
    const totalThumbnails = totalImages * THUMBNAIL_DUPLICATION;
    // Align the selected image to the top of the visible window
    return Math.floor(totalThumbnails / 2) + (selectedImage % totalImages);
  };

  // Helper functions to extract data from HTML content
  const extractDescription = (bodyHtml) => {
    if (!bodyHtml) return "Product description not available";
    const parser = new DOMParser();
    const doc = parser.parseFromString(bodyHtml, 'text/html');
    const firstParagraph = doc.querySelector('p');
    return firstParagraph ? firstParagraph.textContent.trim() : "Product description not available";
  };

  const extractFeatures = (bodyHtml) => {
    if (!bodyHtml) return ["Product features not available"];
    const parser = new DOMParser();
    const doc = parser.parseFromString(bodyHtml, 'text/html');
    const listItems = doc.querySelectorAll('li');
    const features = [];
    listItems.forEach(item => {
      const text = item.textContent.trim();
      if (text && text.length > 0) {
        features.push(text);
      }
    });
    return features.length > 0 ? features : ["Product features not available"];
  };

  const extractColor = (title) => {
    if (!title) return "Unknown";
    const parts = title.split(":");
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return "Unknown";
  };

  // Always derive selectedImage from windowIndex
  const getSelectedImage = (windowIndex, images) => {
    if (!images || windowIndex === null) return 0;
    return ((windowIndex % images.length) + images.length) % images.length;
  };

  const handleThumbnailScroll = (direction) => {
    if (!product?.images || windowIndex === null) return;
    setThumbTransition(true);
    const total = product.images.length;
    const DUPLICATION = 5;
    const visibleCount = 5;
    const resetOffset = total * (DUPLICATION - 2);
    let newIndex = windowIndex;
    if (direction === 'down') {
      newIndex = windowIndex + 1;
    } else if (direction === 'up') {
      newIndex = windowIndex - 1;
    }
    // Infinite scroll reset for thumbnails (only when truly out of middle region)
    const minIndex = total;
    const maxIndex = total * (DUPLICATION - 1) - visibleCount;
    if (newIndex < minIndex) {
      newIndex = newIndex + resetOffset;
    } else if (newIndex > maxIndex) {
      newIndex = newIndex - resetOffset;
    }
    setWindowIndex(newIndex);
    // Scroll main image column by one image (plus gap)
    if (mainImageScrollRef.current) {
      const imageHeight = 468;
      const gap = 70;
      const totalImageHeight = imageHeight + gap;
      mainImageScrollRef.current.scrollTo({
        top: newIndex * totalImageHeight,
        behavior: 'smooth',
      });
    }
  };

  // Helper to create a duplicated stack for infinite scroll
  const getInfiniteStackImages = (images) => {
    if (!images) return [];
    // 5x duplication for seamless infinite scroll
    return Array.from({ length: images.length * 5 }, (_, i) => images[i % images.length]);
  };

  // Helper to extract base name (before colon or color)
  const getBaseName = (title) => {
    // Remove anything after ':' or ' - ' or ' : '
    return title.split(':')[0].split(' - ')[0].trim();
  };

  // Fetch all color variants for the current product name
  useEffect(() => {
    if (!product?.name) return;
    let isMounted = true;
    const baseName = getBaseName(product.name);
    const allProducts = [];
    let page = 1;
    const fetchAllPages = async () => {
      let hasMore = true;
      while (hasMore) {
        const url = `https://neemans.com/collections/all-products/products.json?page=${page}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          allProducts.push(...data.products);
          page++;
        } else {
          hasMore = false;
        }
      }
      // Filter by base name
      const variants = allProducts.filter(p => getBaseName(p.title) === baseName).map(p => ({
        id: p.id,
        handle: p.handle,
        color: p.title.split(':').slice(1).join(':').trim() || '',
        image: p.images && p.images.length > 0 ? p.images[p.images.length - 1].src : '',
        isCurrent: p.handle === productId,
      }));
      if (isMounted) {
        setColorVariants(variants);
        setColorLoading(false);
      }
    };
    setColorLoading(true);
    fetchAllPages();
    return () => { isMounted = false; };
  }, [product?.name, productId]);

  // Handler for color click (navigate or update product)
  const handleColorClick = (variant) => {
    if (variant.handle !== productId) {
      window.location.href = `/products/${variant.handle}`;
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from Neeman's API
        const response = await fetch(`https://neemans.com/products/${productId}.json`);
        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await response.json();
        
        if (data.product) {
          // Transform the API data to match our component structure
          const transformedProduct = {
            id: data.product.id,
            name: data.product.title,
            brand: "Neeman's",
            price: parseFloat(data.product.variants[0]?.price || 0),
            mrp: parseFloat(data.product.variants[0]?.compare_at_price || data.product.variants[0]?.price || 0),
            discount: data.product.variants[0]?.compare_at_price 
              ? Math.floor(((parseFloat(data.product.variants[0].compare_at_price) - parseFloat(data.product.variants[0].price)) / parseFloat(data.product.variants[0].compare_at_price)) * 100)
              : 0,
            rating: 0,
            reviews: 0,
            description: data.product.body_html ? extractDescription(data.product.body_html) : "Product description not available",
            features: extractFeatures(data.product.body_html),
            sizes: data.product.variants.map(variant => ({
              uk: variant.title && variant.title.match(/\d+/) ? variant.title.match(/\d+/)[0] : variant.id,
              price: parseFloat(variant.price)
            })),
            images: data.product.images.map((image, index) => ({
              id: index + 1,
              url: image.src,
              alt: `${data.product.title} view ${index + 1}`
            })),
            category: data.product.product_type || "Shoes",
            color: extractColor(data.product.title),
            material: "Premium materials",
            care: "Follow care instructions",
            warranty: "30 days return policy"
          };
          
          setProduct(transformedProduct);
          setSelectedSize(transformedProduct.sizes[0]);
          setWindowIndex(transformedProduct.images.length + 0);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Set initial scrollTop only once after images are rendered
  useEffect(() => {
    if (mainImageScrollRef.current && product?.images) {
      const imageHeight = 468;
      const gap = 70;
      const totalImageHeight = imageHeight + gap;
      const startIndex = product.images.length; // start of middle copy
      // Only set if not already set
      if (mainImageScrollRef.current.scrollTop !== startIndex * totalImageHeight) {
        mainImageScrollRef.current.scrollTop = startIndex * totalImageHeight;
      }
    }
  }, [product?.images]);

  // Infinite scroll logic with guard
  useEffect(() => {
    if (!mainImageScrollRef.current || !product?.images) return;
    const imageHeight = 468;
    const gap = 70;
    const totalImageHeight = imageHeight + gap;
    const total = product.images.length;
    const DUPLICATION = 5;
    const stackLength = total * DUPLICATION;
    const visibleCount = 5;
    // Allow scrolling through the middle 3 copies (infinite region)
    const minScroll = total * totalImageHeight;
    const maxScroll = (total * (DUPLICATION - 1) - visibleCount) * totalImageHeight;
    const resetOffset = total * (DUPLICATION - 2);

    const handleScroll = () => {
      if (!mainImageScrollRef.current) return;
      const scrollTop = mainImageScrollRef.current.scrollTop;
      if (scrollTop < minScroll) {
        mainImageScrollRef.current.scrollTop = scrollTop + resetOffset * totalImageHeight;
        setWindowIndex((prev) => prev + resetOffset);
      } else if (scrollTop > maxScroll) {
        mainImageScrollRef.current.scrollTop = scrollTop - resetOffset * totalImageHeight;
        setWindowIndex((prev) => prev - resetOffset);
      } else {
        // Sync windowIndex with main image scroll position
        const newWindowIndex = Math.round(scrollTop / totalImageHeight);
        setWindowIndex(newWindowIndex);
      }
    };

    const ref = mainImageScrollRef.current;
    ref.addEventListener('scroll', handleScroll);
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, [product?.images]);

  // On initial mount, set windowIndex to the start of the middle copy
  useEffect(() => {
    if (product?.images) {
      setWindowIndex(product.images.length); // start of middle copy
    }
  }, [product?.images]);

  useEffect(() => {
    const node = thumbStackRef.current;
    if (!node || !product?.images) return;
    const total = product.images.length;
    const middle = total * 2;
    const mod = (n, m) => ((n % m) + m) % m;
    const onEnd = () => {
      // Only reset if more than one full copy away from the middle
      if (windowIndex < total || windowIndex >= total * 3) {
        const newIndex = middle + mod(windowIndex, total);
        setThumbTransition(false);
        setWindowIndex(newIndex);
        requestAnimationFrame(() => setThumbTransition(true));
      }
    };
    node.addEventListener('transitionend', onEnd);
    return () => node.removeEventListener('transitionend', onEnd);
  }, [windowIndex, product?.images]);

  const handleViewOffersClick = () => {
    if (offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-5"></div>
        <p className="text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Error: {error || 'Product not found'}</p>
      </div>
    );
  }

  const handleImageLoad = (imageIndex) => {
    setLoadedImages(prev => new Set([...prev, imageIndex]));
  };

  const handleImageClick = (index) => {
    isThumbnailScrolling.current = false;
    setMainImageTransition(true);
    setThumbnailTransition(true);
    // Set windowIndex so the selected image is at the top of the window
    const total = product.images.length;
    const DUPLICATION = 5;
    // Place the selected image at the top of the middle copy
    const newWindowIndex = total + index;
    setWindowIndex(newWindowIndex);
    // Scroll main image column so the selected image is at the top
    if (mainImageScrollRef.current) {
      const imageHeight = 468;
      const gap = 70;
      const totalImageHeight = imageHeight + gap;
      mainImageScrollRef.current.scrollTo({
        top: newWindowIndex * totalImageHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    setIsAddingToCart(true);
    console.log('Added to cart:', {
      product: product.name,
      size: selectedSize,
      quantity: quantity,
      price: product.price
    });
    setShowCartSidebar(true);
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const calculateDiscount = () => {
    return Math.floor(((product.mrp - product.price) / product.mrp) * 100);
  };

  const getStackImages = (images) => {
    if (!images) return [];
    return Array.from({ length: images.length * DUPLICATION }, (_, i) => images[i % images.length]);
  };

  // Helper to get a Shopify-style 48x48 thumbnail URL
  const getSwatchUrl = (url) => {
    if (!url) return '';
    return url.replace(/(\.[a-zA-Z]+)($|\?)/, '_48x48$1$2');
  };

    return (
    <div className="min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <section className="flex flex-row gap-3 max-w-[1300px] w-full mx-auto py-10 items-stretch bg-white">
        {/* Column 1: Product Images */}
        <div className="flex flex-row items-start">
          {/* Thumbnails with Scroll Controls */}
          <div className="flex flex-col items-center min-w-[102px]">
            {/* Up Chevron */}
            {product.images && product.images.length > VISIBLE_THUMBNAILS && (
              <button 
                onClick={() => handleThumbnailScroll('up')}
                className="w-[102px] h-8 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-200 mb-2"
                style={{marginBottom: '8px'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18,15 12,9 6,15"></polyline>
                </svg>
              </button>
            )}
            {/* Thumbnails Container (only images, fixed height) */}
            <div className="flex flex-col items-center overflow-hidden" style={{height: '437.031px', maxHeight: '437.031px'}}>
              <div
                ref={thumbStackRef}
                className="flex flex-col items-center"
                style={{
                  transform: `translateY(${-windowIndex * 91.4062}px)`,
                  transition: thumbTransition ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
                }}
              >
                {getStackImages(product.images).map((image, i) => {
                  const realIndex = i % product.images.length;
                  // Highlight is always on the top visible image
                  const isSelected = i === windowIndex;
                  return (
                    <img
                      key={i}
                      src={image.url}
                      alt={image.alt}
                      loading="lazy"
                      onLoad={() => handleImageLoad(realIndex)}
                      className={`w-[102px] h-[71.4062px] object-cover rounded-none cursor-pointer border-2 transition-all duration-200 ease-in-out bg-[#f8f9fa] shadow-sm${i < getStackImages(product.images).length - 1 ? ' mb-5' : ''} ${
                        isSelected 
                          ? 'border-[#222] shadow-md' 
                          : 'border-transparent hover:border-gray-400'
                      } ${!loadedImages.has(realIndex) ? 'opacity-50' : 'opacity-100'}`}
                      onClick={() => handleImageClick(realIndex)}
                    />
                  );
                })}
              </div>
            </div>
            {/* Down Chevron */}
            {product.images && product.images.length > VISIBLE_THUMBNAILS && (
              <button 
                onClick={() => handleThumbnailScroll('down')}
                className="w-[102px] h-8 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-200 mt-2"
                style={{marginTop: '8px'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#495057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
              </button>
            )}
          </div>

          {/* Main Image Display */}
          <div className="w-[831.98px] bg-white rounded-none flex flex-col">
            <div
              className="overflow-y-auto scrollbar-hide"
              style={{ height: '2690px', scrollSnapType: 'y mandatory' }}
              ref={mainImageScrollRef}
            >
              <div className="flex flex-col">
                {getInfiniteStackImages(product.images).map((image, i) => (
                  <div
                    key={i}
                    className={`w-[94%] h-[468px]${i < getInfiniteStackImages(product.images).length - 1 ? ' mb-[70px]' : ''} ml-[32px] rounded-none shadow-none flex items-center mx-auto`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="object-fill w-full h-full rounded-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Product Details */}
        <div className="flex-1 p-0 pl-2 max-w-[418px] flex flex-col items-start" ref={detailsRef}>
          {/* Product Badge */}
          <div className="mb-2 flex gap-2">
            
          </div>

          {/* Product Title */}
          <h1 className="text-[2rem] mb-3 text-[#222] leading-tight font-bold">{product.name}</h1>
          
          {/* Price Section */}
          <div className="flex items-center gap-4 mb-1">
            <span className="text-[1.3rem] font-bold text-[#222]">
              Rs. {product.price.toLocaleString()}
            </span>
            <span className="text-[1.1rem] text-[#bbb] ml-2">
              <span>MRP </span>
              <span className="line-through">₹{product.mrp.toLocaleString()}</span>
            </span>
            <span className="text-[1.1rem] text-[#1ca14a] font-bold ml-2">
              {calculateDiscount()}% OFF
            </span>
          </div>
          <p className="text-sm text-[#888] mb-[18px]">MRP Inclusive of all taxes</p>

          {/* EMI Section */}
          <div className="bg-[#f1eadf] border-2 border-[#bd9966] rounded-none w-full max-w-full letter-spacing-normal px-5 py-[2px] relative mb-[18px] flex flex-col gap-0 items-start shadow-sm">
            <div className="flex items-baseline gap-[2px] text-[1.15rem] text-black font-bold">
              <span>Pay</span>
              <span className="font-bold">₹</span>
              <span className="text-[1.25rem] font-bold text-black leading-normal ml-[2px]">{Math.floor(product.price/3)}</span>
              <span className="font-bold text-[1.05rem]">/month</span>
            </div>
            <div className="text-[#666] flex items-center text-base mt-[2px] gap-1">
              0% Interest EMI via
              <img src="https://preemi.snapmint.com/assets/whitelable/UPI-Logo-vector%201.svg" alt="upi" className="w-[35px] mx-[6px] -mb-1 align-middle" />
            </div>
          </div>

          {/* Features Section (after EMI) */}
          <div className="w-full flex flex-col gap-4 my-6">
            <div className="flex items-center gap-4">
              <img src="https://neemans.com/cdn/shop/files/Truly_versatile._From_semi-formal_to_smart-casual..svg?v=1718808638" alt="feature1" className="w-8 h-8" />
              <span className="text-base text-[#222]">Versatile design that pairs with relaxed & semi-casual looks</span>
            </div>
            <div className="flex items-center gap-4">
              <img src="https://neemans.com/cdn/shop/files/Breathable_Knit_Fabric.svg?v=1686991691" alt="feature2" className="w-8 h-8" />
              <span className="text-base text-[#222]">Classic low-top, reimagined in breathable knit fabric</span>
            </div>
            <div className="flex items-center gap-4">
              <img src="https://neemans.com/cdn/shop/files/Cushioned_footbed_for_superior_comfort.svg?v=1719840484" alt="feature3" className="w-8 h-8" />
              <span className="text-base text-[#222]">Cushioned sole for stress-free movement</span>
            </div>
          </div>

          <hr className="border-gray-400 my-[10px] w-full" />

          {/* Color Variants Swatches */}
          {colorVariants.length > 1 && (
            <>
              <div className="mb-1 text-base font-semibold text-[#222]">
                Color: {product.color || (colorVariants.find(v => v.isCurrent)?.color) || ''}
              </div>
              <div className="flex gap-2 mb-4">
                {colorVariants.map(variant => (
                  <img
                    key={variant.id}
                    src={getSwatchUrl(variant.image)}
                    alt={variant.color}
                    width={48}
                    height={48}
                    className={`w-12 h-12 object-cover rounded border-0 ${variant.isCurrent ? 'border-black' : 'border-gray-200'} cursor-pointer transition-all duration-150`}
                    style={{ boxShadow: variant.isCurrent ? '0 0 0 2px #222' : undefined }}
                    onClick={() => handleColorClick(variant)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Size Selection */}
          <div className="my-7">
            <h4 className="text-base mb-3 text-[#495057] font-semibold">Select Size (UK):</h4>
            <div className="flex gap-5 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size.uk}
                  className={`py-3 px-4 border-[1.5px] rounded-none text-sm font-medium min-w-[50px] text-center relative transition-all duration-300 cursor-pointer
                    ${selectedSize?.uk === size.uk
                      ? 'bg-[#222] text-white border-[#222]'
                      : 'bg-white text-[#495057] border-[#dee2e6] hover:border-[#adb5bd] hover:bg-[#f8f9fa]'}
                  `}
                  onClick={() => setSelectedSize(size)}
                >
                  {size.uk}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-400 my-[10px] w-full" />

          {/* Action Buttons */}
          <div className="flex gap-[18px] w-full my-6">
            <button
              className={`flex-1 w-full rounded-none h-14 flex items-center justify-center text-base font-semibold uppercase tracking-wider transition-all duration-300 border border-[#222] ${
                selectedSize
                  ? 'bg-white text-[#222] border-[#222] hover:bg-[#222] hover:text-white'
                  : 'bg-[#dee2e6] cursor-not-allowed opacity-60'
              }`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedSize}
            >
              {isAddingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>
            <button 
              className={`flex-1 w-full rounded-none h-14 flex items-center justify-center text-base font-semibold uppercase tracking-wider transition-all duration-300 border border-[#222] ${
                selectedSize
                  ? 'bg-[#222] text-white hover:bg-white hover:text-[#222]'
                  : 'bg-[#dee2e6] cursor-not-allowed opacity-60'
              }`}
              disabled={!selectedSize}
            >
              BUY NOW
            </button>
          </div>

          {/* Offer Box */}
          <div className="bg-[#eaf6ef] border border-[#d2e7db] rounded-none p-[18px] mb-[10px] mt-0 flex flex-col w-full min-h-[44px] box-border justify-center">
            <div className="flex items-center justify-center w-full gap-[18px] min-h-[28px]">
              <span className="whitespace-nowrap text-sm font-semibold text-[#495057] leading-tight">
                Get this for as low as{' '}
                <span className="text-[#1ca14a] font-bold">
                  Rs. {Math.round(product.price * 0.90)}
                </span>
              </span>
              <span className="text-[#d97706] font-bold text-sm cursor-pointer ml-[18px] whitespace-nowrap inline-block" onClick={handleViewOffersClick}>
                VIEW OFFERS ›
              </span>
            </div>
            <div className="text-[#666] text-base font-semibold mt-[2px]">with these offers.</div>
          </div>

          {/* Secure Transaction */}
          <img 
            className="w-full mt-5" 
            src="https://cdn.shopify.com/s/files/1/2428/5565/files/100_Secure_Transaction_-_PDP_Desktop.jpg?v=1744720896&width=650" 
            alt="Secure Transaction"
          />

          <hr className="border-gray-400 my-[10px] w-full" />

          {/* Delivery Check */}
          <div className="my-8 pb-3 border-b border-[#dee2e6]">
            <div className="flex items-center text-[1.25rem] mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="10" r="4"/>
                <path d="M12 2C7 2 2 7 2 12c0 5 10 10 10 10s10-5 10-10c0-5-5-10-10-10z"/>
              </svg>
              <span className="text-[1.18rem] font-bold text-[#495057]">CHECK DELIVERY DATE:</span>
            </div>
            <div className="flex w-full mb-[18px]">
              <input 
                className="flex-1 py-3 px-4 text-[1.08rem] border-[1.5px] border-[#adb5bd] border-r-0 rounded-none outline-none bg-white text-[#495057]" 
                type="text" 
                placeholder="Enter Pincode" 
                maxLength={6} 
              />
              <button className="bg-[#bfa16a] text-white font-bold text-[1.08rem] border-none rounded-none px-8 cursor-pointer transition-colors duration-200 tracking-wider hover:bg-[#a68b54]">
                CHECK
              </button>
            </div>
          </div>

          <hr className="border-gray-400 my-[10px] w-full" />

          {/* Offers Section */}
          <div className="mb-6" ref={offersRef}>
            <h3 className="text-[1.18rem] font-bold mb-3 text-[#495057] tracking-wider">OFFERS</h3>
            <div className="flex flex-col gap-0 mt-3">
              {/* Student Offer */}
              <div className="flex items-start gap-4 py-3">
                <img className="w-11 h-11 rounded-full bg-[#f5f5f1] object-contain flex-shrink-0 block" src="https://cdn.shopify.com/s/files/1/2428/5565/files/UNiDAYS_logo.svg?v=1744190973" alt="Student Offer" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[1.08rem] font-bold text-[#495057] mb-[2px]">Extra 15% OFF for Students.</div>
                  <div className="text-base text-[#666] font-normal mb-0">Get verified with UNiDAYS to avail this offer.</div>
                </div>
              </div>
              <hr className="border-t border-[#dee2e6] m-0 ml-[60px]" />

              {/* Pay Later Offer */}
              <div className="flex items-start gap-4 py-3">
                <img className="w-11 h-11 rounded-full bg-[#f5f5f1] object-contain flex-shrink-0 block" src="https://cdn.shopify.com/s/files/1/2428/5565/files/snapmint_offers_logo.svg?v=1720514035" alt="Pay Later" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[1.08rem] font-bold text-[#495057] mb-[2px]">Pay only Rs.{Math.floor(product.price / 3)} now and rest in 2 easy EMIs</div>
                  <div className="text-base text-[#666] font-normal mb-0">No Cost EMI available via UPI.</div>
                </div>
              </div>
              <hr className="border-t border-[#dee2e6] m-0 ml-[60px]" />

              {/* Buy 2 Offer */}
              <div className="flex items-start gap-4 py-3">
                <img className="w-11 h-11 rounded-full bg-[#f5f5f1] object-contain flex-shrink-0 block" src="https://cdn.shopify.com/s/files/1/2428/5565/files/Buy_2_Logo.jpg?v=1739781910" alt="2 Products Offer" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[1.08rem] font-bold text-[#495057] mb-[2px]">Buy any 2 products, get Extra 7% OFF</div>
                  <div className="text-base text-[#666] font-normal mb-0">
                    Discounted Price: <span className="font-bold">Rs. {Math.round(product.price * 0.93)}</span>
                  </div>
                </div>
              </div>
              <hr className="border-t border-[#dee2e6] m-0 ml-[60px]" />

              {/* Buy 3 Offer */}
              <div className="flex items-start gap-4 py-3">
                <img className="w-11 h-11 rounded-full bg-[#f5f5f1] object-contain flex-shrink-0 block" src="https://cdn.shopify.com/s/files/1/2428/5565/files/Buy_3_Logo.jpg?v=1739781911" alt="3 Products Offer" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[1.08rem] font-bold text-[#495057] mb-[2px]">Buy any 3 products, get Extra 10% OFF</div>
                  <div className="text-base text-[#666] font-normal mb-0">
                    Discounted Price: <span className="font-bold">Rs. {Math.round(product.price * 0.90)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="text-[1.02rem] leading-[1.5] p-[18px] my-5 break-words">
            <h3 className="text-[1.18rem] font-bold mb-3 text-[#495057] tracking-wider">DESCRIPTION</h3>
            <p className="text-[1.02rem] text-[#666] leading-[1.6] m-0 font-sans">{product.description}</p>
          </div>

          {/* Product Details */}
          <div className="mb-6">
            <h3 className="text-[1.18rem] font-bold mb-3 text-[#495057] tracking-wider">DETAILS</h3>
            <ul className="list-none p-0 m-0">
              <li className="text-base text-[#666] mb-2 leading-[1.6]"><strong className="text-[#495057] font-semibold mr-[6px]">Category:</strong> {product.category}</li>
              <li className="text-base text-[#666] mb-2 leading-[1.6]"><strong className="text-[#495057] font-semibold mr-[6px]">Color:</strong> {product.color}</li>
              <li className="text-base text-[#666] mb-2 leading-[1.6]"><strong className="text-[#495057] font-semibold mr-[6px]">Material:</strong> {product.material}</li>
              <li className="text-base text-[#666] mb-2 leading-[1.6]"><strong className="text-[#495057] font-semibold mr-[6px]">Care:</strong> {product.care}</li>
              <li className="text-base text-[#666] mb-2 leading-[1.6]"><strong className="text-[#495057] font-semibold mr-[6px]">Warranty:</strong> {product.warranty}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Product Tabs Navbar */}
      <ProductTabsNavbar />

      {/* Cart Sidebar placeholder */}
      {showCartSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cart</h2>
              <p className="text-gray-600">Product added to cart successfully!</p>
              <button 
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                onClick={() => setShowCartSidebar(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
