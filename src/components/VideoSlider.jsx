import React, { useRef, useState, useEffect } from 'react';
import MegaVideoSlider from './MegaVideoSlider';

const VideoSlider = () => {
  const [videos, setVideos] = useState([]);
  const [showMega, setShowMega] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetch('/data/videos.json')
      .then(res => res.json())
      .then(data => setVideos(data));
  }, []);

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

  const handleClick = (idx) => {
    setSelectedIdx(idx);
    setShowMega(true);
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
              src={video.previewVideo}
              className="w-full h-full object-cover cursor-pointer"
              muted
              loop
              playsInline
              preload="metadata"
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              onClick={() => handleClick(idx)}
              style={{ display: 'block' }}
            />
          </div>
        ))}
      </div>
      {showMega && (
        <MegaVideoSlider
          videos={videos}
          initialIndex={selectedIdx}
          onClose={() => setShowMega(false)}
        />
      )}
    </div>
  );
};

export default VideoSlider;
