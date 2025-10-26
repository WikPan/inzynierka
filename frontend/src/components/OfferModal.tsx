
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
  const images =
    offer.images && offer.images.length > 0
      ? offer.images.map((img) => img.url)
      : ["https://via.placeholder.com/600x400?text=Brak+zdjęć"];

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
      onClick={onClose} // kliknięcie tła zamyka
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
        onClick={(e) => e.stopPropagation()} // zapobiega zamknięciu przy kliknięciu w treść
      >
        {/* 🔹 Galeria */}
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

        {/* 🔹 Treść */}
        <h2 style={{ marginBottom: "10px" }}>{offer.title}</h2>
        <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "10px" }}>
          🏷️ <b>{offer.category}</b>
        </p>
        <p style={{ lineHeight: 1.5, marginBottom: "10px" }}>
          {offer.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "15px",
          }}
        >
          <div>
            <p style={{ margin: 0 }}>📍 {offer.localisation}</p>
            <p style={{ margin: 0 }}>⭐ ocena: wkrótce</p>
          </div>
          <h3 style={{ color: "#007bff" }}>{offer.prize} zł</h3>
        </div>

        {/* 🔹 Przyciski */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Skontaktuj się
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
