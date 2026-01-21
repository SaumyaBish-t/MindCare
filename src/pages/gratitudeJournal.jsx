// src/pages/GratitudeJournal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { gratitudeAPI } from "../api/gratitude_API.js";
const GratitudeJournal = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await gratitudeAPI.getEntries();
      if (res.success) setEntries(res.entries);
    } catch (err) {
      console.error("Error loading gratitude entries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadEntries();
    }
  }, [isLoaded, isSignedIn, user, loadEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    try {
      setSubmitting(true);
      const res = await gratitudeAPI.createEntry(text);
      if (res.success) {
        setInput("");
        // Optimistic update or reload
        setEntries((prev) => [res.entry, ...prev]);
      }
    } catch (err) {
      console.error("Error creating gratitude entry:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await gratitudeAPI.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Please sign in to access your gratitude journal.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-rose-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            🌼 Gratitude Journal
          </h1>
          <p className="text-gray-600 mt-3">
            Take a moment to notice the good things in your day. Even tiny ones
            count.
          </p>
        </header>

        {/* New Entry Form */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-3">
            What are you grateful for today?
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Try listing 3 things. They can be very small: a warm cup of tea, a
            kind message, a comfortable bed.
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
              placeholder={`Example:\n- The sunlight in my room\n- A friend who checked on me\n- I got through today`}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Entry"}
            </button>
          </form>
        </div>

        {/* Previous entries */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Past Entries
          </h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-gray-500">
              No entries yet. Start with one small thing you appreciate today 💛
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800">
                    {entry.content}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GratitudeJournal;
