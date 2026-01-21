import React, { useState, useEffect } from "react";
import { sendChatMessage } from "../api/chat";
const Buddy = () => {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/chat/history`,
          { credentials: "include" },
        );

        const data = await res.json();

        if (data.messages.length > 0) {
          setMessages(
            data.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          );
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Hi I'm your friendly mental health companion. 🌿\n\nYou can talk to me about your day or anything on your mind.",
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }

    loadHistory();
  }, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const data = await sendChatMessage(text, newMessages);
      const botReply =
        data.message || "Sorry, I wasn't able to reply right now.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was a problem on my side. You can try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="mh-chat-wrapper bg-black text-white min-h-screen mx-auto">
      <div className="mh-chat-header text-center text-4xl">
        <h2 className="py-4">Talk to your companion 💬</h2>
        <p className="mh-disclaimer text-xl py-3">
          This chat is for emotional support only and is not a substitute for
          professional help or emergency services.
        </p>
      </div>

      <div className="mh-chat-box overflow-y-auto p-4 border-2 ">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap
          ${
            m.role === "user"
              ? "bg-blue-800 text-white" // user bubble: dark blue
              : "bg-blue-200 text-black" // bot bubble: light blue
          }`}
            >
              {m.content.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-3 flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-2 bg-blue-200 text-black text-sm">
              Typing…
            </div>
          </div>
        )}
      </div>

      <div className="mh-input-area py-4 px-4">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write anything you’d like to share..."
          className="border-2 w-full h-15"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="border-2 w-16"
        >
          Send
        </button>
      </div>

      <div className="mh-crisis-note py-4 px-4 text-center">
        If you are in crisis or thinking about harming yourself, please contact
        your local emergency number or a suicide helpline in your country. You
        deserve real, immediate support. 💙
      </div>
    </div>
  );
};

export default Buddy;
