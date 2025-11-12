import { useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email || !title || !message)
      return alert("⚠️ Wypełnij wszystkie pola.");

    setSending(true);
    try {
      await axios.post("http://localhost:3000/contact", {
        email,
        title,
        message,
      });
      alert("✅ Wiadomość wysłana! Dziękujemy za kontakt.");
      setEmail("");
      setTitle("");
      setMessage("");
    } catch (err: any) {
      alert(
        "❌ Błąd wysyłania wiadomości: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px",
        color: "#222",
        textAlign: "center",
      }}
    >
      {/* --- Sekcja powitalna --- */}
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "800",
          color: "#007bff",
          marginBottom: "10px",
          letterSpacing: "1px",
        }}
      >
        👋 Witaj w <span style={{ color: "#0056d6" }}>Oofferto</span>
      </h1>

      <p
        style={{
          maxWidth: "700px",
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "60px",
        }}
      >
        Oofferto łączy osoby, które potrzebują pomocy z tymi, którzy mogą ją
        zaoferować. Twórz ogłoszenia, przeglądaj oferty w swojej okolicy i
        pomagaj innym 💙
      </p>

      {/* --- Sekcja "O nas" --- */}
      <div
        style={{
          maxWidth: "1000px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "40px",
          marginBottom: "80px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.3s",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            color: "#007bff",
            marginBottom: "20px",
          }}
        >
          💡 Nasza misja
        </h2>
        <p
          style={{
            color: "#444",
            fontSize: "1.05rem",
            lineHeight: "1.6",
          }}
        >
          Naszym celem jest stworzenie bezpiecznej i przyjaznej przestrzeni, w
          której każdy może znaleźć pomoc lub zaoferować swoje umiejętności.
          <br />
          Oofferto to miejsce współpracy, zaufania i pozytywnej energii —
          niezależnie od miasta.
        </p>
      </div>

      {/* --- Formularz kontaktowy --- */}
      <div
        style={{
          background: "#fff",
          padding: "40px 50px",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#007bff",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          📬 Skontaktuj się z nami
        </h2>

        <input
          type="email"
          placeholder="📧 Twój adres e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "#f9f9f9",
            color: "#333",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <input
          type="text"
          placeholder="📝 Tytuł wiadomości"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "#f9f9f9",
            color: "#333",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <textarea
          placeholder="💬 Treść wiadomości..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "#f9f9f9",
            color: "#333",
            fontSize: "0.95rem",
            resize: "none",
            outline: "none",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={sending}
          style={{
            width: "100%",
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
          {sending ? "⏳ Wysyłanie..." : "Wyślij wiadomość"}
        </button>
      </div>

      {/* --- Stopka --- */}
      <footer
        style={{
          marginTop: "100px",
          fontSize: "0.9rem",
          color: "#555",
        }}
      >
        © {new Date().getFullYear()} Oofferto — Wszystkie prawa zastrzeżone
      </footer>
    </div>
  );
}
