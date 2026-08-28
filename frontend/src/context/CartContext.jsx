import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "aurelia_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, size = "", color = "") => {
    setItems((prev) => {
      const key = `${product._id}-${size}-${color}`;
      const existing = prev.find((i) => `${i.product}-${i.size}-${i.color}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.product}-${i.size}-${i.color}` === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.discountPrice > 0 ? product.discountPrice : product.price,
          size,
          color,
          quantity,
          stock: product.stock,
        },
      ];
    });
  };

  const removeFromCart = (product, size, color) => {
    setItems((prev) => prev.filter((i) => !(i.product === product && i.size === size && i.color === color)));
  };

  const updateQuantity = (product, size, color, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.product === product && i.size === size && i.color === color ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemsCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
