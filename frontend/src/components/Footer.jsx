import { QRCodeSVG } from "qrcode.react";
import { SITE } from "../data/catalog.js";

export default function Footer() {
  const footer = SITE.footer || {};
  const contacts = Array.isArray(footer.contacts) ? footer.contacts : [];
  const formUrl = footer.feedbackFormUrl || "";

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-contact">
          <p className="footer-kicker">{footer.contactKicker || "Liên hệ"}</p>
          <ul>
            {contacts.map((item) => (
              <li key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                {item.href ? (
                  <a href={item.href}>{item.value}</a>
                ) : (
                  <strong>{item.value}</strong>
                )}
              </li>
            ))}
          </ul>
        </div>
        {formUrl ? (
          <div className="footer-qr">
            <p className="footer-kicker">{footer.feedbackKicker || "Đánh giá trải nghiệm"}</p>
            <p className="footer-hint">{footer.feedbackHint || ""}</p>
            <div className="qr-frame">
              <QRCodeSVG
                value={formUrl}
                size={72}
                bgColor="#fffdf8"
                fgColor="#1b4d4a"
                level="M"
                includeMargin
              />
            </div>
            <a className="footer-form-link" href={formUrl} target="_blank" rel="noreferrer">
              {footer.feedbackLink || "Mở form đánh giá"}
            </a>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
