import React, { useState, useEffect } from "react";
import { getMLModelInfo } from "../services/api";
import {
  Cpu,
  Target,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowLeft,
} from "lucide-react";

export default function MLModelInfoPage({ onBack }) {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        const data = await getMLModelInfo();
        setModelInfo(data);
      } catch (e) {
        console.error("Could not load model info:", e);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  return (
    <div className="container" style={{ padding: "40px 20px 80px", maxWidth: "900px" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "28px" }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: "16px" }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)", marginBottom: "6px" }}>
          <Cpu size={26} />
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, textTransform: "uppercase" }}>
            Machine Learning Pipeline Architecture
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
          AI Difficulty Adaptation & Transparency Report
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
          Technical specifications, evaluation benchmarks, and strict clinical safety boundaries.
        </p>
      </div>

      {/* Prominent Ethical Boundary Banner */}
      <div className="disclaimer-banner" style={{ marginBottom: "32px", borderColor: "var(--color-warning)" }}>
        <AlertTriangle size={28} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "var(--color-warning)", fontSize: "var(--font-base)" }}>
            Mandatory Clinical Boundary & Ethical Safeguard:
          </strong>
          <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
            The Random Forest model and rule-based fallback predict <strong>only game difficulty levels</strong> (Easy, Medium, Hard) to minimize cognitive anxiety and maximize user engagement. <strong>This model NEVER predicts clinical dementia diagnosis, disease severity, life expectancy, or medical treatment needs.</strong>
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-muted)" }}>
            Loading model specifications...
          </p>
        </div>
      ) : modelInfo ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Top Benchmark Comparison */}
          <div className="card card-elevated" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "18px" }}>
              Evaluation Benchmarks vs Rule-Based Baseline
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-primary-light)",
                  border: "2px solid var(--color-primary)",
                }}
              >
                <span style={{ fontSize: "var(--font-sm)", color: "var(--color-primary)", fontWeight: 700 }}>
                  Random Forest Accuracy
                </span>
                <div style={{ fontSize: "var(--font-3xl)", fontWeight: 800, color: "var(--color-primary)" }}>
                  {Math.round(modelInfo.accuracy * 1000) / 10}%
                </div>
                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                  Macro F1: {modelInfo.macro_f1}
                </span>
              </div>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-muted)",
                  border: "2px solid var(--border-color)",
                }}
              >
                <span style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", fontWeight: 700 }}>
                  Rule-Based Baseline Accuracy
                </span>
                <div style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>
                  {Math.round(modelInfo.baseline_accuracy * 1000) / 10}%
                </div>
                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                  Macro F1: {modelInfo.baseline_macro_f1}
                </span>
              </div>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-success-bg)",
                  border: "2px solid var(--color-success)",
                }}
              >
                <span style={{ fontSize: "var(--font-sm)", color: "var(--color-success)", fontWeight: 700 }}>
                  Algorithm Performance Gain
                </span>
                <div style={{ fontSize: "var(--font-3xl)", fontWeight: 800, color: "var(--color-success)" }}>
                  +{Math.round((modelInfo.accuracy - modelInfo.baseline_accuracy) * 1000) / 10}%
                </div>
                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                  Statistically superior adaptation
                </span>
              </div>
            </div>
          </div>

          {/* Model Pipeline Parameters & Features */}
          <div className="card card-elevated" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "16px" }}>
              Pipeline Architecture & Features
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <strong style={{ fontSize: "var(--font-base)", display: "block", marginBottom: "8px" }}>
                  Algorithm Details:
                </strong>
                <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "var(--font-base)", lineHeight: 1.8 }}>
                  <li>Estimator: <code>RandomForestClassifier</code></li>
                  <li>Number of Trees: 100</li>
                  <li>Maximum Depth: 8</li>
                  <li>Class Weight: <code>balanced</code></li>
                  <li>Serialization: <code>Joblib</code> (persisted artifact)</li>
                  <li>Preprocessing: <code>ColumnTransformer</code> with <code>StandardScaler</code> and <code>OneHotEncoder</code></li>
                </ul>
              </div>

              <div>
                <strong style={{ fontSize: "var(--font-base)", display: "block", marginBottom: "8px" }}>
                  Feature Vector Inputs:
                </strong>
                <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "var(--font-base)", lineHeight: 1.8 }}>
                  {modelInfo.feature_names.map((feat) => (
                    <li key={feat}><code>{feat}</code></li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <strong style={{ fontSize: "var(--font-base)", display: "block", marginBottom: "8px" }}>
                Target Output Classes:
              </strong>
              <div style={{ display: "flex", gap: "10px" }}>
                {modelInfo.target_classes.map((cls) => (
                  <span key={cls} className={`badge badge-${cls}`} style={{ textTransform: "capitalize", fontSize: "var(--font-base)" }}>
                    {cls} Difficulty
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Fallback & Override Mechanisms */}
          <div className="card card-elevated" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "12px" }}>
              Explainable Fallback & Caregiver Overrides
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", lineHeight: 1.6, marginBottom: "16px" }}>
              In the event of network disruption, missing model files, or extreme metric outliers, the application automatically triggers the <strong>documented conservative rule-based fallback</strong> without throwing errors or interrupting gameplay. Furthermore, all difficulty recommendations can be freely overridden by the user or caregiver.
            </p>

            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--bg-muted)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontFamily: "monospace",
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              <div>// Conservative Rule-Based Fallback Logic</div>
              <div>if (accuracy &lt; 60% || hints &gt;= 3 || response_time &gt; 8.5s) =&gt; EASY</div>
              <div>else if (accuracy &gt;= 85% &amp;&amp; hints &lt;= 1 &amp;&amp; response_time &lt;= 4s) =&gt; HARD (or step up)</div>
              <div>else =&gt; MEDIUM (or maintain current level)</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
