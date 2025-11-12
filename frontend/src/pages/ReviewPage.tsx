import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type Review = {
  id: string;
  stars: number;
  comment?: string;
  createdAt: string;
  user?: { login?: string };
};

type Offer = {
  id: string;
  user?: { id: string; login: string };
};

export default function ReviewPage() {
  const { offerId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [offerOwnerId, setOfferOwnerId] = useState<string | null>(null);
  const [sortType, setSortType] = useState<
    "starsAsc" | "starsDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [dataLoaded, setDataLoaded] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function init() {
      await loadOfferOwner();
      await loadReviews();

      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await axios.get("http://localhost:3000/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserId(res.data.id);
        } catch {
          setIsLoggedIn(false);
        }
      }

      setDataLoaded(true);
    }

    init();
  }, []);

  async function loadOfferOwner() {
    try {
      const res = await axios.get<Offer>(
        `http://localhost:3000/offers/${offerId}`
      );
      if (res.data.user?.id) setOfferOwnerId(res.data.user.id);
    } catch (err) {
      console.error("Błąd pobierania właściciela oferty:", err);
    }
  }

  async function loadReviews() {
    try {
      const res = await axios.get(
        `http://localhost:3000/reviews/offer/${offerId}`
      );
      setReviews(res.data);
    } catch (err) {
      console.error("Błąd pobierania recenzji:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      alert("Musisz być zalogowany, aby dodać recenzję.");
      return;
    }

    if (userId === offerOwnerId) {
      alert("❌ Nie możesz ocenić swojej własnej oferty.");
      return;
    }

    if (stars === 0) {
      alert("⚠️ Ocena 0 gwiazdek traktowana jest jako zgłoszenie oferty.");
      try {
        await axios.post(
          "http://localhost:3000/reviews/report",
          { offerId, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("📩 Zgłoszenie zostało przesłane do moderatora.");
        setComment("");
        setStars(5);
        return;
      } catch (err) {
        console.error("Błąd podczas zgłoszenia:", err);
        alert("❌ Nie udało się wysłać zgłoszenia.");
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/reviews",
        { offerId, stars, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      setStars(5);
      await loadReviews();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "❌ Nie udało się dodać recenzji.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortType === "starsAsc") return a.stars - b.stars;
    if (sortType === "starsDesc") return b.stars - a.stars;
    if (sortType === "dateAsc")
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    if (sortType === "dateDesc")
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return 0;
  });

  if (!dataLoaded) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: "80px",
          color: "#555",
          fontSize: "1.1rem",
        }}
      >
        ⏳ Ładowanie danych...
      </p>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          padding: "35px 40px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#007bff",
            fontWeight: 800,
          }}
        >
          ⭐ Recenzje oferty
        </h2>

        {/* Info o 0 gwiazdek */}
        <div
          style={{
            backgroundColor: "#fff8e1",
            color: "#856404",
            border: "1px solid #ffecb5",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "20px",
            fontSize: "0.95rem",
          }}
        >
          ⚠️ Wystawienie oceny <b>0 gwiazdek</b> zostanie potraktowane jako{" "}
          <b>zgłoszenie oferty</b>.
        </div>

        {/* Formularz */}
        {isLoggedIn ? (
          userId === offerOwnerId ? (
            <p
              style={{
                color: "#666",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              🔒 Nie możesz ocenić swojej własnej oferty.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                marginBottom: "25px",
                backgroundColor: "#f9fafc",
                padding: "18px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
              }}
            >
              <label
                style={{
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                Ocena (0–5):
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                style={{
                  width: "70px",
                  padding: "8px",
                  textAlign: "center",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
              <textarea
                placeholder="💬 Komentarz (opcjonalnie)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  height: "90px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  background: "#fff",
                  marginBottom: "12px",
                  fontSize: "0.95rem",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading
                    ? "#9ecfff"
                    : "linear-gradient(90deg, #007bff, #00bfff)",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
                }}
              >
                {loading ? "⏳ Wysyłanie..." : "Dodaj recenzję"}
              </button>
            </form>
          )
        ) : (
          <p style={{ color: "#666", textAlign: "center", marginBottom: 20 }}>
            🔒 Zaloguj się, aby dodać recenzję.
          </p>
        )}

        {/* Sortowanie */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: "#333" }}>Opinie użytkowników:</h3>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as any)}
            style={{
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <option value="dateDesc">📅 Najnowsze</option>
            <option value="dateAsc">📅 Najstarsze</option>
            <option value="starsDesc">⭐ Ocena malejąco</option>
            <option value="starsAsc">⭐ Ocena rosnąco</option>
          </select>
        </div>

        {/* Lista recenzji */}
        {sortedReviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>
            Brak recenzji dla tej oferty.
          </p>
        ) : (
          sortedReviews.map((r) => (
            <div
              key={r.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "12px 0",
              }}
            >
              <strong style={{ color: "#f5b301", fontSize: "1rem" }}>
                ⭐ {r.stars}/5
              </strong>
              {r.comment && (
                <p
                  style={{
                    margin: "8px 0",
                    color: "#333",
                    lineHeight: 1.4,
                  }}
                >
                  {r.comment}
                </p>
              )}
              <small style={{ color: "#777" }}>
                {new Date(r.createdAt).toLocaleDateString()} —{" "}
                {r.user?.login || "Anonimowy użytkownik"}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
