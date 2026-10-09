import { useEffect, useState } from "react";
import { WHATSAPP_LINK_NUMBER } from "../appConstants";

export default function useStorefrontInteractions(notify) {
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [customBrief, setCustomBrief] = useState({
    occasion: "",
    servings: "",
    flavor: "",
    theme: "",
    preferredDate: "",
    name: "",
    phone: "",
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem("pinkbakes_wishlist");
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items.map(String) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pinkbakes_wishlist", JSON.stringify(wishlist));
    } catch (_) {}
  }, [wishlist]);

  function toggleWishlist(event, product) {
    event.stopPropagation();
    const id = String(product.id);
    const exists = wishlist.includes(id);
    setWishlist(exists ? wishlist.filter(item => item !== id) : [...wishlist, id]);
    notify(exists ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist`);
  }

  function sendCustomBrief() {
    const brief = customBrief;
    const hasOccasion = Boolean(brief.occasion?.trim());
    const hasTheme = Boolean(brief.theme?.trim());
    const hasServings = Boolean(brief.servings?.trim());
    if (!hasOccasion || (!hasTheme && !hasServings)) {
      notify("Please add occasion and either theme or servings");
      return;
    }
    const lines = [
      "Hi PinkBakes! Custom cake brief:",
      `* Name: ${brief.name?.trim() || "-"}`,
      `* Occasion: ${brief.occasion.trim()}`,
      `* Servings: ${brief.servings?.trim() || "-"}`,
      `* Flavor: ${brief.flavor?.trim() || "-"}`,
      `* Theme: ${brief.theme?.trim() || "-"}`,
      `* Preferred date: ${brief.preferredDate || "-"}`,
      `* Phone: ${brief.phone?.trim() || "-"}`,
    ];
    window.open(`https://wa.me/${WHATSAPP_LINK_NUMBER}?text=${encodeURIComponent(lines.join(" | "))}`, "_blank", "noopener,noreferrer");
    notify("Opening WhatsApp with your cake brief");
  }

  function subscribe(event) {
    event.preventDefault();
    if (newsletter.trim()) {
      setNewsletterDone(true);
      setNewsletter("");
    }
  }

  return {
    newsletter,
    setNewsletter,
    newsletterDone,
    customBrief,
    setCustomBrief,
    wishlist,
    toggleWishlist,
    sendCustomBrief,
    subscribe,
  };
}
