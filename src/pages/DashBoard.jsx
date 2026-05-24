import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Icon } from "../lib/icon.jsx";
import { api } from "../lib/api.js";

const bg = (c) => ({
  peach: "var(--dawn-peach-subtle)",
  success: "var(--dawn-success-bg)",
  info: "var(--dawn-info-bg)",
  lavender: "var(--dawn-lavender-bg)",
  warning: "var(--dawn-warning-bg)",
  danger: "var(--dawn-danger-bg)",
}[c]);
const fg = (c) => ({
  peach: "var(--dawn-peach)",
  success: "var(--dawn-success)",
  info: "var(--dawn-info)",
  lavender: "#8a5fbf",
  warning: "var(--dawn-warning)",
  danger: "var(--dawn-danger)",
}[c]);

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

function StatCard({ icon, label, value, sub, accent, progress, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card card-hover"
      style={{
        padding: 28, textAlign: "left", background: "var(--dawn-surface)",
        display: "flex", flexDirection: "column", gap: 14, minHeight: 160,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="icon-bubble" style={{ background: bg(accent), color: fg(accent) }}>
          <Icon name={icon} size={20} />
        </div>
        <span style={{ fontSize: 13, color: "var(--dawn-text-muted)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: fg(accent), lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>{sub}</div>
      {progress !== undefined && (
        <div style={{ height: 6, background: "var(--dawn-peach-subtle)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: fg(accent), transition: "width 0.4s ease" }} />
        </div>
      )}
    </button>
  );
}

const QUICK_ACTIONS = [
  { icon: "message-circle", title: "Talk to Buddy",      desc: "Have a gentle conversation",   to: "/buddy",   color: "peach" },
  { icon: "bar-chart-3",    title: "Log your mood",      desc: "Quick sentiment check-in",     to: "/mood",    color: "info" },
  { icon: "heart",          title: "Write in journal",   desc: "Notice something good",        to: "/journal", color: "lavender" },
  { icon: "moon",           title: "Track sleep",        desc: "Log last night's rest",        to: "/sleep",   color: "success" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [habits, setHabits] = useState([]);
  const [moods, setMoods] = useState([]);
  const [journal, setJournal] = useState([]);
  const [sleep, setSleep] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [h, m, g] = await Promise.allSettled([
          api.habitsList(getToken),
          api.sentimentHistory(getToken),
          api.gratitudeList(getToken),
        ]);
        if (!alive) return;
        if (h.status === "fulfilled") setHabits(h.value?.habits || []);
        if (m.status === "fulfilled") setMoods(m.value?.analyses || []);
        if (g.status === "fulfilled") setJournal(g.value?.entries || []);
      } catch (e) {
        console.error("Dashboard load failed:", e);
      }
      try {
        const raw = JSON.parse(localStorage.getItem("mindcare:sleep") || "[]");
        if (alive) setSleep(raw);
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, [getToken]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const name = user?.firstName || user?.username || "friend";

  const todayStr = now.toDateString();
  const habitsDone = habits.filter((h) => {
    const last = h.last_completed || h.lastCompleted;
    return last && new Date(last).toDateString() === todayStr;
  }).length;

  const moodLatest = moods[0];
  const journalToday = journal.filter((e) => new Date(e.createdAt).toDateString() === todayStr).length;
  const lastSleep = sleep[0];

  const recent = [
    ...moods.slice(0, 2).map((e) => ({
      icon: "bar-chart-3",
      title: `Logged a mood entry`,
      sub: (e.inputText || "").slice(0, 60),
      ts: new Date(e.createdAt).getTime(),
    })),
    ...journal.slice(0, 2).map((e) => ({
      icon: "heart",
      title: "Wrote in your journal",
      sub: (e.content || "").slice(0, 60),
      ts: new Date(e.createdAt).getTime(),
    })),
    ...habits
      .filter((h) => {
        const last = h.last_completed || h.lastCompleted;
        return last && new Date(last).toDateString() === todayStr;
      })
      .slice(0, 2)
      .map((h) => ({
        icon: "check-circle-2",
        title: `Completed "${h.title}"`,
        sub: `Habit • ${h.category || "general"}`,
        ts: new Date(h.last_completed || h.lastCompleted).getTime(),
      })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 5);

  return (
    <div className="container fade-in" style={{ padding: "40px 24px 64px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, color: "var(--dawn-text-muted)", marginBottom: 6 }}>{dateStr}</p>
        <h1 style={{ fontSize: 32 }}>{greeting}, {name}.</h1>
        <p style={{ marginTop: 8, color: "var(--dawn-text-secondary)" }}>Here's how you're doing today.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard
          icon="bar-chart-3" label="Mood"
          value={moodLatest ? "Logged" : "Not yet"}
          sub={moodLatest ? "Latest reading" : "Tap to log"}
          accent="peach"
          onClick={() => navigate("/mood")}
        />
        <StatCard
          icon="target" label="Habits"
          value={`${habitsDone}/${habits.length}`}
          sub="Completed today"
          accent="success"
          progress={habits.length ? habitsDone / habits.length : 0}
          onClick={() => navigate("/habits")}
        />
        <StatCard
          icon="moon" label="Sleep"
          value={lastSleep ? `${lastSleep.duration}h` : "—"}
          sub={lastSleep ? `Score ${lastSleep.score}` : "No data"}
          accent="info"
          onClick={() => navigate("/sleep")}
        />
        <StatCard
          icon="heart" label="Gratitude"
          value={`${journalToday}`}
          sub={journalToday === 1 ? "entry today" : "entries today"}
          accent="lavender"
          onClick={() => navigate("/journal")}
        />
      </div>

      <div className="grid-dashboard">
        <div>
          <h2 style={{ marginBottom: 16 }}>Quick actions</h2>
          <div className="grid-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.title}
                className="card card-hover"
                onClick={() => navigate(a.to)}
                style={{ padding: 24, textAlign: "left", display: "flex", gap: 16, alignItems: "center", background: "var(--dawn-surface)", minHeight: 96 }}
              >
                <div className="icon-bubble" style={{ background: bg(a.color), color: fg(a.color) }}>
                  <Icon name={a.icon} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--dawn-text-primary)", marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 14, color: "var(--dawn-text-muted)" }}>{a.desc}</div>
                </div>
                <Icon name="arrow-right" size={18} color="var(--dawn-text-muted)" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 16 }}>Today</h2>
          <div
            className="card"
            style={{ padding: 24, background: "linear-gradient(135deg, var(--dawn-gradient-start), var(--dawn-gradient-mid))", border: "none" }}
          >
            <Icon name="sparkles" size={22} color="var(--dawn-peach)" strokeWidth={2} />
            <h3 style={{ marginTop: 12, marginBottom: 8 }}>Gentle reminder</h3>
            <p style={{ fontSize: 14, color: "var(--dawn-text-secondary)", lineHeight: 1.6 }}>
              You showed up today. That's already a win — small steps count.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, padding: "6px 0", color: "var(--dawn-peach)" }} onClick={() => navigate("/journal")}>
              Write it down <Icon name="arrow-right" size={14} />
            </button>
          </div>

          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon name="flame" size={18} color="var(--dawn-warning)" />
              <span style={{ fontWeight: 600, color: "var(--dawn-text-primary)" }}>Today's habits</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--dawn-text-primary)", marginBottom: 4 }}>
              {habitsDone}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--dawn-text-muted)" }}> / {habits.length || 0} done</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>Keep showing up.</p>
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Recent activity</h2>
          <div className="card" style={{ padding: 8 }}>
            {recent.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 14, alignItems: "center", padding: 16,
                  borderBottom: i < recent.length - 1 ? "1px solid var(--dawn-peach-subtle)" : "none",
                }}
              >
                <div className="icon-bubble icon-bubble-sm"><Icon name={r.icon} size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--dawn-text-primary)" }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: "var(--dawn-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>{timeAgo(r.ts)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
