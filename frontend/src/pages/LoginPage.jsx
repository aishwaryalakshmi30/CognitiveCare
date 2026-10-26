import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

export default function LoginPage({ setCurrentTab }) {
  const { login } = useAuth();
  const { speak } = useAccessibility();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      speak("Signed in successfully. Welcome to CognitiveCare.");
      setCurrentTab("home");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
      speak("Sign in failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
  };

  return (
    <div className="container" style={{ maxWidth: "560px", padding: "40px 20px" }}>
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
            <LogIn size={32} />
          </div>
          <h2 style={{ fontSize: "var(--font-2xl)" }}>Sign In to CognitiveCare</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginTop: "4px" }}>
            Access cognitive games, memories, or caregiver monitoring
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
          <div>
            <label
              htmlFor="login-email"
              style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}
            >
              Email Address:
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-email"
                type="email"
                required
                placeholder="e.g. dhiren.borah@cognitivecare.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "46px" }}
              />
              <Mail
                size={22}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{ display: "block", marginBottom: "8px", fontWeight: 700, fontSize: "var(--font-base)" }}
            >
              Password:
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "46px" }}
              />
              <Lock
                size={22}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: "100%", marginTop: "10px" }}
          >
            {loading ? "Signing In..." : "Sign In to Account"}
          </button>
        </form>

        {/* Quick autofill chips */}
        <div style={{ marginTop: "28px", borderTop: "2px solid var(--border-color)", paddingTop: "20px" }}>
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "10px" }}>
            Quick Autofill Demo Accounts:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: "36px", padding: "6px 12px", fontSize: "var(--font-sm)" }}
              onClick={() => fillCredentials("dhiren.borah@cognitivecare.org", "Elderly@1234")}
            >
              Dhiren (Senior)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: "36px", padding: "6px 12px", fontSize: "var(--font-sm)" }}
              onClick={() => fillCredentials("caregiver.priya@cognitivecare.org", "Caregiver@1234")}
            >
              Dr. Priya (Caregiver)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: "36px", padding: "6px 12px", fontSize: "var(--font-sm)" }}
              onClick={() => fillCredentials("admin@cognitivecare.org", "Admin@1234")}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "var(--font-sm)" }}>
          Don't have an account yet?{" "}
          <a onClick={() => setCurrentTab("register")} style={{ fontWeight: 700 }}>
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}
