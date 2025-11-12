import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e3f2fd 0%, #f8faff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          padding: "40px",
          lineHeight: 1.7,
          color: "#333",
          fontSize: "1rem",
          position: "relative",
          border: "1px solid #f0f4ff",
        }}
      >
        <h1
          style={{
            color: "#007bff",
            marginBottom: "25px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.8rem",
          }}
        >
          📜 Regulamin korzystania z serwisu Oofferto
        </h1>

        <div
          style={{
            background: "rgba(240,249,255,0.7)",
            padding: "20px 25px",
            borderRadius: "14px",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
          }}
        >
          <p>
            <b>1️⃣</b> Rejestrując się w serwisie Oofferto, użytkownik zobowiązuje się do
            korzystania z platformy w sposób zgodny z obowiązującym prawem, dobrymi
            obyczajami oraz zasadami współżycia społecznego.
          </p>

          <p>
            <b>2️⃣</b> Zabrania się publikowania treści wulgarnych, obraźliwych, niezgodnych
            z prawem lub mogących naruszać dobra osobiste innych użytkowników.
          </p>

          <p>
            <b>3️⃣</b> Administrator zastrzega sobie prawo do usunięcia konta lub oferty w
            przypadku naruszenia zasad niniejszego regulaminu.
          </p>

          <p>
            <b>4️⃣</b> Dane użytkowników są przetwarzane zgodnie z obowiązującymi przepisami o
            ochronie danych osobowych (RODO).
          </p>

          <p
            style={{
              marginTop: "25px",
              fontWeight: 600,
              color: "#111",
              background: "#f1f9ff",
              padding: "10px 15px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
            }}
          >
            ✅ Korzystanie z serwisu oznacza akceptację niniejszego regulaminu.
          </p>
        </div>

        {/* 🔙 Przycisk powrotu */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "linear-gradient(90deg, #007bff, #00bfff)",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(0,123,255,0.3)",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "brightness(1)")
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ← Wróć do rejestracji
          </button>
        </div>
      </div>
    </div>
  );
}
