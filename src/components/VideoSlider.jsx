import React, { useRef } from 'react';

const videos = [
  { url: 'https://cdn.shopify.com/videos/c/vp/3d95c2163e4b4c31850fe708dc0ee2a7/3d95c2163e4b4c31850fe708dc0ee2a7.HD-1080p-2.5Mbps-28939349.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/2f370722f4b74d2a8974f97fa22f9c28/2f370722f4b74d2a8974f97fa22f9c28.HD-1080p-2.5Mbps-28939360.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/e9a79fda28a2477fab943c01784152b9/e9a79fda28a2477fab943c01784152b9.HD-1080p-2.5Mbps-28939370.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/6d853c4694bc485a9106d77bc8088a67/6d853c4694bc485a9106d77bc8088a67.HD-1080p-2.5Mbps-28939387.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/1e8d0191623e4264ae9503d300b0e5ca/1e8d0191623e4264ae9503d300b0e5ca.HD-1080p-2.5Mbps-28939399.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/de8e6ffb59df4abd9e7a63941f7f8198/de8e6ffb59df4abd9e7a63941f7f8198.HD-1080p-2.5Mbps-26930307.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/7c1ccdb6d5b248e58055b4f8a3db0235/7c1ccdb6d5b248e58055b4f8a3db0235.HD-720p-1.6Mbps-26930323.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/f710d60bf1c3438489562776a0a9b73f/f710d60bf1c3438489562776a0a9b73f.HD-1080p-2.5Mbps-26930338.mp4#t=0.1' },
  { url: 'https://cdn.shopify.com/videos/c/vp/f97a852f4c4845498f283ccc7805f97a/f97a852f4c4845498f283ccc7805f97a.HD-1080p-2.5Mbps-26710805.mp4'},
  {url : 'https://cdn.shopify.com/videos/c/vp/7e1a3e02e1f741a587079c3f963134e3/7e1a3e02e1f741a587079c3f963134e3.HD-1080p-2.5Mbps-26710798.mp4'},
  {url :'https://cdn.shopify.com/videos/c/vp/471c21d6e9754c1d8f7affdbad850d5c/471c21d6e9754c1d8f7affdbad850d5c.HD-1080p-2.5Mbps-26930442.mp4'},
  {url: 'https://cdn.shopify.com/videos/c/vp/a1c591a6c34448b89fa149ecb70ff1d2/a1c591a6c34448b89fa149ecb70ff1d2.HD-1080p-2.5Mbps-26710846.mp4'},
  {url : 'https://cdn.shopify.com/videos/c/vp/ff1f9a8ddce64f7fbba5893ed45bdb93/ff1f9a8ddce64f7fbba5893ed45bdb93.HD-1080p-2.5Mbps-26710881.mp4'}
];

const VideoSlider = () => {
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

export default VideoSlider;
