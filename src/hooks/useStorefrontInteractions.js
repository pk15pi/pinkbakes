import { useState } from "react";
import { WHATSAPP_LINK_NUMBER } from "../appConstants";

export default function useStorefrontInteractions(notify) {
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [customBrief, setCustomBrief] = useState({
    occasion: "",
    servings: "",
    weight: "",
    flavor: "",
    theme: "",
    preferredDate: "",
    name: "",
    phone: "",
  });
  // Phase 16: the wishlist moved to hooks/useWishlist (server-backed when signed in).

  function sendCustomBrief() {
    const brief = customBrief;
    const hasOccasion = Boolean(brief.occasion?.trim());
    // Servings, weight and idea/remarks are all optional; only the occasion is required.
    if (!hasOccasion) {
      notify("Please select an occasion");
      return;
    }
    const lines = [
      "Hi PinkBakes! Custom cake brief:",
      `* Name: ${brief.name?.trim() || "-"}`,
      `* Occasion: ${brief.occasion.trim()}`,
      `* Servings: ${brief.servings?.trim() || "-"}`,
      `* Weight: ${brief.weight?.trim() || "-"}`,
      `* Flavor: ${brief.flavor?.trim() || "-"}`,
      `* Idea / remarks: ${brief.theme?.trim() || "-"}`,
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
    sendCustomBrief,
    subscribe,
  };
}
