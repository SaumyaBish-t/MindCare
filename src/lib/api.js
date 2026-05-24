// Centralized fetch helper. Pass `getToken` from Clerk's useAuth() so every
// authed request carries a Bearer token — works cross-origin without cookies.

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, { method = "GET", body, getToken, signal } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (getToken) {
    try {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore — backend will respond 401 if required */
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
    signal,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data;
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return s; }
}

export const api = {
  // -------- Chat / Buddy --------
  chatHistory: (getToken) => request("/api/chat/history", { getToken }),
  chatSend: (message, history, getToken) =>
    request("/api/chat", { method: "POST", body: { message, history }, getToken }),

  // -------- Sentiment / Mood --------
  sentimentAnalyze: (text, getToken) =>
    request("/api/sentiment/analyze", { method: "POST", body: { text }, getToken }),
  sentimentSave: (payload, getToken) =>
    request("/api/sentiment/save", { method: "POST", body: payload, getToken }),
  sentimentHistory: (getToken) => request("/api/sentiment/history", { getToken }),
  sentimentDelete: (id, getToken) =>
    request(`/api/sentiment/${id}`, { method: "DELETE", getToken }),

  // -------- Habits --------
  habitsList: (getToken) => request("/api/habits", { getToken }),
  habitsCreate: (payload, getToken) =>
    request("/api/habits", { method: "POST", body: payload, getToken }),
  habitsComplete: (id, getToken) =>
    request(`/api/habits/${id}/complete`, { method: "POST", getToken }),
  habitsStreak: (id, getToken) =>
    request(`/api/habits/${id}/streak`, { getToken }),
  habitsDelete: (id, getToken) =>
    request(`/api/habits/${id}`, { method: "DELETE", getToken }),

  // -------- Gratitude / Journal --------
  gratitudeList: (getToken) => request("/api/gratitude", { getToken }),
  gratitudeCreate: (content, getToken) =>
    request("/api/gratitude", { method: "POST", body: { content }, getToken }),
  gratitudeDelete: (id, getToken) =>
    request(`/api/gratitude/${id}`, { method: "DELETE", getToken }),

  // -------- Sleep --------
  sleepList: (getToken) => request("/api/sleep", { getToken }),
  sleepCreate: (payload, getToken) =>
    request("/api/sleep", { method: "POST", body: payload, getToken }),
  sleepDelete: (id, getToken) =>
    request(`/api/sleep/${id}`, { method: "DELETE", getToken }),
};

export { API_BASE };
