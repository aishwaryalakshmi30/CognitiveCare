import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import GameResultModal from "../components/GameResultModal";
import {
  HelpCircle,
  Volume2,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const OBJECTS_DATABASE = [
  {
    id: "kettle",
    name: "Tea Kettle",
    prompt: "What is used to boil water and brew a hot cup of tea?",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80",
    options: ["Tea Kettle", "Water Pitcher", "Soup Bowl", "Garden Hose"],
    spokenHelp: "Look at the spout and handle. It is used to brew hot tea.",
  },
  {
    id: "clock",
    name: "Wall Clock",
    prompt: "Which item has numbers and hands to show the time of day?",
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=500&q=80",
    options: ["Wall Clock", "Picture Frame", "Mirror", "Dinner Plate"],
    spokenHelp: "It hangs on the wall and shows the hours and minutes.",
  },
  {
    id: "glasses",
    name: "Reading Glasses",
    prompt: "What helps someone read books and letters clearly?",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=500&q=80",
    options: ["Reading Glasses", "Magnifying Mirror", "Sunglasses", "Camera Lens"],
    spokenHelp: "You wear these on your eyes to help read small print.",
  },
  {
    id: "rose",
    name: "Garden Flower",
    prompt: "Which fragrant flower blossoms in home gardens?",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    options: ["Garden Flower", "Green Shrub", "Oak Leaf", "Pine Cone"],
    spokenHelp: "A bright red garden flower with delicate petals.",
  },
  {
    id: "book",
    name: "Reading Book",
    prompt: "Which item has bound paper pages with stories and information?",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
    options: ["Reading Book", "Newspaper Roll", "Photo Album", "Writing Pad"],
    spokenHelp: "It has a cover and many pages filled with stories.",
  },
  {
    id: "umbrella",
    name: "Rain Umbrella",
    prompt: "What protects you from rain and bright sunlight when walking outside?",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
    options: ["Rain Umbrella", "Sun Hat", "Raincoat", "Walking Cane"],
    spokenHelp: "You open this over your head when it starts to rain.",
  },
];

export default function ObjectRecognitionGame({ initialDifficulty = "easy", onExit }) {
  const { speak, audioPrompts, untimedMode } = useAccessibility();

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Timing
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerIntervalRef = useRef(null);

  const totalQuestions = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;

  const initializeGame = (diff = difficulty) => {
    const shuffled = [...OBJECTS_DATABASE].sort(() => Math.random() - 0.5);
    const count = diff === "easy" ? 4 : diff === "medium" ? 5 : 6;
    const selected = shuffled.slice(0, count);

    setQuestions(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setHintsUsed(0);
    setEliminatedOptions([]);
    setGameCompleted(false);
    setSecondsElapsed(0);

    if (audioPrompts && selected[0]) {
      speak(`Familiar Object Recognition. ${selected[0].prompt}`);
    }
  };

  useEffect(() => {
    initializeGame(difficulty);
    return () => clearInterval(timerIntervalRef.current);
  }, [difficulty]);

  // Timer loop
  useEffect(() => {
    if (gameCompleted) {
      clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [gameCompleted]);

  const currentQ = questions[currentIndex] || OBJECTS_DATABASE[0];

  const handleSelectOption = (option) => {
    if (isAnswered || gameCompleted) return;

    setSelectedOption(option);
    setIsAnswered(true);
    const correct = option === currentQ.name;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      if (audioPrompts) {
        speak(`Correct! That is indeed the ${currentQ.name}.`);
      }
    } else {
      if (audioPrompts) {
        speak(`A good try. The correct answer is ${currentQ.name}.`);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setEliminatedOptions([]);

      if (audioPrompts && questions[nextIdx]) {
        speak(questions[nextIdx].prompt);
      }
    } else {
      setGameCompleted(true);
    }
  };

  const handleUseHint = () => {
    if (isAnswered || hintsUsed >= 3) return;

    // Eliminate 1 incorrect option
    const incorrect = currentQ.options.filter(
      (opt) => opt !== currentQ.name && !eliminatedOptions.includes(opt)
    );
    if (incorrect.length > 0) {
      const toRemove = incorrect[0];
      setEliminatedOptions((prev) => [...prev, toRemove]);
      setHintsUsed((prev) => prev + 1);

      if (audioPrompts) {
        speak(`Hint: It is not ${toRemove}. ${currentQ.spokenHelp}`);
      }
    }
  };

  // Metrics
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
  const score = correctCount * 50 - hintsUsed * 10;
  const avgResponseTime = questions.length > 0 ? Number((secondsElapsed / questions.length).toFixed(1)) : 4.0;

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "30px 20px 80px" }}>
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
            onClick={() => initializeGame(difficulty)}
            style={{ minHeight: "40px", padding: "6px 14px" }}
          >
            <RotateCcw size={18} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Progress & Question Info */}
      <div
        className="card card-elevated"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Question
          </span>
          <strong style={{ fontSize: "var(--font-lg)", color: "var(--color-primary)" }}>
            {currentIndex + 1} of {questions.length}
          </strong>
        </div>

        <div>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "block" }}>
            Score
          </span>
          <strong style={{ fontSize: "var(--font-lg)", color: "var(--color-success)" }}>
            {correctCount} Correct
          </strong>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleUseHint}
          disabled={isAnswered || hintsUsed >= 3 || eliminatedOptions.length >= 2}
          style={{ padding: "8px 16px", minHeight: "44px" }}
        >
          <HelpCircle size={18} />
          <span>Need a Hint?</span>
        </button>
      </div>

      {/* Question Card */}
      <div className="card card-elevated" style={{ padding: "30px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "var(--font-xl)", color: "var(--text-primary)" }}>
            {currentQ.prompt}
          </h2>
          {audioPrompts && (
            <button
              className="btn btn-voice"
              onClick={() => speak(`${currentQ.prompt} ${currentQ.spokenHelp}`)}
              style={{ flexShrink: 0 }}
            >
              <Volume2 size={20} />
              Read Question
            </button>
          )}
        </div>

        {/* Clear Familiar Object Photograph */}
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            maxHeight: "320px",
            border: "2px solid var(--border-color)",
            marginBottom: "24px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <img
            src={currentQ.image}
            alt="Familiar object"
            style={{ width: "100%", height: "300px", objectFit: "cover" }}
          />
        </div>

        {/* 4 Large Choice Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {currentQ.options.map((option) => {
            const isEliminated = eliminatedOptions.includes(option);
            const isChosen = selectedOption === option;
            const isAnswerKey = option === currentQ.name;

            let btnBg = "var(--bg-surface)";
            let btnBorder = "var(--border-color)";
            let btnColor = "var(--text-primary)";

            if (isAnswered) {
              if (isAnswerKey) {
                btnBg = "var(--color-success-bg)";
                btnBorder = "var(--color-success)";
                btnColor = "var(--color-success)";
              } else if (isChosen) {
                btnBg = "#fee2e2";
                btnBorder = "#ef4444";
                btnColor = "#b91c1c";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered || isEliminated}
                style={{
                  minHeight: "64px",
                  fontSize: "var(--font-lg)",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: btnBg,
                  borderColor: btnBorder,
                  color: btnColor,
                  borderWidth: "3px",
                  borderStyle: "solid",
                  opacity: isEliminated ? 0.3 : 1,
                  textDecoration: isEliminated ? "line-through" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                }}
              >
                <span>{option}</span>
                {isAnswered && isAnswerKey && <CheckCircle size={24} color="var(--color-success)" />}
                {isAnswered && isChosen && !isAnswerKey && <XCircle size={24} color="#ef4444)" />}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next Button */}
        {isAnswered && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isCorrect ? "var(--color-success-bg)" : "var(--bg-muted)",
              border: `2px solid ${isCorrect ? "var(--color-success)" : "var(--border-color)"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <strong style={{ fontSize: "var(--font-lg)", color: isCorrect ? "var(--color-success)" : "var(--text-primary)" }}>
                {isCorrect ? "✨ Well done! Correct." : `It is the ${currentQ.name}.`}
              </strong>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                {currentQ.spokenHelp}
              </p>
            </div>

            <button className="btn btn-primary btn-large" onClick={handleNextQuestion}>
              {currentIndex + 1 < questions.length ? "Next Object" : "See Results"}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Game Result Modal on Completion */}
      {gameCompleted && (
        <GameResultModal
          gameType="familiar_object"
          score={score}
          accuracy={accuracy}
          totalAttempts={questions.length}
          correctMatches={correctCount}
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
