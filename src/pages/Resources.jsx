import { useEffect, useState } from "react";
import { Icon } from "../lib/icon.jsx";
import { PageHeader, EmptyState, Spinner } from "../components/ui-common.jsx";
import { searchYoutubeVideos } from "../api/youtubeSearch";

const CATEGORIES = [
  { id: "anxiety",       icon: "wind",        title: "Anxiety",       desc: "Calm racing thoughts and find your ground.", query: "anxiety relief meditation" },
  { id: "depression",    icon: "cloud-rain",  title: "Depression",    desc: "Gentle reads for heavy days.",               query: "coping with depression therapy" },
  { id: "sleep",         icon: "moon",        title: "Sleep",         desc: "Rituals and stories to ease into rest.",     query: "guided sleep meditation" },
  { id: "mindfulness",   icon: "leaf",        title: "Mindfulness",   desc: "Practices for noticing this moment.",        query: "mindfulness meditation for beginners" },
  { id: "relationships", icon: "users",       title: "Relationships", desc: "Connection, boundaries, and repair.",        query: "healthy relationships boundaries" },
  { id: "self-worth",    icon: "sparkles",    title: "Self-worth",    desc: "Recognise your own value.",                  query: "building self worth confidence" },
];

const POPULAR = ["panic attacks", "morning routine", "loneliness", "grief", "burnout"];

const CrisisCard = ({ icon, title, number, sub, href }) => (
  <a
    href={href}
    style={{
      display: "flex", gap: 14, padding: 18,
      background: "rgba(255,255,255,0.6)",
      border: "1px solid rgba(199,80,80,0.15)",
      borderRadius: 12, alignItems: "center", transition: "all 0.15s",
    }}
  >
    <div
      style={{
        width: 44, height: 44, borderRadius: 14,
        background: "rgba(199,80,80,0.12)", color: "var(--dawn-danger)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <Icon name={icon} size={20} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--dawn-danger)", lineHeight: 1.1 }}>{number}</div>
      <div style={{ fontSize: 12, color: "var(--dawn-text-muted)", marginTop: 2 }}>{sub}</div>
    </div>
  </a>
);

function VideoCard({ video, playing, onPlay, fallbackGradient }) {
  return (
    <div className="card card-hover" style={{ overflow: "hidden" }}>
      {playing ? (
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <iframe
            title={video.title}
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{
            position: "relative", aspectRatio: "16/9", cursor: "pointer",
            background: video.thumbnail ? `url(${video.thumbnail}) center/cover` : fallbackGradient,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={onPlay}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
          <button
            aria-label={`Play ${video.title}`}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--dawn-peach)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(212,129,107,0.4)", zIndex: 1,
            }}
          >
            <Icon name="play" size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}
      <div style={{ padding: 18 }}>
        <h3 style={{ marginBottom: 6, fontSize: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {video.title}
        </h3>
        {video.channelTitle && (
          <p style={{ fontSize: 12, color: "var(--dawn-text-muted)", marginBottom: 8 }}>{video.channelTitle}</p>
        )}
        {video.description && (
          <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}

const GRADIENTS = [
  "linear-gradient(135deg, #ffd5b9, #f5b6c6)",
  "linear-gradient(135deg, #f5d5e0, #e8dff5)",
  "linear-gradient(135deg, #d9e8f5, #e8dff5)",
  "linear-gradient(135deg, #ffe8d6, #ffd5b9)",
];

const Resources = () => {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setPlaying(null);
    try {
      const r = await searchYoutubeVideos(q, 8);
      if (r.success) setVideos(r.videos);
      else {
        setVideos([]);
        setError(r.error || "Search failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Load a default set on mount
  useEffect(() => {
    runSearch("mindfulness wellness tips");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickCategory = (c) => {
    setSelectedCat(c.id);
    setQuery(c.title);
    runSearch(c.query);
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 24px 64px", maxWidth: 1120 }}>
      <PageHeader
        icon="book-open"
        title="Wellness resources"
        subtitle="A small library of videos and crisis support — curated with care."
      />

      {/* Search */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--dawn-text-muted)" }}>
            <Icon name="search" size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
            placeholder="Search resources — anxiety, sleep, gratitude…"
            style={{
              width: "100%", padding: "14px 110px 14px 46px",
              borderRadius: 999, border: "1px solid var(--dawn-peach-subtle)",
              background: "var(--dawn-bg)", fontSize: 15,
            }}
          />
          <button
            className="btn btn-primary"
            style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", padding: "8px 18px" }}
            onClick={() => runSearch(query)}
            disabled={loading || !query.trim()}
          >
            {loading ? "…" : "Search"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>Popular:</span>
          {POPULAR.map((p) => (
            <button
              key={p}
              onClick={() => { setQuery(p); runSearch(p); }}
              style={{
                padding: "5px 12px", borderRadius: 999,
                background: "var(--dawn-surface-alt)",
                fontSize: 12, color: "var(--dawn-text-secondary)",
                transition: "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Crisis */}
      <div
        className="card"
        style={{
          padding: 24, marginBottom: 32,
          background: "var(--dawn-danger-bg)", border: "none",
          borderLeft: "3px solid var(--dawn-danger)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon name="life-buoy" size={20} color="var(--dawn-danger)" />
          <h3 style={{ color: "var(--dawn-danger)" }}>Crisis support</h3>
        </div>
        <p style={{ fontSize: 14, color: "var(--dawn-text-secondary)", marginBottom: 18 }}>
          If you're in crisis or having thoughts of harm, please reach out — help is available, free, and confidential.
        </p>
        <div className="grid-2">
          <CrisisCard icon="phone" title="988 Suicide & Crisis Lifeline" number="988" sub="Call or text · 24/7 · USA" href="tel:988" />
          <CrisisCard icon="ambulance" title="Emergency services" number="911" sub="Immediate help · 24/7 · USA" href="tel:911" />
        </div>
      </div>

      {/* Categories */}
      <h2 style={{ marginBottom: 16 }}>Browse by topic</h2>
      <div className="grid-3" style={{ marginBottom: 40 }}>
        {CATEGORIES.map((c) => {
          const selected = selectedCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => pickCategory(c)}
              className="card card-hover"
              style={{
                padding: 22, textAlign: "left",
                border: `1.5px solid ${selected ? "var(--dawn-peach)" : "rgba(212,129,107,0.06)"}`,
                background: selected ? "var(--dawn-peach-subtle)" : "var(--dawn-surface)",
              }}
            >
              <div className="icon-bubble" style={{ marginBottom: 14 }}><Icon name={c.icon} size={22} /></div>
              <h3 style={{ marginBottom: 6 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", lineHeight: 1.6 }}>{c.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Videos */}
      <h2 style={{ marginBottom: 16 }}>Watch & listen</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner size={24} /></div>
      ) : error ? (
        <div className="card" style={{ padding: 18, color: "var(--dawn-text-muted)" }}>
          <Icon name="info" size={14} /> {error}. (Set <code>VITE_YOUTUBE_API_KEY</code> to enable search.)
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon="search"
          title={hasSearched ? "No results" : "Search to begin"}
          subtitle="Try a different keyword or pick a category above."
        />
      ) : (
        <div className="grid-2">
          {videos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              playing={playing === v.id}
              onPlay={() => setPlaying(v.id)}
              fallbackGradient={GRADIENTS[i % GRADIENTS.length]}
            />
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 40, padding: 24,
          background: "var(--dawn-surface-alt)", borderRadius: 16, textAlign: "center",
        }}
      >
        <Icon name="info" size={18} color="var(--dawn-info)" />
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--dawn-text-muted)", maxWidth: 500, margin: "8px auto 0" }}>
          A reminder: these resources support — they don't replace — care from a licensed professional.
          If something resonates, follow up with a therapist who can know your full story.
        </p>
      </div>
    </div>
  );
};

export default Resources;
