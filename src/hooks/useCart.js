import { useState } from "react";
import { validateCart } from "../services/authService";
import { CART_QTY_MAX, cartQtyCap, cartUnitPrice } from "../appConstants";
import { isOutOfStock, normalizeProduct } from "../productUtils";

export default function useCart(notify) {
  const [cart, setCart] = useState([]);

  function addToCart(item) {
    const product = normalizeProduct(item);
    if (isOutOfStock(product)) {
      notify("This cake is currently out of stock.");
      return;
    }
    const available = Number(product.available_quantity ?? product.stock_remaining ?? 0);
    setCart(previous => {
      const found = previous.find(entry => entry.id === product.id);
      const nextQty = found ? found.qty + 1 : 1;
      if (available > 0 && nextQty > available) {
        notify(`Only ${available} units of "${product.name}" are currently available.`);
        return previous;
      }
      const priced = {
        ...found,
        ...product,
        qty: nextQty,
        size: found?.size || "1 kg",
        discounted_price: cartUnitPrice(product),
      };
      if (found) return previous.map(entry => entry.id === product.id ? priced : entry);
      return [...previous, priced];
    });
    notify(`${product.name} added to your cart`);
  }

  async function changeQty(id, delta) {
    const current = cart.find(item => item.id === id);
    if (!current) return;
    const nextQty = current.qty + delta;
    if (nextQty <= 0) {
      setCart(previous => previous.filter(item => item.id !== id));
      return;
    }
    const maxAllowed = cartQtyCap(current);
    if (delta > 0 && current.qty >= maxAllowed) {
      const stock = Number(current.available_quantity ?? current.stock_remaining ?? 0);
      notify(
        stock > 0 && stock < CART_QTY_MAX
          ? `Only ${stock} units available.`
          : `Maximum quantity is ${CART_QTY_MAX}.`
      );
      return;
    }
    try {
      const result = await validateCart({ items: [{ id, quantity: nextQty }] });
      if (!result?.valid || result.ok === false) {
        notify(result?.detail || result?.message || "Not enough stock for that quantity.");
        return;
      }
      const available = result.items?.[0]?.available ?? current.available_quantity;
      setCart(previous => previous.map(item => item.id === id ? { ...item, qty: nextQty, available_quantity: available } : item));
    } catch (error) {
      notify(error.message || "Unable to validate cart quantity.");
    }
  }

  return {
    cart,
    setCart,
    cartCount: cart.reduce((count, item) => count + item.qty, 0),
    cartTotal: cart.reduce((total, item) => total + cartUnitPrice(item) * item.qty, 0),
    addToCart,
    changeQty,
  };
}
