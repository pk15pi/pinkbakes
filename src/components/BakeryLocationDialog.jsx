import { ArrowRight, CalendarDays, CakeSlice, MapPin, MessageCircle, X } from "lucide-react";

function BakeryLocationDialog({ location, onClose, onShare, onOpenMaps }) {
  return (
    <div className="bakery-visit-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="bakery-visit-title">
      <div className="bakery-visit-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="bakery-visit-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
        <div className="bakery-visit-hero">
          <div className="bakery-visit-hero-glow" aria-hidden="true" />
          <div className="bakery-visit-badge"><CakeSlice size={22}/></div>
          <p className="bakery-visit-eyebrow">Come taste the sweetness</p>
          <h3 id="bakery-visit-title">Visit Our Bakery</h3>
          <p className="bakery-visit-place">{location.label}</p>
        </div>
        <div className="bakery-visit-body">
          <div className="bakery-visit-meta">
            <div className="bakery-visit-chip">
              <CalendarDays size={15}/>
              <span>{location.hours}</span>
            </div>
            <div className="bakery-visit-chip soft">
              <MapPin size={15}/>
              <span>Your current location is used by the actions below</span>
            </div>
          </div>
          <p className="bakery-visit-hint">Choose an action below to share or view a map pin for your current location. Your browser will ask for permission.</p>
          <div className="bakery-visit-actions">
            <button type="button" className="bakery-visit-tile bakery-visit-wa" onClick={onShare}>
              <span className="bakery-visit-tile-icon"><MessageCircle size={22}/></span>
              <span className="bakery-visit-tile-copy">
                <strong>Share on WhatsApp</strong>
                <small>Share a map pin of your current location</small>
              </span>
              <ArrowRight size={16} className="bakery-visit-tile-arrow"/>
            </button>
            <button type="button" className="bakery-visit-tile bakery-visit-maps" onClick={onOpenMaps}>
              <span className="bakery-visit-tile-icon"><MapPin size={22}/></span>
              <span className="bakery-visit-tile-copy">
                <strong>Open in Google Maps</strong>
                <small>View a map pin of your current location</small>
              </span>
              <ArrowRight size={16} className="bakery-visit-tile-arrow"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BakeryLocationDialog;
