import React from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  Brain,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Type,
  LogOut,
  UserCheck,
  ShieldCheck,
  HeartHandshake,
  Clock,
} from "lucide-react";

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout, isElderly, isCaregiver, isAdmin } = useAuth();
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    cycleFontSize,
    audioPrompts,
    toggleAudioPrompts,
    untimedMode,
    toggleUntimedMode,
    speak,
    isSpeaking,
  } = useAccessibility();

  const handleReadAloud = () => {
    let msg = `You are on the CognitiveCare platform. Current section: ${currentTab}. `;
    if (user) {
      msg += `Signed in as ${user.full_name}, ${user.role}. `;
    }
    speak(msg);
  };

  return (
    <header
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "3px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Top Accessibility Bar */}
      <div
        style={{
          backgroundColor: "var(--bg-muted)",
          borderBottom: "1px solid var(--border-color)",
          padding: "8px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--font-sm)" }}>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            Senior Accessibility Tools:
          </span>
          <button
            onClick={toggleHighContrast}
            aria-label="Toggle High Contrast Mode"
            style={{
              padding: "6px 12px",
              minHeight: "38px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-color)",
            }}
          >
            {highContrast ? <Sun size={18} /> : <Moon size={18} />}
            <span>{highContrast ? "Normal Colors" : "High Contrast"}</span>
          </button>

          <button
            onClick={cycleFontSize}
            aria-label="Adjust Text Size"
            style={{
              padding: "6px 12px",
              minHeight: "38px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-color)",
            }}
          >
            <Type size={18} />
            <span>
              Text Size: <strong>{fontSize.replace("_", " ").toUpperCase()}</strong>
            </span>
          </button>

          <button
            onClick={toggleAudioPrompts}
            aria-label="Toggle Voice Guidance"
            style={{
              padding: "6px 12px",
              minHeight: "38px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              backgroundColor: audioPrompts ? "var(--color-primary-light)" : "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-color)",
            }}
          >
            {audioPrompts ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>Voice Guide: {audioPrompts ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={toggleUntimedMode}
            aria-label="Toggle Untimed Play Mode"
            style={{
              padding: "6px 12px",
              minHeight: "38px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              backgroundColor: untimedMode ? "var(--color-success-bg)" : "var(--bg-surface)",
              color: untimedMode ? "var(--color-success)" : "var(--text-primary)",
              border: "2px solid var(--border-color)",
            }}
          >
            <Clock size={18} />
            <span>Untimed Play: {untimedMode ? "ACTIVE" : "OFF"}</span>
          </button>
        </div>

        {audioPrompts && (
          <button
            onClick={handleReadAloud}
            style={{
              backgroundColor: "var(--color-info-bg)",
              color: "var(--color-info)",
              border: "2px solid var(--color-info)",
              padding: "6px 14px",
              minHeight: "38px",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
            }}
          >
            <Volume2 size={16} />
            <span>{isSpeaking ? "Speaking..." : "Read Page Aloud"}</span>
          </button>
        )}
      </div>

      {/* Main Navigation Bar */}
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setCurrentTab("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Brain size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              CognitiveCare
            </h1>
            <p style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "-2px" }}>
              Supportive Cognitive Gaming & Memory Hub
            </p>
          </div>
        </div>

        {/* Role-Specific Navigation Buttons */}
        {user && (
          <nav style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {isElderly && (
              <>
                <button
                  className={currentTab === "home" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("home")}
                >
                  Dashboard
                </button>
                <button
                  className={currentTab === "games" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("games")}
                >
                  Cognitive Games
                </button>
                <button
                  className={currentTab === "memories" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("memories")}
                >
                  My Memories
                </button>
                <button
                  className={currentTab === "routines" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("routines")}
                >
                  Daily Routines
                </button>
                <button
                  className={currentTab === "history" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("history")}
                >
                  My Progress
                </button>
              </>
            )}

            {isCaregiver && (
              <>
                <button
                  className={currentTab === "caregiver" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("caregiver")}
                >
                  <HeartHandshake size={20} />
                  Patient Monitoring
                </button>
                <button
                  className={currentTab === "games" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("games")}
                >
                  Explore Games
                </button>
                <button
                  className={currentTab === "ml_info" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("ml_info")}
                >
                  AI Model Specs
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  className={currentTab === "admin" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("admin")}
                >
                  <ShieldCheck size={20} />
                  System Stats
                </button>
                <button
                  className={currentTab === "ml_info" ? "btn btn-primary" : "btn btn-secondary"}
                  onClick={() => setCurrentTab("ml_info")}
                >
                  ML Inspection
                </button>
              </>
            )}
          </nav>
        )}

        {/* User Account & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <UserCheck size={20} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", textTransform: "capitalize" }}>
                    {user.role} Account
                  </div>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
                style={{ minWidth: "48px", padding: "10px" }}
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setCurrentTab("login")}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentTab("register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
