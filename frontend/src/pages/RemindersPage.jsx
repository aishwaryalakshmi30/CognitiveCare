import React, { useState, useEffect } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { fetchReminders, toggleReminder, createReminder, deleteReminder } from "../services/api";
import {
  Clock,
  Plus,
  Volume2,
  Trash2,
  CheckCircle2,
  Circle,
  Pill,
  Droplets,
  Utensils,
  Sparkles,
  Users,
  Bell,
  X,
} from "lucide-react";

export default function RemindersPage() {
  const { speak, audioPrompts } = useAccessibility();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("medication");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [spokenPrompt, setSpokenPrompt] = useState("");

  const loadReminders = async () => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } catch (e) {
      console.error("Error loading reminders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleToggle = async (id) => {
    try {
      const updated = await toggleReminder(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.is_completed && audioPrompts) {
        speak(`Reminder for ${updated.title} marked completed.`);
      }
    } catch (e) {
      alert("Failed to toggle reminder status.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this reminder?")) {
      await deleteReminder(id);
      await loadReminders();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createReminder({
        title,
        description,
        category,
        reminder_time: reminderTime,
        is_recurring: true,
        spoken_prompt: spokenPrompt || `Reminder: ${title}`,
      });
      setShowAddModal(false);
      setTitle("");
      setDescription("");
      setReminderTime("09:00");
      setSpokenPrompt("");
      await loadReminders();
      speak("New reminder created successfully.");
    } catch (err) {
      alert("Failed to create reminder.");
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "medication":
        return <Pill size={22} color="#e11d48" />;
      case "hydration":
        return <Droplets size={22} color="#0284c7" />;
      case "meal":
        return <Utensils size={22} color="#d97706" />;
      case "social":
        return <Users size={22} color="#7c3aed" />;
      default:
        return <Bell size={22} color="#16a34a" />;
    }
  };

  const filteredReminders =
    categoryFilter === "all"
      ? reminders
      : reminders.filter((r) => r.category === categoryFilter);

  return (
    <div className="container" style={{ padding: "40px 20px 80px", maxWidth: "860px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
            Scheduled Reminders
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
            Never miss important medications, hydration intervals, or gentle afternoon activities.
          </p>
        </div>

        <button className="btn btn-primary btn-large" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Create Reminder
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
        {["all", "medication", "hydration", "meal", "activity", "social"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "8px 16px",
              minHeight: "42px",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              borderRadius: "var(--radius-full)",
              backgroundColor: categoryFilter === cat ? "var(--color-primary)" : "var(--bg-surface)",
              color: categoryFilter === cat ? "#ffffff" : "var(--text-primary)",
              border: "2px solid var(--border-color)",
              textTransform: "capitalize",
            }}
          >
            {cat === "all" ? "All Reminders" : cat}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-muted)" }}>
            Loading your reminders...
          </p>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Bell size={48} color="var(--color-warning)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "8px" }}>No Reminders in this Category</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginBottom: "20px" }}>
            Create custom reminders with times, voice instructions, and daily schedules.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Create First Reminder
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredReminders.map((rem) => (
            <div
              key={rem.id}
              className="card card-elevated"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                padding: "20px 24px",
                backgroundColor: rem.is_completed ? "var(--bg-muted)" : "var(--bg-surface)",
                opacity: rem.is_completed ? 0.75 : 1,
              }}
            >
              <div
                onClick={() => handleToggle(rem.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  cursor: "pointer",
                  flex: 1,
                  minWidth: "280px",
                }}
              >
                {rem.is_completed ? (
                  <CheckCircle2 size={30} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                ) : (
                  <Circle size={30} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "2px" }} />
                )}

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {getCategoryIcon(rem.category)}
                    </span>
                    <h3
                      style={{
                        fontSize: "var(--font-xl)",
                        fontWeight: 700,
                        textDecoration: rem.is_completed ? "line-through" : "none",
                        color: rem.is_completed ? "var(--text-muted)" : "var(--text-primary)",
                      }}
                    >
                      {rem.title}
                    </h3>
                  </div>

                  {rem.description && (
                    <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {rem.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Timing */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "var(--bg-muted)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontWeight: 700,
                    fontSize: "var(--font-lg)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Clock size={20} />
                  <span>{rem.reminder_time}</span>
                </div>

                {audioPrompts && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => speak(rem.spoken_prompt || `Reminder at ${rem.reminder_time}: ${rem.title}. ${rem.description || ""}`)}
                    title="Speak reminder"
                    style={{ minWidth: "48px", padding: "10px" }}
                  >
                    <Volume2 size={20} />
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => handleDelete(rem.id)}
                  title="Delete reminder"
                  style={{ minWidth: "48px", padding: "10px" }}
                >
                  <Trash2 size={20} color="var(--text-muted)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="card card-elevated" style={{ maxWidth: "560px", width: "100%", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "var(--font-xl)" }}>Create New Reminder</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", minHeight: "36px" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Category:
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="medication">Medication & Tablets</option>
                  <option value="hydration">Water & Hydration</option>
                  <option value="meal">Meal & Nutrition</option>
                  <option value="activity">Cognitive Game & Exercise</option>
                  <option value="social">Family Call & Conversation</option>
                  <option value="general">General Daily Reminder</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Reminder Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Hydration & Glass of Water"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Scheduled Time (24-Hour format):
                </label>
                <input
                  type="time"
                  required
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Instructions / Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drink one full glass of lukewarm water."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Spoken Audio Prompt (optional):
                </label>
                <input
                  type="text"
                  placeholder="Text spoken aloud by the voice assistant"
                  value={spokenPrompt}
                  onChange={(e) => setSpokenPrompt(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Reminder
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
