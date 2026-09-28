/**
 * Lightweight document-head helper for the PinkBakes SPA.
 * Equivalent to a head manager (no react-helmet dependency).
 * Always escapes text before writing into meta/JSON-LD.
 */

export const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://pinkbakes.com").replace(/\/$/, "");
export const BRAND = "pinkbakes";
export const DEFAULT_DESCRIPTION =
  "pinkbakes — handcrafted cakes for birthdays, anniversaries, weddings, and custom celebrations.";

let jsonLdNodes = [];

function ensureMetaByName(name) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
}

function ensureMetaByProperty(property) {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  return el;
}

function ensureLink(rel) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

/** Escape for HTML attribute / text content contexts. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip tags and collapse whitespace for meta / JSON-LD text fields. */
export function plainText(value, maxLen = 300) {
  let text = String(value ?? "").replace(/<[^>]*>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLen) {
    text = text.slice(0, maxLen - 1).trimEnd() + "…";
  }
  return text;
}

function setJsonLd(blocks) {
  jsonLdNodes.forEach((n) => n.remove());
  jsonLdNodes = [];
  (blocks || []).filter(Boolean).forEach((block) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(block).replace(/</g, "\\u003c");
    document.head.appendChild(script);
    jsonLdNodes.push(script);
  });
}

/**
 * Update document title, robots, canonical, Open Graph, Twitter, and JSON-LD.
 */
export function setPageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  robots = "index,follow",
  image,
  type = "website",
  jsonLd = [],
} = {}) {
  const safeTitle = plainText(title || BRAND, 70);
  const safeDesc = plainText(description || DEFAULT_DESCRIPTION, 160);
  document.title = safeTitle;

  ensureMetaByName("description").setAttribute("content", safeDesc);
  ensureMetaByName("robots").setAttribute("content", robots);
  ensureMetaByName("twitter:card").setAttribute("content", image ? "summary_large_image" : "summary");
  ensureMetaByName("twitter:title").setAttribute("content", safeTitle);
  ensureMetaByName("twitter:description").setAttribute("content", safeDesc);

  ensureMetaByProperty("og:title").setAttribute("content", safeTitle);
  ensureMetaByProperty("og:description").setAttribute("content", safeDesc);
  ensureMetaByProperty("og:type").setAttribute("content", type || "website");
  ensureMetaByProperty("og:site_name").setAttribute("content", BRAND);

  let canon = canonical || SITE_URL + "/";
  if (canon.startsWith("/")) canon = SITE_URL + canon;
  ensureLink("canonical").setAttribute("href", canon);
  ensureMetaByProperty("og:url").setAttribute("content", canon);

  if (image) {
    ensureMetaByProperty("og:image").setAttribute("content", image);
    ensureMetaByName("twitter:image").setAttribute("content", image);
  }

  setJsonLd(jsonLd);
}

export function absoluteUrl(path) {
  if (!path) return SITE_URL + "/";
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

export function productPath(product) {
  if (!product) return "/";
  const slug = (product.slug || "").trim();
  if (slug) return `/products/${slug}`;
  if (product.id != null) return `/products/${product.id}`;
  return "/";
}

const AVAIL = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
};

export function buildProductJsonLd(product) {
  if (!product) return null;
  const name = plainText(product.name || "Cake", 120);
  const description = plainText(product.short_description || product.description || "", 5000);
  const image = product.main_image || product.image || (product.gallery && product.gallery[0]) || "";
  const url = absoluteUrl(productPath(product));
  const priceNum = Number(
    product.discounted_price ??
      (Number(product.price || 0) * (100 - Number(product.discount || 0))) / 100
  );
  const price = (Math.round(priceNum * 100) / 100).toFixed(2);
  let availability = AVAIL[product.availability] || AVAIL.in_stock;
  const qty = Number(product.available_quantity ?? product.stock_remaining ?? 0);
  if (Number.isFinite(qty) && qty <= 0) availability = AVAIL.out_of_stock;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    sku: String(product.id ?? ""),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      availability,
    },
  };
  if (description) data.description = description;
  if (image) data.image = [image];
  if (product.category) data.category = plainText(product.category, 80);

  const reviewCount = Number(product.review_count || 0);
  const ratingValue = Number(product.average_rating ?? product.rating ?? 0);
  if (reviewCount > 0 && ratingValue > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(ratingValue * 10) / 10,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return data;
}

export function buildOrganizationJsonLd({ email, telephone } = {}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
  };
  if (email) data.email = email;
  if (telephone) data.telephone = String(telephone);
  return data;
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
  };
}

export function buildBreadcrumbJsonLd(items) {
  if (!items || !items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: plainText(item.name, 80),
      item: absoluteUrl(item.path || "/"),
    })),
  };
}

/** Match /products/:slugOrId from location.pathname */
export function parseProductPath(pathname) {
  const m = String(pathname || "").match(/^\/products\/([^/?#]+)\/?$/);
  if (!m) return null;
  return decodeURIComponent(m[1]);
}

export function isPrivatePath(pathname) {
  const p = String(pathname || "");
  return (
    p.startsWith("/admin") ||
    p.startsWith("/admin-login") ||
    p.startsWith("/reset-password") ||
    p.startsWith("/cart") ||
    p.startsWith("/checkout") ||
    p.startsWith("/account") ||
    p.startsWith("/orders") ||
    p.startsWith("/login") ||
    p.startsWith("/signup")
  );
}
