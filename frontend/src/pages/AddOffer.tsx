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
  const token = localStorage.getItem("token");

  // ------------------------
  // AUTOCOMPLETE
  // ------------------------
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
      setLatitude(null);
      setLongitude(null);
    },
  };

  // ------------------------
  // GEOLOKALIZACJA
  // ------------------------
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

  // ------------------------
  // OBSŁUGA ZDJĘĆ
  // ------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 3) {
      alert("Możesz dodać maksymalnie 3 zdjęcia!");
      return;
    }

    const newFiles = [...selectedImages, ...files].slice(0, 3);
    setSelectedImages(newFiles);
    setPreviewUrls(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  // ------------------------
  // SUBMIT
  // ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) throw new Error("Brak tokena (zaloguj się ponownie)");

      // 1️⃣ Stwórz ofertę
      const body: any = {
        title,
        description,
        prize: parseFloat(prize),
        category,
        localisation,
      };
      if (latitude != null && longitude != null) {
        body.latitude = latitude;
        body.longitude = longitude;
      }

      const offerRes = await axios.post("http://localhost:3000/offers", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const offerId = offerRes.data.id;
      console.log("✅ Oferta utworzona:", offerRes.data);

      // 2️⃣ Jeśli wybrano zdjęcia — wyślij je
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((file) => formData.append("files", file));

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
        console.log("✅ Zdjęcia przesłane do oferty");
      }

      alert("✅ Oferta dodana pomyślnie!");
      // reset formularza
      setTitle("");
      setDescription("");
      setPrize("");
      setCategory("");
      setLocalisation("");
      setLatitude(null);
      setLongitude(null);
      setSelectedImages([]);
      setPreviewUrls([]);
    } catch (err: any) {
      console.error("❌ Błąd dodawania oferty:", err);
      alert("Nie udało się dodać oferty.");
    }
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <h2>Dodaj nową ofertę</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Cena"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Kategoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        {/* 🔹 Upload zdjęć */}
        <label style={{ marginTop: "10px", display: "block" }}>
          Zdjęcia (max 3):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{ marginTop: "5px" }}
        />

        {/* 🔹 Podgląd zdjęć */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
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
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <label style={{ marginTop: "15px", display: "block" }}>
          Lokalizacja:
        </label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
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

        <button
          type="submit"
          style={{
            display: "block",
            marginTop: "20px",
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Dodaj ofertę
        </button>
      </form>
    </div>
  );
}
