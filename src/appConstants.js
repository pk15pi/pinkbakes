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

export const formatCurrency = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value || 0));

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
