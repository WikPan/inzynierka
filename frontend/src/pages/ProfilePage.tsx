import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OfferCard from "../components/OfferCard";
import OfferModal from "../components/OfferModal";

interface Offer {
  id: string;
  title: string;
  description: string;
  prize: number;
  category: string;
  localisation: string;
  images?: { url: string }[];
  avgRounded?: number | null;
  ratingsCount?: number;
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
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // FETCH USER + OFFERS
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setNewEmail(data.email);
      } catch {
        navigate("/login");
      }
    };

    const fetchOffers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/offers/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const offersWithStats = await Promise.all(
          res.data.map(async (offer: Offer) => {
            try {
              const { data: stats } = await axios.get(
                `http://localhost:3000/reviews/offer/${offer.id}/stats`
              );
              return { ...offer, avgRounded: stats.avgRounded, ratingsCount: stats.ratingsCount };
            } catch {
              return { ...offer, avgRounded: null, ratingsCount: 0 };
            }
          })
        );

        setOffers(offersWithStats);
        setFilteredOffers(offersWithStats);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchUser();
    fetchOffers();
  }, [navigate, token]);

  // FILTERING
  useEffect(() => {
    let r = [...offers];

    if (filterTitle.trim()) {
      r = r.filter((o) =>
        o.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    if (filterLocation.trim()) {
      r = r.filter((o) =>
        o.localisation.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    if (filterCategory) {
      r = r.filter((o) => o.category === filterCategory);
    }

    setFilteredOffers(r);
  }, [filterTitle, filterLocation, filterCategory, offers]);

  // CHANGE EMAIL
  const handleEmailChange = async () => {
    try {
      const { data } = await axios.patch(
        "http://localhost:3000/users/change-email",
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser((prev) => (prev ? { ...prev, email: data.email } : prev));
      setMessage("✅ Email został zaktualizowany");
    } catch {
      setMessage("❌ Nie udało się zmienić adresu email");
    }
  };

  // UPLOAD AVATAR
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        "http://localhost:3000/users/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
      setMessage("✅ Avatar został zaktualizowany!");
    } catch {
      setMessage("❌ Błąd uploadu avatara");
    } finally {
      setUploading(false);
    }
  };

  // DELETE OFFER
  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć?")) return;

    try {
      await axios.delete(`http://localhost:3000/offers/${id}/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOffers((prev) => prev.filter((o) => o.id !== id));
      setFilteredOffers((prev) => prev.filter((o) => o.id !== id));
      alert("✅ Usunięto ofertę.");
    } catch {
      alert("❌ Błąd podczas usuwania.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        padding: "50px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
          width: "100%",
          maxWidth: "1300px",
        }}
      >
        {/* ---------------------------------------------------------
            LEWA STRONA — OFERTY
        --------------------------------------------------------- */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "18px",
              color: "#007bff",
              fontWeight: 800,
            }}
          >
            Twoje oferty
          </h2>

          {/* FILTRY */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
              marginBottom: "20px",
              background: "#f9fafc",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Tytuł"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              style={{
                flex: "1 1 220px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Wszystkie</option>
              <option value="Pomoc">Pomoc</option>
              <option value="Kuchnia">Kuchnia</option>
              <option value="Ogród">Ogród</option>
              <option value="Prace dorywcze">Prace dorywcze</option>
              <option value="Transport">Transport</option>
              <option value="Inne">Inne</option>
            </select>

            <input
              type="text"
              placeholder="📍 Lokalizacja"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* LISTA OFERT — 3 KOLUMNY */}
          {loadingOffers ? (
            <p style={{ textAlign: "center" }}>Ładowanie...</p>
          ) : filteredOffers.length === 0 ? (
            <p style={{ textAlign: "center" }}>Brak ofert.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  id={offer.id}
                  title={offer.title}
                  localisation={offer.localisation}
                  price={offer.prize}
                  category={offer.category}
                  images={
                    offer.images?.length
                      ? offer.images.map((i) => i.url)
                      : ["/logo.png"]
                  }
                  rating={offer.avgRounded ?? undefined}
                  ratingsCount={offer.ratingsCount ?? 0}
                  onClick={() => setSelectedOffer(offer)}
                />
              ))}
            </div>
          )}

          {selectedOffer && (
            <OfferModal
              offer={selectedOffer}
              onClose={() => setSelectedOffer(null)}
            >
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <button
                  style={{
                    background: "linear-gradient(90deg, #007bff, #00bfff)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/offers/edit/${selectedOffer.id}`)}
                >
                  ✏️ Edytuj
                </button>

                <button
                  style={{
                    background: "linear-gradient(90deg, #ff4b5c, #dc3545)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDeleteOffer(selectedOffer.id)}
                >
                  ❌ Usuń
                </button>
              </div>
            </OfferModal>
          )}
        </div>

        {/* ---------------------------------------------------------
            PRAWA STRONA — PROFIL (NAPRAWIONA)
        --------------------------------------------------------- */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            padding: "24px",
            height: "fit-content",
            width: "100%",
            maxWidth: "380px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#007bff",
              fontWeight: 800,
            }}
          >
            Twój profil
          </h2>

          {user && (
            <>
              {/* AVATAR BLOK */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={user.avatarUrl || "/logo.png"}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #e9ecef",
                    marginBottom: "12px",
                  }}
                />

                <label
                  htmlFor="avatarUpload"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(90deg, #007bff, #00bfff)",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
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

                <h3 style={{ marginTop: "12px", color: "#333" }}>
                  {user.username}
                </h3>
              </div>

              {/* FORMULARZ */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{ fontWeight: 600, display: "block", marginBottom: 6 }}
                  >
                    Email:
                  </label>
<input
  type="email"
  value={newEmail}
  onChange={(e) => setNewEmail(e.target.value)}
  style={{
    width: "100%",
    padding: "1px 1px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    height: "44px",
    textAlign: "center",   // 🔥 WYŚRODKOWANY TEKST
  }}
/>

                </div>

                <button
                  onClick={handleEmailChange}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #00b85c, #28a745)",
                    color: "white",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Zapisz email
                </button>

                <button
                  onClick={() => navigate("/change-password")}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #007bff, #00bfff)",
                    color: "white",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Zmień hasło
                </button>

                {message && (
                  <p
                    style={{
                      marginTop: "10px",
                      color: message.includes("✅") ? "#28a745" : "#dc3545",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
