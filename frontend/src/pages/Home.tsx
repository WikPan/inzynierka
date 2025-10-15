import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/offers").then((res) => setOffers(res.data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Oferty</h1>
      {offers.map((offer: any) => (
        <div key={offer.id} style={{ borderBottom: "1px solid #ccc", margin: "1rem 0" }}>
          <h3>{offer.title}</h3>
          <p>{offer.description}</p>
          <p>
            <b>{offer.prize} zł</b> — {offer.localisation}
          </p>
        </div>
      ))}
    </div>
  );
}
