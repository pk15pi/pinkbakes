import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, UserRound, ShoppingBag, Menu, X, ChevronRight, ChevronLeft,
  Star, Heart, ZoomIn, Rotate3d, Plus, Minus, Trash2, ArrowRight,
  CakeSlice, Sparkles, Leaf, CalendarDays, ShieldCheck, Instagram,
  MessageCircle, Mail, MapPin, Check, SlidersHorizontal
} from "lucide-react";
import "./styles.css";

const products = [
  {
    id: 1, name: "Chocolate Truffle", price: 1299, category: "Chocolate Cakes",
    rating: 4.9, badge: "Bestseller",
    description: "Rich, moist and absolutely indulgent.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476b?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=90"
    ]
  },
  {
    id: 2, name: "Red Velvet", price: 1199, category: "Designer Cakes",
    rating: 4.8, badge: "New",
    description: "Velvety layers with a hint of cocoa.",
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1614707267537-2b5d5b8e9e09?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1400&q=90"
    ]
  },
  {
    id: 3, name: "Vanilla Dream", price: 1099, category: "Birthday Cakes",
    rating: 4.9, badge: "",
    description: "Light, fresh and full of vanilla goodness.",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1400&q=90"
    ]
  },
  {
    id: 4, name: "Berry Bliss", price: 1399, category: "Designer Cakes",
    rating: 5.0, badge: "",
    description: "A perfect blend of chocolate and berries.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1576618148400-6b7c8d3c0f2a?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1400&q=90"
    ]
  },
  {
    id: 5, name: "Rose Garden", price: 1499, category: "Anniversary Cakes",
    rating: 4.9, badge: "Popular",
    description: "Elegant vanilla cake finished with buttercream roses.",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1400&q=90"
    ]
  },
  {
    id: 6, name: "Midnight Mocha", price: 1599, category: "Chocolate Cakes",
    rating: 4.9, badge: "Chef's Pick",
    description: "Deep chocolate sponge, espresso cream and ganache.",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=90"
    ]
  }
];

const categories = [
  ["Birthday Cakes", "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=600&q=85"],
  ["Anniversary Cakes", "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=600&q=85"],
  ["Wedding Cakes", "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=85"],
  ["Chocolate Cakes", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85"],
  ["Designer Cakes", "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=85"],
  ["Photo Cakes", "https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=600&q=85"],
  ["Custom Cakes", "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=85"],
  ["Eggless Cakes", "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=85"]
];

const reviews = [
  ["Priya Sharma", "The cake was beyond beautiful and tasted amazing! Everyone loved it.", "Birthday Cake"],
  ["Rohit Mehta", "Perfect experience from ordering to delivery. The cake looked exactly like the picture.", "Anniversary Cake"],
  ["Neha Verma", "I ordered a custom cake for my daughter's birthday and it was absolutely perfect.", "Custom Cake"]
];

const ADMIN_ID = "pinkbake";
const ADMIN_PASSWORD = "pinkbake";
const BRAND_NAME = "pinkbakes";
const WHATSAPP_NUMBER = "6033430700";
const CONTACT_EMAIL = "pinkbakes@pinkbakes.com";

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All Cakes");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [catalog, setCatalog] = useState(products);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ id: "", password: "" });
  const [adminMessage, setAdminMessage] = useState("");
  const [cakeForm, setCakeForm] = useState({
    name: "",
    price: "",
    category: "Birthday Cakes",
    description: "",
    image: ""
  });

  const filtered = useMemo(() => {
    return catalog.filter(p =>
      (category === "All Cakes" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search, catalog]);

  const cartCount = cart.reduce((n, item) => n + item.qty, 0);
  const cartTotal = cart.reduce((n, item) => n + item.price * item.qty, 0);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function addToCart(p) {
    setCart(prev => {
      const found = prev.find(x => x.id === p.id);
      if (found) return prev.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x);
      return [...prev, {...p, qty: 1, size: "1 kg"}];
    });
    notify(`${p.name} added to your cart`);
  }

  function changeQty(id, delta) {
    setCart(prev => prev.flatMap(x => {
      if (x.id !== id) return [x];
      const qty = x.qty + delta;
      return qty <= 0 ? [] : [{...x, qty}];
    }));
  }

  function scrollTo(id) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
  }

  function subscribe(e) {
    e.preventDefault();
    if (newsletter.trim()) {
      setNewsletterDone(true);
      setNewsletter("");
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault();
    if (
      adminCredentials.id.trim().toLowerCase() === ADMIN_ID &&
      adminCredentials.password.trim() === ADMIN_PASSWORD
    ) {
      setIsAdminLoggedIn(true);
      setAdminOpen(false);
      setAdminCredentials({ id: "", password: "" });
      setAdminMessage("");
      notify("Admin login successful");
      return;
    }
    setAdminMessage("Invalid admin ID or password.");
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    setAdminOpen(false);
    setAdminMessage("");
    setAdminCredentials({ id: "", password: "" });
  }

  function addCake(e) {
    e.preventDefault();

    if (!cakeForm.name.trim() || !cakeForm.price || !cakeForm.description.trim()) {
      setAdminMessage("Please fill in the cake name, price, and description.");
      return;
    }

    const baseImage = cakeForm.image || catalog[0]?.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85";
    const newCake = {
      id: Date.now(),
      name: cakeForm.name.trim(),
      price: Number(cakeForm.price),
      category: cakeForm.category,
      rating: 4.8,
      badge: "New",
      description: cakeForm.description.trim(),
      image: baseImage,
      gallery: [baseImage, baseImage]
    };

    setCatalog(prev => [newCake, ...prev]);
    setCakeForm({ name: "", price: "", category: "Birthday Cakes", description: "", image: "" });
    setAdminMessage("Cake added successfully.");
    notify(`${newCake.name} added to the catalog`);
  }

  function removeCake(id) {
    setCatalog(prev => prev.filter(p => p.id !== id));
    setAdminMessage("Cake removed successfully.");
    notify("Cake removed from catalog");
  }

  return (
    <div className="site">
      <header className="header">
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X/> : <Menu/>}
        </button>
        <div className="brand" onClick={() => scrollTo("home")}>
          <div className="brand-mark"><CakeSlice size={21}/></div>
          <div><strong>{BRAND_NAME}</strong><small>CAKES FOR EVERY MOMENT</small></div>
        </div>
        <nav className={mobileOpen ? "nav mobile-visible" : "nav"}>
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("cakes")}>Cakes</button>
          <button onClick={() => scrollTo("categories")}>Categories</button>
          <button onClick={() => scrollTo("custom")}>Custom Cakes</button>
          <button onClick={() => scrollTo("about")}>About Us</button>
          <button onClick={() => scrollTo("gallery")}>Gallery</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
        <div className="header-actions">
          <button className="icon-btn search-toggle" onClick={() => document.getElementById("search")?.focus()}><Search/></button>
          <button className="icon-btn hide-mobile"><UserRound/></button>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            <ShoppingBag/><span>{cartCount}</span>
          </button>
          <button className="admin-login-btn" onClick={() => isAdminLoggedIn ? setAdminOpen(true) : setAdminOpen(true)}>{isAdminLoggedIn ? "Admin" : "Admin Login"}</button>
          <button className="order-top" onClick={() => scrollTo("cakes")}>Order Now</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy reveal">
            <span className="eyebrow">PREMIUM • FRESH • HANDCRAFTED</span>
            <h1>Beautiful Cakes,<br/>Made for Your<br/><em>Beautiful Moments</em></h1>
            <p>From birthdays to anniversaries, we create cakes that make your celebrations sweeter and your memories last longer.</p>
            <div className="hero-buttons">
              <button className="btn primary" onClick={() => scrollTo("cakes")}>Explore Cakes <ArrowRight size={16}/></button>
              <button className="btn secondary" onClick={() => scrollTo("custom")}>Order Your Cake</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=90" alt="Premium chocolate cake"/>
            <div className="hero-note">Life is<br/><em>sweeter</em><br/>with cake <span>♡</span></div>
          </div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-head center">
            <span className="eyebrow">SHOP BY CATEGORY</span>
            <h2>Find the Perfect Cake for Every Occasion</h2>
          </div>
          <div className="category-grid">
            {categories.map(([name,img]) => (
              <button key={name} className="category-card" onClick={() => {setCategory(name); scrollTo("cakes")}}>
                <img src={img} alt={name}/><span>{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cakes-section section" id="cakes">
          <div className="section-head">
            <div><span className="eyebrow">OUR SIGNATURE CAKES</span><h2>Customer Favorites</h2></div>
            <button className="text-link" onClick={() => setCategory("All Cakes")}>View All Cakes <ArrowRight size={16}/></button>
          </div>

          <div className="catalog-toolbar">
            <div className="chips">
              {["All Cakes","Birthday Cakes","Anniversary Cakes","Chocolate Cakes","Designer Cakes"].map(c =>
                <button className={category === c ? "chip active" : "chip"} key={c} onClick={() => setCategory(c)}>{c}</button>
              )}
            </div>
            <div className="searchbox">
              <Search size={16}/><input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cakes..."/>
            </div>
          </div>

          <div className="product-grid">
            {filtered.map(p => (
              <article className="product-card" key={p.id}>
                <div className="product-media">
                  <img src={p.image} alt={p.name}/>
                  {p.badge && <span className="badge">{p.badge}</span>}
                  <button className="heart"><Heart size={17}/></button>
                  <button className="quick-view" onClick={() => setProduct(p)}><ZoomIn size={15}/> Quick View</button>
                </div>
                <div className="product-body">
                  <div className="rating"><Star size={13} fill="currentColor"/>{p.rating}</div>
                  <h3>{p.name}</h3><p>{p.description}</p>
                  <strong>₹{p.price.toLocaleString("en-IN")}</strong>
                  <div className="sizes"><span>0.5 kg</span><span>1 kg</span><span>1.5 kg</span><span>2 kg</span></div>
                  <div className="product-actions">
                    <button className="btn secondary small" onClick={() => setProduct(p)}>View Cake</button>
                    <button className="btn primary small" onClick={() => addToCart(p)}>Add to Cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <div className="empty">No cakes found. Try another search or category.</div>}
        </section>

        <section className="benefits section" id="about">
          {[
            [CakeSlice,"Freshly Baked","Every Day"],[Sparkles,"Premium","Ingredients"],[Heart,"Custom","Designs"],
            [Leaf,"Eggless","Options"],[CalendarDays,"Same Day / Advance","Ordering"],[ShieldCheck,"Hygienic","Preparation"]
          ].map(([Icon,a,b]) => <div className="benefit" key={a}><Icon/><b>{a}</b><span>{b}</span></div>)}
        </section>

        <section className="custom-banner section" id="custom">
          <div className="custom-image"><img src="https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1100&q=85" alt="Custom cake"/></div>
          <div className="custom-copy">
            <span className="eyebrow">DREAM IT • WE'LL BAKE IT</span>
            <h2>Create Your Custom Cake</h2>
            <p>Have a special idea in mind? Let us bring it to life with a cake designed just for you.</p>
            <button className="btn primary" onClick={() => notify("Custom cake request form coming next")}>Design Your Custom Cake</button>
          </div>
          <div className="custom-points">
            <span><Check/> Personalized Designs</span><span><Check/> Any Theme</span><span><Check/> Any Size</span><span><Check/> Delicious Flavours</span>
          </div>
        </section>

        <section className="experience section">
          <div className="section-head center"><span className="eyebrow">A CLOSER LOOK</span><h2>Experience Your Cake</h2><p>Zoom in, rotate the interactive preview, and explore every detail before you order.</p></div>
          <div className="viewer">
            <div className="viewer-cake" id="viewerCake">
              <div className="cake-shadow"></div>
              <div className="cake-tier top"></div>
              <div className="cake-tier middle"></div>
              <div className="cake-tier base"></div>
              <div className="berries">● ● ● ●</div>
            </div>
            <div className="viewer-controls">
              <button onClick={() => document.getElementById("viewerCake").classList.toggle("spin")}><Rotate3d/> Rotate 3D</button>
              <button onClick={() => document.getElementById("viewerCake").classList.toggle("zoomed")}><ZoomIn/> Zoom</button>
              <span>Interactive preview • 360° ready</span>
            </div>
          </div>
        </section>

        <section className="reviews section">
          <div className="section-head center"><span className="eyebrow">KIND WORDS FROM OUR CUSTOMERS</span><h2>What Our Customers Say</h2></div>
          <div className="review-grid">
            {reviews.map(([name,text,tag],i) => <div className="review" key={name}>
              <div className="avatar">{name[0]}</div><p>“{text}”</p><div className="stars">★★★★★</div><b>{name}</b><small>{tag}</small>
            </div>)}
          </div>
        </section>

        <section className="gallery section" id="gallery">
          <div className="section-head">
            <div><span className="eyebrow">FOLLOW OUR SWEET JOURNEY</span><h2>Made to Be Shared</h2></div>
            <button className="outline-pill" onClick={() => notify("Opening Instagram...")}><Instagram size={15}/> Follow on Instagram</button>
          </div>
          <div className="gallery-grid">
            {[
              "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85",
              "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=85",
              "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=85",
              "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=85",
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=85",
              "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=85"
            ].map((src,i)=><img key={i} src={src} alt="Cake gallery"/>)
            }
          </div>
        </section>

        <section className="contact-strip section" id="contact">
          <div><MapPin/><span><b>Visit Our Bakery</b><small>Open daily • 10 AM – 9 PM</small></span></div>
          <div><MessageCircle/><span><b>WhatsApp Orders</b><small><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">{WHATSAPP_NUMBER}</a></small></span></div>
          <div><Mail/><span><b>Email Us</b><small><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></small></span></div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand"><div className="brand-mark"><CakeSlice size={21}/></div><strong>{BRAND_NAME}</strong><small>CAKES FOR EVERY MOMENT</small><p>Handcrafted cakes made for life's sweetest celebrations.</p></div>
          <div><h4>Explore</h4><button onClick={() => scrollTo("cakes")}>Cakes</button><button onClick={() => scrollTo("categories")}>Categories</button><button onClick={() => scrollTo("custom")}>Custom Cakes</button><button onClick={() => scrollTo("gallery")}>Gallery</button></div>
          <div><h4>Company</h4><button onClick={() => notify("About page coming next")}>About Us</button><button onClick={() => notify("Contact page coming next")}>Contact</button><button onClick={() => notify("Delivery policy coming next")}>Shipping & Delivery</button><button onClick={() => notify("Refund policy coming next")}>Refund Policy</button></div>
          <div className="newsletter"><h4>Subscribe for latest updates</h4><form onSubmit={subscribe}><input value={newsletter} onChange={e=>setNewsletter(e.target.value)} placeholder="Your email address" type="email" required/><button aria-label="Subscribe"><ArrowRight/></button></form>{newsletterDone && <span className="subscribed"><Check size={14}/> You're subscribed!</span>}<div className="social"><Instagram/><MessageCircle/><Heart/></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 {BRAND_NAME}. All rights reserved.</span><span>Privacy Policy &nbsp; | &nbsp; Terms & Conditions &nbsp; | &nbsp; Shipping & Delivery &nbsp; | &nbsp; Refund Policy</span></div>
      </footer>

      {product && <ProductModal product={product} onClose={() => setProduct(null)} onAdd={() => {addToCart(product); setProduct(null)}}/>}

      {adminOpen && !isAdminLoggedIn && (
        <div className="admin-modal-backdrop" onClick={() => setAdminOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Admin Login</h3>
              <button onClick={() => setAdminOpen(false)}><X/></button>
            </div>
            <form className="admin-form" onSubmit={handleAdminLogin}>
              <label>
                Admin ID
                <input value={adminCredentials.id} onChange={e => setAdminCredentials(prev => ({ ...prev, id: e.target.value }))} placeholder="pinkbake" />
              </label>
              <label>
                Password
                <input type="password" value={adminCredentials.password} onChange={e => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))} placeholder="pinkbake" />
              </label>
              {adminMessage && <span className="admin-error">{adminMessage}</span>}
              <button type="submit" className="btn primary full">Login</button>
            </form>
          </div>
        </div>
      )}

      {isAdminLoggedIn && (
        <aside className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">ADMIN PANEL</span>
              <h2>{BRAND_NAME} Dashboard</h2>
            </div>
            <button className="btn secondary small" onClick={handleAdminLogout}>Logout</button>
          </div>

          <div className="admin-content">
            <form className="admin-form add-cake-form" onSubmit={addCake}>
              <h3>Add New Cake</h3>
              <label>
                Cake Name
                <input value={cakeForm.name} onChange={e => setCakeForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Strawberry Delight" />
              </label>
              <label>
                Price (₹)
                <input type="number" value={cakeForm.price} onChange={e => setCakeForm(prev => ({ ...prev, price: e.target.value }))} placeholder="1299" />
              </label>
              <label>
                Category
                <select value={cakeForm.category} onChange={e => setCakeForm(prev => ({ ...prev, category: e.target.value }))}>
                  {[
                    "Birthday Cakes",
                    "Anniversary Cakes",
                    "Wedding Cakes",
                    "Chocolate Cakes",
                    "Designer Cakes",
                    "Photo Cakes",
                    "Custom Cakes",
                    "Eggless Cakes"
                  ].map(categoryName => <option key={categoryName} value={categoryName}>{categoryName}</option>)}
                </select>
              </label>
              <label>
                Description
                <textarea value={cakeForm.description} onChange={e => setCakeForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Rich chocolate sponge with smooth cream..." />
              </label>
              <label>
                Image URL
                <input value={cakeForm.image} onChange={e => setCakeForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
              </label>
              {adminMessage && <span className="admin-error">{adminMessage}</span>}
              <button type="submit" className="btn primary full">Add Cake</button>
            </form>

            <div className="admin-cake-list">
              <h3>Current Cakes</h3>
              {catalog.map(item => (
                <div className="admin-cake-item" key={item.id}>
                  <div className="admin-cake-details">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                      <small>₹{item.price.toLocaleString("en-IN")}</small>
                    </div>
                  </div>
                  <button className="admin-remove" onClick={() => removeCake(item.id)}><Trash2 size={15}/> Remove</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head"><h2>Your Cart</h2><button onClick={() => setCartOpen(false)}><X/></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={38}/><h3>Your cart is empty</h3><p>Pick a beautiful cake for your next celebration.</p><button className="btn primary" onClick={() => {setCartOpen(false);scrollTo("cakes")}}>Explore Cakes</button></div> :
          <>
            <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image}/><div><b>{item.name}</b><small>{item.size}</small><strong>₹{(item.price*item.qty).toLocaleString("en-IN")}</strong><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}><Plus/></button><button className="delete" onClick={()=>changeQty(item.id,-item.qty)}><Trash2/></button></div></div></div>)}</div>
            <div className="cart-summary"><div><span>Subtotal</span><b>₹{cartTotal.toLocaleString("en-IN")}</b></div><small>Taxes and delivery calculated at checkout.</small><button className="btn primary checkout" onClick={()=>notify("Checkout is ready to connect to Shopify/Razorpay")}>Proceed to Checkout <ArrowRight/></button></div>
          </>
        }
      </aside>
      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)}></div>}
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function ProductModal({product,onClose,onAdd}) {
  const [image,setImage] = useState(product.gallery[0]);
  const [zoom,setZoom] = useState(false);
  const [threeD,setThreeD] = useState(false);
  const [size,setSize] = useState("1 kg");
  const [eggless,setEggless] = useState(false);
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}><X/></button>
      <div className="modal-gallery">
        <div className={zoom ? "modal-main zoomed" : "modal-main"}><img src={image} alt={product.name}/></div>
        <div className="thumbs">{product.gallery.map(src=><button className={src===image?"selected":""} key={src} onClick={()=>setImage(src)}><img src={src} alt=""/></button>)}</div>
        <div className="viewer-buttons"><button onClick={()=>setZoom(!zoom)}><ZoomIn/> {zoom?"Reset Zoom":"Zoom"}</button><button onClick={()=>setThreeD(!threeD)}><Rotate3d/> {threeD?"Exit 3D":"3D Preview"}</button></div>
        {threeD && <div className="mini-3d"><div className="cake-3d-shape"></div><span>Drag-ready 3D preview</span></div>}
      </div>
      <div className="modal-info">
        <span className="eyebrow">{product.category.toUpperCase()}</span>
        <div className="rating"><Star size={14} fill="currentColor"/>{product.rating} • 120+ reviews</div>
        <h2>{product.name}</h2><p className="modal-desc">{product.description} Hand-finished with premium ingredients and made fresh to order.</p>
        <div className="modal-price">₹{product.price.toLocaleString("en-IN")}</div>
        <label>Choose Size</label><div className="option-row">{["0.5 kg","1 kg","1.5 kg","2 kg"].map(x=><button className={size===x?"selected-option":""} key={x} onClick={()=>setSize(x)}>{x}</button>)}</div>
        <label>Preference</label><div className="option-row"><button className={!eggless?"selected-option":""} onClick={()=>setEggless(false)}>Regular</button><button className={eggless?"selected-option":""} onClick={()=>setEggless(true)}>Eggless</button></div>
        <label>Message on Cake</label><input className="cake-message" placeholder="Happy Birthday..."/>
        <label>Delivery Date</label><input className="cake-message" type="date"/>
        <button className="btn primary full" onClick={onAdd}>Add to Cart <ShoppingBag size={17}/></button>
        <div className="secure"><ShieldCheck/> Freshly made • Secure checkout • Delivery support</div>
      </div>
    </div>
  </div>
}

createRoot(document.getElementById("root")).render(<App />);
