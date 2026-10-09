export const normalizeProduct = (product) => {
  const base = product || {};
  const price = Number(base.price ?? 0);
  const discount = Number(base.discount ?? 0);
  const discounted = Number(base.discounted_price ?? (price * (100 - discount) / 100 || price));
  const image = base.main_image || base.image || base.images?.[0] || "";
  const gallery = Array.isArray(base.gallery) && base.gallery.length
    ? base.gallery
    : Array.isArray(base.images) && base.images.length
      ? base.images
      : image
        ? [image]
        : [];

  return {
    ...base,
    id: base.id,
    slug: base.slug || "",
    name: base.name || "Cake",
    price,
    discount,
    discounted_price: discounted,
    rating: Number(base.average_rating ?? base.rating ?? 0),
    review_count: Number(base.review_count ?? 0),
    image,
    gallery,
    description: base.description || base.short_description || "",
    short_description: base.short_description || base.description || "",
    availability: base.availability || "in_stock",
    available_quantity: Number(base.available_quantity ?? base.stock_remaining ?? 0),
    stock_remaining: Number(base.stock_remaining ?? base.available_quantity ?? 0),
    is_low_stock: Boolean(base.is_low_stock),
    low_stock_threshold: Number(base.low_stock_threshold ?? 5),
    category: typeof base.category === "object" && base.category
      ? String(base.category.name || base.category.slug || "").trim()
      : String(base.category || "").trim(),
    status: base.status || "published",
    badge: base.badge || (discount ? `${discount}% OFF` : ""),
    main_image: image,
    images: gallery,
  };
};

export function hasCakeContent(item) {
  if (!item) return false;
  return Boolean(item.image || item.description || item.short_description || Number(item.price) > 0 || item.slug || item.id);
}

export function isOutOfStock(product) {
  const available = Number(product?.available_quantity ?? product?.stock_remaining ?? 0);
  return product?.availability === "out_of_stock" || available <= 0;
}
