import { CalendarDays, CakeSlice, Check, Heart, Leaf, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const BENEFITS = [
  [CakeSlice, "Freshly Baked", "Every Day"],
  [Sparkles, "Premium", "Ingredients"],
  [Heart, "Custom", "Designs"],
  [Leaf, "Eggless", "Options"],
  [CalendarDays, "Same Day / Advance", "Ordering"],
  [ShieldCheck, "Hygienic", "Preparation"],
];

const CUSTOMER_REVIEWS = [
  ["Priya Sharma", "The cake was beyond beautiful and tasted amazing! Everyone loved it.", "Birthday Cake"],
  ["Rohit Mehta", "Perfect experience from ordering to delivery. The cake looked exactly like the picture.", "Anniversary Cake"],
  ["Neha Verma", "I ordered a custom cake for my daughter's birthday and it was absolutely perfect.", "Custom Cake"],
];

const GALLERY_ITEMS = [
  { src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85", alt: "Chocolate drip birthday cake with candles at a celebration table", caption: "Birthday" },
  { src: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=85", alt: "Elegant layered wedding cake with floral decoration", caption: "Wedding" },
  { src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=85", alt: "Assorted frosted cupcakes and cake bites for a party spread", caption: "Party treats" },
  { src: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=85", alt: "Tall celebration cake with fresh berries and cream", caption: "Anniversary" },
  { src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=85", alt: "Colorful layered cake slice served for a weekend treat", caption: "Weekend treat" },
  { src: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=85", alt: "Custom decorated cake ready for a special occasion", caption: "Custom order" },
];

export function BenefitStrip() {
  return (
    <section className="benefits section" id="about">
      {BENEFITS.map(([Icon, title, subtitle]) => (
        <div className="benefit" key={title}><Icon/><b>{title}</b><span>{subtitle}</span></div>
      ))}
    </section>
  );
}

export function CustomerReviews() {
  return (
    <section className="reviews section">
      <div className="section-head center"><span className="eyebrow">KIND WORDS FROM OUR CUSTOMERS</span><h2>What Our Customers Say</h2></div>
      <div className="review-grid">
        {CUSTOMER_REVIEWS.map(([name, text, tag]) => (
          <div className="review" key={name}>
            <div className="avatar">{name[0]}</div><p>"{text}"</p><div className="stars">*****</div><b>{name}</b><small>{tag}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CelebrationGallery({ whatsappNumber }) {
  return (
    <section className="gallery section" id="gallery">
      <div className="section-head">
        <div>
          <span className="eyebrow">REAL CELEBRATION MOMENTS</span>
          <h2>Made to Be Shared</h2>
          <p className="gallery-lead">Birthday tables, wedding sweets, and weekend treats - cakes that look as good in photos as they taste in person. See how customers celebrate with pinkbakes.</p>
        </div>
        <button
          className="outline-pill gallery-cta"
          type="button"
          onClick={() => {
            const msg = "Hi PinkBakes! I want to share a cake moment from my celebration.";
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
          }}
        >
          <MessageCircle size={15}/> Share your cake moment
        </button>
      </div>
      <div className="gallery-grid">
        {GALLERY_ITEMS.map((item) => (
          <figure className="gallery-item" key={item.src}>
            <img src={item.src} alt={item.alt} loading="lazy" width="600" height="600" />
            <figcaption className="gallery-caption">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function CustomCakePoints() {
  return (
    <div className="custom-points">
      <span><Check/> Personalized Designs</span><span><Check/> Any Theme</span><span><Check/> Any Size</span><span><Check/> Delicious Flavours</span>
    </div>
  );
}
