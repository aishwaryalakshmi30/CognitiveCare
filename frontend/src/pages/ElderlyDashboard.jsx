import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  fetchReminders,
  toggleReminder,
  fetchRoutines,
  toggleRoutine,
  fetchMemoryCards,
  fetchGameSummary,
} from "../services/api";
import {
  Brain,
  Gamepad2,
  Clock,
  CheckCircle2,
  Circle,
  Volume2,
  Heart,
  Image,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function ElderlyDashboard({ setCurrentTab, setActiveGame }) {
  const { user } = useAuth();
  const { speak, audioPrompts } = useAccessibility();

  const [reminders, setReminders] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [memoryCards, setMemoryCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rems, rts, cards, sum] = await Promise.all([
          fetchReminders().catch(() => []),
          fetchRoutines().catch(() => []),
          fetchMemoryCards().catch(() => []),
          fetchGameSummary().catch(() => null),
        ]);
        setReminders(rems);
        setRoutines(rts);
        setMemoryCards(cards);
        setSummary(sum);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleReadSummary = () => {
    const greeting = `${getGreeting()}, ${user?.full_name || "friend"}. `;
    const pendingReminders = reminders.filter((r) => !r.is_completed).length;
    const routineCount = routines.filter((r) => !r.is_checked).length;
    let msg = `${greeting} You have ${pendingReminders} active reminder${pendingReminders !== 1 ? "s" : ""} and ${routineCount} checklist item${routineCount !== 1 ? "s" : ""} today. Would you like to play a relaxing game of Picture Matching or Sequence Memory?`;
    speak(msg);
  };

  const handleToggleReminder = async (id) => {
    try {
      const updated = await toggleReminder(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.is_completed) {
        speak("Reminder marked as completed. Well done.");
      }
    } catch (err) {
      alert("Failed to update reminder");
    }
  };

  const handleToggleRoutine = async (id) => {
    try {
      const updated = await toggleRoutine(id);
      setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.is_checked) {
        speak("Routine task completed. Good job.");
      }
    } catch (err) {
      alert("Failed to update routine");
    }
  };

  const handleStartGame = (gameType) => {
    if (setActiveGame) {
      setActiveGame(gameType);
    }
    setCurrentTab("games");
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontSize: "var(--font-xl)", color: "var(--text-muted)" }}>
          Loading your personalized dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px 80px" }}>
      {/* Welcome Banner */}
      <div
        className="card card-elevated"
        style={{
          background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--bg-surface) 100%)",
          borderColor: "var(--color-primary)",
          marginBottom: "32px",
          padding: "32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: "10px",
                border: "1px solid var(--border-color)",
              }}
            >
              Today is {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <h1 style={{ fontSize: "var(--font-2xl)", marginBottom: "8px" }}>
              {getGreeting()}, {user?.full_name}!
            </h1>
            <p style={{ fontSize: "var(--font-lg)", color: "var(--text-secondary)", maxWidth: "650px" }}>
              Welcome back to your peaceful space. Relax, enjoy gentle cognitive exercises, and explore your cherished memories.
            </p>
          </div>

          {audioPrompts && (
            <button
              className="btn btn-voice"
              onClick={handleReadSummary}
              style={{ padding: "12px 20px", fontSize: "var(--font-base)" }}
            >
              <Volume2 size={22} />
              Read Today's Overview
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Games & Memory Checklist */}
      <div className="grid-2" style={{ gap: "32px", marginBottom: "40px" }}>
        {/* Left Column: Cognitive Games Quick Launch */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Gamepad2 size={28} color="var(--color-primary)" />
            <h2 style={{ fontSize: "var(--font-xl)" }}>Today's Cognitive Games</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Game 1: Picture Matching */}
            <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "var(--font-lg)" }}>1. Picture Matching</h3>
                <span className="badge badge-easy">Gentle Focus</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Find pairs of familiar, colorful cards. Relaxed, optional untimed play with helpful hints.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleStartGame("picture_matching")}
                style={{ alignSelf: "flex-start" }}
              >
                Play Picture Matching
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Game 2: Sequence Memory */}
            <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "var(--font-lg)" }}>2. Sequence Memory</h3>
                <span className="badge badge-medium">Memory Recall</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Watch a gentle sequence of vibrant colors, then repeat it back at your own calm pace.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleStartGame("sequence_memory")}
                style={{ alignSelf: "flex-start" }}
              >
                Play Sequence Memory
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Game 3: Familiar Object Recognition */}
            <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "var(--font-lg)" }}>3. Familiar Object Recognition</h3>
                <span className="badge badge-easy">Daily Objects</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Recognize everyday items (tea kettle, book, flowers, clock) with spoken audio assistance.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleStartGame("familiar_object")}
                style={{ alignSelf: "flex-start" }}
              >
                Play Object Recognition
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Reminders & Daily Routines */}
        <div>
          {/* Reminders Card */}
          <div className="card card-elevated" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={26} color="var(--color-warning)" />
                <h2 style={{ fontSize: "var(--font-lg)" }}>Today's Reminders</h2>
              </div>
              <span className="badge badge-medium">{reminders.length} scheduled</span>
            </div>

            {reminders.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No active reminders for today.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => handleToggleReminder(rem.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: rem.is_completed ? "var(--bg-muted)" : "var(--bg-surface)",
                      border: "2px solid var(--border-color)",
                      cursor: "pointer",
                      textDecoration: rem.is_completed ? "line-through" : "none",
                      opacity: rem.is_completed ? 0.7 : 1,
                    }}
                  >
                    {rem.is_completed ? (
                      <CheckCircle2 size={26} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    ) : (
                      <Circle size={26} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "var(--font-base)" }}>{rem.title}</strong>
                        <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--color-primary)" }}>
                          {rem.reminder_time}
                        </span>
                      </div>
                      {rem.description && (
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {rem.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Routine Checklist */}
          <div className="card card-elevated">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={26} color="var(--color-success)" />
                <h2 style={{ fontSize: "var(--font-lg)" }}>Daily Routine Checklist</h2>
              </div>
              <span className="badge badge-easy">
                {routines.filter((r) => r.is_checked).length}/{routines.length} done
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {routines.map((rt) => (
                <div
                  key={rt.id}
                  onClick={() => handleToggleRoutine(rt.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: rt.is_checked ? "var(--color-success-bg)" : "var(--bg-muted)",
                    border: "2px solid var(--border-color)",
                    cursor: "pointer",
                  }}
                >
                  {rt.is_checked ? (
                    <CheckCircle2 size={24} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={24} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span
                    style={{
                      fontSize: "var(--font-base)",
                      textDecoration: rt.is_checked ? "line-through" : "none",
                      color: rt.is_checked ? "var(--color-success)" : "var(--text-primary)",
                      fontWeight: rt.is_checked ? 600 : 500,
                    }}
                  >
                    {rt.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Cards Preview Section */}
      <section style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image size={28} color="var(--color-info)" />
            <h2 style={{ fontSize: "var(--font-xl)" }}>Cherished Memories & Familiar Faces</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => setCurrentTab("memories")}>
            View All Memories
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid-3">
          {memoryCards.slice(0, 3).map((card) => (
            <div key={card.id} className="card card-elevated" style={{ overflow: "hidden", padding: 0 }}>
              {card.photo_url && (
                <img
                  src={card.photo_url}
                  alt={card.name_or_title}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
              )}
              <div style={{ padding: "20px" }}>
                <span className="badge badge-easy" style={{ marginBottom: "8px" }}>
                  {card.relation}
                </span>
                <h3 style={{ fontSize: "var(--font-lg)", marginBottom: "6px" }}>{card.name_or_title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginBottom: "16px" }}>
                  {card.description}
                </p>
                {audioPrompts && card.audio_prompt && (
                  <button
                    className="btn btn-voice"
                    onClick={() => speak(card.audio_prompt)}
                    style={{ width: "100%" }}
                  >
                    <Volume2 size={18} />
                    Hear Description
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
