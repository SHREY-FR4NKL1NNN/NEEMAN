import React, { useState, useEffect, useRef } from "react";

const reviews = [
  {
    title: "Loved it ..Neemans",
    text: "Loved it..Very bright shoes ..like my future 😏",
    name: "Sidharth Panda",
    product: "Everyday Basic Sneakers : Powder ...",
    rating: 5,
  },
  {
    title: "Loved the shoes..So happy for it",
    text: "I bet..you'll love it when you'll wear ..first thing you'll be feelin...",
    name: "Sidharth Panda",
    product: "Tread Basics : Grey",
    rating: 5,
  },
  {
    title: "Good",
    text: "Quality good",
    name: "M Gangadhraao",
    product: "Cork Thong Sandals : Black",
    rating: 5,
  },
  {
    title: "Superb Service",
    text: "Customer service was excellent and the shoes are very comfortable.",
    name: "Amit Patel",
    product: "Classic Sneakers : Navy",
    rating: 5,
  },
  {
    title: "Great for walking",
    text: "I use these for my daily walks and they are just perfect!",
    name: "Rina Shah",
    product: "Walking Shoes : Grey",
    rating: 5,
  },
  {
    title: "Stylish and comfy",
    text: "Love the look and feel. Will buy again!",
    name: "Suresh Kumar",
    product: "Slip-Ons : Brown",
    rating: 5,
  },
];

const ReviewsSlider = () => {
  const [start, setStart] = useState(0);
  const visible = 3;
  const intervalRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  const total = reviews.length;

  const handlePrev = () => {
    setStart((prev) => (prev - 1 + total) % total);
  };
  const handleNext = () => {
    setStart((prev) => (prev + 1) % total);
  };

  // Auto-scroll logic (infinite loop)
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setStart((prev) => (prev + 1) % total);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered, total]);

  // Calculate translateX for sliding effect
  const translateX = `-${(start * 100) / visible}%`;

  // Get the visible reviews, looping if needed
  const getVisibleReviews = () => {
    const result = [];
    for (let i = 0; i < visible; i++) {
      result.push(reviews[(start + i) % total]);
    }
    return result;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full max-w-6xl overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex transition-transform duration-500 justify-center"
          style={{ width: `${(reviews.length * 100) / visible}%`, transform: `translateX(${translateX})` }}
        >
          {getVisibleReviews().map((review, idx) => (
            <div
              key={idx}
              className="bg-white shadow-lg p-6 aspect-square max-w-[250px] w-full flex-shrink-0 rounded-lg flex flex-col justify-between items-start mx-2"
            >
              <div className="flex gap-1 pb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 text-white text-lg">★</span>
                ))}
              </div>
              <div className="font-bold text-base pb-1 leading-tight break-words w-full">{review.title}</div>
              <div className="text-black text-sm pb-1 leading-snug break-words w-full">{review.text}</div>
              <div className="font-bold text-base pt-2 pb-0 leading-tight w-full">{review.name}</div>
              <div className="text-gray-500 text-xs leading-tight w-full">{review.product}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={handlePrev}
          className="text-4xl font-extrabold text-black bg-transparent border-none shadow-none px-2 py-0 transition hover:text-gray-500"
          aria-label="Previous"
        >
          &#60;
        </button>
        <button
          onClick={handleNext}
          className="text-4xl font-extrabold text-black bg-transparent border-none shadow-none px-2 py-0 transition hover:text-gray-500"
          aria-label="Next"
        >
          &#62;
        </button>
      </div>
    </div>
  );
};

export default ReviewsSlider; 