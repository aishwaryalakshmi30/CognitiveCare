import React from "react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  Brain,
  Sparkles,
  Heart,
  ShieldCheck,
  Gamepad2,
  CalendarCheck,
  Image,
  ArrowRight,
  AlertTriangle,
  User,
  Activity,
} from "lucide-react";

export default function LandingPage({ setCurrentTab }) {
  const { login } = useAuth();
  const { speak } = useAccessibility();

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      speak(`Logged in successfully.`);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--color-primary-light) 0%, var(--bg-primary) 100%)",
          padding: "60px 0 40px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="container" style={{ textAlign: "center", maxWidth: "900px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              color: "var(--color-primary)",
              border: "1px solid var(--border-color)",
              marginBottom: "20px",
            }}
          >
            <Sparkles size={18} />
            <span>AI-Assisted Supportive Cognitive Gaming & Memory Platform</span>
          </div>

          <h1
            style={{
              fontSize: "var(--font-3xl)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "20px",
              color: "var(--text-primary)",
            }}
          >
            Empowering Mental Vitality, Familiar Memories & Compassionate Care
          </h1>

          <p
            style={{
              fontSize: "var(--font-lg)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "30px",
            }}
          >
            A calm, senior-accessible digital companion tailored for elderly dementia support in NER.
            Featuring adaptive cognitive stimulation, personalized memory cards, daily routine checklists,
            and non-diagnostic caregiver activity tracking.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary btn-large"
              onClick={() => setCurrentTab("login")}
            >
              Get Started / Sign In
              <ArrowRight size={22} />
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => {
                const el = document.getElementById("demo-accounts");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Instant Demo Accounts
            </button>
          </div>

          {/* Clinical Disclaimer Notice */}
          <div className="disclaimer-banner" style={{ textAlign: "left", marginTop: "30px" }}>
            <AlertTriangle size={24} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "var(--color-warning)" }}>Clinical & Ethical Notice:</strong> CognitiveCare is a supportive cognitive stimulation and daily memory assistance tool. It is <strong>NOT</strong> a medical diagnostic system, clinical staging instrument, or medical device. Machine learning difficulty adjustments are designed purely for comfortable, non-frustrating cognitive engagement.
            </div>
          </div>
        </div>
      </section>

      {/* Instant Demo Accounts Quick-Login Cards */}
      <section id="demo-accounts" style={{ padding: "50px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "8px" }}>
              Instant Demo Access by Role
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
              Click any account below to instantly log in and evaluate that role's experience:
            </p>
          </div>

          <div className="grid-2" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Elderly User 1 */}
            <div className="card card-elevated" style={{ borderLeft: "6px solid var(--color-primary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-primary-light)" }}>
                  <User size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--font-lg)" }}>Dhiren Borah</h3>
                  <span className="badge badge-easy">Elderly User (Senior View)</span>
                </div>
              </div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Senior dashboard with large cards, active reminders, memory cards of family in Guwahati, and 3 cognitive games with ML difficulty adaptation.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => handleQuickLogin("dhiren.borah@cognitivecare.org", "Elderly@1234")}
              >
                Log In as Dhiren (Elderly)
              </button>
            </div>

            {/* Caregiver */}
            <div className="card card-elevated" style={{ borderLeft: "6px solid var(--color-success)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-success-bg)" }}>
                  <Heart size={24} color="var(--color-success)" />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--font-lg)" }}>Dr. Priya Sharma</h3>
                  <span className="badge badge-medium">Caregiver Account</span>
                </div>
              </div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Caregiver portal to review authorized patients' gameplay activity, accuracy trends, session counts, and configure daily routine reminders.
              </p>
              <button
                className="btn btn-success"
                style={{ width: "100%" }}
                onClick={() => handleQuickLogin("caregiver.priya@cognitivecare.org", "Caregiver@1234")}
              >
                Log In as Dr. Priya (Caregiver)
              </button>
            </div>

            {/* Elderly User 2 */}
            <div className="card card-elevated" style={{ borderLeft: "6px solid #8b5cf6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "#f3e8ff" }}>
                  <User size={24} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--font-lg)" }}>Maya Devi</h3>
                  <span className="badge badge-easy">Elderly User (Standard)</span>
                </div>
              </div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Second senior profile experiencing sequence memory exercises, routine checklists, and calm spoken audio instructions.
              </p>
              <button
                className="btn btn-secondary"
                style={{ width: "100%" }}
                onClick={() => handleQuickLogin("maya.devi@cognitivecare.org", "Elderly@1234")}
              >
                Log In as Maya (Elderly)
              </button>
            </div>

            {/* Admin */}
            <div className="card card-elevated" style={{ borderLeft: "6px solid var(--color-warning)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-warning-bg)" }}>
                  <ShieldCheck size={24} color="var(--color-warning)" />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--font-lg)" }}>System Administrator</h3>
                  <span className="badge badge-hard">Admin Account</span>
                </div>
              </div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "16px" }}>
                System health dashboard, total users by role, session counts across games, and real-time Random Forest ML pipeline status.
              </p>
              <button
                className="btn btn-secondary"
                style={{ width: "100%" }}
                onClick={() => handleQuickLogin("admin@cognitivecare.org", "Admin@1234")}
              >
                Log In as Administrator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules Overview */}
      <section style={{ padding: "40px 0", backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "8px" }}>
              Designed with Dementia-Friendly Principles
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
              Thoughtfully engineered to minimize cognitive anxiety and maximize reassuring engagement.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ color: "var(--color-primary)", marginBottom: "16px" }}>
                <Gamepad2 size={36} />
              </div>
              <h3 style={{ fontSize: "var(--font-lg)", marginBottom: "10px" }}>
                1. Cognitive Stimulation Games
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Picture Matching, Sequence Memory, and Familiar Object Recognition. Optional untimed mode with zero speed pressure and encouraging feedback.
              </p>
            </div>

            <div className="card">
              <div style={{ color: "var(--color-success)", marginBottom: "16px" }}>
                <Activity size={36} />
              </div>
              <h3 style={{ fontSize: "var(--font-lg)", marginBottom: "10px" }}>
                2. AI Difficulty Adaptation
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Scikit-learn Random Forest Classifier recommends gentle next difficulty levels based on accuracy, response time, and hints—with clear explanations and caregiver overrides.
              </p>
            </div>

            <div className="card">
              <div style={{ color: "var(--color-info)", marginBottom: "16px" }}>
                <Image size={36} />
              </div>
              <h3 style={{ fontSize: "var(--font-lg)", marginBottom: "10px" }}>
                3. Memory Cards & Checklists
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
                Familiar photographs of relatives and home towns with audio prompts, daily hydration/medication checklists, and calm routine reminders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
