import { useEffect, useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import { useParams, useNavigate } from "react-router-dom";

type Suggestion = {
  label: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
};

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    localisation: "",
    prize: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Pobieranie istniejących danych oferty
  useEffect(() => {
    axios
      .get(`http://localhost:3000/offers/${id}`)
      .then((res) => {
        const o = res.data;
        setForm({
          title: o.title ?? "",
          description: o.description ?? "",
          category: o.category ?? "",
          localisation: o.localisation ?? "",
          prize: o.prize?.toString() ?? "",
          latitude: o.latitude ?? null,
          longitude: o.longitude ?? null,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd ładowania oferty:", err);
        setLoading(false);
      });
  }, [id]);

  // 🔹 Obsługa zmian w polach
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Pobieranie sugestii lokalizacji
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
    setForm((prev) => ({
      ...prev,
      localisation: suggestion.label,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    }));
  };

  // 🔹 Obsługa przycisku "Użyj mojej lokalizacji"
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
          setForm((prev) => ({
            ...prev,
            localisation: data.label,
            latitude: data.lat,
            longitude: data.lon,
          }));
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

  // 🔹 Zapis edycji
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:3000/offers/${id}`,
        {
          title: form.title,
          description: form.description,
          category: form.category,
          localisation: form.localisation,
          prize: parseFloat(form.prize),
          latitude: form.latitude,
          longitude: form.longitude,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Oferta została zaktualizowana!");
      navigate("/offers");
    } catch (err) {
      console.error("Błąd edycji:", err);
      alert("❌ Nie udało się zaktualizować oferty.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          color: "#007bff",
        }}
      >
        ⏳ Ładowanie danych oferty...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f9f9f9 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "white",
          borderRadius: "18px",
          padding: "45px 55px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#007bff",
            fontWeight: 800,
            marginBottom: "25px",
            fontSize: "2rem",
            letterSpacing: "-0.5px",
          }}
        >
          ✏️ Edytuj ofertę
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <input
            name="title"
            type="text"
            placeholder="Tytuł oferty"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <textarea
            name="description"
            placeholder="Opis oferty..."
            value={form.description}
            onChange={handleChange}
            required
            style={{ ...inputStyle, minHeight: "130px", resize: "none" }}
          />

          <input
            name="prize"
            type="number"
            placeholder="Cena (zł)"
            value={form.prize}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Wybierz kategorię</option>
            <option value="Pomoc">Pomoc</option>
            <option value="Kuchnia">Kuchnia</option>
            <option value="Ogród">Ogród</option>
            <option value="Prace dorywcze">Prace dorywcze</option>
            <option value="Transport">Transport</option>
            <option value="Inne">Inne</option>
          </select>

          {/* 📍 Podpowiedzi lokalizacji */}
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => setSuggestions([])}
            onSuggestionSelected={onSuggestionSelected}
            getSuggestionValue={(s) => s.label}
            renderSuggestion={(s) => (
              <div style={{ padding: "10px 12px", color: "#333" }}>{s.label}</div>
            )}
            inputProps={{
              placeholder: "📍 Podaj miejscowość",
              value: form.localisation,
              onChange: (_: any, { newValue }: any) =>
                setForm((prev) => ({ ...prev, localisation: newValue })),
              style: inputStyle,
            }}
          />

          <button
            type="button"
            onClick={handleUseMyLocation}
            style={{
              ...buttonStyle,
              background: "linear-gradient(90deg, #4dabf7, #74c0fc)",
            }}
          >
            {useLocation ? "⏳ Pobieranie..." : "📌 Użyj mojej lokalizacji"}
          </button>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg, #adb5bd, #ced4da)",
              }}
            >
              ⬅️ Anuluj
            </button>

            <button
              type="submit"
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg, #007bff, #00bfff)",
              }}
            >
              💾 Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #cfd8dc",
  background: "#f9f9f9",
  color: "#333",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s ease",
};

const buttonStyle: React.CSSProperties = {
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "14px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.25s ease",
  boxShadow: "0 4px 12px rgba(0,123,255,0.4)",
  flex: 1,
};
