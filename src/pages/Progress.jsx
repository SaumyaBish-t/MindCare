import React, { useState, useEffect } from "react";
import WeeklyChart from "../components/WeeklyChart.jsx";

const Progress = () => {
  const [sleepHistory, setSleepHistory] = useState([]);
  const [musicTab, setMusicTab] = useState("rain");

  // 🌟 Load sleep history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sleepHistory")) || [];
    setSleepHistory(saved);
  }, []);

  // 🌬 Breathing text cycle
  useEffect(() => {
    const steps = ["Inhale...", "Hold...", "Exhale...", "Hold..."];
    let i = 0;
    const interval = setInterval(() => {
      const el = document.getElementById("breathText");
      if (el) el.textContent = steps[i % steps.length];
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 🌟 stars bg generation
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: Math.random() * 200,
    left: Math.random() * window.innerWidth,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="relative overflow-hidden">

      {/* ⭐ random stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-[#D7E8FF]"
          style={{
            top: `${star.top}px`,
            left: `${star.left}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle 2.5s infinite`,
            animationDelay: `${star.delay}s`,
            opacity: 0.8,
          }}
        />
      ))}

      {/* 🌙 moon */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-[#FDFEFF] rounded-full blur-[2px] shadow-[0_0_100px_30px_rgba(255,255,255,0.2)]" />

      {/* ☁️ clouds */}
      <div className="absolute top-32 left-10 w-64 h-24 bg-white/10 blur-3xl rounded-full animate-[floatCloud_20s_linear_infinite]" />
      <div className="absolute top-52 right-20 w-72 h-28 bg-white/10 blur-3xl rounded-full animate-[floatCloud_28s_linear_infinite]" />

      {/* 🌠 shooting star */}
      <div className="absolute top-40 left-20 w-[3px] h-[70px] bg-white/90 blur-sm animate-[shoot_2s_ease-in-out_infinite]" />

      {/* 🎤 hero */}
      <div className="p-50 bg-gradient-to-b from-[#0D1B2A] via-[#1B263B] to-[#415A77] bg-opacity-90">
        <h1 className="text-center text-6xl text-[#EAF4FF]">Sound Sleep</h1>
        <p className="text-center text-lg p-6 text-[#B4C5E4]">
          Track your sleep habits and improve your sleep quality.
        </p>
      </div>

      {/* 🛌 sleep tracker */}
      <div className="bg-gradient-to-b from-[#1B263B] to-[#2D3A4B] py-16 px-6 text-center">
        <h2 className="text-[#EAF4FF] font-semibold text-4xl mb-10">
          Make Your Sleep Schedule Better
        </h2>

        {/* input card */}
        <div className="max-w-xl mx-auto bg-[#2D3A4B] border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_25px_rgba(174,200,255,0.15)] mb-10 text-left">
          <h3 className="text-[#EAF4FF] text-xl font-semibold mb-4">Record Last Night's Sleep</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[#C6D2E3] block mb-1">Sleep Time</label>
              <input type="time" id="sleep-start" className="w-full px-4 py-2 rounded-xl bg-[#1B263B] text-[#F7FAFF] border border-[#44566C]" />
            </div>

            <div>
              <label className="text-[#C6D2E3] block mb-1">Wake Time</label>
              <input type="time" id="sleep-end" className="w-full px-4 py-2 rounded-xl bg-[#1B263B] text-[#F7FAFF] border border-[#44566C]" />
            </div>

            <button
              type="button"
              onClick={() => {
                const start = document.getElementById("sleep-start").value;
                const end = document.getElementById("sleep-end").value;
                if (!start || !end) return alert("Please enter both times");

                const s = new Date(`2000-01-01 ${start}`);
                let e = new Date(`2000-01-01 ${end}`);
                if (e < s) e.setDate(e.getDate() + 1);

                const diff = e - s;
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const min = Math.floor((diff / (1000 * 60)) % 60);

                const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
                const entry = { day: today, hours: +(hrs + min/60).toFixed(2) };
                const updated = [...sleepHistory, entry].slice(-7);

                setSleepHistory(updated);
                localStorage.setItem("sleepHistory", JSON.stringify(updated));

                const score = Math.min(100, Math.round((hrs / 8) * 100));
                document.getElementById("sleep-hours").textContent = `${hrs}h ${min}m`;
                document.getElementById("sleep-score").textContent = score;
                document.getElementById("sleep-emoji").textContent = score > 85 ? "😴✨" : score > 60 ? "🙂" : "😕";
                document.getElementById("affirmation").textContent =
                  score > 85 ? "Amazing rest! Keep it up 🌙"
                  : score > 60 ? "Good job — you're improving 🌟"
                  : "Tomorrow will be better 💙";
              }}
              className="mt-4 w-full bg-[#4ECDC4] text-[#0D1B2A] font-semibold py-2 rounded-xl hover:opacity-90 transition"
            >
              Save Sleep
            </button>
          </div>
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto place-items-center">
          <div className="bg-[#2D3A4B] border border-white/10 rounded-2xl p-6 text-center w-64 shadow-md">
            <p className="text-[#AFCBFF] text-sm">Sleep Duration</p>
            <h3 id="sleep-hours" className="text-[#EAF4FF] text-3xl font-bold mt-2">--</h3>
          </div>

          <div className="bg-[#2D3A4B] border border-white/10 rounded-2xl p-6 text-center w-64 shadow-md">
            <p className="text-[#AFCBFF] text-sm">Sleep Score</p>
            <h3 className="text-[#EAF4FF] text-3xl font-bold mt-2 flex items-center justify-center gap-2">
              <span id="sleep-emoji">😴</span>
              <span id="sleep-score">--</span>
            </h3>
          </div>

          <div className="bg-[#2D3A4B] border border-white/10 rounded-2xl p-6 text-center w-64 shadow-md">
            <p className="text-[#AFCBFF] text-sm">Affirmation</p>
            <h3 id="affirmation" className="text-[#EAF4FF] text-lg mt-2">
              Your nightly motivation will appear here 💫
            </h3>
          </div>
        </div>

        {/* chart */}
        <div className="mt-10">
          <WeeklyChart data={sleepHistory} />
        </div>
      </div>

      {/* 🌬 breathing section */}
      <div className="bg-[#1B263B] py-16 text-center">
        <h2 className="text-[#EAF4FF] text-3xl font-semibold mb-2">Relax & Breathe</h2>
        <p className="text-[#B4C5E4] mb-8">A 1-minute slow breathing exercise to reduce stress</p>

        <div className="flex justify-center">
          <div className="w-32 h-32 bg-[#4ECDC4] rounded-full opacity-60 animate-breathe"></div>
        </div>

        <p id="breathText" className="text-[#EAF4FF] mt-6 text-lg">Inhale...</p>
      </div>

      {/* 🎵 music section */}
      <div className="bg-[#141B29] py-20 px-6 text-center">
        <h2 className="text-[#EAF4FF] text-4xl font-semibold mb-3">Sleep Music</h2>
        <p className="text-[#B4C5E4] mb-10 text-lg">Choose a calming sound to help you sleep peacefully</p>

        {/* tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {["rain","piano","forest","ocean"].map(t => (
            <button
              key={t}
              onClick={() => setMusicTab(t)}
              className={`px-6 py-2 rounded-full ${
                musicTab===t ? "bg-[#4ECDC4] text-[#0D1B2A]" : "bg-[#2D3A4B] text-[#EAF4FF]"
              }`}
            >
              {t==="rain"?"🌧 Rain":t==="piano"?"🎹 Piano":t==="forest"?"🌲 Forest":"🌊 Ocean"}
            </button>
          ))}
        </div>

        {/* floating clouds & sparkles */}
        <div className="max-w-2xl mx-auto rounded-xl overflow-hidden relative">
          <div className="absolute -top-10 -left-10 w-40 h-20 bg-white/10 blur-3xl rounded-full animate-[floatCloudSlow_12s_infinite]"></div>
          <div className="absolute top-16 -right-10 w-48 h-24 bg-white/10 blur-3xl rounded-full animate-[floatCloudSlow_18s_infinite]"></div>
          <div className="absolute top-8 left-1/3 w-2 h-2 bg-[#AFCBFF] rounded-full blur-[2px] animate-[twinkleSoft_2.2s_infinite]"></div>
          <div className="absolute top-20 right-1/4 w-2 h-2 bg-[#B4C5E4] rounded-full blur-[2px] animate-[twinkleSoft_3s_infinite]"></div>
          <div className="absolute bottom-10 left-1/4 w-1 h-1 bg-[#CDE4FF] rounded-full blur-[1px] animate-[twinkleSoft_1.6s_infinite]"></div>

          {/* embeds */}
          {musicTab === "rain" && (
            <iframe style={{borderRadius:"12px"}} src="https://open.spotify.com/embed/playlist/7f24KaDrATReBg45esAgX8" width="100%" height="352"></iframe>
          )}
          {musicTab === "piano" && (
            <iframe style={{borderRadius:"12px"}} src="https://open.spotify.com/embed/playlist/3QdD9wpA7kugRfqjAdOh5N" width="100%" height="352"></iframe>
          )}
          {musicTab === "forest" && (
            <iframe style={{borderRadius:"12px"}} src="https://open.spotify.com/embed/playlist/37i9dQZF1DX2oU49YwtXI2" width="100%" height="352"></iframe>
          )}
          {musicTab === "ocean" && (
            <iframe style={{borderRadius:"12px"}} src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4wta20PHgwo" width="100%" height="352"></iframe>
          )}
        </div>
      </div>

    </div>
  );
};

export default Progress;
