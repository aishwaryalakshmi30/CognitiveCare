import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowLeft, Heart, Shield } from "lucide-react";

export default function RegisterPage({ setCurrentTab }) {
  const { register } = useAuth();
  const { speak } = useAccessibility();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("elderly");
  const [fontSizeScale, setFontSizeScale] = useState("large");
  const [audioPrompts, setAudioPrompts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        language_preference: "en",
        high_contrast_mode: highContrast,
        audio_prompts_enabled: audioPrompts,
        untimed_mode_enabled: true,
        font_size_scale: fontSizeScale,
      });
      speak("Account registered successfully. Welcome to CognitiveCare.");
      setCurrentTab("home");
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "620px", padding: "40px 20px" }}>
      <button
        className="btn btn-secondary"
        onClick={() => setCurrentTab("home")}
        style={{ marginBottom: "20px" }}
      >
        <ArrowLeft size={18} />
        Back to Overview
      </button>

      <div className="card card-elevated" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-light)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              marginBottom: "12px",
            }}
          >
            <UserPlus size={32} />
          </div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Create a CognitiveCare Account</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginTop: "4px" }}>
            Tailored cognitive stimulation and daily memory assistance
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "2px solid #ef4444",
              color: "#991b1b",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "var(--font-base)",
            }}
          >
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Role Selection */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}>
              I am registering as:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                type="button"
                className={role === "elderly" ? "btn btn-primary" : "btn btn-secondary"}
                onClick={() => setRole("elderly")}
                style={{ justifyContent: "center" }}
              >
                <User size={20} />
                Elderly User
              </button>
              <button
                type="button"
                className={role === "caregiver" ? "btn btn-primary" : "btn btn-secondary"}
                onClick={() => setRole("caregiver")}
                style={{ justifyContent: "center" }}
              >
                <Heart size={20} />
                Caregiver
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-name"
              style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}
            >
              Full Name:
            </label>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="e.g. Dhiren Borah"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}
            >
              Email Address:
            </label>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="e.g. dhiren@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}
            >
              Password (minimum 6 characters):
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Initial Accessibility Preferences */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-muted)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "var(--font-base)", display: "block", marginBottom: "12px" }}>
              Initial Accessibility Preferences:
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={audioPrompts}
                  onChange={(e) => setAudioPrompts(e.target.checked)}
                  style={{ width: "22px", height: "22px", minHeight: "auto" }}
                />
                <span>Enable spoken voice instructions and audio guidance</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  style={{ width: "22px", height: "22px", minHeight: "auto" }}
                />
                <span>Enable High Contrast visual theme</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: "100%", marginTop: "10px" }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "var(--font-sm)" }}>
          Already registered?{" "}
          <a onClick={() => setCurrentTab("login")} style={{ fontWeight: 700 }}>
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}
