import React, { useState, useEffect } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const slides = [
  {
    image: 'https://neemans.com/cdn/shop/files/1920X800_Desktop_Banner_06787013-8711-4e09-8c07-cb09ee213a14.jpg?v=1750951745&width=1500',
    href: 'https://neemans.com/products/begin-walk-flow'
  },
  {
    image: 'https://neemans.com/cdn/shop/files/1920X800_-_Desktop_Banner_Cushers.jpg?v=1749889879&width=1500',
    href: '#'
  },
  {
    image: 'https://neemans.com/cdn/shop/files/BWT_-_Desktop_Banner.jpg?v=1751290410&width=1500',
    href: '#'
  },
  {
    image: 'https://neemans.com/cdn/shop/files/ELT_-_Desktop_Banner.jpg?v=1751290410&width=1500',
    href: '#'
  },
  {
    image: 'https://neemans.com/cdn/shop/files/1920X800_Desktop_Banner.jpg?v=1750788112&width=1500',
    href: '#'
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 900);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  const handleManual = (idx) => {
    setPrev(current);
    setCurrent(idx);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 900);
  };

  return (
    <div className="relative w-full aspect-[15/6] overflow-hidden group slider-container mt-16">
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        const isPrev = idx === prev && isAnimating;
        return (
          <a
            key={idx}
            href={slide.href}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${isActive && isAnimating ? 'opacity-100 scale-110 z-20' : isActive ? 'opacity-100 scale-100 z-10' : isPrev ? 'opacity-0 scale-75 z-30' : 'opacity-0 scale-75 z-0'}`}
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          >
            <img
              src={slide.image}
              alt={`Slide ${idx + 1}`}
              className="w-full h-full object-cover absolute top-0 left-0 transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              draggable="false"
            />
          </a>
        );
      })}

      {/* Left Arrow */}
      <button
        onClick={() => handleManual(current === 0 ? slides.length - 1 : current - 1)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#D9D9D9] bg-white text-gray-800 flex items-center justify-center z-20 transition-all duration-200 hover:shadow-lg hover:scale-105"
        aria-label="Previous Slide"
      >
        <span className="block w-6 h-6 rotate-180">
          <DotLottieReact
            src="https://lottie.host/0d5ae801-d983-4068-8e30-a420457dfb3d/zIOsFifOdf.lottie"
            loop={false}
            autoplay={false}
          />
        </span>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => handleManual((current === slides.length - 1 ? 0 : current + 1))}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#D9D9D9] bg-white text-gray-800 flex items-center justify-center z-20 transition-all duration-200 hover:shadow-lg hover:scale-105"
        aria-label="Next Slide"
      >
        <span className="block w-6 h-6">
          <DotLottieReact
            src="https://lottie.host/0d5ae801-d983-4068-8e30-a420457dfb3d/zIOsFifOdf.lottie"
            loop={false}
            autoplay={false}
          />
        </span>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-0.5 sm:bottom-4 sm:right-8 sm:gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleManual(idx)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 flex items-center justify-center rounded-full border border-white transition-colors duration-200 focus:outline-none ${idx === current ? "bg-white" : "bg-transparent"}`}
            aria-label={`Go to slide ${idx + 1}`}
          >
            {idx === current ? (
              <span className="block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slider;
