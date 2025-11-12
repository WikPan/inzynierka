import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/users.ts";

interface LoginProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!login || !password) {
      alert("⚠️ Wpisz login i hasło.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ login, password });

      if (data?.access_token) {
        const userData = data.user || {
          id: data.id,
          login: data.login,
          email: data.email,
          accountType: data.accountType || "user",
        };

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accountType", userData.accountType);

        alert("✅ Zalogowano pomyślnie!");
        setIsLoggedIn(true);

        const type = userData.accountType?.toLowerCase();
        if (type === "admin") navigate("/admin");
        else navigate("/profile");
      } else {
        alert("❌ Niepoprawna odpowiedź z serwera.");
      }
    } catch (err: any) {
      console.error("❌ Błąd logowania:", err);
      alert("❌ Błąd logowania: " + (err.response?.data?.message || err.message));
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
        padding: "60px 20px",
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
            marginBottom: "30px",
            fontWeight: "800",
            fontSize: "1.9rem",
            color: "#007bff",
          }}
        >
          🔐 Logowanie do Oofferto
        </h1>

        {/* --- Pola formularza --- */}
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

        <div style={{ marginBottom: "30px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Hasło
          </label>
          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* --- Przycisk logowania --- */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: loading
              ? "#9ecfff"
              : "linear-gradient(90deg, #007bff, #00bfff)",
            color: "white",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(0,123,255,0.4)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          {loading ? "⏳ Logowanie..." : "Zaloguj się"}
        </button>

        {/* --- Link do rejestracji --- */}
        <p
          style={{
            marginTop: "25px",
            fontSize: "0.9rem",
            color: "#555",
          }}
        >
          Nie masz konta?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontWeight: "600",
              textDecoration: "underline",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00bfff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#007bff")}
          >
            Zarejestruj się
          </span>
        </p>
      </div>
    </div>
  );
}
