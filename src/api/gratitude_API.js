const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const gratitudeAPI = {
  async getEntries() {
    const res = await fetch(`${API_BASE_URL}/gratitude`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // for Clerk session
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json(); // { success, entries }
  },

  async createEntry(content) {
    const res = await fetch(`${API_BASE_URL}/gratitude`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json(); // { success, entry }
  },

  async deleteEntry(id) {
    const res = await fetch(`${API_BASE_URL}/gratitude/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json(); // { success }
  },
};
