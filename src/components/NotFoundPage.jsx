import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Full-page "not found" view for unknown URLs (bug 011). Reuses the policy-page styling.
function NotFoundPage({ brandName, onHome, onBrowse }) {
  const onHomeRef = useRef(onHome);
  onHomeRef.current = onHome;
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onHomeRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="policy-page not-found-page" role="region" aria-labelledby="not-found-title">
      <div className="policy-page-bar">
        <button type="button" className="policy-page-brand" onClick={onHome}>{brandName}</button>
        <button type="button" className="policy-page-close" onClick={onHome} aria-label="Go to homepage">
          <X size={18}/>
        </button>
      </div>
      <article className="policy-page-sheet">
        <p className="policy-page-kicker">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="policy-page-summary">
          We couldn't find the page you were looking for. It may have moved, or the link may be mistyped.
        </p>
        <nav className="policy-page-nav" aria-label="Helpful links">
          <button type="button" className="is-current" onClick={onHome}>Go to homepage</button>
          <button type="button" onClick={onBrowse}>Browse cakes</button>
        </nav>
      </article>
    </div>
  );
}

export default NotFoundPage;
