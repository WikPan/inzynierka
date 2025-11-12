import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/users.ts";

export default function Register() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!login || !email) {
      alert("⚠️ Wpisz login i adres e-mail.");
      return;
    }
    if (!accepted) {
      alert("⚠️ Musisz zaakceptować regulamin, aby się zarejestrować.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ login, email });
      alert(
        "✅ Rejestracja zakończona! Hasło zostało wysłane na Twój adres e-mail."
      );
      navigate("/login");
    } catch (err: any) {
      alert(
        "❌ Błąd rejestracji: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          padding: "45px 50px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#007bff",
            marginBottom: "25px",
            fontWeight: 800,
            fontSize: "1.9rem",
          }}
        >
          📝 Rejestracja
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "0.95rem",
            marginBottom: "25px",
          }}
        >
          Po rejestracji automatyczne hasło zostanie wysłane na Twój adres e-mail.
        </p>

        {/* Login */}
        <div style={{ marginBottom: "18px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Login
          </label>
          <input
            type="text"
            placeholder="Wpisz login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#333",
              outline: "none",
              fontSize: "0.95rem",
              transition: "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #007bff";
              e.target.style.boxShadow = "0 0 6px rgba(0,123,255,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #ccc";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "25px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="Wpisz adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#333",
              outline: "none",
              fontSize: "0.95rem",
              transition: "border 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #007bff";
              e.target.style.boxShadow = "0 0 6px rgba(0,123,255,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #ccc";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Checkbox z linkiem */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "25px",
            fontSize: "0.9rem",
            textAlign: "left",
            color: "#555",
          }}
        >
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Akceptuję{" "}
            <span
              onClick={() => navigate("/terms")}
              style={{
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#00bfff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#007bff")
              }
            >
              regulamin
            </span>
          </span>
        </div>

        {/* Przycisk */}
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            background: loading
              ? "#9ecfff"
              : "linear-gradient(90deg, #007bff, #00bfff)",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0,123,255,0.4)",
          }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          {loading ? "⏳ Rejestrowanie..." : "Zarejestruj się"}
        </button>

        <p
          style={{
            marginTop: "25px",
            color: "#555",
            fontSize: "0.9rem",
          }}
        >
          Masz już konto?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontWeight: 600,
              textDecoration: "underline",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00bfff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#007bff")}
          >
            Zaloguj się
          </span>
        </p>
      </div>
    </div>
  );
}
