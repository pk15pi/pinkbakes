export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  publicSiteUrl: (import.meta.env.VITE_PUBLIC_SITE_URL || "https://pinkbakes.com").replace(/\/$/, ""),
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_default_key",
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    enabled: Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
    center: {
      lat: 19.076,
      lng: 72.8777,
    },
    zoom: 12,
  },
};

export const getMapsUrl = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "https://maps.google.com";
  }
  return `https://maps.google.com/?q=${lat},${lng}`;
};
