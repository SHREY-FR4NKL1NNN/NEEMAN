import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.variant_id === action.payload.variant_id
      );
      
      if (existingItemIndex >= 0) {
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { 
            ...action.payload, 
            quantity: action.payload.quantity || 1,
            variant_id: action.payload.variant_id || action.payload.id
          }]
        };
      }
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && item.variant_id === action.payload.variant_id)
        )
      };
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => 
            !(item.id === action.payload.id && item.variant_id === action.payload.variant_id)
          )
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && item.variant_id === action.payload.variant_id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('neemans_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neemans_cart', JSON.stringify(cart.items));
  }, [cart.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId, variantId = null) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: { 
        id: productId, 
        variant_id: variantId || productId 
      } 
    });
  };

  const updateQuantity = (productId, quantity, variantId = null) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { 
        id: productId, 
        quantity, 
        variant_id: variantId || productId 
      } 
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId, variantId = null) => {
    return cart.items.some(item => 
      item.id === productId && item.variant_id === (variantId || productId)
    );
  };

  const getItemQuantity = (productId, variantId = null) => {
    const item = cart.items.find(item => 
      item.id === productId && item.variant_id === (variantId || productId)
    );
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
