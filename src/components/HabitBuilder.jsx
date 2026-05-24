import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Icon } from "../lib/icon.jsx";
import { api } from "../lib/api.js";
import { PageHeader, EmptyState, Spinner, ConfirmModal, useToast } from "./ui-common.jsx";

const CATEGORIES = [
  { id: "mindfulness", label: "Mind",   icon: "brain" },
  { id: "health",      label: "Body",   icon: "activity" },
  { id: "wellness",    label: "Wellness", icon: "leaf" },
  { id: "reflection",  label: "Reflect", icon: "pen-line" },
  { id: "movement",    label: "Move",   icon: "footprints" },
  { id: "learning",    label: "Learn",  icon: "book-open" },
  { id: "general",     label: "General", icon: "circle" },
];

const TEMPLATES = [
  { title: "Morning meditation",    desc: "5 minutes of mindful breathing", category: "mindfulness", icon: "brain" },
  { title: "Drink 8 glasses of water", desc: "Stay hydrated through the day", category: "health", icon: "droplets" },
  { title: "Gratitude journal",     desc: "Write 3 things you're grateful for", category: "reflection", icon: "heart" },
  { title: "10-minute walk",        desc: "Take a peaceful walk outside", category: "movement", icon: "footprints" },
  { title: "Read for 20 minutes",   desc: "Expand your mind with reading", category: "learning", icon: "book-open" },
  { title: "Deep breathing",        desc: "Practice 4-7-8 breathing", category: "wellness", icon: "wind" },
];

const bg = (c) => ({ peach: "var(--dawn-peach-subtle)", success: "var(--dawn-success-bg)", warning: "var(--dawn-warning-bg)" }[c]);
const fg = (c) => ({ peach: "var(--dawn-peach)", success: "var(--dawn-success)", warning: "var(--dawn-warning)" }[c]);

function StatBlock({ icon, value, label, accent }) {
  return (
    <div className="card" style={{ padding: 22, background: "var(--dawn-surface-alt)", border: "none" }}>
      <div className="icon-bubble icon-bubble-sm" style={{ background: bg(accent), color: fg(accent), marginBottom: 12 }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: fg(accent), lineHeight: 1.1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--dawn-text-muted)" }}>{label}</div>
    </div>
  );
}

const HabitBuilder = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", category: "mindfulness", template: null, targetFrequency: "daily" });
  const [confirmId, setConfirmId] = useState(null);
  const { show, node: toastNode } = useToast();

  const loadStreaks = useCallback(async (list) => {
    const results = await Promise.all(
      list.map(async (h) => {
        try {
          const r = await api.habitsStreak(h.id, getToken);
          return [h.id, r?.streak ?? 0];
        } catch {
          return [h.id, 0];
        }
      })
    );
    setStreaks(Object.fromEntries(results));
  }, [getToken]);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.habitsList(getToken);
      const list = data?.habits || [];
      setHabits(list);
      loadStreaks(list);
    } catch (e) {
      console.error("Load habits failed:", e);
    } finally {
      setLoading(false);
    }
  }, [getToken, loadStreaks]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) loadHabits();
  }, [isLoaded, isSignedIn, user, loadHabits]);

  const todayStr = new Date().toDateString();
  const completedToday = habits.filter((h) => {
    const last = h.last_completed || h.lastCompleted;
    return last && new Date(last).toDateString() === todayStr;
  }).length;
  const longestStreak = Object.values(streaks).reduce((m, v) => Math.max(m, v), 0);

  const pickTemplate = (t) => setDraft({ title: t.title, description: t.desc, category: t.category, template: t, targetFrequency: "daily" });

  const submitNew = async () => {
    if (!draft.title.trim()) return;
    try {
      const r = await api.habitsCreate(
        { title: draft.title.trim(), description: draft.description.trim(), category: draft.category, targetFrequency: draft.targetFrequency },
        getToken
      );
      if (r?.success) {
        setShowForm(false);
        setDraft({ title: "", description: "", category: "mindfulness", template: null, targetFrequency: "daily" });
        show("Habit added");
        loadHabits();
      }
    } catch (e) {
      console.error(e);
      show("Failed to create habit", "error");
    }
  };

  const completeHabit = async (id) => {
    try {
      await api.habitsComplete(id, getToken);
      loadHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const removeHabit = async (id) => {
    try {
      await api.habitsDelete(id, getToken);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      show("Habit removed");
    } catch (e) {
      console.error(e);
      show("Failed to delete", "error");
    } finally {
      setConfirmId(null);
    }
  };

  if (!isLoaded) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size={28} /></div>;
  }

  return (
    <div className="container fade-in" style={{ padding: "40px 32px 64px" }}>
      <PageHeader
        icon="target"
        title="Habit builder"
        subtitle="Tiny rituals, repeated kindly — they're how change actually happens."
        right={
          !showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Icon name="plus" size={16} /> Add habit
            </button>
          )
        }
      />

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <StatBlock icon="activity" accent="peach" value={habits.length} label="Active habits" />
        <StatBlock icon="check-circle-2" accent="success" value={`${completedToday}/${habits.length || 0}`} label="Done today" />
        <StatBlock icon="flame" accent="warning" value={longestStreak} label="Longest streak" />
      </div>

      {showForm && (
        <div className="card slide-down" style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3>New habit</h3>
            <button className="btn-icon" onClick={() => setShowForm(false)}><Icon name="x" size={18} /></button>
          </div>

          <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 12 }}>Start from a template</p>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {TEMPLATES.map((t) => {
              const selected = draft.template?.title === t.title;
              return (
                <button
                  key={t.title}
                  onClick={() => pickTemplate(t)}
                  className="card"
                  style={{
                    padding: 16, textAlign: "left",
                    background: selected ? "var(--dawn-peach-subtle)" : "var(--dawn-surface)",
                    border: `1.5px solid ${selected ? "var(--dawn-peach)" : "var(--dawn-peach-subtle)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <div className="icon-bubble icon-bubble-sm" style={{ marginBottom: 10 }}>
                    <Icon name={t.icon} size={14} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--dawn-text-primary)", marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "var(--dawn-text-muted)" }}>{t.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 240px" }}>
              <label className="field-label">Habit name</label>
              <input
                className="field"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, template: null })}
                placeholder="e.g. Five minute stretch"
              />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label className="field-label">Category</label>
              <select
                className="field"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <label className="field-label">Description (optional)</label>
          <textarea
            className="field" rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Why does this habit matter to you?"
            style={{ marginBottom: 18 }}
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitNew} disabled={!draft.title.trim()}>
              <Icon name="plus" size={16} /> Create habit
            </button>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: 16 }}>Your habits</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner size={24} /></div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon="target"
          title="No habits yet"
          subtitle="Start small. One habit, kept gently, becomes a foundation."
          action={
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Icon name="plus" size={16} /> Create your first habit
            </button>
          }
        />
      ) : (
        <div className="grid-2">
          {habits.map((h) => {
            const cat = CATEGORIES.find((c) => c.id === h.category) || CATEGORIES[CATEGORIES.length - 1];
            const last = h.last_completed || h.lastCompleted;
            const doneToday = last && new Date(last).toDateString() === todayStr;
            const streak = streaks[h.id] ?? 0;
            const total = h.total_completions ?? h.totalCompletions ?? 0;
            return (
              <div key={h.id} className="card card-hover" style={{ padding: 22 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    className="icon-bubble"
                    style={{
                      background: doneToday ? "var(--dawn-success-bg)" : "var(--dawn-peach-subtle)",
                      color: doneToday ? "var(--dawn-success)" : "var(--dawn-peach)",
                    }}
                  >
                    <Icon name={cat.icon} size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <h3 style={{ marginBottom: 4 }}>{h.title}</h3>
                      <button className="btn-icon btn-icon-danger" onClick={() => setConfirmId(h.id)} title="Delete">
                        <Icon name="trash-2" size={15} />
                      </button>
                    </div>
                    {h.description && (
                      <p style={{ fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 12 }}>{h.description}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--dawn-text-muted)", marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Icon name="flame" size={14} color="var(--dawn-warning)" />
                        {streak} day streak
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Icon name="check" size={14} color="var(--dawn-success)" />
                        {total} total
                      </span>
                      <span className="pill" style={{ background: "var(--dawn-surface-alt)", color: "var(--dawn-text-muted)", fontSize: 11 }}>
                        <Icon name={cat.icon} size={11} /> {cat.label}
                      </span>
                    </div>
                    <button
                      onClick={() => !doneToday && completeHabit(h.id)}
                      disabled={doneToday}
                      className="btn"
                      style={
                        doneToday
                          ? { background: "var(--dawn-success-bg)", color: "var(--dawn-success)", width: "100%" }
                          : { width: "100%", background: "var(--dawn-peach)", color: "#fff" }
                      }
                    >
                      <Icon name={doneToday ? "check-check" : "circle"} size={16} />
                      {doneToday ? "Completed today" : "Mark complete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmId !== null}
        title="Remove habit?"
        message="This habit and its streak will be gone. You can always start a new one."
        onConfirm={() => removeHabit(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      {toastNode}
    </div>
  );
};

export default HabitBuilder;
