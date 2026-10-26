import React, { useState, useEffect } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { fetchMemoryCards, createMemoryCard, deleteMemoryCard } from "../services/api";
import {
  Image,
  Plus,
  Volume2,
  Trash2,
  Heart,
  MapPin,
  Users,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function MemoriesPage({ onBack }) {
  const { speak, audioPrompts } = useAccessibility();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [category, setCategory] = useState("family");
  const [nameOrTitle, setNameOrTitle] = useState("");
  const [relation, setRelation] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [audioPrompt, setAudioPrompt] = useState("");

  const loadCards = async () => {
    try {
      const data = await fetchMemoryCards();
      setCards(data);
    } catch (e) {
      console.error("Error loading memory cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMemoryCard({
        category,
        name_or_title: nameOrTitle,
        relation,
        description,
        photo_url: photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
        audio_prompt: audioPrompt || `This is ${nameOrTitle}, your ${relation}. ${description}`,
      });
      setShowAddModal(false);
      setNameOrTitle("");
      setRelation("");
      setDescription("");
      setPhotoUrl("");
      setAudioPrompt("");
      await loadCards();
      speak("New cherished memory card created successfully.");
    } catch (err) {
      alert("Failed to save memory card.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this memory card?")) {
      await deleteMemoryCard(id);
      await loadCards();
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px 80px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "8px" }}>
            My Cherished Memories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
            Familiar photographs, beloved family members, and fond childhood hometowns.
          </p>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={22} />
          Add Familiar Card
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "var(--font-lg)", color: "var(--text-muted)" }}>
            Loading your memory gallery...
          </p>
        </div>
      ) : cards.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Image size={48} color="var(--color-primary)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "var(--font-xl)", marginBottom: "8px" }}>No Memory Cards Added Yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", marginBottom: "20px" }}>
            Add photographs of children, grandchildren, pets, or beloved homes.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add First Memory Card
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card card-elevated"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {card.photo_url && (
                <img
                  src={card.photo_url}
                  alt={card.name_or_title}
                  style={{ width: "100%", height: "240px", objectFit: "cover" }}
                />
              )}

              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span className="badge badge-easy" style={{ marginBottom: "6px" }}>
                      {card.relation}
                    </span>
                    <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 700 }}>
                      {card.name_or_title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDelete(card.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      minHeight: "36px",
                      minWidth: "36px",
                    }}
                    title="Delete card"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)", lineHeight: 1.6, flex: 1, marginBottom: "20px" }}>
                  {card.description}
                </p>

                {audioPrompts && (
                  <button
                    className="btn btn-voice"
                    onClick={() => speak(card.audio_prompt || `${card.name_or_title}, your ${card.relation}. ${card.description}`)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <Volume2 size={20} />
                    Hear Description
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Card Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="card card-elevated" style={{ maxWidth: "560px", width: "100%", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "var(--font-xl)" }}>Add Familiar Person or Place</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", minHeight: "36px" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Category:
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="family">Family Member</option>
                  <option value="friend">Close Friend</option>
                  <option value="place">Beloved Place or Hometown</option>
                  <option value="pet">Pet Companion</option>
                  <option value="memory">Cherished Memory</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Name or Place Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya or Ancestral Home in Tezpur"
                  value={nameOrTitle}
                  onChange={(e) => setNameOrTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Relationship or Label:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daughter, Grandson, Childhood Home"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Description / Familiar Memory:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe where they live, what they love, or fond shared moments."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Photograph Web Image URL (optional):
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Memory Card
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
