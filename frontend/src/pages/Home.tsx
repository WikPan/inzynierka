import { useEffect, useState } from "react";
import axios from "axios";
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
  avgRounded?: number | null; // ⭐ średnia
  ratingsCount?: number; // 💬 liczba opinii
};

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // 🔹 1. Pobieramy wszystkie oferty
        const { data } = await axios.get("http://localhost:3000/offers");

        // 🔹 2. Dla każdej oferty pobieramy statystyki ocen
        const offersWithStats = await Promise.all(
          data.map(async (offer: Offer) => {
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
              // jeśli brak recenzji lub błąd — wpisz puste
              return { ...offer, avgRounded: null, ratingsCount: 0 };
            }
          })
        );

        setOffers(offersWithStats);
      } catch (err) {
        console.error("❌ Błąd pobierania ofert:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Ładowanie ofert...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Oferty</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          justifyItems: "center",
        }}
      >
        {offers.map((offer) => (
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
                : ["/logo.png"] // 👈 lokalne logo z public/
            }
            rating={offer.avgRounded ?? undefined}
            ratingsCount={offer.ratingsCount ?? 0}
            onClick={() => setSelectedOffer(offer)}
          />
        ))}
      </div>

      {selectedOffer && (
        <OfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
      )}
    </div>
  );
}
