import { useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";

type Suggestion = {
  label: string;     // "Gliwice, Śląskie"
  city: string;      // "Gliwice"
  state: string;     // "Śląskie"
  lat: number;
  lon: number;
};

export default function AddOffer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [category, setCategory] = useState("");

  const [localisation, setLocalisation] = useState(""); // label do wyświetlenia
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);

  // --- AUTOCOMPLETE (proxy przez backend) ---
  const getSuggestions = async (value: string): Promise<Suggestion[]> => {
    const q = value.trim();
    if (q.length < 2) return [];
    try {
      const res = await fetch(
        `http://localhost:3000/geo/autocomplete?query=${encodeURIComponent(q)}`
      );
      if (!res.ok) return [];
      const data: Suggestion[] = await res.json();
      // dodatkowo ogranicz liczbę wyników na froncie (opcjonalnie)
      return data.slice(0, 10);
    } catch (e) {
      console.error("❌ Błąd pobierania danych (geo/autocomplete):", e);
      return [];
    }
  };

  const onSuggestionsFetchRequested = async ({ value }: any) => {
    const results = await getSuggestions(value);
    setSuggestions(results);
  };

  const onSuggestionsClearRequested = () => setSuggestions([]);

  const getSuggestionValue = (s: Suggestion) => s.label;

  const renderSuggestion = (s: Suggestion) => (
    <div style={{ padding: "6px 10px", cursor: "pointer" }}>{s.label}</div>
  );

  const onSuggestionSelected = (
    _e: any,
    { suggestion }: { suggestion: Suggestion }
  ) => {
    setLocalisation(suggestion.label);
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
  };

  const inputProps = {
    placeholder: "Podaj miejscowość (np. Gliwice, Śląskie)",
    value: localisation,
    onChange: (_: any, { newValue }: any) => {
      setLocalisation(newValue);
      // kiedy użytkownik edytuje ręcznie – wyczyść współrzędne
      setLatitude(null);
      setLongitude(null);
    },
  };

  // --- Użyj mojej lokalizacji ---
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Twoja przeglądarka nie wspiera geolokalizacji.");
      return;
    }

    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(
            `http://localhost:3000/geo/reverse?lat=${lat}&lon=${lon}`
          );
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data: Suggestion = await res.json();

          setLocalisation(data.label);
          setLatitude(data.lat);
          setLongitude(data.lon);
        } catch (err) {
          console.error(err);
          alert("Nie udało się pobrać lokalizacji.");
        } finally {
          setUseLocation(false);
        }
      },
      (err) => {
        alert("Nie udało się pobrać lokalizacji: " + err.message);
        setUseLocation(false);
      }
    );
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const body: any = {
        title,
        description,
        prize: parseFloat(prize),
        category,
        localisation, // "Miasto, Województwo" – do wyświetlania
      };

      // Jeżeli mamy współrzędne – wyślij do backendu
      if (latitude != null && longitude != null) {
        body.latitude = latitude;
        body.longitude = longitude;
      }

      const res = await axios.post("http://localhost:3000/offers", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Oferta dodana:", res.data);
      alert("Oferta została pomyślnie dodana!");

      // wyczyść formularz
      setTitle("");
      setDescription("");
      setPrize("");
      setCategory("");
      setLocalisation("");
      setLatitude(null);
      setLongitude(null);
      setSuggestions([]);
    } catch (err: any) {
      console.error("❌ Błąd dodawania oferty:", err);
      alert("Nie udało się dodać oferty.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <h2>Dodaj nową ofertę</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Cena"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
        />

        <input
          type="text"
          placeholder="Kategoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label>Lokalizacja:</label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />

        <button type="button" onClick={handleUseMyLocation} disabled={useLocation}>
          {useLocation ? "Pobieranie..." : "Użyj mojej lokalizacji"}
        </button>

        <button type="submit">Dodaj ofertę</button>
      </form>
    </div>
  );
}
