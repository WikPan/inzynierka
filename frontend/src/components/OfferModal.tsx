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
  };
  onClose: () => void;
};

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  const [stats, setStats] = useState<{ avgRounded: number | null; ratingsCount: number; reportsCount: number }>({
    avgRounded: null,
    ratingsCount: 0,
    reportsCount: 0,
  });
  const navigate = useNavigate();

  const images =
    offer.images && offer.images.length > 0
      ? offer.images.map((img) => img.url)
      : ["https://via.placeholder.com/600x400?text=Brak+zdjęć"];

  useEffect(() => {
    axios
      .get(`http://localhost:3000/reviews/offer/${offer.id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Błąd pobierania statystyk:", err));
  }, [offer.id]);

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
                width: `${100 / images.length - 2}%`,
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>

        {/* 📋 Opis */}
        <h2>{offer.title}</h2>
        <p>🏷️ <b>{offer.category}</b></p>
        <p>{offer.description}</p>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <div>
            <p>📍 {offer.localisation}</p>
            <p>
              ⭐ {stats.avgRounded ? stats.avgRounded.toFixed(1) : "Brak ocen"} ({stats.ratingsCount} opinii)
            </p>
          </div>
          <h3 style={{ color: "#007bff" }}>{offer.prize} zł</h3>
        </div>

        {/* 🔹 Przyciski */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
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
