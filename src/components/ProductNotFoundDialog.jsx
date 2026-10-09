import { X } from "lucide-react";

function ProductNotFoundDialog({ onClose, onBrowse }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-label="Cake not found">
      <div className="product-modal" style={{ maxWidth: 480, padding: "2rem", textAlign: "center" }} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X/></button>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Cake not found</h1>
        <p style={{ marginBottom: "1.25rem" }}>This cake is unavailable or no longer listed.</p>
        <button type="button" className="btn primary" onClick={onBrowse}>Browse cakes</button>
      </div>
    </div>
  );
}

export default ProductNotFoundDialog;
