import { useCallback, useEffect, useState } from "react";
import { fetchProduct, fetchProductBySlug } from "../services/authService";
import { normalizeProduct } from "../productUtils";
import { parseProductPath, productPath } from "../seo";

export default function useProductRoute(catalog, catalogLoading) {
  const [product, setProduct] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);

  const openProduct = useCallback((item, { pushUrl = true } = {}) => {
    if (!item) return;
    setProductNotFound(false);
    setProduct(item);
    if (pushUrl) {
      const next = productPath(item);
      try {
        if ((window.location.pathname || "") !== next) {
          window.history.pushState({ product: true }, "", next);
        }
      } catch (_) { /* ignore */ }
    }
  }, []);

  const closeProduct = useCallback(() => {
    setProduct(null);
    setProductNotFound(false);
    try {
      const path = window.location.pathname || "";
      if (parseProductPath(path)) {
        window.history.pushState({}, "", "/");
      }
    } catch (_) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (catalogLoading) return;

    const resolveFromPath = () => {
      const key = parseProductPath(window.location.pathname || "");
      if (!key) {
        setProductNotFound(false);
        return;
      }
      const bySlug = catalog.find(item => item.slug && item.slug === key);
      const byId = catalog.find(item => String(item.id) === String(key));
      const found = bySlug || byId;
      if (found) {
        openProduct(found, { pushUrl: false });
        return;
      }
      const loader = /^\d+$/.test(key) ? fetchProduct(key) : fetchProductBySlug(key);
      loader
        .then(data => openProduct(normalizeProduct(data), { pushUrl: false }))
        .catch(() => {
          setProduct(null);
          setProductNotFound(true);
        });
    };

    resolveFromPath();
    const onPop = () => {
      const key = parseProductPath(window.location.pathname || "");
      if (!key) {
        setProduct(null);
        setProductNotFound(false);
        return;
      }
      resolveFromPath();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [catalogLoading, catalog, openProduct]);

  return { product, productNotFound, openProduct, closeProduct };
}
