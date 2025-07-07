import React, { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';
import Slider from "./components/slider";
import ImageBanner from "./components/ImageBanner";
import CollectionCards from "./components/CollectionCards";
import banner1 from "/assets/banner1.png";
import reviewimage from "/assets/reviewimage.png"
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

const collections = [
  {
    title: 'MEN',
    image: 'https://neemans.com/cdn/shop/files/For_Men.jpg?v=1712743136&width=400',
    handle: 'men',
  },
  {
    title: 'WOMEN',
    image: 'https://neemans.com/cdn/shop/files/For_Women.jpg?v=1712743136&width=400',
    handle: 'women',
  },
  {
    title: 'LIMITED STOCK',
    image: 'https://neemans.com/cdn/shop/files/Limited_Stock_Banner.jpg?v=1741084491&width=400',
    handle: 'limited-stock',
  },
  {
    title: 'TRENDING',
    image: 'https://neemans.com/cdn/shop/files/For_Men-1.jpg?v=1712743136&width=400',
    handle: 'trending-collection',
  },
];

const categories = [
    {
      label: 'SNEAKERS',
      image: 'https://neemans.com/cdn/shop/files/Frame_39230_ab7ae17e-7d4e-41f9-8f32-17e555ad43f4.png?v=1712729212&width=400',
      handle: 'sneakers',
      bgtext: 'SNEAKERS',
    },
    {
      label: 'SLIP-ONS',
      image: 'https://neemans.com/cdn/shop/files/Frame_39231_9d230ddc-a0bd-445e-89e8-c64c2c47d688.png?v=1712729212&width=400',
      handle: 'slip-ons',
      bgtext: 'SLIP ONS',
    },
    {
      label: 'LOAFERS',
      image: 'https://neemans.com/cdn/shop/files/Frame_39233_d9666860-0b4a-4988-a4f6-0c508f84a258.png?v=1712583768&width=400',
      handle: 'loafers',
      bgtext: 'LOAFERS',
    },
    {
      label: 'OXFORDS',
      image: 'https://neemans.com/cdn/shop/files/Oxfords.png?v=1720616110&width=400',
      handle: 'oxfords-collection',
      bgtext: 'OXFORDS',
    },
    {
      label: 'FLATS',
      image: 'https://neemans.com/cdn/shop/files/Flats_New.png?v=1718002963&width=400',
      handle: 'flats',
      bgtext: 'FLATS',
    },
    {
      label: 'SANDALS',
      image: 'https://neemans.com/cdn/shop/files/Frame_39234_850d0a30-849f-46cd-ade8-e812eeadffda.png?v=1712583768&width=400',
      handle: 'sandals',
      bgtext: 'SANDALS',
    },
    {
      label: 'SLIDES',
      image: 'https://neemans.com/cdn/shop/files/Slides.png?v=1730268638&width=400',
      handle: 'slides',
      bgtext: 'SLIDES',
    },
    {
      label: 'WALKING SHOES',
      image: 'https://neemans.com/cdn/shop/files/Frame_39236_344486a2-12a4-4418-9470-9dba384503fa.png?v=1712583768&width=400',
      handle: 'walking-shoes',
      bgtext: 'WALKING',
    },
  ];
//   https://neemans.com/cdn/shop/files/Offer_Heading_Desktop_a0c2e60b-dbab-4088-834d-40e9d7ce2ddf.jpg?v=1720181852&width=1920

// Create a mapping from baseName (lowercase) to handle
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
        <ImageBanner imageUrl={banner1} alt="Neeman's Impact" />
        <CollectionCards collections={collections} />
        
        <ImageBanner imageUrl="https://neemans.com/cdn/shop/files/Awards_Desktop.jpg?v=1727499800&width=1500" alt="Neeman's Impact" />
        <ProductSlider handles={handles} />
        
       
        <ImageBanner imageUrl= "https://neemans.com/cdn/shop/files/Offer_Heading_Desktop_a0c2e60b-dbab-4088-834d-40e9d7ce2ddf.jpg?v=1720181852&width=1920" alt="Neeman's Impact" />
        <ImageBanner imageUrl="https://neemans.com/cdn/shop/files/Offers_desktop_01_2506b261-7719-4241-92bb-ae553479abe5.jpg?v=1739874202&width=1500" alt="Neeman's Impact" />
        <CollectionCards collections={categories} />
        <TrendingSlider handles={handles} />
        
        <h2 className="font-semibold text-[27px] leading-[38px] text-black text-center pt-5 pb-2.5 mb-0 font-['Abril_Display',serif] px-4 md:px-12">
          Customer Testimonials
        </h2>
        <ImageBanner imageUrl={reviewimage} alt="Neeman's Impact" />
        <ReviewimageSlider />
        <BestSellerSlider handles={handles} />
        <ImageBanner imageUrl= 'https://neemans.com/cdn/shop/files/Desktop_awards_cb07f1b0-6f23-43ec-bf6a-9a2f34c1c547.jpg?v=1736334654&width=1500' alt="Neeman's Impact" />
        <ImageBanner imageUrl='https://neemans.com/cdn/shop/files/Frame_3066.jpg?v=1712584274&width=1500' alt="Neeman's Impact" />
        {/* https://neemans.com/cdn/shop/files/Frame_3066.jpg?v=1712584274&width=1500 */}

        <VideoSlider />
      
        {/* https://neemans.com/cdn/shop/files/Desktop_awards_cb07f1b0-6f23-43ec-bf6a-9a2f34c1c547.jpg?v=1736334654&width=1500 */}
        {/* <ReviewsSlider/> */}
        {/* https://neemans.com/cdn/shop/files/Featured_in_cc1443f3-4215-46f6-be65-2647ccc65f40.jpg?v=1712584374&width=1500 */}
        <ImageBanner imageUrl='https://neemans.com/cdn/shop/files/Featured_in_cc1443f3-4215-46f6-be65-2647ccc65f40.jpg?v=1712584374&width=1500'alt="Neeman's Impact" />

        <StoryView
          videoUrl="https://cdn.shopify.com/videos/c/o/v/f629a444b254409ea7c4562746413c1a.mp4"
          imageUrl="https://neemans.com/cdn/shop/files/Videos_text.jpg?v=1712241682&width=550"
          heading="Our Story"
          description={`We crushed something\nAnd it turned into a story we're proud of!`}
          quote="Left in the ocean. Recycled into shoes."
        />
        
        <VideoSlider2/>
        <ImageBanner imageUrl='https://neemans.com/cdn/shop/files/Offline_store.jpg?v=1712241901&width=1500' alt="Neeman's Impact" />
        {/* https://neemans.com/cdn/shop/files/Offline_store.jpg?v=1712241901&width=1500 */}
        <ImageBanner imageUrl= '  https://neemans.com/cdn/shop/files/Bulk_enquires_desktop_9efa04f3-7756-4e75-a8a1-d76c7d4615ec.jpg?v=1712241901&width=1500' alt="Neeman's Impact" />
        {/* https://neemans.com/cdn/shop/files/Bulk_enquires_desktop_9efa04f3-7756-4e75-a8a1-d76c7d4615ec.jpg?v=1712241901&width=1500 */}
      </div>
    );
  }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collection/:handle" element={<CollectionsPage />} />
    </Routes>
  );
}
