import { CakeSlice, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

function SiteHeader({
  mobileOpen,
  setMobileOpen,
  brandName,
  scrollTo,
  user,
  loadUserOrders,
  setAuthMode,
  setAuthStage,
  setAuthMessage,
  setAuthOpen,
  cartCount,
  setCartOpen,
  openCheckout,
}) {
  return (
    <header className="header">
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
        {mobileOpen ? <X/> : <Menu/>}
      </button>
      <div className="brand" onClick={() => scrollTo("home")}>
        <div className="brand-mark"><CakeSlice size={21}/></div>
        <div><strong>{brandName}</strong><small>CAKES FOR EVERY MOMENT</small></div>
      </div>
      <nav className={mobileOpen ? "nav mobile-visible" : "nav"}>
        <button onClick={() => { setMobileOpen(false); scrollTo("home"); }}>Home</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("cakes"); }}>Cakes</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("categories"); }}>Categories</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("custom"); }}>Custom Cakes</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("about"); }}>About Us</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("gallery"); }}>Gallery</button>
        <button onClick={() => { setMobileOpen(false); scrollTo("contact"); }}>Contact</button>
      </nav>
      <div className="header-actions">
        <button type="button" className="icon-btn search-toggle" onClick={() => document.getElementById("search")?.focus()} aria-label="Search cakes" title="Search cakes">
          <Search/>
        </button>

        <button
          type="button"
          className="header-action account-btn"
          onClick={() => {
            if (user) {
              loadUserOrders();
              return;
            }
            setAuthMode("signin");
            setAuthStage("form");
            setAuthMessage("");
            setAuthOpen(true);
          }}
          aria-label="Open account"
          title={user ? `Signed in as ${user.first_name || user.username}` : "Sign in or sign up"}
        >
          <span className="action-icon"><UserRound size={16} /></span>
          <span className="action-label">{user ? "Orders" : "Sign in"}</span>
        </button>

        <button type="button" className="header-action cart-btn" onClick={() => setCartOpen(true)} aria-label="Open cart" title="Open cart">
          <span className="action-icon"><ShoppingBag size={16} /></span>
          <span className="action-label">Cart</span>
          <span className="cart-count">{cartCount}</span>
        </button>

        <button type="button" className="order-top" onClick={() => { setMobileOpen(false); openCheckout(); }}>Order Now</button>
      </div>
    </header>
  );
}

export default SiteHeader;
