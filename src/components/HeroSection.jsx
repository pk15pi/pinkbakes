import { ArrowRight } from "lucide-react";

function HeroSection({ scrollTo, openCheckout }) {
  return (
    <section className="hero" id="home">
      <div className="hero-copy reveal">
        <span className="eyebrow">PREMIUM * FRESH * HANDCRAFTED</span>
        <h1>Beautiful Cakes,<br/>Made for Your<br/><em>Beautiful Moments</em></h1>
        <p>From birthdays to anniversaries, we create cakes that make your celebrations sweeter and your memories last longer.</p>
        <div className="hero-buttons">
          <button className="btn primary" onClick={() => scrollTo("cakes")}>Explore Cakes <ArrowRight size={16}/></button>
          <button className="btn secondary" onClick={() => openCheckout()}>Order Your Cake</button>
        </div>
      </div>
      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1280&q=75"
          srcSet="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=480&q=70 480w, https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=768&q=72 768w, https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1024&q=75 1024w, https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1280&q=75 1280w"
          sizes="(max-width: 900px) 100vw, 50vw"
          alt="Premium chocolate cake from pinkbakes"
          width="1600"
          height="1200"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-note">Life is<br/><em>sweeter</em><br/>with cake</div>
      </div>
    </section>
  );
}

export default HeroSection;
