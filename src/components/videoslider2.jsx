import React, { useRef } from 'react';

const videos = [
  { url: 'https://cdn.shopify.com/videos/c/vp/f8fc50b63fcd4a61bf53ce9e0933cbf4/f8fc50b63fcd4a61bf53ce9e0933cbf4.HD-1080p-2.5Mbps-17248653.mp4' },
  { url: 'https://cdn.shopify.com/videos/c/vp/0548b2e9f4c74bf6a987f4c446581b81/0548b2e9f4c74bf6a987f4c446581b81.HD-1080p-2.5Mbps-26930292.mp4' },
  { url: 'https://cdn.shopify.com/s/files/1/2428/5565/files/shopgracias-videos-gif506316ce.mp4?v=1691904146' },
  { url: 'https://cdn.shopify.com/s/files/1/2428/5565/files/shopgracias-videos-gif17898d3b.mp4?v=1691904162' },
  { url: 'https://cdn.shopify.com/s/files/1/2428/5565/files/shopgracias-videos-gif45b5f910.mp4?v=1691904184' },
  { url: 'https://cdn.shopify.com/videos/c/vp/25db8ce779f543c78ded8a11330f3e45/25db8ce779f543c78ded8a11330f3e45.HD-1080p-2.5Mbps-17248718.mp4' },
  { url: 'https://cdn.shopify.com/videos/c/vp/8ba298cf03bd46dcbc4202507f2873f9/8ba298cf03bd46dcbc4202507f2873f9.HD-1080p-2.5Mbps-17248725.mp4' },
  { url: 'https://cdn.shopify.com/videos/c/vp/5111cd94527c4d4c8cf3171cdbd04e2e/5111cd94527c4d4c8cf3171cdbd04e2e.HD-1080p-2.5Mbps-17248732.mp4' },
  
];

const VideoSlider2 = () => {
  // Store refs for each video
  const videoRefs = useRef([]);

  const handleMouseEnter = (idx) => {
    const video = videoRefs.current[idx];
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  };

  const handleMouseLeave = (idx) => {
    const video = videoRefs.current[idx];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex gap-2">
        {videos.map((video, idx) => (
          <div
            key={idx}
            className={`flex-shrink-0 w-[250px] h-[450px] relative bg-black${idx === 0 ? ' ml-4' : ''}`}
          >
            <video
              ref={el => (videoRefs.current[idx] = el)}
              src={video.url}
              className="w-full h-full object-cover cursor-pointer"
              muted
              loop
              playsInline
              preload="metadata"
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              style={{ display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSlider2;
