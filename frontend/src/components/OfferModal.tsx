import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type OfferModalProps = {
  offer: {
    id: string;
    title: string;
    description: string;
    category: string;
    localisation: string;
    prize: number;
    images?: { url: string }[];
    user?: { id: string; login: string };
  };
  onClose: () => void;
};

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  const [stats, setStats] = useState<{
    avgRounded: number | null;
    ratingsCount: number;
    reportsCount: number;
  }>({
    avgRounded: null,
    ratingsCount: 0,
    reportsCount: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const images =
    offer.images && offer.images.length > 0
      ? offer.images.map((img) => img.url)
      : ["/logo.png"];

  useEffect(() => {
    axios
      .get(`http://localhost:3000/reviews/offer/${offer.id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Błąd pobierania statystyk:", err));
  }, [offer.id]);

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(null));
  }, [token]);

  const isOwner = userId && offer.user && offer.user.id === userId;

  const handleDelete = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;
    try {
      await axios.delete(`http://localhost:3000/offers/${offer.id}/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Oferta została usunięta.");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Błąd usuwania:", err);
      alert("❌ Nie udało się usunąć oferty.");
    }
  };

  const handleEdit = () => {
    navigate(`/offers/edit/${offer.id}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f7faff 100%)",
          borderRadius: "20px",
          width: "85%",
          maxWidth: "900px",
          padding: "25px 30px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          overflowY: "auto",
          maxHeight: "90vh",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ Przycisk zamknięcia */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            color: "#888",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
        >
          ✕
        </button>

        {/* 🖼️ Galeria */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "25px",
          }}
        >
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`offer-${i}`}
              style={{
                width:
                  images.length === 1
                    ? "80%"
                    : images.length === 2
                    ? "48%"
                    : "31%",
                maxWidth: "500px",
                height: "auto",
                maxHeight: "280px",
                objectFit: "cover",
                borderRadius: "12px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#f9fbff",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          ))}
        </div>

        {/* 📋 Informacje o ofercie */}
        <h2
          style={{
            color: "#007bff",
            marginBottom: "10px",
            fontWeight: 700,
            fontSize: "1.6rem",
          }}
        >
          {offer.title}
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#444",
            marginBottom: "6px",
          }}
        >
          🏷️ <b>{offer.category}</b>
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#555",
            lineHeight: 1.5,
            backgroundColor: "#f8faff",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          {offer.description}
        </p>

        {/* 📍 Lokalizacja i statystyki */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "15px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px 0",
                color: "#333",
              }}
            >
              📍 <b>{offer.localisation}</b>
            </p>
            <p
              style={{
                margin: 0,
                color: "#555",
                fontSize: "0.95rem",
              }}
            >
              ⭐ {stats.avgRounded ? stats.avgRounded.toFixed(1) : "Brak ocen"}{" "}
              ({stats.ratingsCount} opinii)
            </p>
          </div>

          <h3
            style={{
              color: offer.prize === 0 ? "#2e8b57" : "#007bff",
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            {offer.prize === 0 ? "🤝 Bezpłatnie" : `${offer.prize} zł`}
          </h3>
        </div>

        {/* 🔹 Przyciski akcji */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: isOwner ? "space-between" : "flex-end",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button
            style={{
              background: "linear-gradient(90deg, #007bff, #00bfff)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
            }}
            onClick={() => navigate(`/reviews/${offer.id}`)}
          >
            ⭐ Zobacz recenzje
          </button>

          {!isOwner && (
            <button
              style={{
                background: "linear-gradient(90deg, #28a745, #5dd85d)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(72,180,97,0.3)",
              }}
              onClick={() =>
                navigate(`/messages/${offer.id}`, {
                  state: { toUserId: offer.user?.id },
                })
              }
            >
              ✉️ Napisz wiadomość
            </button>
          )}

          {isOwner && (
            <>
              <button
                style={{
                  background: "linear-gradient(90deg, #ffc107, #ffe380)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  color: "#333",
                  fontWeight: 600,
                  boxShadow: "0 4px 10px rgba(255,193,7,0.3)",
                }}
                onClick={handleEdit}
              >
                ✏️ Edytuj ofertę
              </button>

              <button
                style={{
                  background: "linear-gradient(90deg, #dc3545, #ff6b6b)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(220,53,69,0.3)",
                }}
                onClick={handleDelete}
              >
                🗑️ Usuń ofertę
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
