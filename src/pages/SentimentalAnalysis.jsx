import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { Icon } from "../lib/icon.jsx";
import { api } from "../lib/api.js";
import { PageHeader, EmptyState, Spinner, ConfirmModal, useToast } from "../components/ui-common.jsx";

// The backend (OpenRouter) returns a structured object:
//   { sentiment, confidence, primary_emotion, secondary_emotions, description, body_hint, gentle_suggestion }
// Older Gradio entries used different shapes — we fall back gracefully.
function interpret(rawResult) {
  const r = Array.isArray(rawResult) ? rawResult[0] : rawResult;

  // New shape (OpenRouter)
  if (r && typeof r === "object" && r.sentiment && ["Positive", "Neutral", "Heavy"].includes(r.sentiment)) {
    return {
      sentiment: r.sentiment,
      color: r.sentiment === "Positive" ? "success" : r.sentiment === "Heavy" ? "danger" : "warning",
      confidence: typeof r.confidence === "number" ? r.confidence : 0.7,
      description: r.description || "",
      primaryEmotion: r.primary_emotion || "",
      secondaryEmotions: Array.isArray(r.secondary_emotions) ? r.secondary_emotions : [],
      bodyHint: r.body_hint || "",
      suggestion: r.gentle_suggestion || "",
    };
  }

  // Legacy fallback for historical Gradio entries
  let label = "Neutral";
  let confidence = 0.6;
  try {
    if (r) {
      if (typeof r === "string") label = r;
      else if (r.emotionalState?.description) {
        label = r.emotionalState.description;
        confidence = r.emotionalState.confidence ?? 0.7;
      } else if (r.label) {
        label = r.label;
        confidence = r.score ?? r.confidence ?? 0.7;
      }
    }
  } catch { /* noop */ }

  const lower = String(label).toLowerCase();
  if (/(positive|happy|joy|calm|grateful|content|hopeful)/.test(lower)) {
    return { sentiment: "Positive", color: "success", confidence,
      description: "You sound like you're in a really kind place right now. Notice what's helping — and try to give yourself credit for it.",
      primaryEmotion: "", secondaryEmotions: [], bodyHint: "", suggestion: "" };
  }
  if (/(negative|sad|anxious|angry|frustrat|stress|depress|heavy|down|worried|tired|overwhelm)/.test(lower)) {
    return { sentiment: "Heavy", color: "danger", confidence,
      description: "There's some weight in what you wrote, and that's okay. Be gentle with yourself today — even small care counts.",
      primaryEmotion: "", secondaryEmotions: [], bodyHint: "", suggestion: "" };
  }
  return { sentiment: "Neutral", color: "warning", confidence,
    description: "Things feel steady — not heavy, not bright. That's its own kind of okay.",
    primaryEmotion: "", secondaryEmotions: [], bodyHint: "", suggestion: "" };
}

const ACCENT_VAR = { success: "--dawn-success", danger: "--dawn-danger", warning: "--dawn-warning" };

const SentimentalAnalysis = () => {
  const { getToken } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState(null);
  const { show, node: toastNode } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api.sentimentHistory(getToken);
      setHistory(data?.analyses || []);
    } catch (e) {
      console.error("History load failed:", e);
    } finally {
      setHistoryLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const analyze = async () => {
    setError(null);
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.sentimentAnalyze(text, getToken);
      if (!data?.success) throw new Error(data?.error || "Analysis failed");
      const interpreted = interpret(data.data);
      const enriched = { ...interpreted, raw: data.data, text, ts: Date.now() };
      setResult(enriched);
      // auto-save
      try {
        await api.sentimentSave(
          { inputText: text, result: data.data, description: interpreted.description },
          getToken
        );
        fetchHistory();
      } catch (saveErr) {
        console.warn("Auto-save failed:", saveErr);
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => { setResult(null); setShowDetails(false); };

  const deleteEntry = async (id) => {
    try {
      await api.sentimentDelete(id, getToken);
      setHistory((prev) => prev.filter((e) => e.id !== id));
      show("Entry removed");
    } catch (e) {
      console.error(e);
      show("Failed to delete", "error");
    } finally {
      setConfirmId(null);
    }
  };

  // Chart data — last 14 entries
  const chartData = useMemo(
    () =>
      [...history]
        .slice(0, 14)
        .reverse()
        .map((e) => {
          const interp = interpret(e.result);
          return {
            label: new Date(e.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
            score: interp.sentiment === "Positive" ? 3 : interp.sentiment === "Neutral" ? 2 : 1,
            sentiment: interp.sentiment,
          };
        }),
    [history]
  );

  const counts = useMemo(() => {
    const c = { Positive: 0, Neutral: 0, Heavy: 0 };
    history.forEach((e) => { c[interpret(e.result).sentiment] += 1; });
    return c;
  }, [history]);

  return (
    <div className="container-md fade-in" style={{ padding: "40px 24px 64px" }}>
      <PageHeader
        icon="bar-chart-3"
        title="Mood insights"
        subtitle="Understand how you're feeling — type freely and we'll give you a gentle read."
      />

      {/* Input */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <textarea
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling right now? Write anything that comes to mind — no need to be polished."
          rows={4}
          style={{ marginBottom: 14 }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>{text.length} characters · stays private</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => { setText(""); setResult(null); setError(null); }} disabled={!text}>
              Clear
            </button>
            <button className="btn btn-primary" onClick={analyze} disabled={!text.trim() || loading}>
              {loading ? (<><Spinner size={14} light /> Analyzing…</>) : (<><Icon name="activity" size={16} /> Analyze</>)}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "var(--dawn-danger-bg)", color: "var(--dawn-danger)", fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          className="card fade-in"
          style={{ padding: 24, marginBottom: 24, borderLeft: `3px solid var(${ACCENT_VAR[result.color]})` }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span className={`pill pill-${result.color}`}>
              <Icon name={result.color === "success" ? "smile" : result.color === "danger" ? "cloud-rain" : "minus"} size={13} />
              {result.sentiment} · {Math.round((result.confidence || 0.7) * 100)}% confidence
            </span>
            <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>
              {new Date(result.ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
          <p style={{ color: "var(--dawn-text-primary)", lineHeight: 1.6, marginBottom: 12 }}>{result.description}</p>

          {(result.primaryEmotion || result.secondaryEmotions?.length) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {result.primaryEmotion && (
                <span className="pill pill-peach">
                  <Icon name="circle-dot" size={12} /> {result.primaryEmotion}
                </span>
              )}
              {result.secondaryEmotions?.map((e) => (
                <span key={e} className="pill" style={{ background: "var(--dawn-surface-alt)", color: "var(--dawn-text-muted)" }}>
                  {e}
                </span>
              ))}
            </div>
          )}
          {result.bodyHint && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--dawn-text-secondary)" }}>
              <Icon name="heart-pulse" size={14} color="var(--dawn-peach)" />
              <span style={{ fontStyle: "italic" }}>{result.bodyHint}</span>
            </div>
          )}
          {result.suggestion && (
            <div
              style={{
                marginTop: 4, marginBottom: 12, padding: "10px 14px",
                background: "var(--dawn-peach-subtle)", borderRadius: 10,
                color: "var(--dawn-text-secondary)", fontSize: 14,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              <Icon name="sparkles" size={14} color="var(--dawn-peach)" />
              <span>{result.suggestion}</span>
            </div>
          )}

          <button
            onClick={() => setShowDetails((v) => !v)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--dawn-text-muted)", padding: "6px 0" }}
          >
            View details <Icon name={showDetails ? "chevron-up" : "chevron-down"} size={14} />
          </button>

          {showDetails && (
            <div
              style={{
                marginTop: 12, padding: 14,
                background: "var(--dawn-surface-alt)", borderRadius: 10,
                fontFamily: "ui-monospace, monospace",
                fontSize: 12, lineHeight: 1.7, color: "var(--dawn-text-secondary)",
                whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto",
              }}
            >
              {JSON.stringify(result.raw, null, 2)}
            </div>
          )}

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={dismiss}>
              <Icon name="x" size={16} /> Dismiss
            </button>
            <span style={{ fontSize: 12, color: "var(--dawn-text-muted)", alignSelf: "center" }}>
              <Icon name="bookmark-check" size={12} /> Auto-saved to your history
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3>Mood over time</h3>
            <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>Last {chartData.length} entries</span>
          </div>
          <div style={{ height: 200, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,129,107,0.12)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 4]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) => ({ 1: "Heavy", 2: "Neutral", 3: "Positive" }[v] || "")}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--dawn-surface)", border: "1px solid var(--dawn-peach-subtle)", borderRadius: 10, fontSize: 13 }}
                  labelStyle={{ color: "var(--dawn-text-muted)" }}
                />
                <Line
                  type="monotone" dataKey="score"
                  stroke="var(--dawn-peach)" strokeWidth={2.5}
                  dot={{ fill: "var(--dawn-peach)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 14, fontSize: 13, color: "var(--dawn-text-muted)" }}>
            <span><span className="pill pill-success" style={{ padding: "2px 8px" }}>{counts.Positive}</span> positive</span>
            <span><span className="pill pill-warning" style={{ padding: "2px 8px" }}>{counts.Neutral}</span> neutral</span>
            <span><span className="pill pill-danger"  style={{ padding: "2px 8px" }}>{counts.Heavy}</span> heavy</span>
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2>Past entries</h2>
        <span style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>
          {history.length} {history.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {historyLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner size={24} /></div>
      ) : history.length === 0 ? (
        <EmptyState
          icon="bar-chart-3"
          title="No entries yet"
          subtitle="Once you analyze a thought, it'll appear here so you can spot patterns over time."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map((e) => {
            const interp = interpret(e.result);
            return (
              <div
                key={e.id}
                className="card"
                style={{ padding: 20, borderLeft: `3px solid var(${ACCENT_VAR[interp.color]})` }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>
                    {new Date(e.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className={`pill pill-${interp.color}`}>{interp.sentiment}</span>
                    <button className="btn-icon btn-icon-danger" onClick={() => setConfirmId(e.id)} title="Delete">
                      <Icon name="trash-2" size={16} />
                    </button>
                  </div>
                </div>
                <p style={{ color: "var(--dawn-text-primary)", marginBottom: 8, fontSize: 14.5 }}>{e.inputText}</p>
                {e.description && (
                  <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", fontStyle: "italic" }}>{e.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmId !== null}
        title="Remove this entry?"
        message="This will permanently delete this mood entry. Your past analysis won't be recoverable."
        onConfirm={() => deleteEntry(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      {toastNode}
    </div>
  );
};

export default SentimentalAnalysis;
