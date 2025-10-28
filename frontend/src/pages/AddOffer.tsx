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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localisation, setLocalisation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [useLocation, setUseLocation] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [descError, setDescError] = useState(false);
  const token = localStorage.getItem("token");

  const MAX_TITLE = 60;
  const MAX_DESC = 500;

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

  const onSuggestionsClearRequested = () => setSuggestions([]);

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
    onChange: (_: any, { newValue }: any) => setLocalisation(newValue),
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 3) {
      alert("Maksymalnie 3 zdjęcia!");
      return;
    }
    const newFiles = [...selectedImages, ...files].slice(0, 3);
    setSelectedImages(newFiles);
    setPreviewUrls(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i: number) => {
    setSelectedImages(selectedImages.filter((_, idx) => idx !== i));
    setPreviewUrls(previewUrls.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length > MAX_TITLE) return setTitleError(true);
    if (description.length > MAX_DESC) return setDescError(true);

    try {
      if (!token) throw new Error("Brak tokena (zaloguj się ponownie)");

      const body: any = {
        title,
        description,
        prize: parseFloat(prize),
        category,
        localisation,
        latitude,
        longitude,
      };

      const offerRes = await axios.post("http://localhost:3000/offers", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const offerId = offerRes.data.id;
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((f) => formData.append("files", f));
        await axios.post(
          `http://localhost:3000/offers/${offerId}/upload-images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("✅ Oferta dodana pomyślnie!");
      setTitle("");
      setDescription("");
      setPrize("");
      setCategory("");
      setLocalisation("");
      setSelectedImages([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error(err);
      alert("❌ Nie udało się dodać oferty.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "60px auto",
        backgroundColor: "#fff",
        padding: "40px 50px",
        borderRadius: "20px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#007bff",
          fontWeight: "bold",
          marginBottom: "25px",
          fontSize: "1.8rem",
        }}
      >
        ✨ Dodaj nową ofertę
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px" }}
      >
        {/* Tytuł */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Tytuł oferty"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(false);
            }}
            maxLength={MAX_TITLE}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              transition: "border-color 0.2s",
            }}
          />
          <small style={{ color: title.length >= MAX_TITLE ? "red" : "#666" }}>
            {title.length}/{MAX_TITLE}
          </small>
          {titleError && (
            <div style={{ color: "red", fontSize: "0.9rem" }}>
              Przekroczono maksymalną długość tytułu.
            </div>
          )}
        </div>

        {/* Opis */}
        <div style={{ position: "relative" }}>
          <textarea
            placeholder="Opis oferty..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDescError(false);
            }}
            maxLength={MAX_DESC}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              resize: "none",
              minHeight: "100px",
            }}
          />
          <small style={{ color: description.length >= MAX_DESC ? "red" : "#666" }}>
            {description.length}/{MAX_DESC}
          </small>
          {descError && (
            <div style={{ color: "red", fontSize: "0.9rem" }}>
              Przekroczono maksymalną długość opisu.
            </div>
          )}
        </div>

{/* Cena */}
<div style={{ position: "relative" }}>
  <input
    type="text" // <-- zmiana na text, ale walidujemy tylko cyfry!
    placeholder="Cena (zł)"
    value={prize}
    onChange={(e) => {
      const val = e.target.value;
      // Pozwalamy tylko cyfry i ewentualnie kropkę
      if (/^[0-9]*([.,][0-9]*)?$/.test(val) || val === "") {
        setPrize(val.replace(",", ".")); // zamieniamy przecinek na kropkę
      }
    }}
    required
    inputMode="decimal" // pokazuje klawiaturę numeryczną na telefonach
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.2s",
    }}
  />
  <small style={{ color: "#555", marginTop: "4px", display: "block" }}>
    💡 Ustawienie ceny na <b>0 zł</b> oznacza, że oferta jest{" "}
    <b>bezpłatna</b>.
  </small>
</div>


        {/* Kategoria */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "1rem",
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

   {/* 📸 Zdjęcia */}
<div
  style={{
    backgroundColor: "#f9fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
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
    📸 Zdjęcia (max 3)
  </label>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    <span style={{ color: "#666", fontSize: "0.9rem" }}>
      {selectedImages.length > 0
        ? `${selectedImages.length} wybrane`
        : "Nie wybrano plików"}
    </span>

    <label
      htmlFor="imageUpload"
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: 500,
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "#0056b3")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "#007bff")
      }
    >
      Wybierz zdjęcia
    </label>
    <input
      id="imageUpload"
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      style={{ display: "none" }}
    />
  </div>

  {/* Podglądy zdjęć */}
  {previewUrls.length > 0 && (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "12px",
        flexWrap: "wrap",
      }}
    >
      {previewUrls.map((url, i) => (
        <div key={i} style={{ position: "relative" }}>
          <img
            src={url}
            alt={`preview-${i}`}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "10px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />
          <button
            type="button"
            onClick={() => removeImage(i)}
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>


        {/* 📍 Lokalizacja */}
        <div
          style={{
            backgroundColor: "#f9fafc",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
          }}
        >
          <label
            style={{
              fontWeight: 600,
              display: "block",
              marginBottom: "8px",
              color: "#333",
            }}
          >
            📍 Lokalizacja
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              onSuggestionSelected={onSuggestionSelected}
              getSuggestionValue={(s) => s.label}
              renderSuggestion={(s) => (
                <div
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {s.label}
                </div>
              )}
              inputProps={{
                placeholder: "Podaj miejscowość (np. Gliwice, Śląskie)",
                value: localisation,
                onChange: (_: any, { newValue }: any) =>
                  setLocalisation(newValue),
                style: {
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  width: "100%",
                },
              }}
            />

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={useLocation}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px 16px",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#007bff")
              }
            >
              {useLocation ? "⏳ Pobieranie..." : "📌 Użyj mojej lokalizacji"}
            </button>
          </div>
        </div>

        {/* 🟦 Przycisk końcowy */}
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "14px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "10px",
            transition: "background-color 0.25s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          ➕ Dodaj ofertę
        </button>
      </form>
    </div>
  );
}
