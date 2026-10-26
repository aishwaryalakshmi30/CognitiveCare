import React, { useState, useEffect } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { fetchRoutines, toggleRoutine, createRoutine } from "../services/api";
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Volume2,
  CalendarCheck,
  X,
} from "lucide-react";

export default function RoutinesPage() {
  const { speak, audioPrompts } = useAccessibility();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPeriod, setNewPeriod] = useState("morning");

  const loadRoutines = async () => {
    try {
      const data = await fetchRoutines();
      setRoutines(data);
    } catch (e) {
      console.error("Error loading routines:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleToggle = async (id) => {
    try {
      const updated = await toggleRoutine(id);
      setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.is_checked && audioPrompts) {
        speak(`Completed: ${updated.title}. Wonderful job.`);
      }
    } catch (e) {
      alert("Failed to update routine item.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRoutine({
        title: newTitle,
        period_of_day: newPeriod,
        order_index: routines.length + 1,
        icon_name: newPeriod === "morning" ? "sun" : newPeriod === "night" ? "moon" : "clock",
      });
      setShowAddModal(false);
      setNewTitle("");
      await loadRoutines();
      speak("New routine item added to your checklist.");
    } catch (e) {
      alert("Failed to add routine task.");
    }
  };

  const periods = [
    { id: "morning", label: "Morning Routines", icon: Sun, color: "#eab308" },
    { id: "afternoon", label: "Afternoon Routines", icon: Clock, color: "#3b82f6" },
    { id: "evening", label: "Evening Routines", icon: Sunset, color: "#f97316" },
    { id: "night", label: "Night & Bedtime Routines", icon: Moon, color: "#6366f1" },
  ];

  const completedCount = routines.filter((r) => r.is_checked).length;
  const progressPercent = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

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
            Daily Routine Checklist
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
            Gentle structured activities to maintain rhythm, hydration, and peace of mind.
          </p>
        </div>

        <button className="btn btn-primary btn-large" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add Routine Item
        </button>
      </div>

      {/* Progress Bar Banner */}
      <div className="card card-elevated" style={{ marginBottom: "32px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <strong style={{ fontSize: "var(--font-lg)" }}>Today's Progress:</strong>{" "}
            <span style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
              {completedCount} of {routines.length} completed ({progressPercent}%)
            </span>
          </div>
          {audioPrompts && (
            <button
              className="btn btn-voice"
              onClick={() => speak(`Today you have completed ${completedCount} out of ${routines.length} routine activities.`)}
            >
              <Volume2 size={18} />
              Read Progress
            </button>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div
          style={{
            height: "14px",
            backgroundColor: "var(--bg-muted)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              backgroundColor: "var(--color-success)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Sections by Period of the Day */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {periods.map((period) => {
          const items = routines.filter((r) => r.period_of_day === period.id);
          const IconComponent = period.icon;

          return (
            <div key={period.id} className="card card-elevated">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderBottom: "2px solid var(--border-color)",
                  paddingBottom: "14px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-muted)",
                    color: period.color,
                  }}
                >
                  <IconComponent size={24} />
                </div>
                <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 700 }}>
                  {period.label}
                </h2>
                <span className="badge badge-easy" style={{ marginLeft: "auto" }}>
                  {items.filter((i) => i.is_checked).length}/{items.length} done
                </span>
              </div>

              {items.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
                  No tasks set for this period.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: item.is_checked ? "var(--color-success-bg)" : "var(--bg-surface)",
                        border: `2px solid ${item.is_checked ? "var(--color-success)" : "var(--border-color)"}`,
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {item.is_checked ? (
                        <CheckCircle2 size={28} color="var(--color-success)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={28} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}

                      <span
                        style={{
                          fontSize: "var(--font-lg)",
                          fontWeight: item.is_checked ? 600 : 500,
                          color: item.is_checked ? "var(--color-success)" : "var(--text-primary)",
                          textDecoration: item.is_checked ? "line-through" : "none",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
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
          <div className="card card-elevated" style={{ maxWidth: "520px", width: "100%", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "var(--font-xl)" }}>Add Daily Routine Item</h2>
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
                  Time of Day:
                </label>
                <select value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night & Bedtime</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Routine Task Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink 1 glass of warm water & herbal tea"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add to Checklist
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
