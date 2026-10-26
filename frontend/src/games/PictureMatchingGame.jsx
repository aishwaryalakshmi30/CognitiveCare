import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import GameResultModal from "../components/GameResultModal";
import {
  Sun,
  Coffee,
  Heart,
  Flower2,
  BookOpen,
  Music,
  TreePine,
  Apple,
  RotateCcw,
  Lightbulb,
  Pause,
  Play,
  Volume2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const CARD_ITEMS = [
  { id: "sun", label: "Bright Sun", icon: Sun, color: "#eab308" },
  { id: "tea", label: "Cup of Tea", icon: Coffee, color: "#b45309" },
  { id: "heart", label: "Loving Heart", icon: Heart, color: "#e11d48" },
  { id: "flower", label: "Garden Flower", icon: Flower2, color: "#ec4899" },
  { id: "book", label: "Reading Book", icon: BookOpen, color: "#2563eb" },
  { id: "music", label: "Melody Note", icon: Music, color: "#8b5cf6" },
  { id: "tree", label: "Pine Tree", icon: TreePine, color: "#16a34a" },
  { id: "apple", label: "Sweet Apple", icon: Apple, color: "#dc2626" },
];

export default function PictureMatchingGame({ initialDifficulty = "easy", onExit }) {
  const { speak, audioPrompts, untimedMode } = useAccessibility();

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintedIndices, setHintedIndices] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Timing
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Setup game board based on difficulty
  const initializeGame = (diff = difficulty) => {
    let pairCount = 3; // easy
    if (diff === "medium") pairCount = 6;
    if (diff === "hard") pairCount = 8;

    const selectedItems = CARD_ITEMS.slice(0, pairCount);
    const deck = [...selectedItems, ...selectedItems]
      .map((item, idx) => ({ ...item, uniqueKey: `${item.id}-${idx}` }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setAttempts(0);
    setHintsUsed(0);
    setHintedIndices([]);
    setIsPaused(false);
    setGameCompleted(false);
    setSecondsElapsed(0);
    startTimeRef.current = Date.now();

    if (audioPrompts) {
      speak(`Picture Matching ready at ${diff} difficulty. Find the matching pairs at your own calm pace.`);
    }
  };

  useEffect(() => {
    initializeGame(difficulty);
    return () => clearInterval(timerIntervalRef.current);
  }, [difficulty]);

  // Timer loop
  useEffect(() => {
    if (isPaused || gameCompleted) {
      clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [isPaused, gameCompleted]);

  // Card Flip Interaction
  const handleCardClick = (index) => {
    if (isPaused || gameCompleted) return;
    if (flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) return;
    if (flippedIndices.length >= 2) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Speak card item name if audio enabled
    if (audioPrompts && cards[index]) {
      speak(cards[index].label);
    }

    if (newFlipped.length === 2) {
      setAttempts((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Correct match
        const newMatched = [...matchedIds, firstCard.id];
        setMatchedIds(newMatched);
        setFlippedIndices([]);

        if (audioPrompts) {
          speak(`Great match! You found the ${firstCard.label}.`);
        }

        // Check if all pairs matched
        const pairCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 8;
        if (newMatched.length === pairCount) {
          setGameCompleted(true);
        }
      } else {
        // Mismatch - pause briefly before turning back down
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  // Hint button: briefly reveals a matching pair
  const handleUseHint = () => {
    if (hintsUsed >= 5 || gameCompleted || isPaused) return;

    // Find an unmatched item
    const unmatched = cards.filter((c) => !matchedIds.includes(c.id));
    if (unmatched.length === 0) return;

    const targetId = unmatched[0].id;
    const indicesToHighlight = cards
      .map((c, idx) => (c.id === targetId ? idx : -1))
      .filter((idx) => idx !== -1);

    setHintedIndices(indicesToHighlight);
    setHintsUsed((prev) => prev + 1);

    if (audioPrompts) {
      speak(`Here is a gentle hint for ${unmatched[0].label}.`);
    }

    setTimeout(() => {
      setHintedIndices([]);
    }, 1800);
  };

  // Metrics Calculations
  const pairCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 8;
  const accuracy = attempts > 0 ? Math.min(100, Math.round((matchedIds.length / attempts) * 100)) : 100;
  const score = Math.max(0, matchedIds.length * 50 - attempts * 5 + (accuracy > 80 ? 50 : 0));
  const avgResponseTime = attempts > 0 ? Number((secondsElapsed / attempts).toFixed(1)) : 3.0;

  return (
    <div className="container" style={{ maxWidth: "860px", padding: "30px 20px 80px" }}>
      {/* Top Header & Game Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <button className="btn btn-secondary" onClick={onExit}>
          <ArrowLeft size={20} />
          Back to Games
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Difficulty selector */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  padding: "6px 14px",
                  minHeight: "40px",
                  fontSize: "var(--font-sm)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: difficulty === level ? "var(--color-primary)" : "var(--bg-surface)",
                  color: difficulty === level ? "#ffffff" : "var(--text-primary)",
                  border: "2px solid var(--border-color)",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setIsPaused((prev) => !prev)}
            style={{ minHeight: "40px", padding: "6px 14px" }}
            title={isPaused ? "Resume Game" : "Pause Game"}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => initializeGame(difficulty)}
            style={{ minHeight: "40px", padding: "6px 14px" }}
            title="Restart Game"
          >
            <RotateCcw size={18} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Status & Metrics Bar */}
      <div
        className="card card-elevated"
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          padding: "16px 20px",
          marginBottom: "28px",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Matched Pairs
          </span>
          <strong style={{ fontSize: "var(--font-lg)", color: "var(--color-success)" }}>
            {matchedIds.length} / {pairCount}
          </strong>
        </div>

        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Attempts Made
          </span>
          <strong style={{ fontSize: "var(--font-lg)" }}>{attempts}</strong>
        </div>

        {!untimedMode && (
          <div>
            <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
              Time Elapsed
            </span>
            <strong style={{ fontSize: "var(--font-lg)" }}>
              {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, "0")}
            </strong>
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={handleUseHint}
          disabled={hintsUsed >= 5 || matchedIds.length === pairCount}
          style={{
            borderColor: "var(--color-warning)",
            color: "var(--color-warning)",
            padding: "8px 16px",
            minHeight: "44px",
          }}
        >
          <Lightbulb size={20} />
          <span>Need a Hint? ({5 - hintsUsed} left)</span>
        </button>
      </div>

      {/* Paused Overlay */}
      {isPaused ? (
        <div
          className="card card-elevated"
          style={{ textAlign: "center", padding: "60px 20px", margin: "40px 0" }}
        >
          <h2 style={{ fontSize: "var(--font-2xl)", marginBottom: "12px" }}>Game Paused</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginBottom: "24px" }}>
            Take your time. Whenever you are ready, click resume to continue.
          </p>
          <button className="btn btn-primary btn-large" onClick={() => setIsPaused(false)}>
            <Play size={22} />
            Resume Activity
          </button>
        </div>
      ) : (
        /* Game Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              difficulty === "easy"
                ? "repeat(3, 1fr)"
                : difficulty === "medium"
                ? "repeat(4, 1fr)"
                : "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);
            const isHinted = hintedIndices.includes(idx);
            const IconComponent = card.icon;

            return (
              <div
                key={card.uniqueKey}
                onClick={() => handleCardClick(idx)}
                style={{
                  height: difficulty === "hard" ? "120px" : "150px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: isFlipped
                    ? "var(--bg-surface)"
                    : isHinted
                    ? "var(--color-warning-bg)"
                    : "var(--color-primary-light)",
                  border: isMatched
                    ? "3px solid var(--color-success)"
                    : isHinted
                    ? "3px solid var(--color-warning)"
                    : isFlipped
                    ? "3px solid var(--color-primary)"
                    : "3px solid var(--border-color)",
                  boxShadow: isFlipped ? "var(--shadow-md)" : "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isMatched ? "default" : "pointer",
                  userSelect: "none",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  transform: isFlipped ? "scale(1.02)" : "scale(1)",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                {isFlipped ? (
                  <>
                    <IconComponent size={difficulty === "hard" ? 42 : 54} color={card.color} />
                    <span
                      style={{
                        fontSize: "var(--font-sm)",
                        fontWeight: 700,
                        marginTop: "8px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {card.label}
                    </span>
                    {isMatched && (
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--color-success)", fontWeight: 700 }}>
                        Matched
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ color: "var(--color-primary)", opacity: 0.6 }}>
                    <Sun size={36} />
                    <div style={{ fontSize: "var(--font-xs)", fontWeight: 700, marginTop: "4px" }}>
                      Tap to Flip
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Game Results Modal on Completion */}
      {gameCompleted && (
        <GameResultModal
          gameType="picture_matching"
          score={score}
          accuracy={accuracy}
          totalAttempts={attempts}
          correctMatches={matchedIds.length}
          completionTimeSeconds={secondsElapsed}
          avgResponseTimeSeconds={avgResponseTime}
          hintsUsed={hintsUsed}
          difficulty={difficulty}
          isUntimed={untimedMode}
          onPlayAgain={(newDiff) => {
            setDifficulty(newDiff);
            initializeGame(newDiff);
          }}
          onReturnHome={onExit}
        />
      )}
    </div>
  );
}
