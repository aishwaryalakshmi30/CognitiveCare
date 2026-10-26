import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ElderlyDashboard from "./pages/ElderlyDashboard";
import GamesHub from "./pages/GamesHub";
import MemoriesPage from "./pages/MemoriesPage";
import RoutinesPage from "./pages/RoutinesPage";
import RemindersPage from "./pages/RemindersPage";
import ProgressHistoryPage from "./pages/ProgressHistoryPage";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MLModelInfoPage from "./pages/MLModelInfoPage";

function AppContent() {
  const { user, isElderly, isCaregiver, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState("home");
  const [activeGame, setActiveGame] = useState("picture_matching");

  // Determine active view based on tab and authentication state
  const renderContent = () => {
    // Public authentication routes
    if (currentTab === "login") {
      return <LoginPage setCurrentTab={setCurrentTab} />;
    }
    if (currentTab === "register") {
      return <RegisterPage setCurrentTab={setCurrentTab} />;
    }

    // If user is not authenticated, show landing page with demo quick logins
    if (!user) {
      return <LandingPage setCurrentTab={setCurrentTab} />;
    }

    // Cognitive Gaming & Memory Assistance views
    if (currentTab === "games") {
      return <GamesHub activeGame={activeGame} setActiveGame={setActiveGame} />;
    }
    if (currentTab === "memories") {
      return <MemoriesPage onBack={() => setCurrentTab("home")} />;
    }
    if (currentTab === "routines") {
      return <RoutinesPage />;
    }
    if (currentTab === "reminders") {
      return <RemindersPage />;
    }
    if (currentTab === "history") {
      return <ProgressHistoryPage />;
    }

    // Caregiver & Admin Portals
    if (currentTab === "caregiver") {
      return <CaregiverDashboard />;
    }
    if (currentTab === "admin") {
      return <AdminDashboard setCurrentTab={setCurrentTab} />;
    }
    if (currentTab === "ml_info") {
      return <MLModelInfoPage onBack={() => setCurrentTab("home")} />;
    }

    // Role-specific home dashboards
    if (currentTab === "home") {
      if (isElderly) {
        return <ElderlyDashboard setCurrentTab={setCurrentTab} setActiveGame={setActiveGame} />;
      }
      if (isCaregiver) {
        return <CaregiverDashboard />;
      }
      if (isAdmin) {
        return <AdminDashboard setCurrentTab={setCurrentTab} />;
      }
    }

    // Fallback view
    return <ElderlyDashboard setCurrentTab={setCurrentTab} setActiveGame={setActiveGame} />;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main style={{ flex: 1 }}>{renderContent()}</main>

      <footer
        style={{
          borderTop: "2px solid var(--border-color)",
          backgroundColor: "var(--bg-surface)",
          padding: "24px 20px",
          textAlign: "center",
          fontSize: "var(--font-sm)",
          color: "var(--text-muted)",
        }}
      >
        <div className="container">
          <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            CognitiveCare Platform &copy; 2026 &bull; Supportive Activity & Memory Companion for NER
          </p>
          <p style={{ marginTop: "4px", fontSize: "var(--font-xs)" }}>
            Disclaimer: Non-diagnostic tool for cognitive exercise and comfort. Not a substitute for clinical medical care.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
