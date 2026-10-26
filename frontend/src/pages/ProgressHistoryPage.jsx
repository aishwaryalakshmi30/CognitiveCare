import React, { useState, useEffect } from "react";
import { fetchGameHistory, fetchGameSummary } from "../services/api";
import {
  Trophy,
  Target,
  Sparkles,
  Clock,
  Lightbulb,
  Gamepad2,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function ProgressHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const [hist, sum] = await Promise.all([
          fetchGameHistory(selectedGameType === "all" ? null : selectedGameType),
          fetchGameSummary(),
        ]);
        setSessions(hist);
        setSummary(sum);
      } catch (e) {
        console.error("Error loading history:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [selectedGameType]);

  return (
    <div className="container" style={{ padding: "40px 20px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
          My Activity & Progress History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
          A reassuring log of your cognitive exercise sessions and personal accomplishments.
        </p>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="disclaimer-banner" style={{ marginBottom: "32px" }}>
        <AlertTriangle size={24} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "var(--color-warning)" }}>Supportive Metric Notice:</strong> Activity history and accuracy trends reflect engagement with cognitive stimulation games. They do <strong>not</strong> measure clinical disease progression, provide neurological diagnoses, or evaluate medical treatment outcomes.
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div className="card card-elevated">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)", marginBottom: "8px" }}>
              <Gamepad2 size={24} />
              <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Total Sessions</span>
            </div>
            <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
              {summary.total_sessions}
            </div>
          </div>

          <div className="card card-elevated">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-success)", marginBottom: "8px" }}>
              <Target size={24} />
              <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Overall Accuracy</span>
            </div>
            <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
              {summary.avg_accuracy}%
            </div>
          </div>

          <div className="card card-elevated">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-warning)", marginBottom: "8px" }}>
              <Trophy size={24} />
              <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Total Activity Score</span>
            </div>
            <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
              {summary.total_score}
            </div>
          </div>

          <div className="card card-elevated">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-info)", marginBottom: "8px" }}>
              <Sparkles size={24} />
              <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Most Played Activity</span>
            </div>
            <div style={{ fontSize: "var(--font-lg)", fontWeight: 800 }}>
              {summary.favorite_game}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {[
          { id: "all", label: "All Game Activities" },
          { id: "picture_matching", label: "Picture Matching" },
          { id: "sequence_memory", label: "Sequence Memory" },
          { id: "familiar_object", label: "Object Recognition" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedGameType(tab.id)}
            style={{
              padding: "8px 16px",
              minHeight: "42px",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              borderRadius: "var(--radius-full)",
              backgroundColor: selectedGameType === tab.id ? "var(--color-primary)" : "var(--bg-surface)",
              color: selectedGameType === tab.id ? "#ffffff" : "var(--text-primary)",
              border: "2px solid var(--border-color)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions History Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-muted)" }}>
            Loading your session records...
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Gamepad2 size={48} color="var(--color-primary)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "8px" }}>No Completed Sessions Yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
            Play your first game of Picture Matching or Sequence Memory to start building your activity log!
          </p>
        </div>
      ) : (
        <div className="card card-elevated" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-muted)", borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Date & Time</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Game Activity</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Difficulty</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Accuracy</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Score</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Duration</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>Hints</th>
                <th style={{ padding: "16px 20px", fontSize: "var(--font-sm)" }}>AI Adapted</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => (
                <tr
                  key={sess.id}
                  style={{ borderBottom: "1px solid var(--border-color)", fontSize: "var(--font-base)" }}
                >
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>
                    {new Date(sess.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700 }}>
                    {sess.game_type === "picture_matching"
                      ? "Picture Matching"
                      : sess.game_type === "sequence_memory"
                      ? "Sequence Memory"
                      : "Object Recognition"}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      className={
                        sess.difficulty === "easy"
                          ? "badge badge-easy"
                          : sess.difficulty === "medium"
                          ? "badge badge-medium"
                          : "badge badge-hard"
                      }
                      style={{ textTransform: "capitalize" }}
                    >
                      {sess.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-success)" }}>
                    {Math.round(sess.accuracy_percentage)}%
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700 }}>
                    {sess.score}
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>
                    {Math.round(sess.completion_time_seconds)}s
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>
                    {sess.hints_used}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {sess.recommended_by_ml ? (
                      <span className="badge badge-easy" style={{ fontSize: "var(--font-xs)" }}>
                        Yes (Random Forest)
                      </span>
                    ) : (
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
                        Standard
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
