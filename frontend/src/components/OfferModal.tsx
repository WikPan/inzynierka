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
    user?: { id: string }; // 👈 potrzebne do sprawdzenia właściciela
  };
  onClose: () => void;
};

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  const [stats, setStats] = useState<{ avgRounded: number | null; ratingsCount: number; reportsCount: number }>({
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
      : ["/logo.png"]; // 👈 nasze lokalne logo zamiast placeholdera

  // 🔹 Pobierz statystyki ocen
  useEffect(() => {
    axios
      .get(`http://localhost:3000/reviews/offer/${offer.id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Błąd pobierania statystyk:", err));
  }, [offer.id]);

  // 🔹 Pobierz dane zalogowanego użytkownika
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(null));
  }, [token]);

  // 🔹 Sprawdź, czy oferta należy do użytkownika
  const isOwner = userId && offer.user && offer.user.id === userId;

  // 🔹 Obsługa usuwania oferty
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

  // 🔹 Edycja oferty
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
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          width: "80%",
          maxWidth: "900px",
          padding: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          overflowY: "auto",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🖼️ Galeria */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`image-${i}`}
              style={{
                width: images.length === 1 ? "70%" : `${100 / images.length - 3}%`,
                maxWidth: images.length === 1 ? "500px" : "none",
                maxHeight: "300px",
                objectFit: "contain", // 👈 lepiej wyświetla logo lub proporcjonalne zdjęcia
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                backgroundColor: "#fafafa",
              }}
            />
          ))}
        </div>

        {/* 📋 Opis */}
        <h2>{offer.title}</h2>
        <p>
          🏷️ <b>{offer.category}</b>
        </p>
        <p>{offer.description}</p>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <div>
            <p>📍 {offer.localisation}</p>
            <p>
              ⭐ {stats.avgRounded ? stats.avgRounded.toFixed(1) : "Brak ocen"} ({stats.ratingsCount} opinii)
            </p>
          </div>
          <h3 style={{ color: "#007bff" }}>{offer.prize === 0 ? "Bezpłatnie" : `${offer.prize} zł`}</h3>
        </div>

        {/* 🔹 Przyciski */}
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: isOwner ? "space-between" : "flex-end",
            gap: "10px",
          }}
        >
          {/* Zawsze widoczny */}
          <button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/reviews/${offer.id}`)}
          >
            Zobacz recenzje
          </button>

          {/* Tylko właściciel */}
          {isOwner && (
            <>
              <button
                style={{
                  backgroundColor: "#ffc107",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  color: "#000",
                }}
                onClick={handleEdit}
              >
                ✏️ Edytuj ofertę
              </button>

              <button
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
                onClick={handleDelete}
              >
                🗑️ Usuń ofertę
              </button>
            </>
          )}

          <button
            style={{
              backgroundColor: "#eee",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
