import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Icon } from "../lib/icon.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { to: "/buddy",     label: "Buddy",     icon: "message-circle" },
  { to: "/mood",      label: "Mood",      icon: "bar-chart-3" },
  { to: "/habits",    label: "Habits",    icon: "target" },
  { to: "/journal",   label: "Journal",   icon: "heart" },
  { to: "/sleep",     label: "Sleep",     icon: "moon" },
  { to: "/resources", label: "Resources", icon: "book-open" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const initials =
    (user?.firstName?.[0] || user?.username?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "M").toUpperCase() +
    (user?.lastName?.[0] || "").toUpperCase();

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(255, 250, 245, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(212, 129, 107, 0.15)",
      }}
    >
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dawn-peach)" }}>
          <Icon name="heart-pulse" size={22} strokeWidth={2} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--dawn-text-primary)", letterSpacing: "-0.02em" }}>
            MindCare
          </span>
        </Link>

        <SignedIn>
          <nav className="hide-mobile" style={{ display: "flex", gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--dawn-peach)" : "var(--dawn-text-muted)",
                  background: isActive ? "var(--dawn-peach-subtle)" : "transparent",
                  transition: "all 0.15s",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </SignedIn>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SignedOut>
            <button className="btn btn-ghost" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn btn-primary" onClick={() => navigate("/get-started")}>Get started</button>
          </SignedOut>
          <SignedIn>
            <button
              onClick={() => signOut(() => navigate("/"))}
              title="Sign out"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--dawn-peach), var(--dawn-lavender))",
                color: "#fff", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {initials}
            </button>
          </SignedIn>
        </div>

        <button className="show-mobile btn-icon" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
          <Icon name={menuOpen ? "x" : "menu"} size={20} />
        </button>
      </div>

      {menuOpen && (
        <div
          className="show-mobile slide-down"
          style={{
            borderTop: "1px solid var(--dawn-peach-subtle)",
            background: "var(--dawn-surface)",
            padding: "12px 24px 16px",
            flexDirection: "column",
          }}
        >
          <SignedIn>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  color: isActive ? "var(--dawn-peach)" : "var(--dawn-text-secondary)",
                  background: isActive ? "var(--dawn-peach-subtle)" : "transparent",
                  fontWeight: 500,
                })}
              >
                <Icon name={item.icon} size={18} /> {item.label}
              </NavLink>
            ))}
            <button
              className="btn btn-ghost"
              style={{ marginTop: 8, justifyContent: "flex-start" }}
              onClick={() => { signOut(() => navigate("/")); setMenuOpen(false); }}
            >
              <Icon name="log-out" size={18} /> Sign out
            </button>
          </SignedIn>
          <SignedOut>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => { navigate("/login"); setMenuOpen(false); }}>Log in</button>
              <button className="btn btn-primary" onClick={() => { navigate("/get-started"); setMenuOpen(false); }}>Get started</button>
            </div>
          </SignedOut>
        </div>
      )}
    </header>
  );
};

export default Navbar;
