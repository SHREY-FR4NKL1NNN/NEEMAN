import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const CartSidebar = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount,
    addToCart
  } = useCart();
  // Most bought products (only for empty cart)
  const mostBoughtProducts = [
    {
      id: 'crossover-brogues-tan',
      handle: 'crossover-brogues-tan',
      title: 'Crossover Brogues : Tan',
      price: 2749,
      originalPrice: 5199,
      image: 'https://cdn.shopify.com/s/files/1/2428/5565/files/Tan_ccd0010f-b5b1-4177-ae78-4a67989354d8.png?v=1743665286',
    },
    {
      id: 'sole-max-slip-ons',
      handle: 'sole-max-slip-ons',
      title: 'Sole Max Slip Ons : Ultra Black',
      price: 1529,
      originalPrice: 2999,
      image: 'https://cdn.shopify.com/s/files/1/2428/5565/files/Ultra_Black_8a4564a9-3a8d-4765-8a01-d60a28d2ddc4.png?v=1743681492',
    },
    {
      id: 'grip-fit-slip-ons-black',
      handle: 'grip-fit-slip-ons',
      title: 'Grip Fit Slip Ons : Black',
      price: 1399,
      originalPrice: 3999,
      image: 'https://cdn.shopify.com/s/files/1/2428/5565/files/Red_0d0f30c6-15c2-44f3-8c75-a251777d6e15.png?v=1743668190',
    },
  ];

  // --- Top Picks for Max Savings (dynamic, always shown when cart has items) ---
  const [allProducts, setAllProducts] = React.useState([]);
  const [topPicks, setTopPicks] = React.useState([]);
  const [productsLoaded, setProductsLoaded] = React.useState(false);

  // Fetch all products from all-products, men, and women collections
  React.useEffect(() => {
    Promise.all([
      fetch('https://neemans.com/collections/all-products/products.json').then(res => res.json()),
      fetch('https://neemans.com/collections/men/products.json').then(res => res.json()),
      fetch('https://neemans.com/collections/women/products.json').then(res => res.json()),
    ]).then(([allData, menData, womenData]) => {
      // Helper to flatten products and get correct image for each variant
      const flatten = (data) => (data.products || []).flatMap(product =>
        product.variants.map(variant => {
          // Try to find image for this variant, fallback to first product image
          let image = '';
          if (variant.featured_image && variant.featured_image.src) {
            image = variant.featured_image.src;
          } else if (product.images && product.images.length > 0) {
            // Try to find image by variant_ids
            const match = product.images.find(img => (img.variant_ids || []).includes(variant.id));
            if (match && match.src) image = match.src;
            else image = product.images[0].src || product.images[0];
          }
          return {
            id: variant.id.toString(),
            handle: product.handle,
            title: product.title,
            price: Number(variant.price),
            originalPrice: Number(variant.compare_at_price) || Number(variant.price),
            image,
            color: (() => {
              const parts = product.title.split(":");
              if (parts.length > 1) return parts[parts.length - 1].trim();
              const colorOption = (product.options || []).find(opt => opt.name.toLowerCase().includes('color'));
              if (colorOption && variant.option1) return variant.option1;
              return '';
            })(),
          };
        })
      );
      // Merge and deduplicate by variant id
      const all = [
        ...flatten(allData),
        ...flatten(menData),
        ...flatten(womenData)
      ];
      const seen = new Set();
      const products = all.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setAllProducts(products);
      setProductsLoaded(true);
    });
  }, []);

  // Compute top picks for max saving (same base handle, different color, not in cart)
  React.useEffect(() => {
    if (!cart.items.length || !productsLoaded) {
      setTopPicks([]);
      return;
    }
    const cartIds = cart.items.map(item => item.id);
    const cartHandles = cart.items.map(item => item.handle);
    const cartColors = cart.items.map(item => {
      // Extract color from title (after colon)
      const parts = item.title.split(":");
      return parts.length > 1 ? parts[1].trim().toLowerCase() : '';
    });
    // Always show top picks based on the most recently added product in cart
    let picks = [];
    if (cart.items.length > 0) {
      const lastCartItem = cart.items[cart.items.length - 1];
      const baseHandle = lastCartItem.title.split(":")[0].trim().toLowerCase();
      const cartColor = lastCartItem.title.split(":")[1]?.trim().toLowerCase() || '';
      // Exclude all handles/colors in cart
      const cartHandlesSet = new Set(cart.items.map(item => item.handle));
      const cartColorsSet = new Set(cart.items.map(item => {
        const parts = item.title.split(":");
        return parts.length > 1 ? parts[1].trim().toLowerCase() : '';
      }));
      const sameBaseProducts = allProducts.filter(p => {
        const pBase = p.title.split(":")[0].trim().toLowerCase();
        const pColor = p.title.split(":")[1]?.trim().toLowerCase() || '';
        return (
          pBase === baseHandle &&
          !cartHandlesSet.has(p.handle) &&
          !cartIds.includes(p.id) &&
          pColor !== cartColor &&
          !cartColorsSet.has(pColor)
        );
      });
      // Group by color (avoid duplicate colors)
      const seenColors = new Set();
      for (const prod of sameBaseProducts) {
        const color = prod.title.split(":")[1]?.trim().toLowerCase() || '';
        if (!seenColors.has(color)) {
          picks.push(prod);
          seenColors.add(color);
        }
        if (seenColors.size >= 3) break;
      }
    }
    // Remove duplicates by id
    const uniquePicks = [];
    const seen = new Set();
    for (const p of picks) {
      if (!seen.has(p.id)) {
        uniquePicks.push(p);
        seen.add(p.id);
      }
    }
    setTopPicks(uniquePicks.slice(0, 3)); // Only show up to 3 top picks
  }, [cart.items, allProducts, productsLoaded]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (item, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(item.id, item.variant_id);
  } else {
    updateQuantity(item.id, newQuantity, item.variant_id);
  }
};


  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here');
    onClose();
  };


  const handleViewMostBought = (product) => {
    window.location.href = `/product/${product.handle}`;
  };
  return (
    <>
      <div 
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          touchAction: isOpen ? 'none' : 'auto',
        }}
      />
      <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="cart-sidebar-header" style={{paddingTop: 0, paddingBottom: 0}}>
          <h2 style={{margin: 0, padding: 0, fontWeight: 700, fontSize: '22px', color: '#222', display: 'flex', alignItems: 'center', gap: '8px'}}>
            My Cart
            {getCartItemsCount() > 0 && (
              <span style={{fontWeight: 500, fontSize: '18px', color: '#888'}}>
                {getCartItemsCount()}
              </span>
            )}
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              borderRadius: 0,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-sidebar-content">
          {cart.items.length === 0 ? (
            <div className="empty-cart" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: 'calc(100vh - 60px)', width: '100%', rgb:(255,255,255), paddingTop: '32px', paddingBottom: '0'
            }}>
              <div className="empty-cart-icon" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="https://cdn.shopify.com/s/files/1/0761/2235/8037/files/shopping-bag.png?v=1731917484" alt="Empty Bag" style={{ width: '100px', height: '100px', objectFit: 'contain',  marginTop: '60px', marginBottom: '-16px' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '18px',marginBottom: '-15px', color: '#868785', textAlign: 'center' }}>Your bag is empty</h3>
              <p style={{ fontSize: '15px', rgba:(123,124,122), marginBottom: '28px',paddingTop: '18px', textAlign: 'center' }}>Start shopping with Neeman's</p>
              <div style={{ width: '100%', marginTop: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#808080', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'left',marginTop:'50px' }}>Mostly Bought</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', }}>
                  {mostBoughtProducts.map((product) => (
                    <div key={product.id} style={{ background: '#f6f5f2', borderRadius: '6px', padding: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                      <div style={{ width: '80px', height: '96px',  marginRight: '0px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', background: 'none', position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          onClick={() => handleViewMostBought(product)}
                          style={{ 
                            width: '80px', 
                            height: '60px', 
                            objectFit: 'contain', 
                            borderRadius: '0', 
                            background: 'transparent', 
                            zIndex: 2,
                            position: 'relative',
                            display: 'block',
                            cursor: 'pointer'
                          }} 
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minWidth: 0,  }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', lineHeight: 1.2, marginBottom: 0,cursor: 'pointer', textAlign: 'left', width: '100%', }} onClick={() => handleViewMostBought(product)}>{product.title}</div>
                        <div style={{ fontSize: '140px', width: '100%', textAlign: 'left', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#3b3b3b', fontSize: '14px' }}>Rs. {product.price.toLocaleString('en-IN')}</span>
                          <span style={{ textDecoration: 'line-through', color: '#b3b3b3', fontSize: '14px' }}>Rs. {product.originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <button
                        style={{ marginLeft: 'auto', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#BD9966', color: 'white', fontWeight: 700, fontSize: '14px', borderRadius: '0px', transition: 'all 0.2s', width: '90px', height: '44px', boxShadow: 'none', border: 'none', minWidth: '90px', cursor: 'pointer', flexDirection: 'row' }}
                        onClick={() => handleViewMostBought(product)}
                        onMouseOver={e => e.currentTarget.style.background = '#a88d4a'}
                        onMouseOut={e => e.currentTarget.style.background = '#bfa15a'}
                      >
                        <span style={{ fontWeight: 700, fontSize: '14px', marginTop: '0px', position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          VIEW
                          <span style={{ display: 'inline-block', marginLeft: '5px', lineHeight: '20px', verticalAlign: 'middle' }}>
                            <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10.3125 4.97711C4.0625 4.97711 1.5625 10.6021 1.5625 10.6021C1.5625 10.6021 4.0625 16.2271 10.3125 16.2271C16.5625 16.2271 19.0625 10.6021 19.0625 10.6021C19.0625 10.6021 16.5625 4.97711 10.3125 4.97711Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.3125 13.7271C12.0384 13.7271 13.4375 12.328 13.4375 10.6021C13.4375 8.87622 12.0384 7.47711 10.3125 7.47711C8.58661 7.47711 7.1875 8.87622 7.1875 10.6021C7.1875 12.328 8.58661 13.7271 10.3125 13.7271Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                maxHeight: `calc(100vh - 220px)`,
                overflowY: 'auto',
                margin: '24px 0 0 0',
                padding: '0 16px',
                paddingBottom: '15px', // change this to increase scroll screen space
                boxSizing: 'border-box',
              }}>
                <div>
                  {/* Discount Progress Bar and Offer Section */}
                  {cart.items.length > 0 && (
                    <div className="rewards-tiers-container" style={{background: 'rgba(0,0,0,0.03)', borderRadius: 12, marginBottom: 24, padding: '16px 12px 8px 12px', position: 'relative', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)'}}>
                      <div className="rewards-tiers-labels" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#222'}}>
                        <span style={{fontSize: 14, color: '#111', textAlign: 'center', fontWeight: 'normal'}}>
                          {cart.items.length === 1 && (<span>Add 1 more and get <span style={{color: '#111', fontWeight: 700}}>Extra 7% OFF</span></span>)}
                          {cart.items.length === 2 && (<span>Add 1 more and get <span style={{color: '#111', fontWeight: 700}}>Extra 10% OFF</span></span>)}
                          {cart.items.length >= 3 && (<span>Extra 10% OFF applied!</span>)}
                        </span>
                      </div>
                      <div className="rewards-progress-bar" style={{position: 'relative', height: 38, margin: '0 0 8px 0', background: 'transparent'}}>
                        {/* Top labels */}
                        <div style={{position: 'absolute', left: 115, right: 18, top: 5, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#333', fontWeight: 'normal', padding: '0 2px'}}>
                          <span>2 items</span>
                          <span>3 items</span>
                        </div>
                        {/* Progress bar background */}
                        <div style={{position: 'absolute', left: 0, right: 0, top: 25, height: 8, background: '#E6E6E6', borderRadius: 4, width: '100%'}}></div>
                        {/* Progress bar fill: only up to the 2nd icon when 2 items */}
                        <div style={{position: 'absolute', left: 0, top: 24, height: 8, background: '#111', width: cart.items.length === 1 ? '25%' : cart.items.length === 2 ? '50%' : cart.items.length >= 3 ? '100%' : '0%', transition: 'width 0.3s'}}></div>
                        {/* 1st icon at 68% (snake circle with % always inside, tick above) */}
                        <div style={{position: 'absolute', left: '50%', top: 10, width: 32, height: 32, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
                          <div style={{width: 32, height: 32, borderRadius: '50%', background: '#fff', border: cart.items.length >= 2 ? '2.5px solid #111' : '2.5px solid #BDBDBD', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingRight: 0}}>
                            {/* Tick above the snake circle */}
                            {cart.items.length >= 2 && (
                              <span style={{position: 'absolute', left: '50%', top: -13, transform: 'translateX(-50%)', zIndex: 3, background: '#111', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                              </span>
                            )}
                            {/* Snake circle SVG with % icon as SVG <text> perfectly centered */}
                            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{display: 'block'}}>
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0943 3.51441C11.2723 1.72371 8.72775 1.72371 7.90568 3.51441C7.73011 3.89684 7.28948 4.07936 6.89491 3.93308C5.04741 3.24816 3.24816 5.04741 3.93308 6.89491C4.07936 7.28948 3.89684 7.73011 3.51441 7.90568C1.72371 8.72775 1.72371 11.2723 3.51441 12.0943C3.89684 12.2699 4.07936 12.7105 3.93308 13.1051C3.24816 14.9526 5.04741 16.7519 6.89491 16.0669C7.28948 15.9207 7.73011 16.1032 7.90568 16.4856C8.72775 18.2763 11.2723 18.2763 12.0943 16.4856C12.2699 16.1032 12.7105 15.9207 13.1051 16.0669C14.9526 16.7519 16.7519 14.9526 16.0669 13.1051C15.9207 12.7105 16.1032 12.2699 16.4856 12.0943C18.2763 11.2723 18.2763 8.72775 16.4856 7.90568C16.1032 7.73011 15.9207 7.28948 16.0669 6.89491C16.7519 5.04741 14.9526 3.24816 13.1051 3.93308C12.7105 4.07936 12.2699 3.89684 12.0943 3.51441ZM9.26889 4.14023C9.55587 3.51511 10.4441 3.51511 10.7311 4.14023C11.2341 5.23573 12.4963 5.75856 13.6265 5.33954C14.2715 5.10044 14.8996 5.72855 14.6605 6.3735C14.2415 7.50376 14.7643 8.76597 15.8598 9.26889C16.4849 9.55587 16.4849 10.4441 15.8598 10.7311C14.7643 11.2341 14.2415 12.4963 14.6605 13.6265C14.8996 14.2715 14.2715 14.8996 13.6265 14.6605C12.4963 14.2415 11.2341 14.7643 10.7311 15.8598C10.4441 16.4849 9.55587 16.4849 9.26889 15.8598C8.76597 14.7643 7.50376 14.2415 6.3735 14.6605C5.72855 14.8996 5.10044 14.2715 5.33954 13.6265C5.75856 12.4963 5.23573 11.2341 4.14023 10.7311C3.51511 10.4441 3.51511 9.55587 4.14023 9.26889C5.23573 8.76597 5.75856 7.50376 5.33954 6.3735C5.10044 5.72855 5.72855 5.10044 6.3735 5.33954C7.50376 5.75856 8.76597 5.23573 9.26889 4.14023Z" fill="#4A4A4A"/>
                              <text x="10" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="300" fill="#808080" fontFamily="inherit">%</text>
                            </svg>
                          </div>
                        </div>
                        {/* 2nd icon at 100% (snake circle with % always inside, tick above) */}
                        <div style={{position: 'absolute', left: '100%', top: 10, width: 32, height: 32, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
                          <div style={{width: 32, height: 32, borderRadius: '50%', background: '#fff', border: cart.items.length >= 3 ? '2.5px solid #111' : '2.5px solid #BDBDBD', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingRight: 0}}>
                            {/* Tick above the snake circle */}
                            {cart.items.length >= 3 && (
                              <span style={{position: 'absolute', left: '50%', top: -13, transform: 'translateX(-50%)', zIndex: 3, background: '#111', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                              </span>
                            )}
                            {/* Snake circle SVG with % icon as SVG <text> perfectly centered */}
                            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{display: 'block'}}>
                              <path fillRule="evenodd" clipRule="evenodd" d="M12.0943 3.51441C11.2723 1.72371 8.72775 1.72371 7.90568 3.51441C7.73011 3.89684 7.28948 4.07936 6.89491 3.93308C5.04741 3.24816 3.24816 5.04741 3.93308 6.89491C4.07936 7.28948 3.89684 7.73011 3.51441 7.90568C1.72371 8.72775 1.72371 11.2723 3.51441 12.0943C3.89684 12.2699 4.07936 12.7105 3.93308 13.1051C3.24816 14.9526 5.04741 16.7519 6.89491 16.0669C7.28948 15.9207 7.73011 16.1032 7.90568 16.4856C8.72775 18.2763 11.2723 18.2763 12.0943 16.4856C12.2699 16.1032 12.7105 15.9207 13.1051 16.0669C14.9526 16.7519 16.7519 14.9526 16.0669 13.1051C15.9207 12.7105 16.1032 12.2699 16.4856 12.0943C18.2763 11.2723 18.2763 8.72775 16.4856 7.90568C16.1032 7.73011 15.9207 7.28948 16.0669 6.89491C16.7519 5.04741 14.9526 3.24816 13.1051 3.93308C12.7105 4.07936 12.2699 3.89684 12.0943 3.51441ZM9.26889 4.14023C9.55587 3.51511 10.4441 3.51511 10.7311 4.14023C11.2341 5.23573 12.4963 5.75856 13.6265 5.33954C14.2715 5.10044 14.8996 5.72855 14.6605 6.3735C14.2415 7.50376 14.7643 8.76597 15.8598 9.26889C16.4849 9.55587 16.4849 10.4441 15.8598 10.7311C14.7643 11.2341 14.2415 12.4963 14.6605 13.6265C14.8996 14.2715 14.2715 14.8996 13.6265 14.6605C12.4963 14.2415 11.2341 14.7643 10.7311 15.8598C10.4441 16.4849 9.55587 16.4849 9.26889 15.8598C8.76597 14.7643 7.50376 14.2415 6.3735 14.6605C5.72855 14.8996 5.10044 14.2715 5.33954 13.6265C5.75856 12.4963 5.23573 11.2341 4.14023 10.7311C3.51511 10.4441 3.51511 9.55587 4.14023 9.26889C5.23573 8.76597 5.75856 7.50376 5.33954 6.3735C5.10044 5.72855 5.72855 5.10044 6.3735 5.33954C7.50376 5.75856 8.76597 5.23573 9.26889 4.14023Z" fill="#4A4A4A"/>
                              <text x="10" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="300" fill="#808080" fontFamily="inherit">%</text>
                            </svg>
                          </div>
                        </div>
                        {/* Labels under icons */}
                        <div style={{position: 'absolute', left: 80, right: 12, top: 33, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#111', fontWeight: 'normal', padding: '0 2px'}}>
                          <span>EXTRA 7% OFF</span>
                          <span>EXTRA 10% OFF</span>
                        </div>
                        {/* Applied offer text */}
                        <div style={{position: 'absolute', left: 0, right: 0, top: 58, width: '100%', textAlign: 'center', fontSize: 14, color: '#111', fontWeight: 'normal'}}>
                          {cart.items.length === 2 && <span>Extra 7% OFF applied!</span>}
                          {cart.items.length >= 3 && <span>Extra 10% OFF applied!</span>}
                        </div>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#808080', margin: '0 2px 0 2px', fontWeight: 600}}>
                        {/* Remove duplicate discount labels here, as labels are already under icons */}
                      </div>
                    </div>
                  )}
                  <div className="cart-items-list">
                    {cart.items.map((item) => (
                      <div key={`${item.id}-${item.variant_id}`} className="cart-sidebar-item" style={{display: 'flex', alignItems: 'flex-start', gap: 18, borderBottom: '1px solid #eee', padding: '18px 0 12px 0'}}>
                        {/* Product Image (last image from images array) */}
                        <div className="item-image" style={{width: 110, minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f6', borderRadius: 8}}>
                          {(() => {
                            // Always use the last image from the images array (Neemans.com style)
                            let imgSrc = '/placeholder-product.jpg';
                            let imagesArr = null;
                            // Find the product in allProducts by variant id (id)
                            const prod = allProducts.find(p => p.id === item.id.toString());
                            // If product is found in allProducts, try to get images from the original product (not variant)
                            if (prod && prod.handle) {
                              // Find the original product by handle in allProducts (flattened structure)
                              const originalProduct = allProducts.find(p => p.handle === prod.handle && p.images && Array.isArray(p.images) && p.images.length > 0);
                              if (originalProduct && originalProduct.images && originalProduct.images.length > 0) {
                                imagesArr = originalProduct.images;
                              }
                            }
                            // Fallback to prod.images if above not found
                            if (!imagesArr && prod && prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
                              imagesArr = prod.images;
                            }
                            // Fallback to item.images
                            if (!imagesArr && item.images && Array.isArray(item.images) && item.images.length > 0) {
                              imagesArr = item.images;
                            }
                            if (imagesArr && imagesArr.length > 0) {
                              const lastImg = imagesArr[imagesArr.length - 1];
                              imgSrc = lastImg.src || lastImg;
                            } else if (prod && prod.image) {
                              imgSrc = prod.image;
                            } else if (item.image) {
                              imgSrc = item.image;
                            }
                            return (
                              <img src={imgSrc} alt={item.title} style={{width: 100, height: 80, objectFit: 'contain', borderRadius: 0, background: 'transparent', display: 'block'}} />
                            );
                          })()}
                        </div>
                        {/* Product Info */}
                        <div className="item-info" style={{flex: 1, minWidth: 0}}>
                          <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%'}}>
                            <h4 style={{
                              fontWeight: 600,
                              fontSize: 16,
                              color: '#111',
                              margin: 0,
                              padding: 0,
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                              overflow: 'visible',
                              textOverflow: 'unset',
                              display: 'block',
                              maxWidth: '100%',
                            }}>{item.title}</h4>
                            {/* Delete Icon */}
                            <button 
                              className="remove-btn"
                              onClick={() => removeFromCart(item.id, item.variant_id)}
                              style={{background: 'none', border: 'none', padding: 0, marginLeft: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', height: 48, minHeight: 48, alignSelf: 'stretch'}}
                              aria-label="Remove from cart"
                            >
                              {/* New trash can icon as provided by user */}
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="10" width="16" height="16" rx="2" fill="none" stroke="#888" strokeWidth="1" fontWeight='100'/>
                                <rect x="12" y="6" width="8" height="4" rx="1" fill="none" stroke="#888" strokeWidth="1" fontWeight='100'/>
                                <line x1="16" y1="14" x2="16" y2="22" stroke="#888" strokeWidth="1" fontWeight='100'/>
                                <line x1="12" y1="14" x2="12" y2="22" stroke="#888" strokeWidth="1" fontWeight='100'/>
                                <line x1="20" y1="14" x2="20" y2="22" stroke="#888" strokeWidth="1" fontWeight='100'/>
                                <line x1="10" y1="10" x2="22" y2="10" stroke="#888" strokeWidth="1" fontWeight='100'/>
                              </svg>
                            </button>
                          </div>
                          {/* Show size as UK X if possible */}
                          {item.variant_title && (
                            <p className="variant-info" style={{color: '#888', fontWeight: 600, fontSize: 14, margin: '2px 0 8px 0'}}>
                              {(() => {
                                const sizeMatch = item.variant_title.match(/\d+/g);
                                if (sizeMatch && sizeMatch.length > 0) {
                                  return `Size: ${sizeMatch.map(s => `UK ${s}`).join(', ')}`;
                                }
                                return item.variant_title;
                              })()}
                            </p>
                          )}
                          {/* Price, compare_at_price, discount */}
                          <div className="item-price-qty" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2}}>
                              {/* Price (Neemans.com: price key) */}
                              {(() => {
                                // Always use the product from allProducts for price/compare_at_price/discount
                                const prod = allProducts.find(p => p.id === item.id.toString());
                                let price = null;
                                let compareAt = null;
                                // Neemans.com JSON: price and compare_at_price are strings, must be parsed
                                if (prod) {
                                  price = prod.price !== undefined ? Number(prod.price) : (item.price !== undefined ? Number(item.price) : null);
                                  // Try to get compare_at_price from prod, fallback to originalPrice, fallback to item
                                  compareAt = prod.compare_at_price !== undefined && prod.compare_at_price !== null ? Number(prod.compare_at_price) : (prod.originalPrice !== undefined ? Number(prod.originalPrice) : (item.compare_at_price !== undefined ? Number(item.compare_at_price) : (item.originalPrice !== undefined ? Number(item.originalPrice) : null)));
                                  // If still not found, try to get from prod.variant if available
                                  if ((!compareAt || compareAt === price) && prod.variants && Array.isArray(prod.variants)) {
                                    const variant = prod.variants.find(v => v.id.toString() === item.variant_id?.toString() || v.id.toString() === item.id?.toString());
                                    if (variant && variant.compare_at_price) {
                                      compareAt = Number(variant.compare_at_price);
                                    }
                                  }
                                } else {
                                  price = item.price !== undefined ? Number(item.price) : null;
                                  compareAt = item.compare_at_price !== undefined ? Number(item.compare_at_price) : (item.originalPrice !== undefined ? Number(item.originalPrice) : null);
                                }
                                return (
                                  <>
                                    <span className="price" style={{fontWeight: 700, color: '#222', fontSize: 14}}>Rs. {price !== null ? price.toLocaleString('en-IN') : ''}</span>
                                    {compareAt && compareAt > price && (
                                      <span style={{textDecoration: 'line-through', color: '#b3b3b3', fontWeight: 500, fontSize: 14, marginLeft: 4}}>Rs. {compareAt.toLocaleString('en-IN')}</span>
                                    )}
                                    {compareAt && price && compareAt > price && (
                                      <span style={{color: '#2eaf4d', fontWeight: 300, fontSize: 14, marginLeft: 2}}>{Math.round(((compareAt - price) / compareAt) * 100)}% OFF</span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            {/* Quantity controls */}
                            <div className="quantity-controls" style={{marginTop: 2, display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', height: 38}}>
                              <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  style={{width: 38, height: 38, fontSize: 22, fontWeight: 400, color: '#222', background: '#fff', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', borderRadius: 0, position: 'relative'}} 
                                  onMouseOver={e => e.currentTarget.style.background = '#F0F0F0'}
                                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                >–</button>
                                {/* Vertical line after minus button */}
                                <div style={{width: 1, height: 38, background: '#ddd', position: 'absolute', left: 38, top: 0, zIndex: 1}}></div>
                              </div>
                              <span style={{width: 38, textAlign: 'center', fontWeight: 600, fontSize: 18, color: '#222', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0}}>{item.quantity}</span>
                              <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                                {/* Vertical line before plus button */}
                                <div style={{width: 1, height: 38, background: '#ddd', position: 'absolute', left: 0, top: 0, zIndex: 1}}></div>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  style={{width: 38, height: 38, fontSize: 22, fontWeight: 400, color: '#222', background: '#fff', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', borderRadius: 0, position: 'relative'}}
                                  onMouseOver={e => e.currentTarget.style.background = '#F0F0F0'}
                                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                >+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="top-picks-section">
                    {topPicks.length > 0 ? (
                      <>
                        <div style={{fontWeight: 700, fontSize: 16, textAlign: 'center', color: '#222', marginBottom: 16}}>Top Picks for Max Savings 🚀</div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 0, width: '100%'}}>
                          {topPicks.map(product => (
                            <div key={product.id} style={{background: '#fff', borderRadius: 8, padding: '18px 0 18px 0', marginBottom: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', boxShadow: '0 1px 0 #eee', width: '100%'}}>
                              <img
                                src={product.image}
                                alt={product.title}
                                style={{width: 80, height: 60, objectFit: 'contain', marginRight: 14, marginLeft: 14, cursor: 'pointer'}}
                                onClick={() => window.location.href = `/product/${product.handle}`}
                              />
                              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minWidth: 0}}>
                                <div
                                  style={{fontWeight: 700, fontSize: 16, color: '#222', marginBottom: 4, textAlign: 'left', cursor: 'pointer', lineHeight: 1.2}}
                                  onClick={() => window.location.href = `/product/${product.handle}`}
                                >
                                  {product.title}
                                </div>
                                <div style={{fontWeight: 700, fontSize: 12, color: '#222', marginBottom: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8}}>
                                  <span style={{fontWeight: 700, color: '#222', fontSize: 14}}>Rs. {product.price.toLocaleString('en-IN')}</span>
                                  <span style={{textDecoration: 'line-through', color: '#b3b3b3', fontSize: 14}}>Rs. {product.originalPrice.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  // Only add if not already in cart (by id+variant_id)
                                  const alreadyInCart = cart.items.some(
                                    item => item.id === product.id && item.variant_id === product.variant_id
                                  );
                                  if (!alreadyInCart) {
                                    addToCart(product);
                                  }
                                }}
                                style={{marginLeft: 5, marginRight: 5, lineHeight: '20px', background: '#bd9966', border: '1px solid #BD9966', color: 'white', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', minWidth: 80, minHeight: 38, letterSpacing: 0.5}}
                              >
                                ADD +
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{textAlign: 'center', color: '#888', fontSize: 14, margin: '12px 0'}}></div>
                    )}
                    <div id="details" style={{marginTop: 24, textAlign: 'center'}}>
                      <img src="https://cdn.shopify.com/s/files/1/2428/5565/files/Brand_Offerings_Side_cart_and_cart_page_New.png?v=1750401357" alt="Brand Offerings" style={{maxWidth: '100%', height: 'auto'}} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="cart-sidebar-footer" style={{position: 'fixed', left: 0, right: 0, bottom: 0, background: '#F0F0F0', zIndex: 100, boxShadow: '0 -2px 12px rgba(0,0,0,0.07)', padding: '16px 24px 24px 24px', width: '400px', maxWidth: '100%', margin: '0 auto'}}>
                {/* Discount summary, only show if cart has items */}
                {cart.items.length > 1 && (
                  <div style={{marginBottom: 0, paddingBottom: 0}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, color: '#888', marginBottom: 2}}>
                      <span>Discounts</span>
                      {cart.items.length === 2 && (
                        <span style={{background: '#f5f5f5', color: '#888', fontWeight: 600, borderRadius: 4, padding: '2px 8px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4}}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill='currentColor' fillOpacity='0.55' style={{marginRight: 2, color: '#222'}}><path d="M17.78 3.09C17.45 2.443 16.778 2 16 2h-5.165c-.535 0-1.046.214-1.422.593l-6.82 6.89c0 .002 0 .003-.002.003-.245.253-.413.554-.5.874L.738 8.055c-.56-.953-.24-2.178.712-2.737L9.823.425C10.284.155 10.834.08 11.35.22l4.99 1.337c.755.203 1.293.814 1.44 1.533z" fillOpacity=".55" fill="currentColor"></path><path fill="currentColor" d="M10.835 2H16c1.105 0 2 .895 2 2v5.172c0 .53-.21 1.04-.586 1.414l-6.818 6.818c-.777.778-2.036.782-2.82.01l-5.166-5.1c-.786-.775-.794-2.04-.02-2.828.002 0 .003 0 .003-.002l6.82-6.89C9.79 2.214 10.3 2 10.835 2zM13.5 8c.828 0 1.5-.672 1.5-1.5S14.328 5 13.5 5 12 5.672 12 6.5 12.672 8 13.5 8z"></path></svg>
                          Extra 7% OFF
                        </span>
                      )}
                      {cart.items.length >= 3 && (
                        <span style={{background: '#f5f5f5', color: '#888', fontWeight: 600, borderRadius: 4, padding: '2px 8px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4}}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill='currentColor' fillOpacity='0.55' style={{marginRight: 2, color: 'black'}}><path d="M17.78 3.09C17.45 2.443 16.778 2 16 2h-5.165c-.535 0-1.046.214-1.422.593l-6.82 6.89c0 .002 0 .003-.002.003-.245.253-.413.554-.5.874L.738 8.055c-.56-.953-.24-2.178.712-2.737L9.823.425C10.284.155 10.834.08 11.35.22l4.99 1.337c.755.203 1.293.814 1.44 1.533z" fillOpacity=".55" fill="currentColor"></path><path fill="currentColor" d="M10.835 2H16c1.105 0 2 .895 2 2v5.172c0 .53-.21 1.04-.586 1.414l-6.818 6.818c-.777.778-2.036.782-2.82.01l-5.166-5.1c-.786-.775-.794-2.04-.02-2.828.002 0 .003 0 .003-.002l6.82-6.89C9.79 2.214 10.3 2 10.835 2zM13.5 8c.828 0 1.5-.672 1.5-1.5S14.328 5 13.5 5 12 5.672 12 6.5 12.672 8 13.5 8z"></path></svg>
                          Extra 10% OFF
                        </span>
                      )}
                      <span style={{flex: 1}}></span>
                      {cart.items.length === 2 && (
                        <span style={{color: '#888', fontWeight: 700, fontSize: 14}}>-Rs. {((getCartTotal()) * 0.07).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                      )}
                      {cart.items.length >= 3 && (
                        <span style={{color: '#e53935', fontWeight: 700, fontSize: 15}}>-Rs. {((getCartTotal()) * 0.10).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="cart-summary" style={{margin: 0, padding: 0, background: 'transparent', color: '#808080'}}>
                  <div className="summary-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0, margin: 0, padding: 0, color: '#808080'}}>
                    <span style={{fontWeight: 700, fontSize: 14, color: '#808080', margin: 0, padding: 0}}>Subtotal:</span>
                    <div style={{display: 'flex', alignItems: 'baseline', gap: 8, flex: 1, justifyContent: 'flex-end', margin: 0, padding: 0}}>
                      <span style={{fontWeight: 700, fontSize: 14, color: '#808080', textAlign: 'right', minWidth: 120, letterSpacing: 0, margin: 0, padding: 0}}>
                        {formatPrice(
                          getCartTotal()
                          - (cart.items.length === 2 ? getCartTotal() * 0.07 : 0)
                          - (cart.items.length >= 3 ? getCartTotal() * 0.10 : 0)
                          + (getCartTotal() >= 1999 ? 0 : 99)
                        )}
                      </span>
                      <span style={{textDecoration: 'line-through', color: '#b3b3b3', fontWeight: 700, fontSize: 14, marginLeft: 8, margin: 0, padding: 0}}>
                        {cart.items.length > 0 && (() => {
                          if (cart.items.length === 1) {
                            const item = cart.items[0];
                            const prod = allProducts.find(p => p.id === item.id.toString());
                            const compareAt = prod && prod.originalPrice ? prod.originalPrice : null;
                            if (compareAt && compareAt > item.price) {
                              return formatPrice((compareAt * item.quantity) + (getCartTotal() >= 1999 ? 0 : 99));
                            } else {
                              const multiplier = 1.8 + Math.random() * 0.1;
                              const fallback = Math.round(item.price * item.quantity * multiplier);
                              return formatPrice(fallback + (getCartTotal() >= 1999 ? 0 : 99));
                            }
                          } else {
                            let compareSum = cart.items.reduce((acc, item) => {
                              const prod = allProducts.find(p => p.id === item.id.toString());
                              const compareAt = prod && prod.originalPrice ? prod.originalPrice : item.price;
                              return acc + (compareAt * item.quantity);
                            }, 0);
                            return formatPrice(compareSum + (getCartTotal() >= 1999 ? 0 : 99));
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="cart-actions" style={{marginTop: 4, paddingTop: 0}}>
                  <button className="checkout-btn moving-gradient" onClick={handleCheckout}>
                    <span className="btn-text">
                      <span className="plc-ord-text">PROCEED TO CHECKOUT</span>
                    </span>
                    <span className="moving-gradient-bg"></span>
                  </button>
                </div>

                <div style={{margin: 0, padding: 0, position: 'relative', bottom: 0}}>
                  <img style={{display: 'block', width: '100%', margin: 0, padding: 0, borderRadius: 0}} src="https://cdn.shopify.com/s/files/1/2428/5565/files/Secure_Transaction_Strip_Side_cart_and_cart_page.svg?v=1732528366" alt="100% Secure Transaction" />
                </div>
                {/* <button className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </button> */}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;