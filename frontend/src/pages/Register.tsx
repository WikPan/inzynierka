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
      const data = await registerUser({ login, email });
      alert("✅ Rejestracja zakończona! Hasło zostało wysłane na Twój adres e-mail.");
      navigate("/login");
    } catch (err: any) {
      alert("❌ Błąd rejestracji: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        paddingTop: "120px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px 50px",
          borderRadius: "18px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          border: "1px solid #e9ecef",
        }}
      >
        <h1
          style={{
            color: "#007bff",
            marginBottom: "25px",
            fontWeight: "bold",
            fontSize: "1.9rem",
          }}
        >
          📝 Rejestracja
        </h1>

        <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: "25px" }}>
          Po rejestracji automatyczne hasło zostanie wysłane na podany adres e-mail.
        </p>

        <div style={{ marginBottom: "18px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Login</label>
          <input
            type="text"
            placeholder="Wpisz login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ced4da",
              backgroundColor: "#f8faff",
              transition: "border-color 0.2s, box-shadow 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#007bff";
              e.target.style.boxShadow = "0 0 4px rgba(0,123,255,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ced4da";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ marginBottom: "25px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Email</label>
          <input
            type="email"
            placeholder="Wpisz adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ced4da",
              backgroundColor: "#f8faff",
              transition: "border-color 0.2s, box-shadow 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#007bff";
              e.target.style.boxShadow = "0 0 4px rgba(0,123,255,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ced4da";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Checkbox z linkiem do regulaminu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "25px",
            fontSize: "0.9rem",
            textAlign: "left",
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
              }}
            >
              regulamin
            </span>
          </span>
        </div>

        {/* Przycisk */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "70%",
              background: loading
                ? "#6c757d"
                : "linear-gradient(90deg, #007bff 0%, #3399ff 100%)",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "1rem",
              transition: "all 0.2s",
              boxShadow: "0 4px 10px rgba(0,123,255,0.25)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "⏳ Rejestrowanie..." : "Zarejestruj się"}
          </button>
        </div>

        <p style={{ marginTop: "22px", color: "#6c757d", fontSize: "0.9rem" }}>
          Masz już konto?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Zaloguj się
          </span>
        </p>
      </div>
    </div>
  );
}
