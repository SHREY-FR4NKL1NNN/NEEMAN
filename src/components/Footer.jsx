import React from "react";

const Footer = ({ bottleImage }) => (
  <footer className="bg-black text-white pt-6 pb-8 px-4 md:px-12">
    {/* Bottle Image */}
    <div className="flex justify-center mb-4 mt-[-64px]">
      {bottleImage && (
        <img src={bottleImage} alt="Bottle" className="w-40 h-40 object-contain" />
      )}
    </div>
    {/* Main Message */}
    <div className="text-center max-w-2xl mx-auto mt-[-24px]">
      <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our page has come to an end, but our<br className="hidden md:inline"/> relationship with you has not.</h2>
      <p className="mb-6 text-base md:text-lg">Stay sustainable and subscribe now</p>
      {/* Subscription Form */}
      <form className="flex flex-col sm:flex-row justify-center items-center gap-2 max-w-md mx-auto mb-10">
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full sm:w-auto flex-1 px-4 py-2 rounded-none text-black focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#c5a97c] text-white px-6 py-2 font-semibold rounded-none hover:bg-[#b89a6b] transition-colors"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
    {/* Links Grid */}
    <div className="max-w-7xl mx-auto flex flex-wrap gap-x-16 gap-y-10 text-sm mb-10 px-[227px]">
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SHOP BY STYLE</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Sports shoes</li>
          <li>Formal shoes</li>
          <li>Walking shoes</li>
          <li>Best running shoes</li>
          <li>Flats for women</li>
          <li>Canvas shoes</li>
          <li>Signature shoes</li>
          <li>Trending shoes</li>
          <li>Fancy shoes</li>
          <li>Leather shoes</li>
          <li>Funky shoes</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">INFORMATION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Track Your Order</li>
          <li>Contact us</li>
          <li>Brand impact</li>
          <li>Why Neeman's</li>
          <li>Student Discount</li>
          <li>Press</li>
          <li>Bulk Inquiry</li>
          <li>Blog</li>
          <li>FAQ</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">GUIDES</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Schedule a Return / Exchange</li>
          <li>Shoe Care</li>
          <li>Returns Policy</li>
          <li>Privacy Policy</li>
          <li>Cookie Policy</li>
          <li>Terms & Conditions</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SNEAKERS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Sneakers</li>
          <li>Signature sneakers for men</li>
          <li>Black sneakers</li>
          <li>Sneakers women</li>
          <li>Chunky sneakers for men</li>
          <li>Casual sneakers for men</li>
          <li>Walking sneakers for men</li>
          <li>Formal sneakers for men</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">FLIP FLOPS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Flip flops</li>
          <li>Flip flops for women</li>
          <li>Extra soft flip flops for women</li>
          <li>Flip flops for men</li>
          <li>Extra soft flip flops for men</li>
          <li>Daily use flip flops for men</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SHOES COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Shoes</li>
          <li>Men</li>
          <li>Women</li>
          <li>All products</li>
          <li>Men shoes</li>
          <li>Women shoes</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">LOAFERS AND OXFORDS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Loafers</li>
          <li>Oxfords</li>
          <li>Formal loafers oxfords for men</li>
          <li>Loafers and oxfords for men</li>
          <li>Casual loafers oxfords for men</li>
          <li>Newly launched loafers and oxfords</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SLIPPERS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Slippers</li>
          <li>Chappal</li>
          <li>Mens slippers</li>
          <li>Women slippers</li>
          <li>Stylish slippers for women</li>
          <li>Best slippers for women</li>
          <li>Black slippers</li>
          <li>White slippers</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SANDALS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Sandals</li>
          <li>Sandals for men</li>
          <li>Extra sandals for men</li>
          <li>Sandals for women</li>
          <li>Daily sandals for men</li>
          <li>Gents sandals</li>
          <li>Ladies sandals</li>
          <li>Trendy sandals for men</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SLIP ONS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Slip Ons</li>
          <li>Formal slip ons for men</li>
          <li>Slip ons for men</li>
          <li>Casual slip ons for women</li>
          <li>Newly launched slip ons</li>
          <li>Walking slip ons for men</li>
          <li>Slip ons for women</li>
          <li>Chunky slip ons for men</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">SLIDES COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Slides</li>
          <li>Men slides</li>
          <li>Best slides for men</li>
          <li>Women slides</li>
        </ul>
      </div>
      <div className="min-w-[180px] flex-1">
        <h3 className="font-bold mb-2">CLOGS COLLECTION</h3>
        <ul className="space-y-1 whitespace-nowrap">
          <li>Newly Launched Clogs</li>
          <li>Clogs for Men</li>
          <li>Clogs for Women</li>
          <li>Outdoor Clogs for Men</li>
          <li>Outdoor Clogs for Women</li>
        </ul>
      </div>
    </div>
    {/* Contact & Social */}
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-6 mt-8 gap-4 px-[227px]">
      <div className="text-xs text-gray-300 mb-2 md:mb-0">
        CONTACT US - <br />
        Phone No.: +91 90599-18841<br />
        Timing: Monday to Sunday (10 AM - 7 PM)
      </div>
      <div className="flex items-center gap-4 mb-2 md:mb-0">
        {/* Social Icons (placeholders) */}
        <span className="inline-block w-6 h-6 bg-gray-700 rounded-full"></span>
        <span className="inline-block w-6 h-6 bg-gray-700 rounded-full"></span>
        <span className="inline-block w-6 h-6 bg-gray-700 rounded-full"></span>
        <span className="inline-block w-6 h-6 bg-gray-700 rounded-full"></span>
        <span className="inline-block w-6 h-6 bg-gray-700 rounded-full"></span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center md:justify-end">
        {/* Payment Icons (placeholders) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="inline-block w-10 h-6 bg-gray-700 rounded"></span>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
