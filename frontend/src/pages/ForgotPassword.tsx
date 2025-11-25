import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!login || !email) {
      alert("⚠️ Podaj login i email.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/users/forgot-password", {
        login,
        email,
      });

      alert("✅ " + res.data.message);
    } catch (err: any) {
      alert("❌ " + (err.response?.data?.message || "Błąd"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          padding: "35px 40px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            marginBottom: "28px",
            fontWeight: 800,
            color: "#007bff",
            textAlign: "center",
          }}
        >
          🔑 Odzyskiwanie hasła
        </h2>

        <label style={{ fontWeight: 600 }}>Login</label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "16px",
          }}
        />

        <label style={{ fontWeight: 600 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "25px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #007bff, #00bfff)",
            padding: "12px",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "⏳ Wysyłanie..." : "Wyślij nowe hasło"}
        </button>
      </div>
    </div>
  );
}
