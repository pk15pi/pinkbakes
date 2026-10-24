import { useState } from "react";
import { validateCart } from "../services/authService";
import { CART_QTY_MAX, cartLineKey, cartQtyCap, cartUnitPrice, cleanCartOptions } from "../appConstants";
import { isOutOfStock, normalizeProduct } from "../productUtils";

// Cart lines are keyed by product id + chosen options (size, eggless, message,
// delivery date) so the same cake with different choices stays on separate lines.
const lineIdOf = (entry) => entry.lineId || String(entry.id);
const productQtyInCart = (cart, productId, exceptLineId) =>
  cart.reduce((sum, entry) => (entry.id === productId && lineIdOf(entry) !== exceptLineId ? sum + entry.qty : sum), 0);

export default function useCart(notify) {
  const [cart, setCart] = useState([]);

  function addToCart(item, options) {
    const product = normalizeProduct(item);
    if (isOutOfStock(product)) {
      notify("This cake is currently out of stock.");
      return;
    }
    const chosen = cleanCartOptions(options);
    const lineId = cartLineKey(product.id, chosen);
    const available = Number(product.available_quantity ?? product.stock_remaining ?? 0);
    setCart(previous => {
      const found = previous.find(entry => lineIdOf(entry) === lineId);
      const nextQty = found ? found.qty + 1 : 1;
      const productTotal = productQtyInCart(previous, product.id, lineId) + nextQty;
      if (available > 0 && productTotal > available) {
        notify(`Only ${available} units of "${product.name}" are currently available.`);
        return previous;
      }
      const priced = {
        ...found,
        ...product,
        lineId,
        options: chosen,
        qty: nextQty,
        discounted_price: cartUnitPrice(product),
      };
      if (found) return previous.map(entry => lineIdOf(entry) === lineId ? priced : entry);
      return [...previous, priced];
    });
    notify(`${product.name} added to your cart`);
  }

  async function changeQty(lineId, delta) {
    const current = cart.find(item => lineIdOf(item) === lineId);
    if (!current) return;
    const nextQty = current.qty + delta;
    if (nextQty <= 0) {
      setCart(previous => previous.filter(item => lineIdOf(item) !== lineId));
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
      // Stock is per product, so validate the total across every line of this cake.
      const productTotal = productQtyInCart(cart, current.id, lineId) + nextQty;
      const result = await validateCart({ items: [{ id: current.id, quantity: productTotal }] });
      if (!result?.valid || result.ok === false) {
        notify(result?.detail || result?.message || "Not enough stock for that quantity.");
        return;
      }
      const available = result.items?.[0]?.available ?? current.available_quantity;
      setCart(previous => previous.map(item => lineIdOf(item) === lineId ? { ...item, qty: nextQty, available_quantity: available } : item));
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
