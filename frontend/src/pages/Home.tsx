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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Lokalizacja
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  // Paginacja
  const [page, setPage] = useState(1);
  const perPage = 12;

  // Sugestie
  const [titleSuggestions, setTitleSuggestions] =
    useState<TitleSuggestion[]>([]);
  const [locSuggestions, setLocSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);

  // Uniwersalny styl inputów
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d0d7e2",
    background: "#fafafa",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  useEffect(() => {
    fetchOffers({});
  }, []);

  async function fetchOffers(filters: any) {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(
        `http://localhost:3000/offers/search${params ? "?" + params : ""}`
      );
      setOffers(data);
    } catch (err) {
      console.error("❌ Błąd pobierania ofert:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      alert("Minimalna cena nie może być większa niż maksymalna.");
      return;
    }

    const filters: any = {};

    if (title.trim()) filters.title = title;
    if (category.trim()) filters.category = category;
    if (localisation.trim()) filters.localisation = localisation;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (coords) {
      filters.lat = coords.lat;
      filters.lon = coords.lon;
    }

    setPage(1);
    fetchOffers(filters);
  };

  const fetchTitleSuggestions = async (value: string) => {
    if (value.trim().length < 2) return setTitleSuggestions([]);
    const { data } = await axios.get(
      `http://localhost:3000/offers/suggest-titles?q=${encodeURIComponent(
        value
      )}`
    );
    setTitleSuggestions(data.slice(0, 5));
  };

  const fetchLocSuggestions = async (value: string) => {
    if (value.trim().length < 2) return setLocSuggestions([]);
    const res = await fetch(
      `http://localhost:3000/geo/autocomplete?query=${encodeURIComponent(
        value
      )}`
    );
    const data = await res.json();
    setLocSuggestions(data.slice(0, 5));
  };

  const handleUseMyLocation = () => {
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
          setCoords({ lat: latitude, lon: longitude });
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

  const totalPages = Math.ceil(offers.length / perPage);
  const paginatedOffers = offers.slice((page - 1) * perPage, page * perPage);

  return (
    <div
      style={{
        display: "flex",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        minHeight: "100vh",
        padding: "40px 0",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          width: "100%",
          gap: "32px",
          padding: "0 30px",
          alignItems: "flex-start",
        }}
      >
        {/* PANEL FILTRÓW */}
        <div
          style={{
            width: "360px",
            background: "#ffffff",
            borderRadius: "22px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            padding: "26px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>🔎</span>
            <h3
              style={{
                color: "#007bff",
                fontWeight: 700,
                margin: 0,
                fontSize: "1.35rem",
              }}
            >
              Filtry
            </h3>
          </div>

          {/* Tytuł */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.9rem", color: "#555" }}>Tytuł</label>
            <Autosuggest
              suggestions={titleSuggestions}
              onSuggestionsFetchRequested={({ value }) =>
                fetchTitleSuggestions(value)
              }
              onSuggestionsClearRequested={() => setTitleSuggestions([])}
              getSuggestionValue={(s) => s.title}
              renderSuggestion={(s) => (
                <div
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  {s.title}
                </div>
              )}
              inputProps={{
                placeholder: "Wpisz tytuł oferty",
                value: title,
                onChange: (_: any, { newValue }: any) => setTitle(newValue),
                style: inputStyle,
              }}
              theme={{
                suggestionsContainer: {
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 5px 18px rgba(0,0,0,0.12)",
                  marginTop: "6px",
                  overflow: "hidden",
                },
              }}
            />
          </div>

          {/* Kategoria */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.9rem", color: "#555" }}>Kategoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">Wszystkie kategorie</option>
              <option value="Pomoc">Pomoc</option>
              <option value="Kuchnia">Kuchnia</option>
              <option value="Ogród">Ogród</option>
              <option value="Prace dorywcze">Prace dorywcze</option>
              <option value="Transport">Transport</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          {/* Lokalizacja */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.9rem", color: "#555" }}>
              Lokalizacja
            </label>
            <Autosuggest
              suggestions={locSuggestions}
              onSuggestionsFetchRequested={({ value }) =>
                fetchLocSuggestions(value)
              }
              onSuggestionsClearRequested={() => setLocSuggestions([])}
              getSuggestionValue={(s) => {
                setCoords({ lat: s.lat, lon: s.lon });
                return s.label;
              }}
              renderSuggestion={(s) => (
                <div
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  {s.label}
                </div>
              )}
              inputProps={{
                placeholder: "Miasto / miejscowość",
                value: localisation,
                onChange: (_: any, { newValue }: any) =>
                  setLocalisation(newValue),
                style: inputStyle,
              }}
              theme={{
                suggestionsContainer: {
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 5px 18px rgba(0,0,0,0.12)",
                  marginTop: "6px",
                  overflow: "hidden",
                },
              }}
            />
          </div>

          {/* Przycisk lokalizacji */}
          <button
            onClick={handleUseMyLocation}
            disabled={useLocation}
            style={{
              marginTop: "4px",
              background: "linear-gradient(90deg, #007bff, #00bfff)",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "11px 14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
              boxShadow: "0 4px 12px rgba(0,123,255,0.35)",
            }}
          >
            {useLocation ? "⏳ Pobieranie lokalizacji..." : "📍 Użyj mojej lokalizacji"}
          </button>

          {/* Zakres ceny */}
          <div
            style={{
              marginTop: "4px",
              padding: "12px 12px 14px",
              borderRadius: "14px",
              background: "#f8fbff",
              border: "1px solid #e2ecf7",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>💰</span>
              <span
                style={{ fontWeight: 600, fontSize: "0.95rem", color: "#444" }}
              >
                Zakres ceny
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="od"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ ...inputStyle, padding: "10px 12px" }}
              />
              <input
                type="number"
                placeholder="do"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ ...inputStyle, padding: "10px 12px" }}
              />
            </div>
          </div>

          {/* Szukaj */}
          <button
            onClick={handleSearch}
            style={{
              marginTop: "4px",
              background: "linear-gradient(90deg, #00b85c, #28a745)",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "13px 16px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(40,167,69,0.35)",
            }}
          >
            🔍 Szukaj
          </button>
        </div>

        {/* LISTA OFERT */}
        <div style={{ flexGrow: 1 }}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Ładowanie...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                  alignItems: "stretch",
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

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ◀ Poprzednia
                  </button>

                  <span>
                    Strona {page} z {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Następna ▶
                  </button>
                </div>
              )}
            </>
          )}

          {selectedOffer && (
            <OfferModal
              offer={selectedOffer}
              onClose={() => setSelectedOffer(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
