import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Icon } from "../lib/icon.jsx";
import { api } from "../lib/api.js";

const SUGGESTIONS = [
  "I'm feeling anxious",
  "Help me relax",
  "I need to vent",
  "Gratitude reflection",
];

const formatDay = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

const MessageBubble = ({ role, content, ts }) => {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
      {!isUser && (
        <div className="icon-bubble icon-bubble-sm" style={{ flexShrink: 0 }}>
          <Icon name="sparkles" size={14} />
        </div>
      )}
      <div style={{ maxWidth: "75%" }}>
        <div
          style={{
            padding: "12px 16px",
            background: isUser ? "var(--dawn-peach)" : "var(--dawn-surface)",
            color: isUser ? "#fff" : "var(--dawn-text-primary)",
            borderRadius: isUser ? "16px 16px 6px 16px" : "16px 16px 16px 6px",
            boxShadow: "var(--shadow-card)",
            fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>
        <div style={{ fontSize: 11, color: "var(--dawn-text-muted)", marginTop: 4, textAlign: isUser ? "right" : "left", paddingLeft: 4, paddingRight: 4 }}>
          {new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

const Buddy = () => {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesRef = useRef(null);

  // Load history once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.chatHistory(getToken);
        if (!alive) return;
        const msgs = (data?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          ts: new Date(m.createdAt).getTime(),
        }));
        if (msgs.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: "Hi — I'm Buddy. I'm here whenever you'd like to talk. There's no right way to begin.",
              ts: Date.now(),
            },
          ]);
        } else {
          setMessages(msgs);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
        setMessages([{
          role: "assistant",
          content: "Hi — I'm Buddy. I'm here whenever you'd like to talk.",
          ts: Date.now(),
        }]);
      } finally {
        if (alive) setLoadingHistory(false);
      }
    })();
    return () => { alive = false; };
  }, [getToken]);

  // Auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const ts = Date.now();
    const newUserMsg = { role: "user", content: trimmed, ts };
    const optimistic = [...messages, newUserMsg];
    setMessages(optimistic);
    setInput("");
    setTyping(true);

    try {
      const history = optimistic.map((m) => ({ role: m.role, content: m.content }));
      const data = await api.chatSend(trimmed, history, getToken);
      const reply = data?.message || "Sorry, I wasn't able to reply right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, there was a problem on my side. You can try again in a moment.",
        ts: Date.now(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // Group with date dividers
  const groups = [];
  let lastDate = "";
  messages.forEach((m, idx) => {
    const d = new Date(m.ts).toDateString();
    if (d !== lastDate) {
      groups.push({ type: "divider", date: d, key: `d-${idx}` });
      lastDate = d;
    }
    groups.push({ type: "msg", ...m, key: `m-${idx}` });
  });

  return (
    <div className="fade-in" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", background: "var(--dawn-bg)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--dawn-peach-subtle)", background: "var(--dawn-surface)" }}>
        <div className="container-md" style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="icon-bubble"><Icon name="message-circle" size={20} /></div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18 }}>Companion chat</h2>
            <p style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>
              Not a replacement for therapy — a kind ear, anytime.
            </p>
          </div>
          <span className="pill pill-success">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dawn-success)" }} />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
        <div className="container-md">
          {loadingHistory ? (
            <div style={{ paddingTop: 60, textAlign: "center" }}>
              <span className="spinner spinner-lg" />
              <p style={{ marginTop: 14, color: "var(--dawn-text-muted)" }}>Loading your chat…</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ paddingTop: 60, textAlign: "center" }}>
              <div style={{ opacity: 0.4, color: "var(--dawn-peach)", display: "inline-flex" }}>
                <Icon name="sparkles" size={48} strokeWidth={1.25} />
              </div>
              <h2 style={{ marginTop: 16 }}>What's on your mind?</h2>
              <p style={{ color: "var(--dawn-text-muted)", marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
                Type anything — joy, anxiety, a half-thought. There's no wrong way to begin.
              </p>
              <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: "10px 16px", borderRadius: 999,
                      background: "var(--dawn-surface)",
                      border: "1px solid var(--dawn-peach-subtle)",
                      color: "var(--dawn-text-secondary)",
                      fontSize: 14, fontWeight: 500, transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map((g) =>
                g.type === "divider" ? (
                  <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 4px" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--dawn-peach-subtle)", opacity: 0.5 }} />
                    <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>{formatDay(g.date)}</span>
                    <div style={{ flex: 1, height: 1, background: "var(--dawn-peach-subtle)", opacity: 0.5 }} />
                  </div>
                ) : (
                  <MessageBubble key={g.key} role={g.role} content={g.content} ts={g.ts} />
                )
              )}
              {typing && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div className="icon-bubble icon-bubble-sm"><Icon name="sparkles" size={14} /></div>
                  <div
                    style={{
                      background: "var(--dawn-surface)", padding: "14px 16px",
                      borderRadius: "16px 16px 16px 6px",
                      display: "flex", gap: 5, alignItems: "center",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid var(--dawn-peach-subtle)", background: "var(--dawn-surface)" }}>
        <div className="container-md" style={{ padding: "16px 24px" }}>
          <div
            style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "var(--dawn-bg)", borderRadius: 24,
              padding: "8px 8px 8px 18px",
              border: "1px solid var(--dawn-peach-subtle)",
              transition: "all 0.15s",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={isSignedIn ? "Write anything you'd like to share…" : "Sign in to save your chat — or just talk for now."}
              rows={1}
              style={{
                flex: 1, resize: "none", background: "transparent", border: "none",
                outline: "none", fontSize: 15, padding: "10px 0",
                color: "var(--dawn-text-primary)", maxHeight: 120,
                fontFamily: "inherit", lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: input.trim() ? "var(--dawn-peach)" : "var(--dawn-peach-subtle)",
                color: input.trim() ? "#fff" : "var(--dawn-text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
            >
              <Icon name="arrow-up" size={18} strokeWidth={2.5} />
            </button>
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--dawn-text-muted)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon name="heart" size={12} color="var(--dawn-peach)" />
            In crisis? Call or text 988 — you're not alone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Buddy;
