import React, { useState } from "react";
import PictureMatchingGame from "../games/PictureMatchingGame";
import SequenceMemoryGame from "../games/SequenceMemoryGame";
import ObjectRecognitionGame from "../games/ObjectRecognitionGame";
import { Gamepad2, Brain, Sparkles, Image, CheckCircle, ArrowRight } from "lucide-react";

export default function GamesHub({ activeGame = "picture_matching", setActiveGame }) {
  const [selectedGame, setSelectedGame] = useState(activeGame);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");

  if (isPlaying) {
    if (selectedGame === "picture_matching") {
      return (
        <PictureMatchingGame
          initialDifficulty={difficulty}
          onExit={() => setIsPlaying(false)}
        />
      );
    }
    if (selectedGame === "sequence_memory") {
      return (
        <SequenceMemoryGame
          initialDifficulty={difficulty}
          onExit={() => setIsPlaying(false)}
        />
      );
    }
    if (selectedGame === "familiar_object") {
      return (
        <ObjectRecognitionGame
          initialDifficulty={difficulty}
          onExit={() => setIsPlaying(false)}
        />
      );
    }
  }

  const games = [
    {
      id: "picture_matching",
      title: "Picture Matching",
      category: "Visual Memory & Association",
      badge: "Easy to start",
      description:
        "Flip and match pairs of colorful everyday items like sunny skies, teacups, flowers, and books. Play untimed without pressure.",
      icon: Gamepad2,
      color: "var(--color-primary)",
    },
    {
      id: "sequence_memory",
      title: "Sequence Memory",
      category: "Working Memory & Attention",
      badge: "Auditory & Visual",
      description:
        "Watch a gentle sequence of vibrant colored bells illuminate with musical chimes, then reproduce the sequence at your own pace.",
      icon: Sparkles,
      color: "var(--color-success)",
    },
    {
      id: "familiar_object",
      title: "Familiar Object Recognition",
      category: "Recognition & Recall",
      badge: "Everyday Objects",
      description:
        "Look at high-clarity photographs of common household items (tea kettle, wall clock, flowers, glasses) and choose the matching name.",
      icon: Image,
      color: "var(--color-info)",
    },
  ];

  return (
    <div className="container" style={{ padding: "40px 20px 80px", maxWidth: "900px" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "12px" }}>
          Cognitive Activity Hub
        </h1>
        <p style={{ fontSize: "var(--font-lg)", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
          Engaging, stress-free brain stimulation exercises powered by Machine Learning difficulty adjustment.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className="card card-elevated"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                padding: "28px",
                borderLeft: `6px solid ${game.color}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "18px", flex: 1, minWidth: "300px" }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    backgroundColor: "var(--bg-muted)",
                    color: game.color,
                  }}
                >
                  <Icon size={32} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <h2 style={{ fontSize: "var(--font-xl)" }}>{game.title}</h2>
                    <span className="badge badge-easy">{game.badge}</span>
                  </div>
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                    {game.category}
                  </span>
                  <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", lineHeight: 1.5 }}>
                    {game.description}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "180px" }}>
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => {
                    setSelectedGame(game.id);
                    setIsPlaying(true);
                  }}
                  style={{ width: "100%" }}
                >
                  Play Game
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
