import React, { useState } from "react";
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
  const [leftArrowPlay, setLeftArrowPlay] = useState(false);
  const [rightArrowPlay, setRightArrowPlay] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-[16/6] overflow-hidden group slider-container">
      {/* Pause Icon Overlay */}
      <div className="pointer-events-none select-none absolute top-5 right-5 bg-black/70 text-white px-3 py-2 rounded-full text-base opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-20">
        ⏸
      </div>
      {/* Slides */}
      {slides.map((slide, idx) => {
        let base = "absolute inset-0 transition-all duration-700";
        let active = idx === current;
        let prev = (current === 0 ? slides.length - 1 : current - 1) === idx;
        let next = (current === slides.length - 1 ? 0 : current + 1) === idx;
        let translate = "";
        if (active) {
          translate = "translate-x-0 opacity-100 z-10";
        } else if (direction === 1 && prev) {
          translate = "-translate-x-full opacity-0 z-0";
        } else if (direction === -1 && next) {
          translate = "translate-x-full opacity-0 z-0";
        } else {
          translate = "opacity-0 z-0";
        }
        return (
          <a
            key={idx}
            href={slide.href}
            className={`${base} ${translate}`}
          >
            <img
              src={slide.image}
              alt={`Slide ${idx + 1}`}
              className="w-full h-full object-cover absolute top-0 left-0"
              draggable="false"
            />
          </a>
        );
      })}

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setLeftArrowPlay(true)}
        onMouseLeave={() => setLeftArrowPlay(false)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#D9D9D9] bg-white text-gray-800 flex items-center justify-center z-20 transition-all duration-200 hover:shadow-lg hover:scale-105"
        aria-label="Previous Slide"
      >
        <span className="block w-6 h-6 rotate-180">
          <DotLottieReact
            src="https://lottie.host/0d5ae801-d983-4068-8e30-a420457dfb3d/zIOsFifOdf.lottie"
            loop={false}
            autoplay={leftArrowPlay}
          />
        </span>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        onMouseEnter={() => setRightArrowPlay(true)}
        onMouseLeave={() => setRightArrowPlay(false)}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#D9D9D9] bg-white text-gray-800 flex items-center justify-center z-20 transition-all duration-200 hover:shadow-lg hover:scale-105"
        aria-label="Next Slide"
      >
        <span className="block w-6 h-6">
          <DotLottieReact
            src="https://lottie.host/0d5ae801-d983-4068-8e30-a420457dfb3d/zIOsFifOdf.lottie"
            loop={false}
            autoplay={rightArrowPlay}
          />
        </span>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-0.5 sm:bottom-4 sm:right-8 sm:gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > current ? 1 : -1);
              setCurrent(idx);
            }}
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
