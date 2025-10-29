import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "60px auto",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        lineHeight: 1.6,
        color: "#333",
      }}
    >
      <h1 style={{ color: "#007bff", marginBottom: "20px" }}>
        📜 Regulamin korzystania z serwisu
      </h1>

      <p>
        1️⃣ Rejestrując się, użytkownik zobowiązuje się do korzystania z serwisu
        zgodnie z prawem oraz zasadami współżycia społecznego.
      </p>
      <p>
        2️⃣ Zabrania się publikowania treści obraźliwych, niezgodnych z prawem lub
        naruszających dobre obyczaje.
      </p>
      <p>
        3️⃣ Administrator zastrzega sobie prawo do usunięcia konta lub oferty w
        przypadku naruszenia zasad.
      </p>
      <p>
        4️⃣ Dane użytkowników są przetwarzane zgodnie z obowiązującymi przepisami o
        ochronie danych osobowych.
      </p>
      <p style={{ marginTop: "20px", fontWeight: "bold", color: "#222" }}>
        Korzystanie z serwisu oznacza akceptację niniejszego regulaminu.
      </p>

      {/* 🔙 Przycisk powrotu */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            background: "linear-gradient(90deg, #007bff 0%, #3399ff 100%)",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,123,255,0.25)",
            transition: "transform 0.2s, filter 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.08)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ← Wróć do rejestracji
        </button>
      </div>
    </div>
  );
}
