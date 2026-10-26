import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import GameResultModal from "../components/GameResultModal";
import {
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  Volume2,
  CheckCircle,
  Eye,
} from "lucide-react";

const PADS = [
  { id: "red", label: "Ruby Red", color: "#ef4444", activeColor: "#fca5a5", freq: 261.63 }, // C4
  { id: "blue", label: "Ocean Blue", color: "#3b82f6", activeColor: "#93c5fd", freq: 329.63 }, // E4
  { id: "green", label: "Sage Green", color: "#10b981", activeColor: "#6ee7b7", freq: 392.00 }, // G4
  { id: "yellow", label: "Golden Sun", color: "#f59e0b", activeColor: "#fde68a", freq: 523.25 }, // C5
];

export default function SequenceMemoryGame({ initialDifficulty = "easy", onExit }) {
  const { speak, audioPrompts, untimedMode } = useAccessibility();

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [round, setRound] = useState(1);
  const totalRounds = 3;

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Timing
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerIntervalRef = useRef(null);

  // Web Audio Context for pleasant gentle chime tones
  const audioCtxRef = useRef(null);

  const playTone = (freq) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // safe fallback if audio context blocked
    }
  };

  const getStartingLength = (diff = difficulty) => {
    if (diff === "medium") return 4;
    if (diff === "hard") return 5;
    return 3; // easy
  };

  const generateSequence = (len) => {
    const padIds = PADS.map((p) => p.id);
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(padIds[Math.floor(Math.random() * padIds.length)]);
    }
    return seq;
  };

  // Play the sequence for the user to watch
  const playSequence = async (seqToPlay) => {
    setIsPlayingSequence(true);
    setUserStep(0);

    // Initial pause before demonstration
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seqToPlay.length; i++) {
      const padId = seqToPlay[i];
      const pad = PADS.find((p) => p.id === padId);

      setActivePad(padId);
      if (pad) playTone(pad.freq);

      await new Promise((r) => setTimeout(r, 650));
      setActivePad(null);
      await new Promise((r) => setTimeout(r, 250));
    }

    setIsPlayingSequence(false);
    if (audioPrompts) {
      speak("Now it's your turn. Tap the colors in the same order.");
    }
  };

  const initializeGame = (diff = difficulty) => {
    const initialLen = getStartingLength(diff);
    const newSeq = generateSequence(initialLen);
    setSequence(newSeq);
    setRound(1);
    setUserStep(0);
    setTotalAttempts(0);
    setCorrectResponses(0);
    setHintsUsed(0);
    setIsPaused(false);
    setGameCompleted(false);
    setSecondsElapsed(0);

    if (audioPrompts) {
      speak(`Sequence Memory at ${diff} difficulty. Watch the colors illuminate.`);
    }

    setTimeout(() => {
      playSequence(newSeq);
    }, 400);
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

  // Handle Senior Pad Tap
  const handlePadClick = (padId) => {
    if (isPlayingSequence || isPaused || gameCompleted) return;

    const pad = PADS.find((p) => p.id === padId);
    if (pad) playTone(pad.freq);

    setActivePad(padId);
    setTimeout(() => setActivePad(null), 250);

    const expectedPadId = sequence[userStep];
    setTotalAttempts((prev) => prev + 1);

    if (padId === expectedPadId) {
      // Correct step
      setCorrectResponses((prev) => prev + 1);
      const nextStep = userStep + 1;

      if (nextStep === sequence.length) {
        // Round completed successfully!
        if (round < totalRounds) {
          if (audioPrompts) {
            speak(`Excellent recall! Advancing to round ${round + 1}.`);
          }
          setRound((prev) => prev + 1);
          const nextSeq = [...sequence, PADS[Math.floor(Math.random() * PADS.length)].id];
          setSequence(nextSeq);
          setTimeout(() => {
            playSequence(nextSeq);
          }, 1000);
        } else {
          // Finished all 3 rounds
          setGameCompleted(true);
        }
      } else {
        setUserStep(nextStep);
      }
    } else {
      // Gentle mistake - give encouraging feedback and let them watch again
      if (audioPrompts) {
        speak("That was close! Let's watch the sequence once more.");
      }
      setTimeout(() => {
        playSequence(sequence);
      }, 900);
    }
  };

  const handleReplaySequence = () => {
    if (isPlayingSequence || isPaused || gameCompleted) return;
    setHintsUsed((prev) => prev + 1);
    playSequence(sequence);
  };

  // Metrics
  const accuracy = totalAttempts > 0 ? Math.min(100, Math.round((correctResponses / totalAttempts) * 100)) : 100;
  const score = Math.max(0, correctResponses * 30 + round * 50 - hintsUsed * 10);
  const avgResponseTime = totalAttempts > 0 ? Number((secondsElapsed / totalAttempts).toFixed(1)) : 3.5;

  return (
    <div className="container" style={{ maxWidth: "780px", padding: "30px 20px 80px" }}>
      {/* Top Header */}
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

          <button
            className="btn btn-secondary"
            onClick={() => setIsPaused((prev) => !prev)}
            style={{ minHeight: "40px", padding: "6px 14px" }}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => initializeGame(difficulty)}
            style={{ minHeight: "40px", padding: "6px 14px" }}
          >
            <RotateCcw size={18} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div
        className="card card-elevated"
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          padding: "16px 20px",
          marginBottom: "32px",
        }}
      >
        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Round Progress
          </span>
          <strong style={{ fontSize: "var(--font-lg)", color: "var(--color-primary)" }}>
            {round} / {totalRounds}
          </strong>
        </div>

        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Sequence Length
          </span>
          <strong style={{ fontSize: "var(--font-lg)" }}>{sequence.length} items</strong>
        </div>

        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Your Steps Done
          </span>
          <strong style={{ fontSize: "var(--font-lg)", color: "var(--color-success)" }}>
            {userStep} / {sequence.length}
          </strong>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleReplaySequence}
          disabled={isPlayingSequence || isPaused}
          style={{ padding: "8px 16px", minHeight: "44px" }}
        >
          <Eye size={18} />
          <span>Watch Again</span>
        </button>
      </div>

      {/* Instructions Prompt */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "28px",
          fontSize: "var(--font-lg)",
          fontWeight: 700,
          color: isPlayingSequence ? "var(--color-primary)" : "var(--color-success)",
        }}
      >
        {isPlayingSequence
          ? "👀 Watch the colors illuminate closely..."
          : "👉 Your turn! Tap the colors in the same sequence."}
      </div>

      {/* 4 Colored Sound Pads */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          maxWidth: "460px",
          margin: "0 auto",
        }}
      >
        {PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad.id)}
              disabled={isPlayingSequence || isPaused}
              aria-label={pad.label}
              style={{
                height: "170px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: isActive ? pad.activeColor : pad.color,
                border: isActive ? "6px solid #ffffff" : "4px solid rgba(0, 0, 0, 0.15)",
                boxShadow: isActive ? "0 0 30px " + pad.color : "var(--shadow-md)",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s ease",
                cursor: isPlayingSequence ? "default" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                padding: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
              >
                <Sparkles size={26} />
              </div>
              <span style={{ fontSize: "var(--font-md)", fontWeight: 800, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                {pad.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Game Result Modal */}
      {gameCompleted && (
        <GameResultModal
          gameType="sequence_memory"
          score={score}
          accuracy={accuracy}
          totalAttempts={totalAttempts}
          correctMatches={correctResponses}
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
