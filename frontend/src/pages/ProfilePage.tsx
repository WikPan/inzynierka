import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Offer {
  id: number;
  title: string;
  description: string;
  prize: number;
  category: string;
  localisation: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setNewEmail(res.data.email);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    const fetchOffers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/offers/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffers(res.data);
      } catch (err) {
        console.error("Błąd pobierania ofert:", err);
      }
    };

    fetchUser();
    fetchOffers();
  }, [navigate, token]);

  const handleEmailChange = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:3000/users/change-email",
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Email został zaktualizowany");
      setUser((prev) => (prev ? { ...prev, email: res.data.email } : prev));
    } catch (err) {
      setMessage("❌ Nie udało się zmienić adresu email");
      console.error(err);
    }
  };

  // 🔹 Upload avatara
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:3000/users/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) =>
        prev ? { ...prev, avatarUrl: res.data.avatarUrl } : prev
      );
      setMessage("✅ Avatar został zaktualizowany!");
    } catch (err) {
      console.error("❌ Błąd uploadu avatara:", err);
      setMessage("❌ Nie udało się wysłać avatara.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "40px", margin: "50px" }}>
      {/* LEWA STRONA – OFERTY */}
      <div style={{ flex: 2 }}>
        <h2>Twoje oferty</h2>
        {offers.length === 0 ? (
          <p>Nie masz jeszcze żadnych ofert.</p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h4>{offer.title}</h4>
              <p>{offer.description}</p>
              <small>
                {offer.category} • {offer.prize} zł • {offer.localisation}
              </small>
            </div>
          ))
        )}
      </div>

      {/* PRAWA STRONA – PROFIL */}
      <div style={{ flex: 1 }}>
        <h2>Twój profil</h2>

        {user && (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img
                src={
                  user.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                  marginBottom: "10px",
                }}
              />

              <div>
                <label
                  htmlFor="avatarUpload"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  {uploading ? "Wysyłanie..." : "Zmień zdjęcie"}
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                />
              </div>

              <h3>{user.username}</h3>
            </div>

            <div>
              <label>Email:</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
              />
              <button onClick={handleEmailChange}>Zapisz email</button>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => navigate("/change-password")}
                style={{
                  width: "100%",
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Zmień hasło
              </button>
            </div>

            {message && (
              <p
                style={{
                  marginTop: "15px",
                  color: message.includes("✅") ? "green" : "red",
                  textAlign: "center",
                }}
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
