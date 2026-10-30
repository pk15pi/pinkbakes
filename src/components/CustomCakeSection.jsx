import { MessageCircle } from "lucide-react";
import { CustomCakePoints } from "./HomeSections";
import { CUSTOM_CAKE_SERVINGS_OPTIONS, CUSTOM_CAKE_WEIGHT_OPTIONS } from "../appConstants";

function CustomCakeSection({ customBrief, setCustomBrief, sendCustomBrief, setCategory, scrollTo }) {
  return (
    <section className="custom-banner section" id="custom">
      <div className="custom-intro">
        <span className="eyebrow">DREAM IT * WE'LL BAKE IT</span>
        <h2>Create Your Custom Cake</h2>
        <p>Share a quick cake brief - occasion, size, flavor, and theme - and we'll reply on WhatsApp with ideas and pricing.</p>
      </div>
      <div className="custom-image"><img src="https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1100&q=85" alt="Custom celebration cake" loading="lazy" width="1100" height="800" /></div>
      <div className="custom-copy">
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
            <label>Servings <span className="optional">(optional)</span>
              <select value={customBrief.servings} onChange={(e) => setCustomBrief({ ...customBrief, servings: e.target.value })}>
                <option value="">Select servings</option>
                {CUSTOM_CAKE_SERVINGS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <div className="custom-brief-row">
            <label>Cake weight <span className="optional">(optional)</span>
              <select value={customBrief.weight} onChange={(e) => setCustomBrief({ ...customBrief, weight: e.target.value })}>
                <option value="">Select weight</option>
                {CUSTOM_CAKE_WEIGHT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
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
          <label>Your idea / remarks <span className="optional">(optional)</span>
            <textarea rows={3} maxLength={1000} placeholder="Describe your idea: colors, theme, character, photo cake, message on cake, any special requests..." value={customBrief.theme} onChange={(e) => setCustomBrief({ ...customBrief, theme: e.target.value })} />
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
            <button type="button" className="btn secondary" onClick={() => { setCategory("Theme Cake"); scrollTo("cakes"); }}>Browse theme cakes</button>
          </div>
        </form>
      </div>
      <CustomCakePoints />
    </section>
  );
}

export default CustomCakeSection;
