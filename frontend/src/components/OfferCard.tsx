import { useState } from "react";
import logoPlaceholder from "../assets/logo.png"; // 👈 nasze logo jako domyślny obrazek

type OfferCardProps = {
  id: string;
  title: string;
  localisation: string;
  price: number | string;
  category: string;
  images: string[];
  rating?: number;
  ratingsCount?: number;
  onClick?: () => void;
};

export default function OfferCard({
  title,
  localisation,
  price,
  category,
  images,
  rating,
  ratingsCount,
  onClick,
}: OfferCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const numericPrice =
    typeof price === "string" ? parseFloat(price) : price;

  const hasImages = images && images.length > 0;
  const displayImage = hasImages ? images[currentIndex] : logoPlaceholder;

  return (
    <div
      onClick={onClick}
      style={{
        width: "260px",
        borderRadius: "18px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 6px 18px rgba(0,123,255,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      {/* 🖼️ Obrazek */}
      <div
        style={{
          position: "relative",
          height: "180px",
          backgroundColor: "#f0f4ff",
        }}
      >
        <img
          src={displayImage}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: hasImages ? "cover" : "contain",
            backgroundColor: "#f9fbff",
            padding: hasImages ? "0" : "25px",
          }}
        />

        {/* 🔁 Strzałki przewijania zdjęć */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontSize: "18px",
                color: "#333",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.9)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.6)")
              }
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontSize: "18px",
                color: "#333",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.9)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.6)")
              }
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 📋 Sekcja informacji */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            margin: 0,
            color: "#222",
            fontWeight: 700,
          }}
        >
          {title}
        </h3>

        {/* 🏷️ Kategoria */}
        <span
          style={{
            alignSelf: "flex-start",
            background:
              "linear-gradient(90deg, #e3f2fd, #f0f9ff)",
            color: "#007bff",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "8px",
          }}
        >
          {category}
        </span>

        {/* 📍 Lokalizacja */}
        <p
          style={{
            fontSize: "0.9rem",
            color: "#555",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          📍 {localisation}
        </p>

        {/* ⭐ Ocena i 💰 Cena */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          {/* ⭐ Ocena */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#f5b301", fontSize: "0.95rem" }}>
              ⭐ {rating ? rating.toFixed(1) : "—"}
            </span>
            {ratingsCount && ratingsCount > 0 && (
              <span
                style={{
                  color: "#777",
                  fontSize: "0.8rem",
                }}
              >
                ({ratingsCount})
              </span>
            )}
          </div>

          {/* 💰 Cena lub "Bezpłatnie" */}
          {numericPrice === 0 ? (
            <strong
              style={{
                color: "#2e8b57",
                fontSize: "1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              🤝 Bezpłatnie
            </strong>
          ) : (
            <strong
              style={{
                color: "#007bff",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {numericPrice} zł
            </strong>
          )}
        </div>
      </div>
    </div>
  );
}
