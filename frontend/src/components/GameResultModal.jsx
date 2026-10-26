import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useAccessibility } from "../context/AccessibilityContext";
import { getMLDifficultyRecommendation, recordGameSession } from "../services/api";
import {
  Trophy,
  Sparkles,
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

export default function GameResultModal({
  gameType,
  score,
  accuracy,
  totalAttempts,
  correctMatches,
  completionTimeSeconds,
  avgResponseTimeSeconds,
  hintsUsed,
  difficulty,
  isUntimed,
  onPlayAgain,
  onReturnHome,
}) {
  const { speak, audioPrompts } = useAccessibility();

  const [mlRecommendation, setMlRecommendation] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);
  const [loadingML, setLoadingML] = useState(true);
  const [savedSession, setSavedSession] = useState(false);

  useEffect(() => {
    // Fire celebratory encouraging confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1e40af", "#15803d", "#facc15", "#38bdf8"],
      });
    } catch (e) {
      // safe fallback if canvas is restricted
    }

    // Call ML Recommendation API & record session
    async function processResults() {
      try {
        // 1. Get ML Recommendation
        const rec = await getMLDifficultyRecommendation({
          game_type: gameType,
          previous_difficulty: difficulty,
          accuracy_percentage: accuracy,
          avg_response_time_seconds: avgResponseTimeSeconds,
          hints_used: hintsUsed,
          recent_performance: accuracy,
        });
        setMlRecommendation(rec);
        setSelectedDifficulty(rec.recommended_difficulty);

        if (audioPrompts) {
          speak(
            `Wonderful job completing the game! Your accuracy was ${Math.round(
              accuracy
            )} percent. ${rec.explanation}`
          );
        }

        // 2. Record Session in Database
        await recordGameSession({
          game_type: gameType,
          difficulty: difficulty,
          recommended_by_ml: rec.method_used === "ml_pipeline",
          is_untimed: isUntimed,
          score: score,
          accuracy_percentage: accuracy,
          total_attempts: totalAttempts,
          correct_matches: correctMatches,
          completion_time_seconds: completionTimeSeconds,
          avg_response_time_seconds: avgResponseTimeSeconds,
          hints_used: hintsUsed,
          session_completed: true,
        });
        setSavedSession(true);
      } catch (err) {
        console.warn("Could not fetch ML recommendation or save session:", err);
      } finally {
        setLoadingML(false);
      }
    }

    processResults();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        className="card card-elevated"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "36px",
          textAlign: "center",
        }}
      >
        {/* Trophy Header */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "var(--color-success-bg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-success)",
            marginBottom: "16px",
          }}
        >
          <Trophy size={40} />
        </div>

        <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "6px" }}>
          Splendid Effort!
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginBottom: "24px" }}>
          You have successfully completed this cognitive exercise session.
        </p>

        {/* Performance Metrics Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "16px 10px",
              backgroundColor: "var(--bg-muted)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Target size={22} color="var(--color-primary)" style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Accuracy</div>
            <div style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round(accuracy)}%
            </div>
          </div>

          <div
            style={{
              padding: "16px 10px",
              backgroundColor: "var(--bg-muted)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Sparkles size={22} color="var(--color-warning)" style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Total Score</div>
            <div style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--text-primary)" }}>
              {score}
            </div>
          </div>

          <div
            style={{
              padding: "16px 10px",
              backgroundColor: "var(--bg-muted)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Lightbulb size={22} color="var(--color-info)" style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Hints Used</div>
            <div style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--text-primary)" }}>
              {hintsUsed}
            </div>
          </div>
        </div>

        {/* Machine Learning Adaptive Difficulty Recommendation Section */}
        <div
          style={{
            padding: "20px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-primary-light)",
            border: "2px solid var(--color-primary)",
            textAlign: "left",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: "var(--font-md)", color: "var(--color-primary)" }}>
              AI Difficulty Recommendation:
            </h3>
          </div>

          {loadingML ? (
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              Analyzing performance metrics with Scikit-learn Pipeline...
            </p>
          ) : mlRecommendation ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>Next Suggested Level:</span>
                <span
                  className={
                    mlRecommendation.recommended_difficulty === "easy"
                      ? "badge badge-easy"
                      : mlRecommendation.recommended_difficulty === "medium"
                      ? "badge badge-medium"
                      : "badge badge-hard"
                  }
                  style={{ textTransform: "capitalize", fontSize: "var(--font-base)" }}
                >
                  {mlRecommendation.recommended_difficulty}
                </span>
                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
                  (Confidence: {Math.round(mlRecommendation.confidence * 100)}%)
                </span>
              </div>

              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: "14px" }}>
                {mlRecommendation.explanation}
              </p>

              {/* User / Caregiver Override Control */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  You can override or choose your next level:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedDifficulty(level)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        minHeight: "40px",
                        fontSize: "var(--font-sm)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor:
                          selectedDifficulty === level
                            ? "var(--color-primary)"
                            : "var(--bg-surface)",
                        color:
                          selectedDifficulty === level ? "#ffffff" : "var(--text-primary)",
                        border: "2px solid var(--border-color)",
                      }}
                    >
                      {level.toUpperCase()}
                      {level === mlRecommendation.recommended_difficulty ? " (AI)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>
              Next session ready at {selectedDifficulty.toUpperCase()} difficulty.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            className="btn btn-primary btn-large"
            onClick={() => onPlayAgain(selectedDifficulty)}
            style={{ flex: 1 }}
          >
            <RotateCcw size={20} />
            Play Again ({selectedDifficulty.toUpperCase()})
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onReturnHome}
            style={{ flex: 1 }}
          >
            Dashboard
          </button>
        </div>

        {/* Non-Diagnostic Disclaimer */}
        <p
          style={{
            fontSize: "var(--font-xs)",
            color: "var(--text-muted)",
            marginTop: "16px",
            fontStyle: "italic",
          }}
        >
          Non-diagnostic supportive exercise. Difficulty recommendations are tailored for comfort, not medical staging.
        </p>
      </div>
    </div>
  );
}
