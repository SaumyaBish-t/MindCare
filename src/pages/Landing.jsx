import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icon.jsx";

const FEATURES = [
  { icon: "brain",        title: "AI Support",       desc: "A gentle companion that listens without judgement, ready when you need it." },
  { icon: "shield-check", title: "Private & Secure", desc: "Everything stays between you and your space. End-to-end encrypted." },
  { icon: "activity",     title: "Instant Insights", desc: "Type how you feel and get a kind, honest reflection in seconds." },
  { icon: "clock",        title: "24/7 Companion",   desc: "Whether it's 3am anxiety or a Sunday reflection — we're here." },
];

const JOURNEY = [
  { icon: "message-circle", title: "Buddy",     desc: "A thoughtful chat companion for whatever's on your mind.",   to: "/buddy" },
  { icon: "bar-chart-3",    title: "Mood",      desc: "Understand the patterns in how you've been feeling.",      to: "/mood" },
  { icon: "target",         title: "Habits",    desc: "Tiny rituals that compound into bigger change.",           to: "/habits" },
  { icon: "heart",          title: "Gratitude", desc: "A daily reminder of what's working in your life.",         to: "/journal" },
  { icon: "moon",           title: "Sleep",     desc: "Track rest and unwind with calming sounds.",               to: "/sleep" },
  { icon: "book-open",      title: "Resources", desc: "Hand-picked reads, videos, and crisis support.",           to: "/resources" },
];

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--dawn-gradient-start) 0%, var(--dawn-gradient-mid) 50%, var(--dawn-gradient-end) 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "96px 0 112px",
        }}
      >
        <div style={{ position: "absolute", top: -120, right: -100, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)", filter: "blur(20px)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,129,107,0.18), transparent 70%)", filter: "blur(30px)" }} />

        <div className="container" style={{ position: "relative", textAlign: "center", maxWidth: 720 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.5)",
              backdropFilter: "blur(8px)",
              fontSize: 13, fontWeight: 500, color: "var(--dawn-text-secondary)",
              marginBottom: 24,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dawn-success)" }} />
            Always here when you need us
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, marginBottom: 18 }}>
            A safe space for your<br />mental wellness.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--dawn-text-secondary)", maxWidth: 540, margin: "0 auto 32px" }}>
            Track your mood, build calming habits, journal your thoughts, and talk to a gentle companion — all in one warm, private place.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/get-started")}>
              Start free session <Icon name="arrow-right" size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/resources")}>
              Learn more
            </button>
          </div>
          <p style={{ marginTop: 22, fontSize: 13, color: "var(--dawn-text-muted)" }}>
            <Icon name="shield-check" size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
            Private & secure · No account needed to explore
          </p>
        </div>
      </section>

      {/* Why MindCare */}
      <section style={{ padding: "80px 0", background: "var(--dawn-bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
            <span className="pill pill-peach"><Icon name="sparkles" size={13} /> Why MindCare</span>
            <h2 style={{ marginTop: 12, marginBottom: 10 }}>Wellness, designed to feel calm.</h2>
            <p style={{ color: "var(--dawn-text-muted)" }}>
              Four pillars that make MindCare feel less like an app and more like a quiet conversation.
            </p>
          </div>
          <div className="grid-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover" style={{ padding: 24 }}>
                <div className="icon-bubble" style={{ marginBottom: 16 }}><Icon name={f.icon} size={22} /></div>
                <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--dawn-text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section style={{ padding: "32px 0 80px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            <span className="pill pill-lavender"><Icon name="compass" size={13} /> Your toolkit</span>
            <h2 style={{ marginTop: 12, marginBottom: 10 }}>Six gentle ways to feel better.</h2>
            <p style={{ color: "var(--dawn-text-muted)" }}>Mix and match — there's no right order.</p>
          </div>
          <div className="grid-3">
            {JOURNEY.map((card) => (
              <div
                key={card.title}
                className="card card-hover"
                style={{ padding: 24, cursor: "pointer" }}
                onClick={() => navigate("/get-started")}
              >
                <div className="icon-bubble icon-bubble-lg" style={{ marginBottom: 18 }}>
                  <Icon name={card.icon} size={26} />
                </div>
                <h3 style={{ marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: "var(--dawn-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{card.desc}</p>
                <button className="btn btn-ghost btn-sm" style={{ padding: "4px 0", color: "var(--dawn-peach)" }}>
                  Open {card.title} <Icon name="arrow-right" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ padding: "64px 0", background: "var(--dawn-surface-alt)" }}>
        <div className="container-sm" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ width: 4, alignSelf: "stretch", minHeight: 80, background: "var(--dawn-peach)", borderRadius: 2 }} />
          <div>
            <blockquote style={{ fontSize: 22, lineHeight: 1.5, fontStyle: "italic", color: "var(--dawn-text-primary)", margin: 0, fontWeight: 500 }}>
              You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person. It makes you human.
            </blockquote>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--dawn-text-muted)" }}>— Lori Deschene</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0", background: "linear-gradient(135deg, var(--dawn-gradient-start), var(--dawn-gradient-mid))", textAlign: "center" }}>
        <div className="container-md">
          <h2 style={{ marginBottom: 14, fontSize: 28 }}>Take one small step forward.</h2>
          <p style={{ color: "var(--dawn-text-secondary)", maxWidth: 480, margin: "0 auto 28px" }}>
            You don't have to figure it all out today. Just begin — we'll be here, gently, the whole way.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/get-started")}>
            Begin your journey <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
