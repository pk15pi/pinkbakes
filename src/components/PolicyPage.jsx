import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { POLICIES, POLICY_SLUGS } from "../policies";

function PolicyPage({ policy, onClose, onOpen, brandName, contactEmail, whatsappNumber, whatsappLinkNumber }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current();
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
    <div className="policy-page" role="dialog" aria-modal="true" aria-labelledby="policy-page-title">
      <div className="policy-page-bar">
        <button type="button" className="policy-page-brand" onClick={onClose}>{brandName}</button>
        <button type="button" className="policy-page-close" onClick={onClose} aria-label="Close policy">
          <X size={18}/>
        </button>
      </div>
      <article className="policy-page-sheet">
        <p className="policy-page-kicker">pinkbakes</p>
        <h1 id="policy-page-title">{policy.title}</h1>
        <p className="policy-page-updated">Updated {policy.updated}</p>
        <p className="policy-page-summary">{policy.summary}</p>
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <p className="policy-page-contact">
          Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          {" "}or WhatsApp <a href={`https://wa.me/${whatsappLinkNumber}`} target="_blank" rel="noreferrer">+91 {whatsappNumber}</a>.
        </p>
        <nav className="policy-page-nav" aria-label="Other policies">
          {POLICY_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              className={slug === policy.slug ? "is-current" : ""}
              onClick={() => onOpen(slug)}
            >
              {POLICIES[slug].title}
            </button>
          ))}
        </nav>
      </article>
    </div>
  );
}

export default PolicyPage;
