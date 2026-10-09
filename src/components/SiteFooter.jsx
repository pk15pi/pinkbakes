import { ArrowRight, CakeSlice, Check, Heart, Instagram, MessageCircle } from "lucide-react";

function SiteFooter({
  brandName,
  whatsappLinkNumber,
  scrollTo,
  subscribe,
  newsletter,
  setNewsletter,
  newsletterDone,
  openPolicy,
  openHelpDesk,
  openFooterAdmin,
  isAdminLoggedIn,
  scrollRoomRef,
}) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand"><div className="brand-mark"><CakeSlice size={21}/></div><strong>{brandName}</strong><small>CAKES FOR EVERY MOMENT</small><p>Handcrafted cakes made for life's sweetest celebrations.</p></div>
        <div><h4>Explore</h4><button onClick={() => scrollTo("cakes")}>Cakes</button><button onClick={() => scrollTo("categories")}>Categories</button><button onClick={() => scrollTo("custom")}>Custom Cakes</button><button onClick={() => scrollTo("gallery")}>Gallery</button></div>
        <div><h4>Company</h4><button type="button" onClick={() => scrollTo("about")}>About Us</button><button type="button" onClick={() => scrollTo("contact")}>Contact</button></div>
        <div className="newsletter"><h4>Subscribe for latest updates</h4><form onSubmit={subscribe}><input value={newsletter} onChange={e=>setNewsletter(e.target.value)} placeholder="Your email address" type="email" required/><button aria-label="Subscribe"><ArrowRight/></button></form>{newsletterDone && <span className="subscribed"><Check size={14}/> You're subscribed!</span>}<div className="social"><span className="social-icon" title="Instagram (link not configured)" aria-label="Instagram unavailable"><Instagram/></span><a className="social-icon" href={`https://wa.me/${whatsappLinkNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp PinkBakes" title="WhatsApp"><MessageCircle/></a><span className="social-icon" title="Favorites" aria-hidden="true"><Heart/></span></div></div>
      </div>
      <div className="footer-bottom"><span>(c) 2026 {brandName}. All rights reserved.</span><span className="footer-bottom-links"><button type="button" className="footer-help-link" onClick={() => openPolicy("privacy")}>Privacy Policy</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("terms")}>Terms & Conditions</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("shipping")}>Shipping & Delivery</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("refund")}>Refund Policy</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={openHelpDesk}>HELP DESK – PinkBakes Assistant</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-admin-link" onClick={openFooterAdmin} aria-label={isAdminLoggedIn ? "Open admin panel" : "Admin Login"} title={isAdminLoggedIn ? "Open admin panel" : "Admin Login"}>{isAdminLoggedIn ? "Admin" : "Admin Login"}</button></span></div>
      <div id="footer-scroll-room" ref={scrollRoomRef} aria-hidden="true" />
    </footer>
  );
}

export default SiteFooter;
