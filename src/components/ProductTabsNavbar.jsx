import React, { useState } from 'react';

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

const ProductTabsNavbar = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <nav className="w-full flex border-b border-[#e5e5e5] bg-white shadow-sm sticky top-0 z-30">
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          className={`flex-1 flex flex-col items-center py-8 transition-all duration-200 focus:outline-none
            ${activeTab === idx ? 'bg-[#f2ebdf] text-[#8a6728] font-semibold border-b-2 border-[#8a6728]' : 'bg-white text-black'}
          `}
          onClick={() => setActiveTab(idx)}
        >
          <span className="mb-2">{tab.icon}</span>
          <span className="text-base tracking-wide">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default ProductTabsNavbar; 