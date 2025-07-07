import React from 'react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product, addToCart, isInCart, getItemQuantity }) => {
    const price = parseFloat(product.variants[0]?.price || product.price)
    const comparePrice = parseFloat(product.variants[0]?.compare_at_price)
    const hasDiscount = comparePrice > price
    const discount = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

    return (
        <div key={product.id} className="bg-white border border-opacity-5 border-gray-200 overflow-hidden h-fit">
            <div className="relative">
                <Link to={`/product/${product.handle}`}>
                    <img
                        className="w-full h-auto object-cover"
                        src={product.images[0]?.src}
                        alt={product.title}
                    />
                </Link>
            </div>
            <div className="flex flex-col justify-between h-auto">
                {/* Rating */}
                <div className="flex items-center space-x-1 px-4 pt-1">
                    <span className="flex items-center gap-1 text-[0.5rem] font-semibold text-black">
                        <svg width="12" height="12" fill="#ffb400" viewBox="0 0 24 24">
                            <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.4 8.173L12 18.896l-7.334 3.86 1.4-8.173L.132 9.21l8.2-1.193z" />
                        </svg>
                        5.0 <span className="text-gray-500">(2)</span>
                    </span>
                </div>

                {/* Title and Price */}
                <div className="px-4 py-1">
                    <h4 className="text-xs font-semibold text-gray-800">{product.title}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                        <span className="text-[0.5625rem] font-semibold text-gray-900">₹{price.toLocaleString()}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-[0.5625rem] text-gray-400 line-through">₹{comparePrice.toLocaleString()}</span>
                                <span className="text-[0.625rem] text-green-600 font-bold">{discount}% OFF</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Add to Cart */}
                <div className="px-4 py-1">
                    <button
                        className="w-full flex items-center text-xs justify-center gap-2 border border-[#eee4d9] bg-[#f9f5f0] text-[#b9976f] font-semibold py-1"
                        onClick={() => addToCart(product)}
                        disabled={isInCart(product.id)}
                    >
                        <svg width="15" height="15" fill="none" stroke="#b9976f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {isInCart(product.id) ? "In Cart" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
