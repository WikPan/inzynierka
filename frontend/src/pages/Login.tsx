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
      console.log("📦 Dane logowania:", data);

      // ✅ Obsługa obu możliwych formatów danych z backendu
      if (data?.access_token) {
        const userData = data.user || {
          id: data.id,
          login: data.login,
          email: data.email,
          accountType: data.accountType || "user",
        };

        // Zapisz dane do localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accountType", userData.accountType);

        alert("✅ Zalogowano pomyślnie!");
        setIsLoggedIn(true);

        // Przekierowanie w zależności od typu konta
        const type = userData.accountType?.toLowerCase();
        if (type === "admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      } else {
        console.error("❌ Niepoprawna odpowiedź z serwera:", data);
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
            marginBottom: "30px",
            fontWeight: "bold",
            fontSize: "1.9rem",
          }}
        >
          🔐 Logowanie
        </h1>

        {/* --- Pola --- */}
        <div style={{ marginBottom: "18px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
            Login
          </label>
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

        <div style={{ marginBottom: "30px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
            Hasło
          </label>
          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* --- Guzik --- */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleLogin}
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
            {loading ? "⏳ Logowanie..." : "Zaloguj się"}
          </button>
        </div>

        {/* --- Link do rejestracji --- */}
        <p
          style={{
            marginTop: "22px",
            color: "#6c757d",
            fontSize: "0.9rem",
          }}
        >
          Nie masz konta?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Zarejestruj się
          </span>
        </p>
      </div>
    </div>
  );
}
