import { useEffect, useMemo, useRef, useState } from "react";
import { addWishlistItem, fetchWishlist, mergeWishlist, removeWishlistItem } from "../services/authService";
import { normalizeProduct } from "../productUtils";

// Mirrors the cart: guests keep product ids in this browser; signed-in customers keep
// them on the server (the browser list is merged in at sign-in, then removed).
export const WISHLIST_STORAGE_KEY = "pinkbakes_wishlist";
const WISHLIST_STORAGE_MAX = 100;

function readStoredWishlist() {
  try {
    const items = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
    if (!Array.isArray(items)) return [];
    return [...new Set(items.map(String).filter(id => /^\d+$/.test(id)))].slice(0, WISHLIST_STORAGE_MAX);
  } catch {
    return [];
  }
}

function writeStoredWishlist(ids) {
  try {
    if (!ids.length) localStorage.removeItem(WISHLIST_STORAGE_KEY);
    else localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: the list still works for this visit.
  }
}

export default function useWishlist(notify, catalog = [], userId = null) {
  const [ids, setIds] = useState(readStoredWishlist);
  const [serverProducts, setServerProducts] = useState({});
  const serverModeRef = useRef(false);
  const prevUserRef = useRef(null);
  const idsRef = useRef(ids);
  idsRef.current = ids;

  function applyServer(data) {
    if (!Array.isArray(data?.items)) return;
    const rows = data.items;
    const products = {};
    rows.forEach(row => { products[String(row.id)] = { ...normalizeProduct(row.product || { id: row.id }), wishlist_in_stock: row.in_stock }; });
    setServerProducts(products);
    setIds(rows.map(row => String(row.id)));
    if (data?.removed?.length) notify("Some cakes in your wishlist are no longer available and were removed.");
  }

  useEffect(() => {
    const token = localStorage.getItem("pinkbakes_token");
    if (userId && token) {
      const guest = [...new Set([...readStoredWishlist(), ...(serverModeRef.current ? [] : idsRef.current)])];
      (guest.length ? mergeWishlist(token, guest) : fetchWishlist(token))
        .then(data => {
          if (localStorage.getItem("pinkbakes_token") !== token) return;
          serverModeRef.current = true;
          try { localStorage.removeItem(WISHLIST_STORAGE_KEY); } catch { /* ignore */ }
          applyServer(data);
        })
        .catch(() => notify("We couldn't load your wishlist. Please refresh to try again."));
    } else if (!userId && prevUserRef.current) {
      // Signed out: the saved list stays on the account; clear it from this browser's view.
      serverModeRef.current = false;
      setIds([]);
      setServerProducts({});
    }
    prevUserRef.current = userId || null;
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!serverModeRef.current) writeStoredWishlist(ids);
  }, [ids]);

  const items = useMemo(() => {
    const byId = new Map((catalog || []).map(product => [String(product.id), product]));
    return ids
      .map(id => byId.get(id) || serverProducts[id])
      .filter(Boolean);
  }, [ids, catalog, serverProducts]);

  function isWishlisted(productId) {
    return ids.includes(String(productId));
  }

  function setMembership(product, wanted) {
    const id = String(product.id);
    const has = idsRef.current.includes(id);
    if (has === wanted) return;
    const previous = idsRef.current;
    if (!wanted && previous.length === 0) return;
    if (wanted && previous.length >= WISHLIST_STORAGE_MAX) {
      notify(`Your wishlist can hold up to ${WISHLIST_STORAGE_MAX} cakes.`);
      return;
    }
    setIds(wanted ? [id, ...previous] : previous.filter(item => item !== id));
    const token = localStorage.getItem("pinkbakes_token");
    if (serverModeRef.current && token) {
      (wanted ? addWishlistItem(token, product.id) : removeWishlistItem(token, product.id))
        .then(data => applyServer(data))
        .catch(error => {
          setIds(previous);
          notify(error?.message || "We couldn't update your wishlist. Please try again.");
        });
    }
  }

  function toggleWishlist(event, product) {
    event?.stopPropagation?.();
    const adding = !isWishlisted(product.id);
    setMembership(product, adding);
    notify(adding ? `Added "${product.name}" to wishlist` : `Removed "${product.name}" from wishlist`);
  }

  function removeFromWishlist(product, { silent = false } = {}) {
    setMembership(product, false);
    if (!silent) notify(`Removed "${product.name}" from wishlist`);
  }

  function addToWishlist(product, { silent = false } = {}) {
    setMembership(product, true);
    if (!silent) notify(`Moved "${product.name}" to wishlist`);
  }

  return { wishlist: ids, wishlistItems: items, isWishlisted, toggleWishlist, removeFromWishlist, addToWishlist };
}
