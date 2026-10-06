/**
 * Resolve GLB/GLTF path for a catalog product.
 *
 * Priority:
 * 1. Explicit product fields: model, modelUrl, model_url, modelPath, model_path, glb, gltf
 * 2. public/models/cakes/cake-product-map.json — array of { product_id, product_slug, model_path }
 *    (see CAKE_PRODUCT_MAP.md). Lookup by product_id, then product_slug.
 *
 * No alternate/invented mappings. If no entry, returns null → CSS rotate fallback.
 */

const MAP_URL = "/models/cakes/cake-product-map.json";
const MODELS_BASE = "/models/cakes";

let mapPromise = null;

function normalizeModelPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("models/")) return `/${trimmed}`;
  if (trimmed.startsWith("cakes/")) return `/models/${trimmed}`;
  return `${MODELS_BASE}/${trimmed.replace(/^\.?\/+/, "")}`;
}

function readExplicitProductModel(product) {
  if (!product || typeof product !== "object") return null;
  const candidates = [
    product.model,
    product.modelUrl,
    product.model_url,
    product.modelPath,
    product.model_path,
    product.glb,
    product.gltf,
  ];
  for (const c of candidates) {
    const path = normalizeModelPath(c);
    if (path) return path;
  }
  return null;
}

function indexMap(raw) {
  const byId = Object.create(null);
  const bySlug = Object.create(null);
  if (!raw) return { byId, bySlug };

  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.mappings)
      ? raw.mappings
      : Array.isArray(raw.items)
        ? raw.items
        : null;

  if (rows) {
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const path = normalizeModelPath(row.model_path || row.modelPath || row.path);
      if (!path) continue;
      const id = row.product_id ?? row.productId ?? row.id;
      if (id != null && id !== "") byId[String(id)] = path;
      const slug = (row.product_slug || row.productSlug || row.slug || "").trim();
      if (slug) bySlug[slug] = path;
    }
    return { byId, bySlug };
  }

  // Legacy object shapes: { byId, bySlug } or flat id/slug → path
  const nestedId = raw.byId || raw.by_id || raw.ids;
  const nestedSlug = raw.bySlug || raw.by_slug || raw.slugs;
  if (nestedId && typeof nestedId === "object") {
    for (const [k, v] of Object.entries(nestedId)) {
      const path = normalizeModelPath(v);
      if (path) byId[String(k)] = path;
    }
  }
  if (nestedSlug && typeof nestedSlug === "object") {
    for (const [k, v] of Object.entries(nestedSlug)) {
      const path = normalizeModelPath(v);
      if (path) bySlug[k] = path;
    }
  }
  return { byId, bySlug };
}

async function loadCakeProductMap() {
  if (!mapPromise) {
    mapPromise = fetch(MAP_URL, { cache: "no-cache" })
      .then(async (res) => {
        if (!res.ok) return { byId: Object.create(null), bySlug: Object.create(null) };
        try {
          return indexMap(await res.json());
        } catch {
          return { byId: Object.create(null), bySlug: Object.create(null) };
        }
      })
      .catch(() => ({ byId: Object.create(null), bySlug: Object.create(null) }));
  }
  return mapPromise;
}

export function invalidateCakeProductMapCache() {
  mapPromise = null;
}

/**
 * @param {object} product
 * @returns {Promise<string|null>}
 */
export async function resolveProductModelUrl(product) {
  const explicit = readExplicitProductModel(product);
  if (explicit) return explicit;

  const { byId, bySlug } = await loadCakeProductMap();
  const idKey = product?.id != null ? String(product.id) : "";
  if (idKey && byId[idKey]) return byId[idKey];

  const slugKey = (product?.slug || "").trim();
  if (slugKey && bySlug[slugKey]) return bySlug[slugKey];

  return null;
}

export { MAP_URL };