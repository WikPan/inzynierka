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
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Zmień hasło</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Stare hasło"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Nowe hasło"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Powtórz nowe hasło"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">Zmień hasło</button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
