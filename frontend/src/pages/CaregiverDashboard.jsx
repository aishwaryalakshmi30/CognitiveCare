import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  fetchCaregiverPatients,
  fetchPatientDetail,
  createPatientReminder,
} from "../services/api";
import {
  Heart,
  User,
  Activity,
  Calendar,
  Clock,
  Target,
  Plus,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Gamepad2,
  CheckCircle2,
  Bell,
  X,
  Volume2,
} from "lucide-react";

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const { speak, audioPrompts } = useAccessibility();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // New Reminder modal states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [remTitle, setRemTitle] = useState("");
  const [remDesc, setRemDesc] = useState("");
  const [remCat, setRemCat] = useState("medication");
  const [remTime, setRemTime] = useState("08:30");
  const [remPrompt, setRemPrompt] = useState("");

  const loadPatients = async () => {
    try {
      const data = await fetchCaregiverPatients();
      setPatients(data);
    } catch (e) {
      console.error("Error loading patients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSelectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setDetailLoading(true);
    try {
      const detail = await fetchPatientDetail(patientId);
      setPatientDetail(detail);
      if (audioPrompts) {
        speak(`Viewing patient records for ${detail.patient.full_name}.`);
      }
    } catch (e) {
      alert("Could not load patient detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateReminderForPatient = async (e) => {
    e.preventDefault();
    try {
      await createPatientReminder(selectedPatientId, {
        title: remTitle,
        description: remDesc,
        category: remCat,
        reminder_time: remTime,
        is_recurring: true,
        spoken_prompt: remPrompt || `Reminder for ${patientDetail.patient.full_name}: ${remTitle}`,
      });
      setShowReminderModal(false);
      setRemTitle("");
      setRemDesc("");
      setRemPrompt("");
      // Refresh patient detail
      const detail = await fetchPatientDetail(selectedPatientId);
      setPatientDetail(detail);
      speak("Reminder successfully scheduled for patient.");
    } catch (err) {
      alert("Failed to create reminder for patient.");
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-success)", marginBottom: "6px" }}>
          <Heart size={26} />
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, textTransform: "uppercase" }}>
            Caregiver Management Portal
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
          Patient Activity & Progress Monitoring
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
          Monitor authorized elderly patients' engagement, session completion, and configure supportive reminders.
        </p>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="disclaimer-banner" style={{ marginBottom: "32px" }}>
        <AlertTriangle size={24} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "var(--color-warning)" }}>Clinical Caregiver Notice:</strong> Session history, accuracy rates, and gameplay patterns represent recreational cognitive stimulation. <strong>Do not interpret these metrics as clinical dementia staging, cognitive decline tests, or medical diagnoses.</strong>
        </div>
      </div>

      {/* Detail View vs List View */}
      {selectedPatientId && patientDetail ? (
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedPatientId(null);
              setPatientDetail(null);
            }}
            style={{ marginBottom: "24px" }}
          >
            <ArrowLeft size={20} />
            Back to All Authorized Patients
          </button>

          {/* Patient Overview Card */}
          <div
            className="card card-elevated"
            style={{
              padding: "32px",
              marginBottom: "32px",
              borderLeft: "6px solid var(--color-primary)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <span className="badge badge-easy" style={{ marginBottom: "8px" }}>
                  {patientDetail.relationship_type} Link (Verified Consent)
                </span>
                <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "4px" }}>
                  {patientDetail.patient.full_name}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                  Email: {patientDetail.patient.email} &bull; Language: {patientDetail.patient.language_preference.toUpperCase()}
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  {patientDetail.patient.high_contrast_mode && (
                    <span className="badge badge-medium">High Contrast Active</span>
                  )}
                  {patientDetail.patient.untimed_mode_enabled && (
                    <span className="badge badge-easy">Untimed Play Active</span>
                  )}
                  {patientDetail.patient.audio_prompts_enabled && (
                    <span className="badge badge-easy">Audio Prompts Enabled</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Plus size={20} />
                  Schedule Patient Reminder
                </button>
              </div>
            </div>
          </div>

          {/* Patient Performance Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", marginBottom: "8px" }}>
                <Gamepad2 size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Total Sessions</span>
              </div>
              <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
                {patientDetail.total_games}
              </div>
            </div>

            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", marginBottom: "8px" }}>
                <Target size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Overall Accuracy</span>
              </div>
              <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
                {patientDetail.overall_accuracy}%
              </div>
            </div>

            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)", marginBottom: "8px" }}>
                <Bell size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Active Reminders</span>
              </div>
              <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
                {patientDetail.reminders.length}
              </div>
            </div>
          </div>

          {/* Recent Gameplay Sessions */}
          <div className="card card-elevated" style={{ marginBottom: "36px", padding: "28px" }}>
            <h3 style={{ fontSize: "var(--font-xl)", marginBottom: "16px" }}>
              Recent Game Engagement History
            </h3>
            {patientDetail.recent_sessions.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No gameplay sessions recorded yet.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-muted)", borderBottom: "2px solid var(--border-color)" }}>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Date</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Activity</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Difficulty</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Accuracy</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Score</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>Hints</th>
                      <th style={{ padding: "14px 16px", fontSize: "var(--font-sm)" }}>AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDetail.recent_sessions.map((sess) => (
                      <tr key={sess.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 16px", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                          {new Date(sess.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, textTransform: "capitalize" }}>
                          {sess.game_type.replace("_", " ")}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span className={`badge badge-${sess.difficulty}`} style={{ textTransform: "capitalize" }}>
                            {sess.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-success)" }}>
                          {Math.round(sess.accuracy_percentage)}%
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                          {sess.score}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                          {sess.hints_used}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {sess.recommended_by_ml ? (
                            <span className="badge badge-easy" style={{ fontSize: "var(--font-xs)" }}>
                              ML Adapted
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

          {/* Configured Patient Reminders */}
          <div className="card card-elevated" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "var(--font-xl)" }}>
                Configured Daily Reminders for {patientDetail.patient.full_name}
              </h3>
              <button
                className="btn btn-secondary"
                onClick={() => setShowReminderModal(true)}
              >
                <Plus size={18} />
                Add Reminder
              </button>
            </div>

            {patientDetail.reminders.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No active reminders configured for this patient.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {patientDetail.reminders.map((rem) => (
                  <div
                    key={rem.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-muted)",
                      border: "1px solid var(--border-color)",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <span className="badge badge-easy" style={{ marginBottom: "4px", textTransform: "capitalize" }}>
                        {rem.category}
                      </span>
                      <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>
                        {rem.title}
                      </h4>
                      {rem.description && (
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {rem.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "var(--font-lg)", color: "var(--color-primary)" }}>
                      <Clock size={20} />
                      <span>{rem.reminder_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Patient Reminder Modal */}
          {showReminderModal && (
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
                  <h2 style={{ fontSize: "var(--font-xl)" }}>
                    Schedule Reminder for {patientDetail.patient.full_name}
                  </h2>
                  <button
                    onClick={() => setShowReminderModal(false)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", minHeight: "36px" }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateReminderForPatient} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Category:
                    </label>
                    <select value={remCat} onChange={(e) => setRemCat(e.target.value)}>
                      <option value="medication">Prescribed Medication</option>
                      <option value="hydration">Water & Hydration</option>
                      <option value="meal">Meal & Nutrition</option>
                      <option value="activity">Cognitive Brain Game</option>
                      <option value="social">Family Social Call</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Reminder Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Morning Blood Pressure Medication"
                      value={remTitle}
                      onChange={(e) => setRemTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Scheduled Time:
                    </label>
                    <input
                      type="time"
                      required
                      value={remTime}
                      onChange={(e) => setRemTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Caregiver Instructions:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Take 1 tablet with a full glass of warm water after breakfast."
                      value={remDesc}
                      onChange={(e) => setRemDesc(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Spoken Audio Prompt:
                    </label>
                    <input
                      type="text"
                      placeholder="Spoken aloud to patient by voice assistant"
                      value={remPrompt}
                      onChange={(e) => setRemPrompt(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Confirm & Schedule Reminder
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowReminderModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Patients List View */
        <div>
          <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "20px" }}>
            Authorized Elderly Patients ({patients.length})
          </h2>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading authorized patients...</p>
          ) : patients.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <User size={48} color="var(--color-primary)" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "var(--font-lg)", marginBottom: "8px" }}>No Patients Linked Yet</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Patients must grant explicit caregiver consent to link accounts.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {patients.map((p) => (
                <div key={p.patient_id} className="card card-elevated" style={{ padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <span className="badge badge-easy" style={{ marginBottom: "6px" }}>
                        {p.relationship_type}
                      </span>
                      <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 700 }}>
                        {p.full_name}
                      </h3>
                      <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                        {p.email}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      margin: "16px 0 20px",
                      padding: "14px",
                      backgroundColor: "var(--bg-muted)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Sessions Played</span>
                      <strong style={{ display: "block", fontSize: "var(--font-lg)" }}>
                        {p.total_sessions_played}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Average Accuracy</span>
                      <strong style={{ display: "block", fontSize: "var(--font-lg)", color: "var(--color-success)" }}>
                        {p.avg_accuracy}%
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Active Reminders</span>
                      <strong style={{ display: "block", fontSize: "var(--font-lg)" }}>
                        {p.active_reminders_count}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Last Activity</span>
                      <span style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600 }}>
                        {p.last_played_date || "Never"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectPatient(p.patient_id)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    View Activity & Reminders
                    <ArrowRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
