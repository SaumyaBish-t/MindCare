import { Link } from "react-router-dom";
import { Icon } from "../lib/icon.jsx";

export default function AuthShell({ heading, sub, children }) {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex" }} className="fade-in">
      {/* Brand panel */}
      <div
        className="hide-mobile"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, var(--dawn-gradient-start), var(--dawn-gradient-mid) 60%, var(--dawn-gradient-end))",
          padding: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)", filter: "blur(20px)" }} />
        <div style={{ position: "absolute", bottom: -120, left: -100, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,129,107,0.18), transparent 70%)", filter: "blur(30px)" }} />

        <Link
          to="/"
          className="btn btn-ghost"
          style={{ alignSelf: "flex-start", color: "var(--dawn-text-secondary)", position: "relative", zIndex: 1 }}
        >
          <Icon name="arrow-left" size={16} /> Back to home
        </Link>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <Icon name="heart-pulse" size={32} color="var(--dawn-peach)" strokeWidth={2} />
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--dawn-text-primary)" }}>MindCare</span>
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.2, marginBottom: 16 }}>
            A gentler way to look after your mind.
          </h1>
          <p style={{ fontSize: 16, color: "var(--dawn-text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
            Track moods, build habits, write what you're grateful for, and have a kind conversation — all in one warm place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "shield-check", text: "End-to-end private — your story stays yours." },
              { icon: "sparkles",     text: "Built with therapists, designed for calm." },
              { icon: "clock",        text: "Always here, no waiting room required." },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="icon-bubble icon-bubble-sm" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <Icon name={b.icon} size={14} />
                </div>
                <span style={{ fontSize: 14, color: "var(--dawn-text-secondary)" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", zIndex: 1, fontSize: 12, color: "var(--dawn-text-muted)" }}>
          "It feels like writing to a friend who actually listens." — early user
        </p>
      </div>

      {/* Form panel */}
      <div
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 32, background: "var(--dawn-bg)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <Link to="/" className="btn btn-ghost show-mobile" style={{ marginBottom: 24, color: "var(--dawn-text-secondary)" }}>
            <Icon name="arrow-left" size={16} /> Back
          </Link>

          <h2 style={{ marginBottom: 8 }}>{heading}</h2>
          {sub && <p style={{ fontSize: 14, color: "var(--dawn-text-muted)", marginBottom: 24 }}>{sub}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}
