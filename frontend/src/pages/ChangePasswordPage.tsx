import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== repeatPassword) {
      return setMessage("❌ Hasła nie są takie same");
    }
    if (newPassword.length < 8) {
      return setMessage("❌ Nowe hasło musi mieć co najmniej 8 znaków");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:3000/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Hasło zostało zmienione");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Błąd przy zmianie hasła");
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
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          padding: "40px 50px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#007bff",
            fontWeight: 800,
            fontSize: "1.8rem",
            marginBottom: "30px",
          }}
        >
          🔒 Zmień hasło
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <input
            type="password"
            placeholder="🔑 Stare hasło"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#333",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="🆕 Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#333",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="🔁 Powtórz nowe hasło"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#333",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />

          <button
            type="submit"
            style={{
              background: "linear-gradient(90deg, #007bff, #00bfff)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.25s",
              boxShadow: "0 4px 12px rgba(0,123,255,0.4)",
            }}
          >
            💾 Zmień hasło
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: 600,
              color: message.includes("✅") ? "#28a745" : "#dc3545",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
