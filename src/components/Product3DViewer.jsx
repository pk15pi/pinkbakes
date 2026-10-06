import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { resolveProductModelUrl } from "../productModelMap.js";

const GlbModelCanvas = lazy(() => import("./GlbModelCanvas.jsx"));

function CssRotateFallback({ product, rotX, rotY, scale, pointerHandlers }) {
  const img = product.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85";
  return (
    <div className="product-3d-stage" {...pointerHandlers}>
      <div
        className="product-3d-orbit"
        style={{ transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})` }}
      >
        <img src={img} alt={(product.name || "Cake") + " 3D view"} draggable={false} />
      </div>
    </div>
  );
}

function Product3DViewer({ product, onClose }) {
  const [rotX, setRotX] = useState(12);
  const [rotY, setRotY] = useState(-18);
  const [scale, setScale] = useState(1.35);
  const [modelUrl, setModelUrl] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [useGlb, setUseGlb] = useState(false);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // product fields -> cake-product-map.json (product_id / slug) -> null (CSS fallback)
  useEffect(() => {
    let cancelled = false;
    setModelUrl(null);
    setModelReady(false);
    setUseGlb(false);
    resolveProductModelUrl(product)
      .then((url) => {
        if (cancelled) return;
        if (url) {
          setModelUrl(url);
          setUseGlb(true);
        }
        setModelReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setModelUrl(null);
        setUseGlb(false);
        setModelReady(true);
      });
    return () => { cancelled = true; };
  }, [product]);

  const onGlbError = useCallback(() => {
    setUseGlb(false);
    setModelUrl(null);
  }, []);

  function onPointerDown(e) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setRotY((v) => v + dx * 0.4);
    setRotX((v) => Math.max(-60, Math.min(60, v - dy * 0.35)));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  const pointerHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  const showGlb = modelReady && useGlb && modelUrl;
  const hint = showGlb
    ? "Drag to orbit | 3D model — controls tilt and zoom"
    : "Drag to rotate | Use controls to tilt and zoom";

  return (
    <div className="modal-backdrop product-3d-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="3D cake view">
      <div className="product-3d-panel" onClick={(e) => e.stopPropagation()}>
        <div className="product-3d-head">
          <div>
            <span className="eyebrow">3D VIEW</span>
            <h2>{product.name}</h2>
            <p>{hint}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        {showGlb ? (
          <div className="product-3d-stage product-3d-stage--glb" {...pointerHandlers}>
            <Suspense fallback={<div className="product-3d-loading">Loading 3D model…</div>}>
              <GlbModelCanvas
                url={modelUrl}
                rotX={rotX}
                rotY={rotY}
                scale={scale}
                onError={onGlbError}
              />
            </Suspense>
          </div>
        ) : (
          <CssRotateFallback
            product={product}
            rotX={rotX}
            rotY={rotY}
            scale={scale}
            pointerHandlers={pointerHandlers}
          />
        )}

        <div className="product-3d-controls">
          <button type="button" onClick={() => setRotY((v) => v - 20)} aria-label="Rotate left"><ChevronLeft size={18} /> Left</button>
          <button type="button" onClick={() => setRotY((v) => v + 20)} aria-label="Rotate right">Right <ChevronRight size={18} /></button>
          <button type="button" onClick={() => setRotX((v) => Math.max(-60, v - 12))} aria-label="Tilt up"><ChevronUp size={18} /> Up</button>
          <button type="button" onClick={() => setRotX((v) => Math.min(60, v + 12))} aria-label="Tilt down">Down <ChevronDown size={18} /></button>
          <button type="button" onClick={() => setScale((v) => Math.min(2.2, Number((v + 0.15).toFixed(2))))}><ZoomIn size={15} /> Zoom in</button>
          <button type="button" onClick={() => setScale((v) => Math.max(0.8, Number((v - 0.15).toFixed(2))))}>Zoom out</button>
          <button type="button" onClick={() => { setRotX(12); setRotY(-18); setScale(1.35); }}>Reset</button>
          <button type="button" className="btn primary small" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default Product3DViewer;