import { useState } from "react";
import axios from "axios";

export default function AddOffer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [category, setCategory] = useState("");
  const [localisation, setLocalisation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // token z logowania

    try {
      await axios.post(
        "http://localhost:3000/offers",
        { title, description, prize, category, localisation },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Oferta dodana pomyślnie!");
      setTitle("");
      setDescription("");
      setPrize("");
      setCategory("");
      setLocalisation("");
    } catch (err) {
      console.error(err);
      alert("Błąd podczas dodawania oferty.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
      <h2>Dodaj ofertę</h2>
      <input placeholder="Tytuł" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input placeholder="Cena" type="number" value={prize} onChange={(e) => setPrize(e.target.value)} />
      <input placeholder="Kategoria" value={category} onChange={(e) => setCategory(e.target.value)} />
      <input placeholder="Lokalizacja" value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
      <button type="submit">Dodaj ofertę</button>
    </form>
  );
}
