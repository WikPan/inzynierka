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

  // 🔹 Filtry
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Pobieranie danych użytkownika i ofert
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

        const offersWithStats = await Promise.all(
          res.data.map(async (offer: Offer) => {
            try {
              const { data: stats } = await axios.get(
                `http://localhost:3000/reviews/offer/${offer.id}/stats`
              );
              return {
                ...offer,
                avgRounded: stats.avgRounded,
                ratingsCount: stats.ratingsCount,
              };
            } catch {
              return { ...offer, avgRounded: null, ratingsCount: 0 };
            }
          })
        );

        setOffers(offersWithStats);
        setFilteredOffers(offersWithStats);
      } catch (err) {
        console.error("Błąd pobierania ofert:", err);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchUser();
    fetchOffers();
  }, [navigate, token]);

  // 🔹 Filtrowanie ofert po tytule, lokalizacji i kategorii
  useEffect(() => {
    let result = [...offers];

    if (filterTitle.trim()) {
      result = result.filter((o) =>
        o.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    if (filterLocation.trim()) {
      result = result.filter((o) =>
        o.localisation.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    if (filterCategory) {
      result = result.filter((o) => o.category === filterCategory);
    }

    setFilteredOffers(result);
  }, [filterTitle, filterLocation, filterCategory, offers]);

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

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;
    try {
      await axios.delete(`http://localhost:3000/offers/${id}/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setFilteredOffers((prev) => prev.filter((o) => o.id !== id));
      alert("✅ Oferta i jej dane zostały usunięte.");
    } catch (err) {
      console.error("Błąd usuwania oferty:", err);
      alert("❌ Nie udało się usunąć oferty.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "40px",
        margin: "50px auto",
        maxWidth: "1300px",
        background: "linear-gradient(180deg, #f8faff 0%, #eef3f8 100%)",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      {/* LEWA STRONA – OFERTY */}
      <div style={{ flex: 2 }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Twoje oferty
        </h2>

        {/* 🔹 Filtry */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "20px",
            background: "#fff",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Tytuł oferty"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
            }}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              flex: "1 1 180px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
            }}
          >
            <option value="">Wszystkie kategorie</option>
            <option value="Pomoc">Pomoc</option>
            <option value="Kuchnia">Kuchnia</option>
            <option value="Ogród">Ogród</option>
            <option value="Prace dorywcze">Prace dorywcze</option>
            <option value="Transport">Transport</option>
            <option value="Inne">Inne</option>
          </select>

          <input
            type="text"
            placeholder="📍 Miejsce"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{
              flex: "1 1 180px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
            }}
          />
        </div>

        {/* 🔹 Lista ofert */}
        {loadingOffers ? (
          <p style={{ textAlign: "center" }}>Ładowanie ofert...</p>
        ) : filteredOffers.length === 0 ? (
          <p style={{ textAlign: "center" }}>Nie znaleziono ofert.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
              justifyItems: "center",
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
                  offer.images && offer.images.length > 0
                    ? offer.images.map((img) => img.url)
                    : ["/logo.png"]
                }
                rating={offer.avgRounded ?? undefined}
                ratingsCount={offer.ratingsCount ?? 0}
                onClick={() => setSelectedOffer(offer)}
              />
            ))}
          </div>
        )}

        {/* 🔹 Modal szczegółów oferty */}
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
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/offers/edit/${selectedOffer.id}`)}
              >
                ✏️ Edytuj
              </button>
              <button
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
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

      {/* PRAWA STRONA – PROFIL */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          padding: "20px",
          height: "fit-content",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Twój profil
        </h2>

        {user && (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img
                src={user.avatarUrl || "/logo.png"}
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
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={handleEmailChange}
                style={{
                  width: "100%",
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Zapisz email
              </button>
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
                  borderRadius: "8px",
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
