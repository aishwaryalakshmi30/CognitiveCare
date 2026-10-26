
const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api/v1";

function getAuthHeader() {
  const token = localStorage.getItem("cognitive_care_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg =
        errData.detail || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    if (res.status === 204) return null;

    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication
export async function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

// User Settings
export async function updateUserPreferences(payload) {
  return request("/users/preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Cognitive Games
export async function recordGameSession(payload) {
  return request("/games/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchGameHistory(gameType = null) {
  const query = gameType
    ? `?game_type=${encodeURIComponent(gameType)}`
    : "";
  return request(`/games/sessions/history${query}`);
}

export async function fetchGameSummary() {
  return request("/games/summary");
}

// Machine Learning
export async function getMLDifficultyRecommendation(payload) {
  return request("/ml/recommend-difficulty", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMLModelInfo() {
  return request("/ml/model-info");
}

// Reminders & Routines
export async function fetchReminders() {
  return request("/reminders/");
}

export async function createReminder(payload) {
  return request("/reminders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleReminder(id) {
  return request(`/reminders/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function deleteReminder(id) {
  return request(`/reminders/${id}`, {
    method: "DELETE",
  });
}

export async function fetchRoutines() {
  return request("/reminders/routines");
}

export async function toggleRoutine(id) {
  return request(`/reminders/routines/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function createRoutine(payload) {
  return request("/reminders/routines", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Memory Cards
export async function fetchMemoryCards() {
  return request("/memory-cards/");
}

export async function createMemoryCard(payload) {
  return request("/memory-cards/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteMemoryCard(id) {
  return request(`/memory-cards/${id}`, {
    method: "DELETE",
  });
}

// Caregiver Portal
export async function fetchCaregiverPatients() {
  return request("/caregiver/patients");
}

export async function fetchPatientDetail(id) {
  return request(`/caregiver/patients/${id}/summary`);
}

export async function createPatientReminder(patientId, payload) {
  return request(`/caregiver/patients/${patientId}/reminders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Admin
export async function fetchAdminStats() {
  return request("/admin/stats");
}

export async function fetchAdminUsers() {
  return request("/admin/users");
}

// Health Check
export async function checkHealth() {
  const url = `${API_BASE.replace("/api/v1", "")}/health`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }

  return res.json();
}
