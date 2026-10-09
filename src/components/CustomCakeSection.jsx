import { MessageCircle } from "lucide-react";
import { CustomCakePoints } from "./HomeSections";

function CustomCakeSection({ customBrief, setCustomBrief, sendCustomBrief, setCategory, scrollTo }) {
  return (
    <section className="custom-banner section" id="custom">
      <div className="custom-image"><img src="https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1100&q=85" alt="Custom celebration cake" loading="lazy" width="1100" height="800" /></div>
      <div className="custom-copy">
        <span className="eyebrow">DREAM IT * WE'LL BAKE IT</span>
        <h2>Create Your Custom Cake</h2>
        <p>Share a quick cake brief - occasion, size, flavor, and theme - and we'll reply on WhatsApp with ideas and pricing.</p>
        <form className="custom-brief" onSubmit={(e) => { e.preventDefault(); sendCustomBrief(); }}>
          <div className="custom-brief-row">
            <label>Occasion
              <select value={customBrief.occasion} onChange={(e) => setCustomBrief({ ...customBrief, occasion: e.target.value })} required>
                <option value="">Select occasion</option>
                <option>Birthday</option>
                <option>Wedding</option>
                <option>Anniversary</option>
                <option>Baby Shower</option>
                <option>Corporate</option>
                <option>Other</option>
              </select>
            </label>
            <label>Servings
              <select value={customBrief.servings} onChange={(e) => setCustomBrief({ ...customBrief, servings: e.target.value })}>
                <option value="">Select size</option>
                <option>6-8</option>
                <option>10-12</option>
                <option>15-20</option>
                <option>25+</option>
                <option>Not sure yet</option>
              </select>
            </label>
          </div>
          <div className="custom-brief-row">
            <label>Flavor
              <input type="text" placeholder="e.g. Chocolate, Red velvet" value={customBrief.flavor} onChange={(e) => setCustomBrief({ ...customBrief, flavor: e.target.value })} />
            </label>
            <label>Preferred date
              <input type="date" value={customBrief.preferredDate} onChange={(e) => setCustomBrief({ ...customBrief, preferredDate: e.target.value })} />
            </label>
          </div>
          <label>Theme / idea
            <textarea rows={2} placeholder="Colors, character, photo cake, message..." value={customBrief.theme} onChange={(e) => setCustomBrief({ ...customBrief, theme: e.target.value })} />
          </label>
          <div className="custom-brief-row">
            <label>Your name
              <input type="text" placeholder="Name" value={customBrief.name} onChange={(e) => setCustomBrief({ ...customBrief, name: e.target.value })} />
            </label>
            <label>Phone <span className="optional">(optional)</span>
              <input type="tel" placeholder="WhatsApp number" value={customBrief.phone} onChange={(e) => setCustomBrief({ ...customBrief, phone: e.target.value })} />
            </label>
          </div>
          <div className="custom-brief-actions">
            <button type="submit" className="btn primary"><MessageCircle size={15}/> Send brief on WhatsApp</button>
            <button type="button" className="btn secondary" onClick={() => { setCategory("Custom Cakes"); scrollTo("cakes"); }}>Browse custom cakes</button>
          </div>
        </form>
      </div>
      <CustomCakePoints />
    </section>
  );
}

export default CustomCakeSection;
