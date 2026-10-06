/**
 * PinkBakes Help Desk — local FAQ knowledge base (no paid LLM/API).
 * Answers reuse known site facts (WhatsApp, email, hours, Razorpay, sizes).
 * Do not invent fixed prices, pincodes, or policy numbers beyond what checkout shows.
 */

export const CHATBOT_QUICK_PROMPTS = [
  "How do I order?",
  "Same-day delivery?",
  "Track my order",
  "Cancel / refund",
  "Eggless cakes",
  "Custom / photo cake",
  "Sizes & flavors",
  "Delivery charges",
  "Payment help",
  "Contact support",
];

/** Lightweight synonym expansion for natural phrasing. */
export const CHATBOT_SYNONYMS = {
  "same day": ["today", "same-day", "same day", "urgent cake", "need cake today", "cake today", "asap", "emergency"],
  delivery: ["deliver", "shipping", "ship", "doorstep", "home delivery", "courier"],
  cancel: ["cancellation", "cancel order", "stop order", "dont want"],
  refund: ["money back", "return money", "reversed", "chargeback"],
  eggless: ["egg less", "without egg", "no egg", "veg cake", "vegetarian cake"],
  custom: ["customise", "customize", "theme cake", "personalized", "personalised", "bespoke"],
  photo: ["photo cake", "picture cake", "image cake", "edible print"],
  track: ["tracking", "where is my order", "order status", "live status"],
  payment: ["pay", "razorpay", "upi", "card", "debit", "credit", "netbanking", "wallet"],
  coupon: ["discount", "promo", "promocode", "offer", "voucher", "code"],
  hours: ["timing", "open", "closing", "opening", "when open"],
  pickup: ["pick up", "collect", "store pickup", "self pickup", "takeaway"],
  allergen: ["allergy", "nuts", "gluten", "dairy", "milk", "contains"],
  storage: ["store cake", "fridge", "refrigerat", "shelf life", "how long last", "keep cake"],
  complain: ["complaint", "damaged", "wrong order", "missing", "bad quality", "issue with order"],
  login: ["sign in", "signin", "log in", "account", "cannot login", "cant login"],
  password: ["forgot password", "reset password"],
  wedding: ["marriage", "reception", "engagement"],
  birthday: ["bday", "kids party"],
  anniversary: ["valentine", "propose"],
  size: ["half kg", "0.5", "1 kg", "1.5", "2 kg", "weight", "how big"],
  flavor: ["flavour", "chocolate", "vanilla", "red velvet", "butterscotch", "black forest"],
  message: ["write on cake", "inscription", "cake text", "happy birthday text"],
  privacy: ["data", "personal information", "gdpr", "delete account"],
  policy: ["terms", "conditions", "refund policy", "shipping policy"],
  contact: ["whatsapp", "phone", "email", "support", "help desk", "customer care", "call"],
  price: ["cost", "budget", "how much", "rate", "charges", "expensive", "cheap", "pricing"],
  advance: ["preorder", "pre-order", "book in advance", "advance booking", "how many days before"],
  modify: ["change order", "edit order", "wrong address", "update order"],
  ingredients: ["what is in", "recipe", "made of", "composition"],
};

export const CHATBOT_FAQS = [
  { id: "order-place", q: "How do I place an order?", keywords: ["place order", "how to order", "how do i order", "buy cake", "order cake", "checkout", "add to cart", "purchase", "order"], a: "Browse Cakes, open a product, choose size and eggless preference, add an optional cake message, then Add to Cart and Checkout. Sign in, select a delivery address, apply a coupon if you have one, and pay with Razorpay." },
  { id: "order-advance", q: "How far in advance should I book?", keywords: ["advance", "preorder", "pre-order", "book in advance", "how many days", "before", "notice"], a: "Most cakes need about 24-48 hours to prepare. For large custom, photo, or wedding cakes, book earlier and WhatsApp us with the event date so we can confirm capacity." },
  { id: "custom-cake", q: "Can I order a custom cake?", keywords: ["custom", "theme cake", "personalized", "personalised", "bespoke", "design cake"], a: "Yes. Use the Custom Cakes section on the site or WhatsApp +91 6033430700. Share occasion, size, flavor, theme, and delivery/pickup date. We confirm feasibility and price before you pay." },
  { id: "photo-cake", q: "Do you make photo cakes?", keywords: ["photo", "picture cake", "image cake", "edible print", "photo cake"], a: "Photo / edible-print cakes are available as custom orders. WhatsApp a clear photo plus size and date. Print quality depends on the image you send." },
  { id: "personalized", q: "Can cakes be personalized?", keywords: ["personalized", "personalised", "name on cake", "dedicated"], a: "Yes — choose size/flavor, add a message on cake at product level, or request a full custom/photo design via Custom Cakes or WhatsApp." },
  { id: "flavors", q: "What flavors do you offer?", keywords: ["flavor", "flavour", "flavours", "flavors", "chocolate", "vanilla", "red velvet", "butterscotch", "black forest"], a: "The live catalog lists current flavors (chocolate, vanilla, red velvet, fruit, and more). Open any cake for its description, or browse Categories. For a flavor not listed, ask via Custom Cakes / WhatsApp." },
  { id: "sizes", q: "What cake sizes are available?", keywords: ["size", "sizes", "0.5 kg", "half kg", "1 kg", "1.5 kg", "2 kg", "weight", "how big", "servings"], a: "Product pages typically offer 0.5 kg, 1 kg, 1.5 kg, and 2 kg. Serving count varies by cut size; ask us if you need help estimating for your guest list." },
  { id: "eggless", q: "Do you make eggless cakes?", keywords: ["eggless", "egg less", "without egg", "no egg", "veg cake", "vegetarian"], a: "Yes. Many products have an Eggless toggle on the product page, and there is an Eggless Cakes category. Availability can vary by design — check the product before checkout." },
  { id: "ingredients", q: "What ingredients do you use?", keywords: ["ingredients", "what is in", "made of", "recipe", "composition", "fresh"], a: "We bake with bakery-grade ingredients suited to each flavor (flour, sugar, dairy, cocoa, fruits, etc.). Exact recipes vary by cake. For a specific product, open its page or WhatsApp us with the cake name." },
  { id: "allergens", q: "Do your cakes contain allergens?", keywords: ["allergen", "allergy", "nuts", "gluten", "dairy", "milk", "contains", "nut free"], a: "Cakes may contain dairy, gluten, eggs (unless eggless), nuts, or traces of allergens from a shared kitchen. Tell us about allergies in order notes or WhatsApp before you confirm — we will advise as best we can." },
  { id: "prices", q: "How much do cakes cost?", keywords: ["price", "pricing", "cost", "budget", "how much", "rate", "expensive", "cheap"], a: "Listed cakes often start around Rs 1,099 depending on the design. Final price depends on size, flavor, eggless option, custom work, and delivery. Always use the product page and checkout total as the source of truth." },
  { id: "offers", q: "Do you have offers or coupons?", keywords: ["coupon", "discount", "promo", "promocode", "offer", "voucher", "code", "offers"], a: "At checkout, enter a coupon code and tap Apply. Valid codes show the discount before payment. Coupons may have minimum order, expiry, or usage limits." },
  { id: "delivery-areas", q: "Which areas do you deliver to?", keywords: ["delivery area", "areas", "pincode", "postal code", "zone", "do you deliver to", "serviceable"], a: "We deliver to covered pincodes/zones configured in our delivery settings. At checkout, add your address — if the pincode is serviceable you will see a delivery quote; if not, try another address or ask about pickup." },
  { id: "delivery-charges", q: "How much is delivery?", keywords: ["delivery charge", "delivery fee", "shipping fee", "delivery cost", "free delivery", "minimum order"], a: "Delivery charge depends on your zone and order value. Some zones offer free delivery above a threshold. The exact charge appears at checkout after you select an address — we do not invent a flat rate here." },
  { id: "delivery-timing", q: "How long does delivery take?", keywords: ["delivery time", "how long", "eta", "when will", "arrive", "preparation", "prep time", "24 hour"], a: "Preparation is usually 24-48 hours. Delivery timing then depends on size, customization, and your location. After dispatch you can follow live tracking from Orders when a partner is assigned." },
  { id: "shipping-policy", q: "What is your shipping and delivery policy?", keywords: ["shipping", "shipping policy", "shipping and delivery", "delivery policy", "ship", "courier policy"], a: "We deliver to serviceable pincodes shown at checkout. Most cakes need about 24-48 hours to prepare; timing then depends on size, customization, and your area. Delivery fee (or free-delivery threshold) appears after you select an address. Same-day is not guaranteed - WhatsApp +91 6033430700 early to check. After dispatch, follow live tracking from Orders when a partner is assigned." },
  { id: "same-day", q: "Do you offer same-day delivery?", keywords: ["same day", "same-day", "today", "urgent", "asap", "need cake today", "cake today", "emergency"], a: "Same-day is not guaranteed. It depends on bakery capacity, cake type, and your delivery zone. WhatsApp +91 6033430700 as early as possible with size, area, and time — we will confirm only if feasible." },
  { id: "cancel", q: "Can I cancel my order?", keywords: ["cancel", "cancellation", "cancel order", "stop order"], a: "You can request cancellation from Orders while the order is still early in fulfillment. Once packing or out-for-delivery starts, cancel may be unavailable — WhatsApp or email with your order id and we will check." },
  { id: "modify", q: "Can I change my order after placing it?", keywords: ["modify", "change order", "edit order", "wrong address", "update order", "wrong cake"], a: "Small changes are easiest before packing. Open Orders or WhatsApp +91 6033430700 with your order id right away. After out-for-delivery, changes are usually not possible." },
  { id: "refund", q: "What is your refund policy?", keywords: ["refund", "money back", "return", "refund policy", "return policy", "return refund"], a: "Eligible refunds (for example after an approved cancellation) go to your original Razorpay payment method. Bank timing varies. Failed payments are not completed orders. Cakes are perishable, so returns of delivered cakes are handled case by case - contact us with order id and photos if something is wrong." },
  { id: "payment-methods", q: "What payment methods do you accept?", keywords: ["payment", "pay", "razorpay", "upi", "card", "debit", "credit", "netbanking", "wallet", "cod", "cash on delivery"], a: "Checkout uses Razorpay (UPI, cards, netbanking, and wallets as enabled there). Cash on delivery is not the default online flow." },
  { id: "payment-failed", q: "What if my payment failed?", keywords: ["payment failed", "failed payment", "retry payment", "deducted", "money deducted", "pending payment"], a: "If payment failed, the order is not marked paid. Use Retry payment from Orders when shown. If money left your account but status is unpaid, WhatsApp us your order id and Razorpay payment id." },
  { id: "payment-secure", q: "Is payment secure?", keywords: ["secure", "safe", "security", "fraud", "ssl"], a: "Card and UPI details are processed by Razorpay's secure checkout. PinkBakes does not store your full card number in the storefront." },
  { id: "track", q: "How do I track my order?", keywords: ["track", "tracking", "order status", "where is my order", "live status", "out for delivery"], a: "Sign in and open Orders in the header to see status history. Live delivery tracking appears once a delivery partner is assigned or the order is out for delivery." },
  { id: "pickup", q: "Can I pick up from the bakery?", keywords: ["pickup", "pick up", "collect", "store pickup", "self pickup", "takeaway"], a: "Pickup may be available depending on the order and bakery schedule. Mention pickup when ordering or WhatsApp +91 6033430700. Use Visit Our Bakery on the contact strip for maps/hours (Open daily | 10 AM - 9 PM)." },
  { id: "location-hours", q: "Where is the bakery and what are the hours?", keywords: ["hours", "timing", "open", "closing", "visit", "bakery", "store", "shop", "location", "address", "map", "directions", "pickup location"], a: "pinkbakes Bakery — Open daily | 10 AM - 9 PM. Tap Visit Our Bakery in the contact section to share location on WhatsApp or open Google Maps. For the exact shop pin used for pickup, confirm on WhatsApp if needed." },
  { id: "contact", q: "How do I contact PinkBakes?", keywords: ["contact", "whatsapp", "phone", "call", "email", "support", "help desk", "customer care"], a: "WhatsApp: +91 6033430700 · Email: pinkbakes@pinkbakes.com · Or keep chatting here for FAQs. For urgent order issues, WhatsApp with your order id is fastest. Contact section: scroll to Contact on the homepage." },
  { id: "birthday", q: "Birthday cake ideas?", keywords: ["birthday", "bday", "kids birthday", "birthday cake"], a: "Popular birthday picks include Chocolate Truffle, Vanilla Dream, Berry Bliss, and themed custom cakes. Browse the Birthday category or tell me a flavor (chocolate, red velvet, eggless)." },
  { id: "anniversary", q: "Anniversary cakes?", keywords: ["anniversary", "valentine"], a: "Elegant favorites include Red Velvet and floral-style designs. Add a short message on the cake, or WhatsApp for a custom look." },
  { id: "wedding", q: "Wedding or event cakes?", keywords: ["wedding", "marriage", "reception", "engagement", "event cake", "party cake"], a: "For wedding and large events, WhatsApp +91 6033430700 with date, guest count, tiers/theme, and delivery area. Multi-tier and large custom cakes need advance booking." },
  { id: "message-on-cake", q: "Can I add a message on the cake?", keywords: ["message on cake", "cake message", "write on cake", "inscription", "happy birthday text", "message"], a: "Yes. On the product page use Message on Cake before adding to cart. Keep it short so it fits the top surface." },
  { id: "storage", q: "How should I store the cake?", keywords: ["storage", "store cake", "fridge", "refrigerat", "keep cake", "room temperature"], a: "Keep the cake refrigerated and bring it out shortly before serving. Avoid direct sun and heat during travel. Fondant and cream cakes differ — ask when you receive the cake if unsure." },
  { id: "shelf-life", q: "How long does the cake stay fresh?", keywords: ["shelf life", "how long last", "fresh for", "expiry", "consume within"], a: "Best enjoyed the same day or within about 24-48 hours when refrigerated, depending on the cream/frosting. We recommend consuming sooner for best taste — ask your delivery note for that cake type if provided." },
  { id: "delivery-care", q: "Any delivery precautions?", keywords: ["precautions", "careful", "melt", "tilt", "transport", "summer"], a: "Place the box on a flat surface, avoid sudden brakes, and keep it cool. In hot weather, minimize time outside AC. Inspect on delivery and contact us immediately if something looks wrong." },
  { id: "damaged-wrong", q: "What if my order is damaged or wrong?", keywords: ["damaged", "wrong order", "missing", "broken", "smashed", "incorrect"], a: "Please photograph the issue and WhatsApp +91 6033430700 or email pinkbakes@pinkbakes.com with your order id as soon as you receive it. We will review replacement/refund options case by case." },
  { id: "complaints", q: "How do I raise a complaint?", keywords: ["complain", "complaint", "feedback bad", "issue with order", "unhappy"], a: "Message WhatsApp +91 6033430700 or email pinkbakes@pinkbakes.com with order id, what went wrong, and photos if relevant. You can also use Orders after signing in for status context." },
  { id: "account", q: "How do I sign in or create an account?", keywords: ["sign in", "signin", "login", "log in", "account", "register", "sign up", "signup", "otp"], a: "Use Sign in in the header (or the Sign in float). Sign up with email, or use OTP where offered. Orders, tracking, coupons, and saved addresses need a signed-in account." },
  { id: "password", q: "I forgot my password", keywords: ["forgot password", "reset password", "password", "cannot login", "cant login"], a: "Open Sign in → Forgot password, enter your email, and follow the reset instructions we send." },
  { id: "privacy", q: "How is my data used?", keywords: ["privacy", "privacy policy", "personal information", "data", "gdpr", "delete account", "my data"], a: "We use your account, address, and order details to fulfill cake orders, process Razorpay payments, and provide support. We do not sell your personal data. Sign in to manage Orders and saved addresses. For data questions or deletion requests, email pinkbakes@pinkbakes.com or WhatsApp +91 6033430700." },
  { id: "terms", q: "What are the terms of service?", keywords: ["terms", "terms of service", "terms and conditions", "conditions", "tos", "policy", "policies"], a: "By ordering on pinkbakes you agree to pay the checkout total, share a reachable delivery address, and allow our usual prep time (about 24-48 hours). Cancellations and refunds follow order status rules in Orders and our Refund Policy. Custom and photo cakes may need confirmation before we bake. For order-specific help, WhatsApp +91 6033430700 or email pinkbakes@pinkbakes.com with your order id." },
  { id: "address", q: "How do I manage delivery addresses?", keywords: ["address", "saved address", "change address", "shipping address"], a: "Sign in and add or select an address at checkout. Delivery charge and eligibility use your pincode/zone. Update the address before payment when possible." },
  { id: "wishlist", q: "How does wishlist work?", keywords: ["wishlist", "favorite", "save cake", "heart"], a: "Tap the heart on a cake to save it on this device, then revisit favorites while you shop." },
  { id: "reviews", q: "Can I leave a review?", keywords: ["review", "rating", "feedback", "testimonial"], a: "Signed-in customers can rate and review cakes from the product page. Honest reviews help other customers choose." },
  { id: "3d", q: "What is 3D view?", keywords: ["3d", "3d view", "rotate", "preview"], a: "Many cakes include a rotate / 3D-style preview on the product page so you can see the cake before ordering." },
  { id: "bulk", q: "Do you take bulk or corporate orders?", keywords: ["bulk", "corporate", "office", "party pack", "many cakes", "wholesale"], a: "Yes for parties and offices. WhatsApp +91 6033430700 with quantity, flavors, date, and delivery area for a quote." },
  { id: "recommend", q: "What cakes are popular?", keywords: ["popular", "best seller", "bestseller", "recommend", "suggestion", "best cake", "top"], a: "Chocolate Truffle, Red Velvet, and Vanilla Dream are frequent favorites. Browse Categories for Birthday, Eggless, and more — or tell me an occasion and flavor preference." },
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s.+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandQuery(query) {
  const q = normalizeText(query);
  const parts = new Set([q]);
  for (const [canonical, list] of Object.entries(CHATBOT_SYNONYMS)) {
    for (const phrase of list.concat([canonical])) {
      const p = normalizeText(phrase);
      if (p && q.includes(p)) parts.add(canonical);
    }
  }
  return { normalized: q, expanded: [...parts].join(" ") };
}

export function matchChatbotFaq(inputText, catalogNames) {
  const { normalized, expanded } = expandQuery(inputText);
  if (!normalized) {
    return { type: "empty", answer: "Please type a question or tap a quick topic below." };
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized) || ["hi", "hey", "hello"].includes(normalized)) {
    return {
      type: "greeting",
      answer: "Hello! I am PinkBakes Assistant (free Help Desk). Ask about orders, delivery, same-day options, refunds, eggless or custom cakes, sizes, payments, and more — or tap a quick question below.",
    };
  }
  if (normalized.includes("thank")) {
    return { type: "thanks", answer: "You are welcome! Anything else about cakes, delivery, or your order?" };
  }
  if (/\b(bye|goodbye)\b/.test(normalized)) {
    return { type: "bye", answer: "Take care! WhatsApp +91 6033430700 anytime if you need a person." };
  }
  if (/\b(human|agent|person|executive|call me)\b/.test(normalized)) {
    return {
      type: "human",
      answer: "For a person, WhatsApp +91 6033430700 or email pinkbakes@pinkbakes.com with your order id. I can still answer most FAQ topics here.",
    };
  }

  let best = null;
  let bestScore = 0;
  for (const faq of CHATBOT_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      const k = normalizeText(kw);
      if (!k) continue;
      if (expanded.includes(k) || normalized.includes(k)) {
        score += Math.min(k.length, 28);
      }
    }
    for (const w of normalizeText(faq.q).split(/\s+/)) {
      if (w.length > 3 && normalized.includes(w)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  const CONFIDENCE = 5;
  if (best && bestScore >= CONFIDENCE) {
    let answer = best.a;
    if (best.id === "recommend" && Array.isArray(catalogNames) && catalogNames.length) {
      answer += ` Right now on the site: ${catalogNames.slice(0, 3).join(", ")}.`;
    }
    return { type: "faq", id: best.id, score: bestScore, answer };
  }

  return {
    type: "fallback",
    answer:
      "I could not find a confident answer for that. Please WhatsApp +91 6033430700 or email pinkbakes@pinkbakes.com, or try topics like: How do I order? · Same-day delivery? · Track my order · Cancel / refund · Contact support. You can also open Contact or Orders from the site header/footer.",
  };
}
