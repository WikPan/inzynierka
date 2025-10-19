import { useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";

export default function AddOffer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [category, setCategory] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [useLocation, setUseLocation] = useState(false);

  // 🔹 Pobieranie propozycji miast/wiosek z OpenStreetMap Nominatim
  const getSuggestions = async (value: string) => {
    const query = value.trim();

    if (query.length < 2) {
      return [];
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?countrycodes=pl&format=json&addressdetails=1&limit=20&featuretype=settlement&q=${encodeURIComponent(
        query
      )}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "inzynierka-app/1.0 (https://localhost)",
          "Accept-Language": "pl",
          "Referer": "https://localhost",
        },
      });

      const data = await response.json();
      const input = query.toLowerCase();

      const results = data
        .filter((item: any) => {
          const type = item.type;
          return (
            type === "city" ||
            type === "town" ||
            type === "village" ||
            type === "hamlet" ||
            type === "suburb"
          );
        })
        .map((item: any) => {
          const city =
            item.address.city ||
            item.address.town ||
            item.address.village ||
            item.address.suburb ||
            item.address.hamlet;
          const state = item.address.state || "";
          return city ? { city, state } : null;
        })
        .filter((v: any): v is { city: string; state: string } => !!v)
        // 🔹 tylko miasta zaczynające się od wpisanego tekstu
        .filter((v) => v.city.toLowerCase().startsWith(input))
        // 🔹 zamiana na string np. "Gliwice, Śląskie"
        .map((v) => `${v.city}${v.state ? ", " + v.state : ""}`)
        // 🔹 usunięcie duplikatów
        .filter((v, i, arr) => arr.indexOf(v) === i)
        // 🔹 maksymalnie 10 wyników
        .slice(0, 10);

      console.log("🔎 Wyniki filtrowane:", results);
      return results;
    } catch (error) {
      console.error("Błąd pobierania danych z Nominatim:", error);
      return [];
    }
  };

  const onSuggestionsFetchRequested = async ({ value }: any) => {
    const results = await getSuggestions(value);
    setSuggestions(results);
  };

  const onSuggestionsClearRequested = () => setSuggestions([]);

  const inputProps = {
    placeholder: "Podaj miejscowość (np. Gliwice, Śląskie)",
    value: localisation,
    onChange: (_: any, { newValue }: any) => setLocalisation(newValue),
  };

  // 🔹 Obsługa przycisku „Użyj mojej lokalizacji”
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Twoja przeglądarka nie wspiera geolokalizacji.");
      return;
    }

    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "pl",
                "User-Agent": "inzynierka-app/1.0",
              },
            }
          );
          const data = await res.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.suburb ||
            data.address.hamlet;
          const state = data.address.state || "";

          setLocalisation(`${city}${state ? ", " + state : ""}`);
        } catch (err) {
          alert("Nie udało się pobrać lokalizacji.");
          console.error(err);
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

  // 🔹 Wysłanie formularza do backendu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/offers",
        {
          title,
          description,
          prize: parseFloat(prize),
          category,
          localisation,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Oferta dodana:", res.data);
      alert("Oferta została pomyślnie dodana!");
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
          getSuggestionValue={(s: any) => s}
          renderSuggestion={(s: any) => (
            <div style={{ padding: "6px 10px", cursor: "pointer" }}>{s}</div>
          )}
          inputProps={inputProps}
        />

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={useLocation}
          style={{ marginTop: "10px" }}
        >
          {useLocation ? "Pobieranie..." : "Użyj mojej lokalizacji"}
        </button>

        <button type="submit" style={{ marginTop: "10px" }}>
          Dodaj ofertę
        </button>
      </form>
    </div>
  );
}
