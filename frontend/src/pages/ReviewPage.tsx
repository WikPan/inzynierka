import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type Review = {
  id: string;
  stars: number;
  comment?: string;
  createdAt: string;
  user?: { email?: string };
};

export default function ReviewPage() {
  const { offerId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadReviews();
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  async function loadReviews() {
    try {
      const res = await axios.get(`http://localhost:3000/reviews/offer/${offerId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Błąd pobierania recenzji:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Musisz być zalogowany, aby dodać recenzję.");
      return;
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
    } catch (err) {
      console.error("Błąd dodawania recenzji:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h2>Recenzje oferty</h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <label>Ocena (0–5): </label>
          <input
            type="number"
            min={0}
            max={5}
            value={stars}
            onChange={(e) => setStars(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          />
          <textarea
            placeholder="Komentarz (opcjonalnie)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ display: "block", width: "100%", margin: "10px 0", height: "80px" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {loading ? "Wysyłanie..." : "Dodaj recenzję"}
          </button>
        </form>
      ) : (
        <p style={{ color: "#666" }}>🔒 Zaloguj się, aby dodać recenzję.</p>
      )}

      <div>
        <h3>Opinie użytkowników:</h3>
        {reviews.length === 0 ? (
          <p>Brak recenzji dla tej oferty.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}>
              <strong>⭐ {r.stars}/5</strong>
              {r.comment && <p>{r.comment}</p>}
              <small style={{ color: "#999" }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
