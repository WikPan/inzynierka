import { useState } from "react";

type OfferCardProps = {
  id: string;
  title: string;
  localisation: string;
  price: number;
  category: string;
  images: string[];
  rating?: number; // na przyszłość
  onClick?: () => void;
};

export default function OfferCard({
  id,
  title,
  localisation,
  price,
  category,
  images,
  rating,
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

  return (
    <div
      onClick={onClick}
      style={{
        width: "250px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget.style.transform = "scale(1.02)"))
      }
      onMouseLeave={(e) =>
        ((e.currentTarget.style.transform = "scale(1.0)"))
      }
    >
      {/* 🔹 Sekcja obrazka */}
      <div
        style={{
          position: "relative",
          height: "180px",
          backgroundColor: "#f0f0f0",
        }}
      >
        {images.length > 0 && (
          <img
            src={images[currentIndex]}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Strzałki */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: "absolute",
                top: "50%",
                left: "8px",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              style={{
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 🔹 Sekcja info */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            margin: 0,
            color: "#333",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>

        {/* 🏷️ Kategoria */}
        <span
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#e3f2fd",
            color: "#007bff",
            fontSize: "0.8rem",
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: "6px",
            marginBottom: "4px",
          }}
        >
          {category}
        </span>

        <p
          style={{
            fontSize: "0.9rem",
            color: "#666",
            margin: 0,
          }}
        >
          📍 {localisation}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <span style={{ color: "#999", fontSize: "0.85rem" }}>
            ⭐ {rating ? rating.toFixed(1) : "—"}
          </span>
          <strong style={{ color: "#007bff", fontSize: "1rem" }}>
            {price} zł
          </strong>
        </div>
      </div>
    </div>
  );
}
