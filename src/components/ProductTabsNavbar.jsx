import React, { useRef, useEffect } from 'react';

const tabs = [
  {
    label: 'Features',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="20" width="20" height="6" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="10" y="6" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 10L22 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 10L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Reviews',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="13" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 20C11.5817 20 8 22.2386 8 25V27H24V25C24 22.2386 20.4183 20 16 20Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 10L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "FAQ's",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 22V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="24" r="1" fill="currentColor"/>
        <path d="M16 10C17.1046 10 18 10.8954 18 12C18 13.1046 17.1046 14 16 14C14.8954 14 14 13.1046 14 12C14 10.8954 14.8954 10 16 10Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    label: 'Care & Info',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 12H20V20H12V12Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Similar Products',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="20" width="20" height="6" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="10" y="6" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
];

const ProductTabsNavbar = ({ activeTab, onTabChange, features = [] }) => {
  const featuresRef = useRef(null);
  const reviewsRef = useRef(null);
  const faqRef = useRef(null); // Add FAQ ref

  // Scroll to section on tab click
  const handleTabClick = (idx) => {
    onTabChange(idx);
    if (idx === 0 && featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (idx === 1 && reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (idx === 2 && faqRef.current) {
      faqRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy: set active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current || !reviewsRef.current) return;
      const featuresTop = featuresRef.current.getBoundingClientRect().top;
      const reviewsTop = reviewsRef.current.getBoundingClientRect().top;
      if (featuresTop <= 100 && reviewsTop > 100) {
        onTabChange(0);
      } else if (reviewsTop <= 100) {
        onTabChange(1);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onTabChange]);

  return (
    <>
      <nav className="w-full flex border-b border-[#e5e5e5] bg-white shadow-sm sticky top-0 z-50 h-[96px]">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`flex-1 flex flex-col items-center h-full py-0 transition-all duration-200 focus:outline-none
              ${activeTab === idx ? 'bg-[#f2ebdf] text-[#8a6728] font-semibold border-b-2 border-[#8a6728]' : 'bg-white text-black'}
            `}
            onClick={() => handleTabClick(idx)}
          >
            <span className="mb-2">{tab.icon}</span>
            <span className="text-base tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>
      {/* Features Section (always rendered) */}
      <div ref={featuresRef}></div>
      <div className="max-w-[1300px] w-full my-0 mx-[128px]">
        <div className="w-full flex flex-col gap-4 pt-8 px-0 pb-0">
          {[0, 1, 2, 3].map((i, idx) => (
            <React.Fragment key={i}>
              <div
                className={`flex items-center gap-6 bg-[#f6f3ee] shadow-sm ${idx % 2 === 1 ? 'flex-row-reverse' : 'flex-row'}`}
                style={{ height: "424.77px" }}
              >
                <div className="flex-1 h-full">
                  <img
                    src={features[i]?.image || ''}
                    alt={`feature${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  />
                </div>
                <div className="flex-1 flex items-center h-full">
                  <span className="text-lg text-[#222] font-medium leading-snug">
                    {features[i]?.text || 'Product feature not available'}
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: "1px",
                  background: "linear-gradient(180deg, rgba(217, 217, 217, 1), rgba(217, 217, 217, 1) 97%)",
                  margin: "32px 0px"
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Reviews Section (always rendered) */}
      <div ref={reviewsRef}></div>
      <div className="w-full max-w-[1100px] mx-auto my-12">
        <h2 className="text-4xl font-serif font-bold text-center mb-10">Customer Reviews</h2>
        <div className="flex flex-row justify-between items-center gap-8">
          {/* Left: Average */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center mb-2">
              {/* Render 4.5 stars */}
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="28" height="28" fill={i <= 4 ? '#c5a97c' : 'none'} stroke="#c5a97c" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="12,2 15,9 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,9" />
                </svg>
              ))}
              <span className="ml-2 text-xl font-semibold">4.64 out of 5</span>
            </div>
            <div className="text-lg">Based on 670 reviews <span className="inline-block align-middle text-teal-500">✔️</span></div>
          </div>
          {/* Center: Breakdown */}
          <div className="flex flex-col flex-1 items-center">
            {[{stars:5,count:491},{stars:4,count:125},{stars:3,count:50},{stars:2,count:2},{stars:1,count:2}].map((row, idx) => (
              <div key={row.stars} className="flex items-center w-full mb-2">
                <span className="mr-2 text-[#c5a97c] font-bold">{'★'.repeat(row.stars)}</span>
                <div className="flex-1 h-3 bg-gray-200 rounded mx-2 overflow-hidden">
                  <div
                    className="h-full bg-[#c5a97c] rounded"
                    style={{ width: `${(row.count/491)*100}%` }}
                  />
                </div>
                <span className="ml-2 w-8 text-right">{row.count}</span>
              </div>
            ))}
          </div>
          {/* Right: Buttons */}
          <div className="flex flex-col flex-1 items-center gap-4">
            <button className="w-56 py-3 bg-black text-white font-bold text-lg rounded-md tracking-wide transition-colors duration-200 hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#c5a97c]">WRITE A REVIEW</button>
            <button className="w-56 py-3 border-2 border-black text-black font-bold text-lg rounded-md tracking-wide transition-colors duration-200 hover:bg-[#f6f3ee] focus:outline-none focus:ring-2 focus:ring-[#c5a97c]">Ask a question</button>
          </div>

          
        </div>
      </div>
      {/* FAQ Section: Always show after reviews */}
      <div ref={faqRef} className="w-full max-w-[1100px] mx-auto my-12 bg-white rounded shadow">
        <h2 className="text-3xl font-serif font-bold   bg-black text-white p-6">Frequently Asked Questions :</h2>
        <style>{`
          /* Hide default marker for Chrome, Safari, Edge */
          details summary::-webkit-details-marker {
            display: none;
          }
          /* Hide default marker for Firefox */
          details > summary {
            list-style: none;
          }
          /* Remove marker for all browsers */
          details summary {
            list-style-type: none;
            outline: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          /* Rotate custom arrow when open */
          details[open] .faq-arrow {
            transform: rotate(180deg);
          }
        `}</style>
        <div className="divide-y divide-gray-200">
          <details className="py-6 ">
            <summary className="cursor-pointer text-lg font-semibold text-grey">
              Are Neeman’s shoes washable?
              <span className="faq-arrow transition-transform duration-200 ml-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-2 text-gray-700">Yes, most Neeman’s shoes are washable. Please refer to the care instructions for each product.</p>
          </details>
          <details className="py-4">
            <summary className="cursor-pointer text-lg font-semibold">
              How to care for the shoes on a daily basis?
              <span className="faq-arrow transition-transform duration-200 ml-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-2 text-gray-700">Wipe with a damp cloth and air dry. Avoid direct sunlight for prolonged periods.</p>
          </details>
          <details className="py-4">
            <summary className="cursor-pointer text-lg font-semibold">
              Is Neeman’s sizing standard/exact or should I size up/down?
              <span className="faq-arrow transition-transform duration-200 ml-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-2 text-gray-700">Neeman’s shoes follow standard sizing. If you are between sizes, we recommend sizing up.</p>
          </details>
          <details className="py-4">
            <summary className="cursor-pointer text-lg font-semibold">
              Where can I wear my Neeman’s?
              <span className="faq-arrow transition-transform duration-200 ml-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <p className="mt-2 text-gray-700">Neeman’s shoes are versatile and can be worn for casual, semi-formal, and daily activities.</p>
          </details>
        </div>
      </div>
      {activeTab !== 0 && (
        <div className="max-w-[1300px] w-full mx-auto my-8 text-center text-gray-500 text-lg">Coming soon...</div>
      )}
    </>
  );
};

export default ProductTabsNavbar; 