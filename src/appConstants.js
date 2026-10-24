import { normalizeProduct } from "./productUtils";

export const CATEGORY_IMAGE_FALLBACKS = {
  "Birthday Cakes": "/products/cakes/BirthdayCakes_BerryMedley.jpg",
  "Anniversary Cakes": "/products/cakes/AnniversaryCakes_BlackForest.jpg",
  "Wedding Cakes": "/products/cakes/WeddingCakes_AlmondMarzipan.jpg",
  "Chocolate Cakes": "/products/cakes/ChocolateCakes_BlackForest2.jpg",
  "Designer Cakes": "/products/cakes/DesignerCakes_BerryMedley.jpg",
  "Photo Cakes": "/products/cakes/PhotoCakes_AlmondMarzipan.jpg",
  "Custom Cakes": "/products/cakes/CustomCakes_BerryMedley.jpg",
  "Eggless Cakes": "/products/cakes/EgglessCakes_BerryMedley.jpg",
};

export const CAKE_CATEGORY_OPTIONS = Object.keys(CATEGORY_IMAGE_FALLBACKS);

const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["ORDER_CONFIRMED"],
  ORDER_CONFIRMED: ["PREPARING"],
  PREPARING: ["PACKING"],
  PACKING: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["DELIVERY_BOY_ASSIGNED"],
  DELIVERY_BOY_ASSIGNED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getNextOrderStatuses(current) {
  return ORDER_STATUS_TRANSITIONS[current] || [];
}

export const BRAND_NAME = "pinkbakes";
export const WHATSAPP_NUMBER = "6033430700";
export const WHATSAPP_LINK_NUMBER = `91${WHATSAPP_NUMBER}`;
export const WHATSAPP_TELEPHONE = `+${WHATSAPP_LINK_NUMBER}`;
export const CONTACT_EMAIL = "pinkbakes@pinkbakes.com";
export const BAKERY_LOCATION = {
  label: "pinkbakes Bakery",
  hours: "Open daily | 10 AM - 9 PM",
};
export const STICKY_HEADER_OFFSET = 80;

export const CART_QTY_MAX = 40;

export const cartUnitPrice = (item) => {
  const list = Number(item?.price ?? 0);
  const discount = Number(item?.discount ?? 0);
  const fromField = Number(item?.discounted_price);
  if (Number.isFinite(fromField) && fromField > 0 && !(discount > 0 && list > 0 && fromField >= list)) {
    return fromField;
  }
  if (discount > 0 && list > 0) {
    return Number(((list * (100 - discount)) / 100).toFixed(2));
  }
  return Number.isFinite(fromField) && fromField > 0 ? fromField : list;
};

export const cartQtyCap = (item) => {
  const stock = Number(item?.available_quantity ?? item?.stock_remaining ?? 0);
  if (stock > 0) return Math.min(stock, CART_QTY_MAX);
  return CART_QTY_MAX;
};

// Single rupee formatter for every price shown in the app (always the "₹" symbol).
// fractionDigits 0 rounds to whole rupees (catalog cards); 2 keeps paise for cart,
// checkout, order and admin amounts while dropping ".00" on whole amounts.
export const formatCurrency = (value, fractionDigits = 0) => {
  const amount = Number(value || 0);
  const options = fractionDigits > 0
    ? { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits, trailingZeroDisplay: "stripIfInteger" }
    : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", ...options })
    .format(Number.isFinite(amount) ? amount : 0);
};

// Product popup options (bug 017). Mirrors the whitelist enforced by the backend.
export const CAKE_SIZE_OPTIONS = ["0.5 kg", "1 kg", "1.5 kg", "2 kg"];
export const CAKE_MESSAGE_MAX_LENGTH = 60;

export const isEgglessProduct = (product) =>
  /eggless/i.test([product?.category, product?.name, product?.badge].filter(Boolean).join(" "));

export const localIsoDate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function cleanCartOptions(options) {
  if (!options || typeof options !== "object") return null;
  const cleaned = {};
  if (CAKE_SIZE_OPTIONS.includes(options.size)) cleaned.size = options.size;
  if (options.eggless === true) cleaned.eggless = true;
  const message = typeof options.message === "string" ? options.message.replace(/\s+/g, " ").trim().slice(0, CAKE_MESSAGE_MAX_LENGTH) : "";
  if (message) cleaned.message = message;
  if (typeof options.delivery_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(options.delivery_date)) cleaned.delivery_date = options.delivery_date;
  return Object.keys(cleaned).length ? cleaned : null;
}

export const cartLineKey = (id, options) => {
  if (!options) return String(id);
  return [id, options.size || "", options.eggless ? "eggless" : "", options.message || "", options.delivery_date || ""].join("|");
};

export function describeCartOptions(options) {
  if (!options) return "";
  const parts = [];
  if (options.size) parts.push(options.size);
  if (options.eggless) parts.push("Eggless");
  if (options.message) parts.push(`Message: "${options.message}"`);
  if (options.delivery_date) {
    const [y, m, d] = options.delivery_date.split("-").map(Number);
    const when = new Date(y, (m || 1) - 1, d || 1);
    parts.push(`Delivery: ${Number.isNaN(when.getTime()) ? options.delivery_date : when.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`);
  }
  return parts.join(" | ");
}

// Shape sent to /cart, /coupons, /delivery quote and checkout endpoints.
export const cartPayloadItems = (cart) =>
  (cart || []).map((item) => ({
    id: item.id,
    quantity: item.qty || 1,
    ...(item.options ? { options: item.options } : {}),
  }));

export function mapShopCategories(fromApi, items) {
  if (fromApi && fromApi.length) {
    return fromApi.map((category) => ({
      name: category.name,
      product_count: Number(category.product_count || 0),
      image: category.image || CATEGORY_IMAGE_FALLBACKS[category.name] || CATEGORY_IMAGE_FALLBACKS["Birthday Cakes"],
    }));
  }
  const seen = new Map();
  (items || []).forEach((raw) => {
    const product = normalizeProduct(raw);
    const name = (product.category || "").trim();
    if (!name) return;
    if (!seen.has(name)) {
      seen.set(name, {
        name,
        product_count: 1,
        image: product.image || CATEGORY_IMAGE_FALLBACKS[name] || CATEGORY_IMAGE_FALLBACKS["Birthday Cakes"],
      });
    } else {
      seen.get(name).product_count += 1;
    }
  });
  return Array.from(seen.values());
}

export function catalogLoadErrorMessage(error) {
  if (error?.timeout) return "Loading cakes took too long. Please retry.";
  if (error?.status) return error.message || "Unable to load cakes. Please try again.";
  return "Unable to load cakes. Check your connection and retry.";
}
