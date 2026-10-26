import React, { useState, useEffect } from "react";
import { fetchAdminStats, fetchAdminUsers } from "../services/api";
import {
  ShieldCheck,
  Users,
  Gamepad2,
  Bell,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle,
  Eye,
} from "lucide-react";

export default function AdminDashboard({ setCurrentTab }) {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsData, usersData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminUsers(),
        ]);
        setStats(statsData);
        setUsersList(usersData);
      } catch (e) {
        console.error("Admin data load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="container" style={{ padding: "40px 20px 80px" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-warning)", marginBottom: "6px" }}>
          <ShieldCheck size={26} />
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, textTransform: "uppercase" }}>
            Administration Hub
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
          System Health & Usage Analytics
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
          Overview of authorized accounts, platform usage statistics, and Random Forest adaptation health.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-muted)" }}>
            Loading system metrics...
          </p>
        </div>
      ) : stats ? (
        <div>
          {/* Top 4 KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "36px",
            }}
          >
            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", marginBottom: "8px" }}>
                <Users size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Total Accounts</span>
              </div>
              <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
                {stats.total_users}
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
                Elderly: {stats.users_by_role?.elderly || 0} &bull; Caregivers: {stats.users_by_role?.caregiver || 0} &bull; Admins: {stats.users_by_role?.admin || 0}
              </div>
            </div>

            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", marginBottom: "8px" }}>
                <Gamepad2 size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Total Game Sessions</span>
              </div>
              <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>
                {stats.total_game_sessions}
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
                Across all cognitive games
              </div>
            </div>

            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-info)", marginBottom: "8px" }}>
                <Database size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>Database Status</span>
              </div>
              <div style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-success)", textTransform: "capitalize" }}>
                {stats.database_status}
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
                MySQL / SQLite Active Pool
              </div>
            </div>

            <div className="card card-elevated">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)", marginBottom: "8px" }}>
                <Cpu size={22} />
                <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>ML Model Status</span>
              </div>
              <div style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-success)" }}>
                {stats.ml_model_status?.is_loaded ? "Model Loaded" : "Fallback Active"}
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "6px" }}>
                {stats.ml_model_status?.algorithm} (Acc: {Math.round((stats.ml_model_status?.accuracy || 0) * 100)}%)
              </div>
            </div>
          </div>

          {/* Quick link to ML Transparency Page */}
          <div
            className="card card-elevated"
            style={{
              padding: "24px 30px",
              backgroundColor: "var(--color-primary-light)",
              border: "2px solid var(--color-primary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "var(--font-lg)", color: "var(--color-primary)", marginBottom: "4px" }}>
                Explore Machine Learning Architecture & Metrics
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                View detailed Scikit-learn Random Forest evaluation metrics, macro F1 comparisons, and the confusion matrix.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setCurrentTab("ml_info")}>
              Inspect Model Details
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Authorized Accounts Management Table */}
          <div className="card card-elevated" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "var(--font-xl)", marginBottom: "16px" }}>
              Authorized System Accounts ({usersList.length})
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-muted)", borderBottom: "2px solid var(--border-color)" }}>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>ID</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Full Name</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Email Address</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Role</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Language</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Accessibility Modes</th>
                    <th style={{ padding: "14px 18px", fontSize: "var(--font-sm)" }}>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "14px 18px", fontWeight: 700 }}>#{u.id}</td>
                      <td style={{ padding: "14px 18px", fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>{u.email}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          className={
                            u.role === "admin"
                              ? "badge badge-hard"
                              : u.role === "caregiver"
                              ? "badge badge-medium"
                              : "badge badge-easy"
                          }
                          style={{ textTransform: "capitalize" }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textTransform: "uppercase", fontSize: "var(--font-sm)" }}>
                        {u.language_preference}
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                        {u.high_contrast_mode && <span style={{ marginRight: "6px" }}>• High-Contrast</span>}
                        {u.audio_prompts_enabled && <span style={{ marginRight: "6px" }}>• Audio</span>}
                        {u.untimed_mode_enabled && <span>• Untimed</span>}
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
