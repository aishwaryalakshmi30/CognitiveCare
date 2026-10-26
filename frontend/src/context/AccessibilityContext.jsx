import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("cc_high_contrast") === "true";
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("cc_font_size") || "standard";
  });

  const [audioPrompts, setAudioPrompts] = useState(() => {
    const val = localStorage.getItem("cc_audio_prompts");
    return val !== null ? val === "true" : true;
  });

  const [untimedMode, setUntimedMode] = useState(() => {
    const val = localStorage.getItem("cc_untimed_mode");
    return val !== null ? val === "true" : true;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("cc_language") || "en";
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Synchronize CSS attributes on root document element
  useEffect(() => {
    document.documentElement.setAttribute("data-high-contrast", String(highContrast));
    localStorage.setItem("cc_high_contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
    localStorage.setItem("cc_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("cc_audio_prompts", String(audioPrompts));
  }, [audioPrompts]);

  useEffect(() => {
    localStorage.setItem("cc_untimed_mode", String(untimedMode));
  }, [untimedMode]);

  useEffect(() => {
    localStorage.setItem("cc_language", language);
  }, [language]);

  // Web Speech API Voice Prompt Engine
  const speak = (text) => {
    if (!audioPrompts || !("speechSynthesis" in window) || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Calm, gently measured pace for elderly users
    utterance.pitch = 1.0;
    utterance.lang = language === "as" || language === "hi" ? "hi-IN" : "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const cycleFontSize = () => {
    setFontSize((prev) => {
      if (prev === "standard") return "large";
      if (prev === "large") return "extra_large";
      return "standard";
    });
  };

  const toggleAudioPrompts = () => setAudioPrompts((prev) => !prev);
  const toggleUntimedMode = () => setUntimedMode((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        cycleFontSize,
        audioPrompts,
        toggleAudioPrompts,
        untimedMode,
        toggleUntimedMode,
        language,
        setLanguage,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
