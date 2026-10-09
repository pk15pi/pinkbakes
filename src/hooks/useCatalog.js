import { useCallback, useEffect, useRef, useState } from "react";
import { asListResponse, fetchCategories, fetchProducts } from "../services/authService";
import { catalogLoadErrorMessage, mapShopCategories } from "../appConstants";
import { normalizeProduct } from "../productUtils";

export default function useCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [shopCategories, setShopCategories] = useState([]);
  const catalogRequestRef = useRef(0);
  const catalogAbortRef = useRef(null);

  const loadCatalog = useCallback(() => {
    catalogAbortRef.current?.abort();
    const controller = new AbortController();
    catalogAbortRef.current = controller;
    const requestId = ++catalogRequestRef.current;
    const isCurrent = () => catalogRequestRef.current === requestId && !controller.signal.aborted;

    setCatalogLoading(true);
    setCategoriesLoading(true);
    setCatalogError("");

    let productsSettled = false;
    let categoriesApplied = false;
    let loadedItems = [];
    const watchdog = setTimeout(() => {
      if (!isCurrent()) return;
      if (!productsSettled) {
        setCatalogLoading(false);
        setCatalogError(current => current || "Loading cakes took too long. Please retry.");
      }
      if (!categoriesApplied) {
        setShopCategories(mapShopCategories([], loadedItems));
        setCategoriesLoading(false);
      }
    }, 10000);

    const productsTask = fetchProducts({}, { signal: controller.signal })
      .then(data => ({ ok: true, items: asListResponse(data) }))
      .catch(error => ({ ok: false, error }));

    const categoriesTask = fetchCategories({ signal: controller.signal })
      .then(data => ({ ok: true, items: asListResponse(data) }))
      .catch(() => ({ ok: false, items: [] }));

    productsTask.then(result => {
      if (!isCurrent()) return;
      productsSettled = true;
      if (result.ok) {
        loadedItems = result.items;
        setCatalog(result.items.map(normalizeProduct));
        setCatalogError("");
      } else if (result.error?.name !== "AbortError") {
        setCatalogError(catalogLoadErrorMessage(result.error));
      }
      setCatalogLoading(false);
    });

    Promise.all([productsTask, categoriesTask]).then(([productsResult, categoriesResult]) => {
      if (!isCurrent()) return;
      clearTimeout(watchdog);
      categoriesApplied = true;
      const items = productsResult.ok ? productsResult.items : loadedItems;
      const fromApi = categoriesResult.ok ? categoriesResult.items : [];
      setShopCategories(mapShopCategories(fromApi, items));
      setCategoriesLoading(false);
      if (productsResult.ok) setCatalogError("");
    });
  }, []);

  useEffect(() => {
    loadCatalog();
    return () => {
      catalogRequestRef.current += 1;
      catalogAbortRef.current?.abort();
    };
  }, [loadCatalog]);

  return {
    catalog,
    setCatalog,
    catalogLoading,
    categoriesLoading,
    catalogError,
    shopCategories,
    loadCatalog,
  };
}
