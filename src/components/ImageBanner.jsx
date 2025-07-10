import React from 'react';

const ImageBanner = ({ imageUrl, alt = "Banner", style = {} }) => {
  return (
    <div className="w-full" style={style}>
      <img src={imageUrl} alt={alt} className="w-full h-auto object-cover block" />
    </div>
  );
};

export default ImageBanner;