/**
 * Customer-facing PinkBakes policies.
 * Facts match how the store actually works (checkout zones, Razorpay, Orders).
 * No invented fees, legal-entity addresses, or refund windows.
 */

export const POLICY_SLUGS = ["privacy", "terms", "shipping", "refund"];

export const POLICIES = {
  privacy: {
    slug: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    updated: "6 October 2026",
    summary:
      "How pinkbakes uses your account, delivery, and order details to bake and deliver cakes, take Razorpay payments, and answer support requests.",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "When you browse, sign in, or place an order we keep the details needed to run the shop: your name, email, phone number, delivery address, and the cakes you order.",
          "Payments are taken through Razorpay. We store the payment status and reference for your order. We do not store your full card number on pinkbakes.",
          "If you stay signed in, this browser keeps a sign-in token in local storage so you do not have to log in on every visit."
        ]
      },
      {
        heading: "How we use it",
        paragraphs: [
          "We use those details to prepare your cake, calculate delivery for the address you chose, send order updates, and reply when you contact us.",
          "We do not sell your personal information. We do not share it for other companies' marketing."
        ]
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Order records stay so we can show your order history, handle a refund, and answer a question about a cake we already delivered.",
          "You can ask us to delete your account details. We may still need to keep a completed order record where a payment or refund has to be traced."
        ]
      },
      {
        heading: "Your choices",
        paragraphs: [
          "Sign in to review Orders and the addresses saved on your account. Update a delivery address before you pay whenever you can.",
          "For a copy of your data, a correction, or a deletion request, email pinkbakes@pinkbakes.com or WhatsApp +91 6033430700. Include the email or phone on the account so we can find it."
        ]
      }
    ]
  },
  terms: {
    slug: "terms",
    path: "/terms",
    title: "Terms & Conditions",
    updated: "6 October 2026",
    summary:
      "The terms for ordering handcrafted cakes on pinkbakes: checkout payment, prep time, delivery details, and custom cakes.",
    sections: [
      {
        heading: "Placing an order",
        paragraphs: [
          "When you check out you agree to pay the total shown there, including any delivery charge for the address you selected.",
          "Most cakes need about 24 to 48 hours to prepare. The exact timing depends on the size, the design, and your area. Same-day baking is not guaranteed. Message us on WhatsApp early if you need a cake sooner and we will say whether we can do it.",
          "Give a delivery address where someone can receive the cake, and a phone number we can reach. If we cannot deliver because the address or phone is wrong, the order is still treated as placed."
        ]
      },
      {
        heading: "Custom and photo cakes",
        paragraphs: [
          "Custom, message, and photo cakes may need a confirmation from us before we start baking. If we cannot match a design, we will tell you before the cake is made.",
          "Please send clear instructions and any photo with the order. We bake from what you submit; we do not redraw a design you did not send."
        ]
      },
      {
        heading: "Cakes are perishable",
        paragraphs: [
          "Cakes are made to be eaten fresh. Once a cake leaves the bakery it should be kept cool and served as you were told. A delay at the door or after delivery can affect cream, fruit, and finish."
        ]
      },
      {
        heading: "Changes and cancellations",
        paragraphs: [
          "You can ask to cancel from your order, subject to how far along the cake is. If a cancellation is approved, any refund follows our Refund Policy and goes back through Razorpay.",
          "Questions about a specific order are easiest with the order id. Email pinkbakes@pinkbakes.com or WhatsApp +91 6033430700."
        ]
      }
    ]
  },
  shipping: {
    slug: "shipping",
    path: "/shipping",
    title: "Shipping & Delivery",
    updated: "6 October 2026",
    summary:
      "Where pinkbakes delivers, how the delivery charge is shown at checkout, and what to expect after a cake is dispatched.",
    sections: [
      {
        heading: "Where we deliver",
        paragraphs: [
          "We deliver to serviceable pincodes. Whether your area is covered is confirmed when you enter an address at checkout. If a pincode is outside our zones, checkout will say so before you pay.",
          "The bakery is open daily from 10 AM to 9 PM."
        ]
      },
      {
        heading: "Delivery charge",
        paragraphs: [
          "The delivery charge depends on your zone and the order value. Some zones have free delivery above a threshold. The exact charge, or that free-delivery note, appears at checkout after you select an address.",
          "We do not publish one flat delivery fee here, because the amount you pay is the one shown for your address."
        ]
      },
      {
        heading: "Timing",
        paragraphs: [
          "Allow about 24 to 48 hours for us to prepare the cake. After that, travel time depends on the size of the order, how custom it is, and how far the address is.",
          "Same-day delivery is not promised. WhatsApp +91 6033430700 early in the day if you want us to check."
        ]
      },
      {
        heading: "After dispatch",
        paragraphs: [
          "When a delivery partner is assigned, you can follow the order from Orders while you are signed in.",
          "Someone should be available at the address to receive the cake. If a delivery fails because no one is there, contact us with your order id and we will tell you what we can still do."
        ]
      }
    ]
  },
  refund: {
    slug: "refund",
    path: "/refund",
    title: "Refund Policy",
    updated: "6 October 2026",
    summary:
      "When pinkbakes refunds a cake order, how the money returns through Razorpay, and how to report a problem with a delivered cake.",
    sections: [
      {
        heading: "Approved cancellations",
        paragraphs: [
          "If we approve a cancellation, the refund goes back to the original Razorpay payment method. How long the bank or card takes to show the credit is outside our checkout screen, and it varies.",
          "A payment that fails is not a completed order. You are not charged for a cake we did not accept."
        ]
      },
      {
        heading: "After a cake is delivered",
        paragraphs: [
          "Cakes are perishable, so we do not take back a cake that was delivered in good condition just because plans changed.",
          "If the cake arrives damaged, incomplete, or clearly not what you ordered, contact us with the order id and photos as soon as you can. We look at those case by case and, where we agree the order was wrong, we refund or replace it."
        ]
      },
      {
        heading: "How to ask",
        paragraphs: [
          "Email pinkbakes@pinkbakes.com or WhatsApp +91 6033430700. Tell us the order id, what went wrong, and attach photos if the cake already arrived.",
          "Refunds are not issued in cash. They follow the Razorpay payment on that order."
        ]
      }
    ]
  }
};

export function policyFromPath(pathname) {
  const match = String(pathname || "").match(/^\/(privacy|terms|shipping|refund)\/?$/);
  if (!match) return null;
  return POLICIES[match[1]] || null;
}
