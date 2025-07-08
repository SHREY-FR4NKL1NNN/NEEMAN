import React, { useState, useEffect, useRef } from 'react';

const PlayPauseIcon = ({ isPlaying }) => (
  isPlaying ? (
    <svg viewBox="0 0 20 20" fill="white" width="18" height="18"><path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z"></path></svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="white" width="18" height="18"><path d="M10.047 3.062a.75.75 0 0 1 .453.688v12.5a.75.75 0 0 1-1.264.546L5.203 13H2.667a.75.75 0 0 1-.7-.48A6.985 6.985 0 0 1 1.5 10c0-.887.165-1.737.468-2.52a.75.75 0 0 1 .7-.48h2.535l4.033-3.796a.75.75 0 0 1 .811-.142Z"></path></svg>
  )
);

const MuteUnmuteIcon = ({ isMuted }) => (
  isMuted ? (
    <svg viewBox="0 0 20 20" fill="white" width="18" height="18"><path d="M10.047 3.062a.75.75 0 0 1 .453.688v12.5a.75.75 0 0 1-1.264.546L5.203 13H2.667a.75.75 0 0 1-.7-.48A6.985 6.985 0 0 1 1.5 10c0-.887.165-1.737.468-2.52a.75.75 0 0 1 .7-.48h2.535l4.033-3.796a.75.75 0 0 1 .811-.142ZM13.78 7.22a.75.75 0 1 0-1.06 1.06L14.44 10l-1.72 1.72a.75.75 0 0 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L16.56 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L15.5 8.94l-1.72-1.72Z"></path></svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="white" width="18" height="18"><path d="M10.047 3.062a.75.75 0 0 1 .453.688v12.5a.75.75 0 0 1-1.264.546L5.203 13H2.667a.75.75 0 0 1-.7-.48A6.985 6.985 0 0 1 1.5 10c0-.887.165-1.737.468-2.52a.75.75 0 0 1 .7-.48h2.535l4.033-3.796a.75.75 0 0 1 .811-.142Z"></path></svg>
  )
);

const CloseIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg>
);

const MegaVideoSlider = ({ videos, initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [transition, setTransition] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [descOpen, setDescOpen] = useState(false);
  const videoRef = useRef(null);
  const video = videos[current];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [current]);

  if (!video) return null;

  const prevIdx = (current - 1 + videos.length) % videos.length;
  const nextIdx = (current + 1) % videos.length;

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  const handleMuteUnmute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Smooth transition logic
  const handleSetCurrent = (idx, direction) => {
    setTransition(direction);
    setTimeout(() => {
      setCurrent(idx);
      setTransition('');
    }, 250);
  };

  // Handler for background click
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('megavideo-bg')) {
      onClose();
    }
  };

  // Sizes from product variants
  const sizes = video.product && video.product.variants
    ? video.product.variants.map(v => v.title)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 megavideo-bg" onClick={handleBackgroundClick}>
      {video.backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${video.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(24px) brightness(0.5)',
          }}
        />
      )}
      <button
        className="hidden md:flex fixed left-4 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 text-white hover:bg-opacity-90 z-40"
        onClick={() => handleSetCurrent(prevIdx, 'left')}
      >
        <span className="text-2xl">&#8592;</span>
      </button>
      <button
        className="hidden md:flex fixed right-4 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 text-white hover:bg-opacity-90 z-40"
        onClick={() => handleSetCurrent(nextIdx, 'right')}
      >
        <span className="text-2xl">&#8594;</span>
      </button>
      <div className="relative z-10 flex items-center justify-center w-full h-full gap-12">
        <div
          className="hidden md:flex flex-col items-center justify-center cursor-pointer mr-8"
          style={{ width: 180 }}
          onClick={() => handleSetCurrent(prevIdx, 'left')}
        >
          <video
            src={videos[prevIdx].megaVideo || videos[prevIdx].previewVideo}
            className="rounded-xl object-cover opacity-70 transition-all duration-300 border-4 border-transparent hover:border-white"
            style={{ width: 150, height: 240 }}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
        <div className="flex flex-col items-center relative h-full justify-center">
          <div className={`relative flex items-center justify-center h-full transition-all duration-300 ${transition === 'left' ? 'animate-slideLeft' : ''} ${transition === 'right' ? 'animate-slideRight' : ''}`}>
            <div className="relative w-full h-full max-w-[340px] max-h-[80vh] flex items-center justify-center">
              <video
                ref={videoRef}
                src={video.megaVideo || video.previewVideo}
                className="w-full h-full object-cover rounded-2xl shadow-2xl bg-black"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                controls={false}
                style={{ zIndex: 2, background: 'black' }}
                onClick={handlePlayPause}
              />
              {/* Top Left Controls */}
              <div className="absolute top-2 left-2 flex flex-col gap-2 z-30">
                <button
                  className="bg-transparent rounded-full p-1 text-white hover:bg-opacity-90"
                  onClick={handleMuteUnmute}
                  style={{ boxShadow: 'none' }}
                >
                  <MuteUnmuteIcon isMuted={isMuted} />
                </button>
              </div>
              {/* Top Right Controls */}
              <div className="absolute top-2 right-2 flex flex-row gap-2 z-30">
                <button
                  className="bg-transparent rounded-full p-1 text-white hover:bg-opacity-90"
                  onClick={handlePlayPause}
                  style={{ boxShadow: 'none' }}
                >
                  <PlayPauseIcon isPlaying={isPlaying} />
                </button>
                <button
                  className="bg-transparent rounded-full p-1 text-white hover:bg-opacity-90"
                  onClick={onClose}
                  style={{ boxShadow: 'none' }}
                >
                  <CloseIcon />
                </button>
              </div>
              {/* Bottom Overlay Product Info */}
              {video.product && video.product.variants && video.product.variants.length > 0 && !showCartModal && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] bg-white/50 rounded-xl p-2 flex flex-col items-start shadow-lg backdrop-blur-sm z-30 text-xs border border-white/30">
                  <div className="flex items-center w-full gap-2">
                    <img src={
                      (video.product.images && video.product.images.length > 0 && video.product.images[0].src)
                      || '/fallback.jpg'
                    } alt={video.product.title} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="font-bold text-[15px] text-black leading-tight mb-1">{video.product.title}</div>
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="font-bold text-black">₹ {video.product.variants[0].price}</span>
                        <span className="line-through text-gray-500">₹ {video.product.variants[0].compare_at_price}</span>
                        <span className="text-green-600 font-semibold">
                          {video.product.variants[0].compare_at_price && video.product.variants[0].price ?
                            `${Math.round(100 - (parseFloat(video.product.variants[0].price) / parseFloat(video.product.variants[0].compare_at_price)) * 100)}% OFF` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-2 bg-black bg-opacity-90 text-white py-2 rounded font-semibold text-[16px] transition hover:bg-opacity-100" onClick={() => setShowCartModal(true)}>Add To Cart</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="hidden md:flex flex-col items-center justify-center cursor-pointer ml-8"
          style={{ width: 180 }}
          onClick={() => handleSetCurrent(nextIdx, 'right')}
        >
          <video
            src={videos[nextIdx].megaVideo || videos[nextIdx].previewVideo}
            className="rounded-xl object-cover opacity-70 transition-all duration-300 border-4 border-transparent hover:border-white"
            style={{ width: 150, height: 240 }}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </div>
      <button
        className="md:hidden absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 text-white hover:bg-opacity-90 z-20"
        onClick={() => handleSetCurrent(prevIdx, 'left')}
      >
        <span className="text-2xl">&#8592;</span>
      </button>
      <button
        className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 text-white hover:bg-opacity-90 z-20"
        onClick={() => handleSetCurrent(nextIdx, 'right')}
      >
        <span className="text-2xl">&#8594;</span>
      </button>
      {/* Animation keyframes for slide transitions */}
      <style>{`
        @keyframes slideLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-60px); } }
        @keyframes slideRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(60px); } }
        .animate-slideLeft { animation: slideLeft 0.25s; }
        .animate-slideRight { animation: slideRight 0.25s; }
      `}</style>
      {/* Add To Cart Modal UI (fixed to bottom inside video div, slides up, matches video size) */}
      {showCartModal && video.product && video.product.variants && video.product.variants.length > 0 && (
        <div className="absolute inset-0 flex items-end justify-center z-50 pointer-events-none" style={{pointerEvents: 'none'}}>
          <div className={`absolute left-0 bottom-0 w-full h-full bg-transparent flex items-end justify-center pointer-events-none`}>
            <div className={`relative w-full h-full flex items-end justify-center`}>
              <div className={`absolute left-0 bottom-0 w-full h-full bg-transparent flex items-end justify-center pointer-events-none`}>
                <div className={`absolute left-0 bottom-0 w-full h-1/2 bg-white rounded-t-2xl shadow-2xl pointer-events-auto transition-transform duration-300 ${showCartModal ? 'translate-y-0 animate-slideUpFixed' : 'translate-y-full'}`} style={{minHeight: '220px', maxHeight: '340px'}}>
                  {/* Dropdown/close button at the top */}
                  <button
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xl text-gray-700 shadow hover:bg-gray-300 transition"
                    onClick={() => setShowCartModal(false)}
                    aria-label="Close Add To Cart"
                    style={{zIndex: 10}}
                  >
                    <span style={{fontSize: '22px', lineHeight: 1}}>⌄</span>
                  </button>
                  <div className="w-full flex flex-col items-center mt-8 px-4">
                    <img src={
                      (video.product.images && video.product.images.length > 0 && video.product.images[0].src)
                      || '/fallback.jpg'
                    } alt={video.product.title} className="w-32 h-24 object-contain rounded mb-2" />
                    <div className="font-bold text-base text-black text-center mb-1">{video.product.title}</div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-bold text-black">₹ {video.product.variants[0].price}</span>
                      <span className="line-through text-gray-500">₹ {video.product.variants[0].compare_at_price}</span>
                      <span className="text-green-600 font-semibold">
                        {video.product.variants[0].compare_at_price && video.product.variants[0].price ?
                          `${Math.round(100 - (parseFloat(video.product.variants[0].price) / parseFloat(video.product.variants[0].compare_at_price)) * 100)}% OFF` : ''}
                      </span>
                    </div>
                    <div className="w-full border-t border-gray-200 my-2" />
                    <div className="w-full font-semibold text-[14px] mb-2">Size:</div>
                    <div className="w-full grid grid-cols-3 gap-2 mb-2">
                      {sizes.map(size => (
                        <button
                          key={size}
                          className={`border rounded-full px-3 py-1 text-[14px] font-medium transition ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div className="w-full border-t border-gray-200 my-2" />
                    <button
                      className="w-full flex items-center justify-between font-semibold text-[14px] mb-2 focus:outline-none"
                      onClick={() => setDescOpen(v => !v)}
                      aria-expanded={descOpen}
                      aria-controls="desc-content"
                      type="button"
                    >
                      <span>Description</span>
                      <span className={`transition-transform ${descOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {descOpen && (
                      <div id="desc-content" className="w-full text-[13px] text-gray-700 mb-2 animate-fadeIn">
                        <div dangerouslySetInnerHTML={{__html: video.product.body_html}} />
                      </div>
                    )}
                    <button
                      className={`w-full mt-2 bg-black ${selectedSize ? 'bg-opacity-90' : 'bg-opacity-40'} text-white py-2 rounded font-semibold text-[15px] transition hover:bg-opacity-100 flex items-center justify-center`}
                      disabled={!selectedSize}
                    >
                      Add To Cart
                    </button>
                  </div>
                  <style>{`
                    .animate-fadeIn { animation: fadeInModal 0.3s; }
                    @keyframes fadeInModal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-slideUpFixed { animation: slideUpModalFixed 0.3s; }
                    @keyframes slideUpModalFixed { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                  `}</style>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaVideoSlider; 