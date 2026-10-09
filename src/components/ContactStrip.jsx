import { Mail, MapPin, MessageCircle } from "lucide-react";

function ContactStrip({ bakeryHours, whatsappNumber, whatsappLinkNumber, contactEmail, onVisit, bakeryLocationOpen }) {
  return (
    <section className="contact-strip section" id="contact">
      <button
        type="button"
        className="contact-card"
        onClick={onVisit}
        aria-haspopup="dialog"
        aria-expanded={bakeryLocationOpen}
      >
        <span className="contact-card-icon contact-card-icon-bakery" aria-hidden="true">
          <MapPin size={22}/>
        </span>
        <span className="contact-card-body">
          <span className="contact-card-eyebrow">Come taste the sweetness</span>
          <b>Visit Our Bakery</b>
          <small>{bakeryHours}</small>
          <span className="contact-card-note">Share location or open maps</span>
        </span>
        <span className="contact-card-pill">Visit</span>
      </button>

      <a className="contact-card" href={`https://wa.me/${whatsappLinkNumber}`} target="_blank" rel="noreferrer">
        <span className="contact-card-icon contact-card-icon-wa" aria-hidden="true">
          <MessageCircle size={22}/>
        </span>
        <span className="contact-card-body">
          <span className="contact-card-eyebrow">Fastest replies</span>
          <b>WhatsApp Orders</b>
          <small>+91 {whatsappNumber}</small>
          <span className="contact-card-note">Custom cakes, status, and help</span>
        </span>
        <span className="contact-card-pill">Chat now</span>
      </a>

      <a className="contact-card" href={`mailto:${contactEmail}`}>
        <span className="contact-card-icon contact-card-icon-mail" aria-hidden="true">
          <Mail size={22}/>
        </span>
        <span className="contact-card-body">
          <span className="contact-card-eyebrow">We write back</span>
          <b>Email Us</b>
          <small>{contactEmail}</small>
          <span className="contact-card-note">Quotes, invoices, and feedback</span>
        </span>
        <span className="contact-card-pill">Send email</span>
      </a>
    </section>
  );
}

export default ContactStrip;
