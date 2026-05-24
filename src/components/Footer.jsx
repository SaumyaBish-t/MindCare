import { Link } from "react-router-dom";
import { Icon } from "../lib/icon.jsx";

const COLS = [
  { title: "Product", items: [
    { label: "Buddy", to: "/buddy" },
    { label: "Mood tracker", to: "/mood" },
    { label: "Habits", to: "/habits" },
    { label: "Journal", to: "/journal" },
    { label: "Sleep", to: "/sleep" },
  ]},
  { title: "Resources", items: [
    { label: "Library", to: "/resources" },
    { label: "Crisis line", to: "/resources" },
  ]},
  { title: "Legal", items: [
    { label: "Privacy", to: "#" },
    { label: "Terms", to: "#" },
    { label: "Cookie policy", to: "#" },
  ]},
  { title: "Connect", items: [
    { label: "Twitter", to: "#" },
    { label: "Instagram", to: "#" },
    { label: "Newsletter", to: "#" },
  ]},
];

const Footer = () => (
  <footer style={{ background: "var(--dawn-text-primary)", color: "#fce8d8", marginTop: 80 }}>
    <div className="container" style={{ padding: "56px 24px 32px" }}>
      <div className="footer-grid">
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="heart-pulse" size={22} color="#e8a590" strokeWidth={2} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>MindCare</span>
          </div>
          <p style={{ fontSize: 14, color: "#d4a890", lineHeight: 1.6 }}>
            A safe space for your mental wellness. Built with care, designed for calm.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {col.title}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.items.map((it) => (
                <li key={it.label}>
                  <Link to={it.to} style={{ fontSize: 14, color: "#d4a890" }}>{it.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 40, paddingTop: 24,
          borderTop: "1px solid rgba(252, 232, 216, 0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#a8896f" }}>© {new Date().getFullYear()} MindCare. All rights reserved.</span>
        <span style={{ fontSize: 13, color: "#a8896f" }}>Made with care.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
