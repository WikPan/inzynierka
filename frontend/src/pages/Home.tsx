import { useEffect, useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import OfferCard from "../components/OfferCard";
import OfferModal from "../components/OfferModal";

type Offer = {
  id: string;
  title: string;
  description: string;
  category: string;
  localisation: string;
  prize: number;
  images?: { url: string }[];
  avgRounded?: number | null;
  ratingsCount?: number;
};

type Suggestion = { label: string; lat: number; lon: number };
type TitleSuggestion = { title: string };

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(false);

  // Filtry
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [price, setPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Paginacja
  const [page, setPage] = useState(1);
  const perPage = 12;

  // Sugestie
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([]);
  const [locSuggestions, setLocSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers(filters?: any) {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters || {}).toString();
      const { data } = await axios.get(
        `http://localhost:3000/offers/search${params ? "?" + params : ""}`
      );
      setOffers(data);
      const maxFound = Math.max(...data.map((o: Offer) => o.prize || 0), 1000);
      setMaxPrice(maxFound);
    } catch (err) {
      console.error("❌ Błąd pobierania ofert:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    setPage(1);
    fetchOffers({
      title,
      category,
      localisation,
      minPrice,
      maxPrice: price,
    });
  };

  // Podpowiedzi tytułów
  const fetchTitleSuggestions = async (value: string) => {
    if (value.trim().length < 2) return setTitleSuggestions([]);
    const { data } = await axios.get(
      `http://localhost:3000/offers/suggest-titles?q=${encodeURIComponent(value)}`
    );
    setTitleSuggestions(data.slice(0, 5));
  };

  // Podpowiedzi lokalizacji
  const fetchLocSuggestions = async (value: string) => {
    if (value.trim().length < 2) return setLocSuggestions([]);
    const res = await fetch(
      `http://localhost:3000/geo/autocomplete?query=${encodeURIComponent(value)}`
    );
    const data = await res.json();
    setLocSuggestions(data.slice(0, 5));
  };

  // Użyj mojej lokalizacji
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) return alert("Brak wsparcia geolokalizacji.");
    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `http://localhost:3000/geo/reverse?lat=${latitude}&lon=${longitude}`
          );
          const data: Suggestion = await res.json();
          setLocalisation(data.label);
        } catch {
          alert("Nie udało się pobrać lokalizacji.");
        } finally {
          setUseLocation(false);
        }
      },
      (err) => {
        alert("Błąd geolokalizacji: " + err.message);
        setUseLocation(false);
      }
    );
  };

  // Paginacja
  const totalPages = Math.ceil(offers.length / perPage);
  const paginatedOffers = offers.slice((page - 1) * perPage, page * perPage);

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        padding: "30px 0",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          width: "100%",
          gap: "25px",
          padding: "0 30px",
        }}
      >
      {/* === PANEL FILTRÓW === */}
      <div
        style={{
          width: "320px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          padding: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          position: "sticky",
          top: "100px",
          height: "fit-content",
        }}
      >
        <h3 style={{ color: "#007bff", fontWeight: 700, marginBottom: "4px" }}>
          🔎 Filtry
        </h3>

        {/* Tytuł */}
        <div style={{ width: "100%", position: "relative" }}>
          <Autosuggest
            suggestions={titleSuggestions}
            onSuggestionsFetchRequested={({ value }) => fetchTitleSuggestions(value)}
            onSuggestionsClearRequested={() => setTitleSuggestions([])}
            getSuggestionValue={(s) => s.title}
            renderSuggestion={(s) => (
              <div
                style={{
                  padding: "6px 10px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {s.title}
              </div>
            )}
            inputProps={{
              placeholder: "Tytuł oferty",
              value: title,
              onChange: (_: any, { newValue }: any) => setTitle(newValue),
              style: {
                width: "100%",
                padding: "11px 12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                outline: "none",
              },
            }}
            theme={{
              container: { width: "100%", position: "relative" },
              input: { width: "100%" },
              suggestionsContainer: {
                position: "absolute",
                top: "100%",
                zIndex: 20,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                width: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            }}
          />
        </div>

        {/* Kategoria */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "0.95rem",
            boxSizing: "border-box",
            outline: "none",
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

        {/* Lokalizacja */}
        <div style={{ width: "100%", position: "relative" }}>
          <Autosuggest
            suggestions={locSuggestions}
            onSuggestionsFetchRequested={({ value }) => fetchLocSuggestions(value)}
            onSuggestionsClearRequested={() => setLocSuggestions([])}
            getSuggestionValue={(s) => s.label}
            renderSuggestion={(s) => (
              <div
                style={{
                  padding: "6px 10px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {s.label}
              </div>
            )}
            inputProps={{
              placeholder: "Lokalizacja",
              value: localisation,
              onChange: (_: any, { newValue }: any) => setLocalisation(newValue),
              style: {
                width: "100%",
                padding: "11px 12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                outline: "none",
              },
            }}
            theme={{
              container: { width: "100%", position: "relative" },
              input: { width: "100%" },
              suggestionsContainer: {
                position: "absolute",
                top: "100%",
                zIndex: 20,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                width: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            }}
          />
        </div>

        {/* 📍 Przycisk lokalizacji */}
        <button
          onClick={handleUseMyLocation}
          disabled={useLocation}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background-color 0.2s",
            width: "100%",
          }}
        >
          {useLocation ? "⏳ Pobieranie..." : "📍 Użyj mojej lokalizacji"}
        </button>

        {/* 💰 Zakres cen */}
        <div
          style={{
            backgroundColor: "#f9fafc",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <label
            style={{
              fontWeight: 600,
              display: "block",
              marginBottom: "10px",
              color: "#333",
            }}
          >
            💰 Zakres ceny
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <input
              type="number"
              min="0"
              value={minPrice === 0 ? "" : minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder="od"
              style={{
                width: "48%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                textAlign: "center",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <span style={{ color: "#555", fontWeight: 500 }}>—</span>
            <input
              type="number"
              min="0"
              value={price === 0 ? "" : price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder="do"
              style={{
                width: "48%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                textAlign: "center",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* 🔘 Checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontSize: "0.95rem",
            marginTop: "8px",
          }}
        >
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                setMinPrice(0);
                setPrice(0);
                fetchOffers({ title, category, localisation, maxPrice: 0 });
              } else {
                setPrice(maxPrice);
              }
            }}
          />
          💚 Pokaż tylko bezpłatne
        </label>

        {/* 🔍 Szukaj */}
        <button
          onClick={() =>
            fetchOffers({
              title,
              category,
              localisation,
              ...(minPrice > 0 ? { minPrice } : {}),
              ...(price > 0 ? { maxPrice: price } : {}),
            })
          }
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
          }}
        >
          🔍 Szukaj
        </button>
      </div>


        {/* === LISTA OFERT === */}
        <div style={{ flexGrow: 1 }}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Ładowanie ofert...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                  justifyItems: "center",
                }}
              >
                {paginatedOffers.map((offer) => (
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

              {/* PAGINACJA */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "25px",
                  }}
                >
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      backgroundColor: page === 1 ? "#e9ecef" : "#fff",
                    }}
                  >
                    ◀ Poprzednia
                  </button>

                  <span>
                    Strona {page} z {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      backgroundColor: page === totalPages ? "#e9ecef" : "#fff",
                    }}
                  >
                    Następna ▶
                  </button>
                </div>
              )}
            </>
          )}

          {selectedOffer && (
            <OfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
