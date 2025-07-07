import React, { useRef } from 'react';

const StoryView = ({ videoUrl, imageUrl }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.loop = false;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-full py-24 flex justify-center items-center" style={{ backgroundColor: '#e4e6f0' }}>
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center md:items-stretch gap-12 md:gap-20 px-4 md:px-0">
        {/* Video Section (left, larger) */}
        <div className="flex-[2] flex items-center justify-center">
          <div className="w-full max-w-3xl aspect-video bg-black overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>
        {/* Image Section (right) */}
        <div className="flex-1 flex items-center justify-center">
          <img src={imageUrl} alt="Story visual" className="w-full h-auto max-h-[600px] object-contain" />
        </div>
      </div>
    </div>
  );
};

export default StoryView; 