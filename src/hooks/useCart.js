import { useEffect, useRef, useState } from "react";
import { fetchServerCart, mergeServerCart, replaceServerCart, validateCart } from "../services/authService";
import { CART_QTY_MAX, cartLineKey, cartQtyCap, cartUnitPrice, cleanCartOptions, hasSizePrices, sizeListPrice } from "../appConstants";
import { isOutOfStock, normalizeProduct } from "../productUtils";

// Cart lines are keyed by product id + chosen options (size, eggless, message,
// delivery date) so the same cake with different choices stays on separate lines.
const lineIdOf = (entry) => entry.lineId || String(entry.id);
const productQtyInCart = (cart, productId, exceptLineId) =>
  cart.reduce((sum, entry) => (entry.id === productId && lineIdOf(entry) !== exceptLineId ? sum + entry.qty : sum), 0);

// Guests: the cart is saved per browser. Signed-in customers: the cart is saved on
// the server (and the browser copy is merged in, then removed). Either way only
// product id, options and quantity are stored; prices always come from the server.
export const CART_STORAGE_KEY = "pinkbakes_cart_v1";
const CART_STORAGE_MAX_LINES = 50;

function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "null");
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.items)) return [];
    return parsed.items
      .filter(entry => entry && (typeof entry.id === "number" || typeof entry.id === "string") && String(entry.id).length > 0)
      .map(entry => ({
        id: entry.id,
        options: cleanCartOptions(entry.options),
        qty: Math.min(CART_QTY_MAX, Math.max(1, Math.floor(Number(entry.qty) || 0))),
      }))
      .filter(entry => Number(entry.qty) >= 1)
      .slice(0, CART_STORAGE_MAX_LINES);
  } catch {
    return [];
  }
}

function writeStoredCart(cart) {
  try {
    if (!cart.length) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    const items = cart.map(item => ({ id: item.id, options: item.options || null, qty: item.qty }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ v: 1, items }));
  } catch {
    // Storage full or blocked (private mode): the cart still works in memory.
  }
}

// Rebuild saved lines from the current catalog; drop anything no longer sellable.
function repriceStoredCart(stored, catalog) {
  const byId = new Map(catalog.map(product => [String(product.id), product]));
  const restored = [];
  let dropped = 0;
  for (const entry of stored) {
    const product = byId.get(String(entry.id));
    if (!product || isOutOfStock(product)) { dropped += 1; continue; }
    const size = entry.options?.size;
    if (size && hasSizePrices(product) && sizeListPrice(product, size) == null) { dropped += 1; continue; }
    const lineId = cartLineKey(product.id, entry.options);
    if (restored.some(line => line.lineId === lineId)) continue;
    const already = restored.reduce((sum, line) => (line.id === product.id ? sum + line.qty : sum), 0);
    const qty = Math.min(entry.qty, cartQtyCap(product) - already);
    if (qty <= 0) { dropped += 1; continue; }
    restored.push({ ...product, lineId, options: entry.options, qty, discounted_price: cartUnitPrice(product) });
  }
  return { restored, dropped };
}

const SERVER_SYNC_DELAY_MS = 600;
const REMOVED_NOTICE = "Some items in your saved cart are no longer available and were removed.";
const toServerItems = (lines) => lines.map(line => ({ id: line.id, options: line.options || null, quantity: line.qty }));

function fromServerLine(row) {
  const product = normalizeProduct(row.product || { id: row.id });
  const options = cleanCartOptions(row.options);
  return {
    ...product,
    lineId: cartLineKey(product.id, options),
    options,
    qty: Number(row.quantity) || 1,
    discounted_price: Number(row.unit_price),
  };
}

export default function useCart(notify, catalog = [], catalogLoading = false, userId = null) {
  const [cart, setCart] = useState([]);
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const serverModeRef = useRef(false);
  const applyingServerRef = useRef(false);
  const syncTimerRef = useRef(null);
  const syncSeqRef = useRef(0);
  const prevUserRef = useRef(null);

  function applyServerCart(data) {
    const rows = Array.isArray(data?.items) ? data.items : [];
    applyingServerRef.current = true;
    setCart(rows.map(fromServerLine));
    if (data?.removed?.length) notify(REMOVED_NOTICE);
  }
  // Saved lines waiting for the catalog; false once restored.
  const pendingRef = useRef(undefined);
  if (pendingRef.current === undefined) pendingRef.current = readStoredCart();

  useEffect(() => {
    const stored = pendingRef.current;
    if (!stored || catalogLoading || !catalog?.length) return;
    pendingRef.current = false;
    if (!stored.length) return;
    const { restored, dropped } = repriceStoredCart(stored, catalog);
    setCart(previous => [
      ...restored.filter(line => !previous.some(entry => lineIdOf(entry) === line.lineId)),
      ...previous,
    ]);
    if (dropped) notify("Some items in your saved cart are no longer available and were removed.");
  }, [catalog, catalogLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sign-in / session restore: merge the browser cart into the saved cart.
  // Sign-out: clear the cart shown in this browser.
  useEffect(() => {
    const token = localStorage.getItem("pinkbakes_token");
    if (userId && token) {
      // Guest lines may still be in storage, in memory, or both (mid-restore);
      // take each line once so the merge doesn't double it.
      const stored = readStoredCart() || [];
      pendingRef.current = false;
      const byKey = new Map();
      [...stored.map(entry => ({ id: entry.id, options: entry.options, quantity: entry.qty })), ...toServerItems(cartRef.current)]
        .forEach(line => {
          const key = cartLineKey(line.id, cleanCartOptions(line.options));
          const seen = byKey.get(key);
          if (!seen || line.quantity > seen.quantity) byKey.set(key, line);
        });
      const guest = [...byKey.values()];
      (guest.length ? mergeServerCart(token, guest) : fetchServerCart(token))
        .then(data => {
          if (localStorage.getItem("pinkbakes_token") !== token) return;
          serverModeRef.current = true;
          try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* ignore */ }
          applyServerCart(data);
        })
        .catch(() => notify("We couldn't load your saved cart. Please refresh to try again."));
    } else if (!userId && prevUserRef.current) {
      serverModeRef.current = false;
      clearTimeout(syncTimerRef.current);
      syncSeqRef.current += 1;
      setCart([]);
    }
    prevUserRef.current = userId || null;
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (serverModeRef.current) {
      if (applyingServerRef.current) {
        applyingServerRef.current = false;
        return;
      }
      // Debounced save of the whole cart; the server re-prices and reports removals.
      clearTimeout(syncTimerRef.current);
      const seq = ++syncSeqRef.current;
      syncTimerRef.current = setTimeout(() => {
        const token = localStorage.getItem("pinkbakes_token");
        if (!token || !serverModeRef.current) return;
        replaceServerCart(token, toServerItems(cartRef.current))
          .then(data => {
            if (seq !== syncSeqRef.current) return;
            if (data?.removed?.length || data?.adjusted?.length) applyServerCart(data);
          })
          .catch(() => {});
      }, SERVER_SYNC_DELAY_MS);
      return;
    }
    // Don't overwrite the saved browser cart until it has been restored.
    if (pendingRef.current) return;
    writeStoredCart(cart);
  }, [cart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(syncTimerRef.current), []);

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
