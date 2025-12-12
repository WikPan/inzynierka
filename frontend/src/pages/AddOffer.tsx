import { useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";

type Suggestion = {
  label: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
};

export default function AddOffer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [category, setCategory] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);
  const token = localStorage.getItem("token");

  const MAX_TITLE = 60;
  const MAX_DESC = 500;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "#f9f9f9",
    color: "#333",
    fontSize: "0.95rem",
    outline: "none",
    height: "44px",
    boxSizing: "border-box",
  };

  const getSuggestions = async (value: string): Promise<Suggestion[]> => {
    const q = value.trim();
    if (q.length < 2) return [];
    try {
      const res = await fetch(
        `http://localhost:3000/geo/autocomplete?query=${encodeURIComponent(q)}`
      );
      if (!res.ok) return [];
      const data: Suggestion[] = await res.json();
      return data.slice(0, 10);
    } catch {
      return [];
    }
  };

  const onSuggestionsFetchRequested = async ({ value }: any) => {
    const results = await getSuggestions(value);
    setSuggestions(results);
  };

  const onSuggestionSelected = (
    _e: any,
    { suggestion }: { suggestion: Suggestion }
  ) => {
    setLocalisation(suggestion.label);
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) return alert("Brak wsparcia geolokalizacji.");

    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(
            `http://localhost:3000/geo/reverse?lat=${lat}&lon=${lon}`
          );
          const data: Suggestion = await res.json();
          setLocalisation(data.label);
          setLatitude(data.lat);
          setLongitude(data.lon);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Brak tokena — zaloguj się ponownie.");

    if (title.length > MAX_TITLE) return alert("Tytuł za długi!");
    if (description.length > MAX_DESC) return alert("Opis za długi!");

    try {
      await axios.post(
        "http://localhost:3000/offers",
        {
          title,
          description,
          prize: parseFloat(prize),
          category,
          localisation,
          latitude,
          longitude,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Oferta dodana!");

      setTitle("");
      setDescription("");
      setPrize("");
      setCategory("");
      setLocalisation("");
    } catch (err) {
      console.error(err);
      alert("❌ Nie udało się dodać oferty.");
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
          width: "100%",
          maxWidth: "700px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 50px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#007bff",
            fontWeight: 700,
            marginBottom: "30px",
            fontSize: "1.9rem",
          }}
        >
          ✨ Dodaj nową ofertę
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <input
            type="text"
            placeholder="Tytuł oferty"
            value={title}
            maxLength={MAX_TITLE}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Opis oferty..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESC}
            style={{
              ...inputStyle,
              minHeight: "120px",
              resize: "none",
              height: "auto",
            }}
          />

          <input
            type="text"
            placeholder="Cena (zł)"
            value={prize}
            onChange={(e) => setPrize(e.target.value.replace(",", "."))}
            style={inputStyle}
          />

          {/* KATEGORIA – ten sam styl, ta sama wysokość */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              ...inputStyle,
              paddingRight: "14px",
            }}
          >
            <option value="">Wybierz kategorię</option>
            <option value="Pomoc">Pomoc</option>
            <option value="Kuchnia">Kuchnia</option>
            <option value="Ogród">Ogród</option>
            <option value="Prace dorywcze">Prace dorywcze</option>
            <option value="Transport">Transport</option>
            <option value="Inne">Inne</option>
          </select>

          {/* LOKALIZACJA – Autosuggest wyrównany do inputów */}
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => setSuggestions([])}
            onSuggestionSelected={onSuggestionSelected}
            getSuggestionValue={(s) => s.label}
            renderSuggestion={(s) => (
              <div style={{ padding: "8px 12px", color: "#333" }}>{s.label}</div>
            )}
            theme={{
              container: {
                position: "relative",
                width: "100%",
              },
              input: {
                ...inputStyle,
              },
              suggestionsContainer: {
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "10px",
                marginTop: "4px",
                position: "absolute",
                width: "100%",
                zIndex: 10,
              },
              suggestionsList: {
                listStyleType: "none",
                padding: 0,
                margin: 0,
              },
            }}
            inputProps={{
              placeholder: "📍 Podaj miejscowość",
              value: localisation,
              onChange: (_: any, { newValue }: any) =>
                setLocalisation(newValue),
            }}
          />

          <button
            type="button"
            onClick={handleUseMyLocation}
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
            {useLocation ? "⏳ Pobieranie..." : "📌 Użyj mojej lokalizacji"}
          </button>

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
            ➕ Dodaj ofertę
          </button>
        </form>
      </div>
    </div>
  );
}
