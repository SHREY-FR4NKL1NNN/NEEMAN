import React, { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from "./context/CartContext";
import Slider from "./components/slider";
import ImageBanner from "./components/ImageBanner";
import CollectionCards from "./components/CollectionCards";
import ReviewsSlider  from "./components/ReviewsSlider";
import ProductSlider from './components/ProductSlider';
import TrendingSlider from "./components/Trendingslider";
import VideoSlider from './components/VideoSlider';
import StoryView from './components/StoryView';
import VideoSlider2 from "./components/videoslider2";
import ReviewimageSlider from "./components/reviewimageslider";
import Navbar from "./components/Navbar";
import CollectionsPage from './pages/CollectionsPage';
import BestSellerSlider from './components/bestsellerslider';
import Footer from "./components/Footer";
import ProductPage from './pages/ProductPage';
import categoriesData from "/public/data/categories.json";
import collectionsData from "/public/data/collections.json";
import bannersData from "/public/data/banners.json";
import reviewimage from "/assets/reviewimage.png";

const { collections } = collectionsData;
const { categories } = categoriesData;
const { banners } = bannersData;

const handles = {};
[...collections, ...categories].forEach(item => {
  const baseName = (item.title || item.label || '').split(' : ')[0].trim().toLowerCase();
  if (baseName && item.handle) handles[baseName] = item.handle;
});

function HomePage() {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const half = document.body.scrollHeight / 2;
      setShowNavbar(window.scrollY < half);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className={`top-0 left-0 w-full z-50 transition-all duration-700 ${showNavbar ? 'sticky opacity-100' : 'opacity-0 pointer-events-none'}`} style={{position: showNavbar ? 'sticky' : 'fixed'}}>
        <Navbar />
      </div>
      <Slider />
      {banners.map((banner, index) => (
        <ImageBanner key={index} imageUrl={banner.imageUrl} alt={banner.alt} />
      ))}
      <CollectionCards collections={collections} />
      <ProductSlider handles={handles} />
      <CollectionCards collections={categories} />
      <TrendingSlider handles={handles} />

      <h2 className="font-semibold text-[27px] leading-[38px] text-black text-center pt-5 pb-2.5 mb-0 font-['Abril_Display',serif] px-4 md:px-12">
        Customer Testimonials
      </h2>
      <ImageBanner imageUrl={reviewimage} alt="Neeman's Impact" />
      <ReviewimageSlider />
      <BestSellerSlider handles={handles} />
      
      <StoryView
        videoUrl="https://cdn.shopify.com/videos/c/o/v/f629a444b254409ea7c4562746413c1a.mp4"
        imageUrl="https://neemans.com/cdn/shop/files/Videos_text.jpg?v=1712241682&width=550"
        heading="Our Story"
        description={`We crushed something\nAnd it turned into a story we're proud of!`}
        quote="Left in the ocean. Recycled into shoes."
      />

      <VideoSlider2 />
      <Footer bottleImage='https://neemans.com/cdn/shop/files/Relive_knit_bottle.png?v=1737457911&width=220' />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/:handle" element={<CollectionsPage />} />
        <Route path="/products/:handle" element={<ProductPage />} />
        <Route path="/product/:handle" element={<ProductPage />} />
      </Routes>
    </CartProvider>
  );
}