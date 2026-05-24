import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { Icon } from "../lib/icon.jsx";
import { PageHeader, useToast } from "../components/ui-common.jsx";

const STORAGE_KEY = "mindcare:sleep";

const AFFIRMATIONS = [
  "Rest is productive too.",
  "Sleep is how you say yes to tomorrow.",
  "Your body is doing repair work right now.",
  "Quiet nights make for bright mornings.",
  "You've earned this slowdown.",
];

const TRACKS = {
  rain:  { title: "Rain in the forest", desc: "Soft, steady drizzle on canopy leaves", icon: "cloud-rain", embed: "https://open.spotify.com/embed/playlist/7f24KaDrATReBg45esAgX8" },
  waves: { title: "Ocean waves",        desc: "Slow tide rolling in and back out",      icon: "waves",     embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4wta20PHgwo" },
  piano: { title: "Sleepy piano",       desc: "Minimal, drifting melodies for letting go", icon: "music", embed: "https://open.spotify.com/embed/playlist/3QdD9wpA7kugRfqjAdOh5N" },
  fire:  { title: "Fireplace",          desc: "Gentle crackle, low and warm",          icon: "flame",     embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2oU49YwtXI2" },
};

const calcDuration = (bed, wake) => {
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
};

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const bg = (c) => ({ peach: "var(--dawn-peach-subtle)", info: "var(--dawn-info-bg)", lavender: "var(--dawn-lavender-bg)" }[c]);
const fg = (c) => ({ peach: "var(--dawn-peach)", info: "var(--dawn-info)", lavender: "#8a5fbf" }[c]);

function SleepStat({ icon, label, value, accent, small }) {
  return (
    <div className="card" style={{ padding: 18, background: "var(--dawn-surface-alt)", border: "none", display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
      <div className="icon-bubble" style={{ background: bg(accent), color: fg(accent) }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, color: "var(--dawn-text-muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: small ? 14 : 20, fontWeight: small ? 500 : 700, color: small ? "var(--dawn-text-primary)" : fg(accent), lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

const Sleep = () => {
  const [entries, setEntries] = useState([]);
  const [bedtime, setBedtime] = useState("22:30");
  const [waketime, setWaketime] = useState("06:30");
  const [breathePhase, setBreathePhase] = useState("Inhale");
  const [breatheActive, setBreatheActive] = useState(false);
  const [musicTab, setMusicTab] = useState("rain");
  const { show, node: toastNode } = useToast();

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setEntries(raw);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!breatheActive) return;
    const phases = ["Inhale", "Hold", "Exhale", "Hold"];
    let i = 0;
    setBreathePhase(phases[0]);
    const iv = setInterval(() => {
      i = (i + 1) % phases.length;
      setBreathePhase(phases[i]);
    }, 4000);
    return () => clearInterval(iv);
  }, [breatheActive]);

  const duration = calcDuration(bedtime, waketime);
  const score = duration >= 7 && duration <= 9 ? "Great" : duration >= 6 ? "Okay" : "Low";
  const scoreColor = score === "Great" ? "success" : score === "Okay" ? "warning" : "danger";
  const numericScore = score === "Great" ? 88 : score === "Okay" ? 72 : 55;

  const saveSleep = () => {
    const entry = {
      id: Date.now(),
      bedtime, waketime, duration,
      score: numericScore,
      date: new Date().toLocaleDateString("en", { weekday: "short" }),
      ts: Date.now(),
    };
    const next = [entry, ...entries].slice(0, 30);
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    show("Sleep logged");
  };

  const affirmation = AFFIRMATIONS[Math.floor((Date.now() / 86400000) % AFFIRMATIONS.length)];
  const chartData = [...entries].slice(0, 7).reverse().map((e) => ({ date: e.date, hours: e.duration, score: e.score }));

  return (
    <div className="container fade-in" style={{ padding: "40px 24px 64px", maxWidth: 1120 }}>
      <PageHeader
        icon="moon"
        title="Sleep tracker"
        subtitle="Log your hours, find calming sounds, and end the day with intention."
      />

      <div className="grid-sleep-top">
        {/* Input */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Last night</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">
                <Icon name="moon" size={12} style={{ marginRight: 4, verticalAlign: "-1px" }} /> Bedtime
              </label>
              <input type="time" className="field" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">
                <Icon name="sun" size={12} style={{ marginRight: 4, verticalAlign: "-1px" }} /> Wake time
              </label>
              <input type="time" className="field" value={waketime} onChange={(e) => setWaketime(e.target.value)} />
            </div>
          </div>
          <div
            style={{
              padding: 14, background: "var(--dawn-surface-alt)", borderRadius: 12,
              marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>Duration</span>
            <span style={{ fontWeight: 600, color: "var(--dawn-text-primary)" }}>
              {duration}h <span className={`pill pill-${scoreColor}`} style={{ marginLeft: 6, fontSize: 11 }}>{score}</span>
            </span>
          </div>
          <button className="btn btn-primary" onClick={saveSleep} style={{ width: "100%" }}>
            <Icon name="check" size={16} /> Save sleep
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SleepStat icon="moon" accent="info" label="Avg duration" value={`${avg(chartData.map((d) => d.hours)).toFixed(1)}h`} />
          <SleepStat icon="star" accent="peach" label="Sleep score" value={`${Math.round(avg(chartData.map((d) => d.score)))}/100`} />
          <SleepStat icon="sparkles" accent="lavender" label="Tonight's affirmation" value={affirmation} small />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Past week</h3>
            <span style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>Hours of sleep</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,129,107,0.12)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 12]} />
                <Tooltip
                  contentStyle={{ background: "var(--dawn-surface)", border: "1px solid var(--dawn-peach-subtle)", borderRadius: 10, fontSize: 13 }}
                  cursor={{ fill: "rgba(212,129,107,0.08)" }}
                />
                <Bar dataKey="hours" fill="var(--dawn-peach)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid-sleep-bottom" style={{ marginTop: 24 }}>
        {/* Breathe */}
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <h3 style={{ marginBottom: 6 }}>Breathe</h3>
          <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 24 }}>
            Box breathing — 4 in, 4 hold, 4 out, 4 hold.
          </p>
          <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, var(--dawn-peach-subtle), transparent 70%)" }} />
            <div
              style={{
                width: 130, height: 130, borderRadius: "50%",
                border: "3px solid var(--dawn-peach)",
                background: "rgba(255,232,214,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--dawn-text-primary)", fontSize: 16, fontWeight: 600,
                animation: breatheActive ? "breathe 16s ease-in-out infinite" : "none",
                transition: "all 0.3s",
              }}
            >
              {breatheActive ? breathePhase : "Ready"}
            </div>
          </div>
          <button className={breatheActive ? "btn btn-secondary" : "btn btn-primary"} onClick={() => setBreatheActive((v) => !v)}>
            <Icon name={breatheActive ? "pause" : "play"} size={16} />
            {breatheActive ? "Pause" : "Start breathing"}
          </button>
        </div>

        {/* Music */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Sleep sounds</h3>
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
            {Object.entries(TRACKS).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setMusicTab(key)}
                className={musicTab === key ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                style={{ background: musicTab === key ? "var(--dawn-peach)" : "var(--dawn-surface-alt)", color: musicTab === key ? "#fff" : "var(--dawn-text-secondary)" }}
              >
                <Icon name={t.icon} size={14} />
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div
            style={{
              padding: 20,
              background: "linear-gradient(135deg, var(--dawn-gradient-mid), var(--dawn-gradient-end))",
              borderRadius: 14, display: "flex", alignItems: "center", gap: 16, marginBottom: 16,
            }}
          >
            <div className="icon-bubble icon-bubble-lg" style={{ background: "rgba(255,255,255,0.6)", color: "var(--dawn-peach)" }}>
              <Icon name={TRACKS[musicTab].icon} size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--dawn-text-primary)", marginBottom: 2 }}>{TRACKS[musicTab].title}</div>
              <div style={{ fontSize: 13, color: "var(--dawn-text-secondary)" }}>{TRACKS[musicTab].desc}</div>
            </div>
          </div>
          <iframe
            title={TRACKS[musicTab].title}
            style={{ borderRadius: 12, border: "none" }}
            src={TRACKS[musicTab].embed}
            width="100%"
            height="200"
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>

      {toastNode}
    </div>
  );
};

export default Sleep;
