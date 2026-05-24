import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Icon } from "../lib/icon.jsx";
import { api } from "../lib/api.js";
import { PageHeader, EmptyState, Spinner, ConfirmModal, useToast } from "../components/ui-common.jsx";

const formatDayLong = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const GratitudeJournal = () => {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const { show, node: toastNode } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.gratitudeList(getToken);
      setEntries(data?.entries || []);
    } catch (e) {
      console.error("Load gratitude failed:", e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const t = text.trim();
    if (!t) return;
    try {
      setSaving(true);
      const data = await api.gratitudeCreate(t, getToken);
      if (data?.success && data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setText("");
        show("Reflection saved");
      }
    } catch (e) {
      console.error(e);
      show("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.gratitudeDelete(id, getToken);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      show("Entry removed");
    } catch (e) {
      console.error(e);
      show("Failed to delete", "error");
    } finally {
      setConfirmId(null);
    }
  };

  // Group by date
  const grouped = {};
  entries.forEach((e) => {
    const d = new Date(e.createdAt).toDateString();
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  return (
    <div className="container-sm fade-in" style={{ padding: "40px 24px 64px" }}>
      <PageHeader
        icon="heart"
        title="Gratitude journal"
        subtitle="Take a moment to notice the good things in your day."
      />

      {/* New entry */}
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 4 }}>What are you grateful for today?</h3>
        <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 16 }}>
          Try listing 3 things — they can be very small. The view from a window. A warm drink. A text from a friend.
        </p>
        <textarea
          className="field"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I'm grateful for…"
          style={{ marginBottom: 14 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>{text.length} characters</span>
          <button className="btn btn-primary" onClick={save} disabled={!text.trim() || saving}>
            {saving ? <><Spinner size={14} light /> Saving…</> : <><Icon name="check" size={16} /> Save entry</>}
          </button>
        </div>
      </div>

      {/* Past entries */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2>Your reflections</h2>
        <span style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>
          {entries.length} {entries.length === 1 ? "reflection" : "reflections"}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner size={24} /></div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No reflections yet"
          subtitle="Start with one small thing you appreciate today."
          action={
            <button className="btn btn-primary" onClick={() => document.querySelector("textarea")?.focus()}>
              <Icon name="pen-line" size={16} /> Write your first
            </button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(grouped).map(([date, group]) => (
            <div key={date}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--dawn-text-secondary)", letterSpacing: "0.02em" }}>
                  {formatDayLong(date)}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--dawn-peach-subtle)", opacity: 0.5 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {group.map((e) => (
                  <div key={e.id} className="card" style={{ padding: 20, borderLeft: "3px solid var(--dawn-peach)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>
                        {new Date(e.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <button className="btn-icon btn-icon-danger" onClick={() => setConfirmId(e.id)} title="Delete">
                        <Icon name="trash-2" size={15} />
                      </button>
                    </div>
                    <p style={{ color: "var(--dawn-text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 15 }}>
                      {e.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmId !== null}
        title="Delete this reflection?"
        message="This gratitude entry will be permanently removed."
        onConfirm={() => remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      {toastNode}
    </div>
  );
};

export default GratitudeJournal;
