import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type AdminUser = {
  id: string;
  login: string;
  email: string;
  avatarUrl?: string;
  accountType: string;
  reportsCount?: number;
};

type AdminOffer = {
  id: string;
  title: string;
  category: string;
  localisation: string;
  prize: number;
  blocked?: boolean;
  reportsCount?: number;
};

type Tab = "users" | "offers";
type FilterType = "all" | "active" | "blocked" | "reported";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [offers, setOffers] = useState<AdminOffer[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  // 🔐 Sprawdzenie uprawnień
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Musisz być zalogowany jako administrator.");
      navigate("/login");
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if ((res.data.accountType || "").toLowerCase() !== "admin") {
          alert("Brak dostępu. To sekcja tylko dla administratora!");
          navigate("/");
          return;
        }

        setCheckingAccess(false);
        await Promise.all([loadAllUsers(token), loadAllOffers(token)]);
      } catch {
        alert("Nie udało się zweryfikować uprawnień administratora.");
        navigate("/");
      }
    };

    checkAccess();
  }, [navigate]);

  // 📥 Pobieranie użytkowników
  async function loadAllUsers(authToken: string) {
    setLoading(true);
    try {
      const res = await axios.get<AdminUser[]>(
        "http://localhost:3000/admin/users",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUsers(res.data);
    } catch {
      alert("Błąd pobierania użytkowników.");
    } finally {
      setLoading(false);
    }
  }

  // 📥 Pobieranie ofert
  async function loadAllOffers(authToken: string) {
    try {
      const res = await axios.get<AdminOffer[]>(
        "http://localhost:3000/admin/offers",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setOffers(res.data);
    } catch {
      alert("Błąd pobierania ofert.");
    }
  }

  // 🚫 / 🔓 Blokowanie użytkownika
  async function handleToggleUser(id: string, isBlocked: boolean) {
    const msg = isBlocked
      ? "Czy na pewno chcesz ODBLOKOWAĆ tego użytkownika?"
      : "Czy na pewno chcesz ZABLOKOWAĆ tego użytkownika?";
    if (!window.confirm(msg)) return;

    try {
      const endpoint = isBlocked ? "unblock" : "block";
      await axios.patch(
        `http://localhost:3000/admin/users/${id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, accountType: isBlocked ? "USER" : "BLOCKED" } : u
        )
      );
    } catch {
      alert("Nie udało się zmienić statusu użytkownika.");
    }
  }

  // ❌ Usuń użytkownika
  async function handleDeleteUser(id: string) {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Nie udało się usunąć użytkownika.");
    }
  }

  // 🚫 / 🔓 Blokowanie ofert
  async function handleToggleOffer(id: string, isBlocked: boolean) {
    const msg = isBlocked
      ? "Czy na pewno chcesz ODBLOKOWAĆ tę ofertę?"
      : "Czy na pewno chcesz ZABLOKOWAĆ tę ofertę?";
    if (!window.confirm(msg)) return;

    try {
      const endpoint = isBlocked ? "unblock" : "block";
      await axios.patch(
        `http://localhost:3000/admin/offers/${id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, blocked: !isBlocked } : o))
      );
    } catch {
      alert("Nie udało się zmienić statusu oferty.");
    }
  }

  // ❌ Usuń ofertę
  async function handleDeleteOffer(id: string) {
    if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Nie udało się usunąć oferty.");
    }
  }

  // 🔎 Filtry
  const filteredUsers = users.filter((u) => {
    if (filter === "active") return u.accountType !== "BLOCKED";
    if (filter === "blocked") return u.accountType === "BLOCKED";
    if (filter === "reported") return (u.reportsCount ?? 0) > 0;
    return true;
  });

  const filteredOffers = offers.filter((o) => {
    if (filter === "active") return !o.blocked;
    if (filter === "blocked") return o.blocked;
    if (filter === "reported") return (o.reportsCount ?? 0) > 0;
    return true;
  });

  if (checkingAccess)
    return (
      <div style={{ padding: "60px", textAlign: "center", fontSize: "1.2rem" }}>
        🔍 Sprawdzanie uprawnień administratora...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9fbff, #e8f2ff)",
        display: "flex",
        justifyContent: "center",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1400px",
          gap: "25px",
        }}
      >
        {/* Lewy panel */}
        <div
          style={{
            width: "260px",
            background: "#fff",
            borderRadius: "18px",
            padding: "24px 20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#007bff",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            👑 Panel administratora
          </h3>

          <button
            onClick={() => setActiveTab("users")}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background:
                activeTab === "users"
                  ? "linear-gradient(90deg, #007bff, #00bfff)"
                  : "#f1f3f5",
              color: activeTab === "users" ? "#fff" : "#333",
              transition: "0.2s",
            }}
          >
            👤 Użytkownicy
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background:
                activeTab === "offers"
                  ? "linear-gradient(90deg, #007bff, #00bfff)"
                  : "#f1f3f5",
              color: activeTab === "offers" ? "#fff" : "#333",
              transition: "0.2s",
            }}
          >
            📦 Oferty
          </button>

          <hr />

          <label style={{ fontWeight: 600 }}>Filtruj:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              fontSize: "0.9rem",
            }}
          >
            <option value="all">Wszystkie</option>
            <option value="active">Aktywne</option>
            <option value="blocked">Zablokowane</option>
            <option value="reported">Zgłoszone</option>
          </select>

          <button
            onClick={() => Promise.all([loadAllUsers(token), loadAllOffers(token)])}
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(90deg, #00b85c, #28a745)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.25s",
              boxShadow: "0 4px 12px rgba(0,123,255,0.2)",
            }}
          >
            🔄 Odśwież dane
          </button>
        </div>

        {/* Prawa część */}
        <div
          style={{
            flexGrow: 1,
            background: "#fff",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              color: "#007bff",
              fontWeight: 700,
              fontSize: "1.6rem",
              marginBottom: "20px",
            }}
          >
            {activeTab === "users" ? "👤 Lista użytkowników" : "📦 Lista ofert"}
          </h3>

          {loading ? (
            <p>Ładowanie danych...</p>
          ) : activeTab === "users" ? (
            filteredUsers.length === 0 ? (
              <p>Brak użytkowników do wyświetlenia.</p>
            ) : (
              <UserTable
                users={filteredUsers}
                handleToggleUser={handleToggleUser}
                handleDeleteUser={handleDeleteUser}
              />
            )
          ) : filteredOffers.length === 0 ? (
            <p>Brak ofert do wyświetlenia.</p>
          ) : (
            <OfferTable
              offers={filteredOffers}
              handleToggleOffer={handleToggleOffer}
              handleDeleteOffer={handleDeleteOffer}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* 🧩 Pomocnicze komponenty */
function UserTable({
  users,
  handleToggleUser,
  handleDeleteUser,
}: {
  users: any[];
  handleToggleUser: (id: string, isBlocked: boolean) => void;
  handleDeleteUser: (id: string) => void;
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.95rem",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          <th style={{ padding: "8px", textAlign: "left" }}>Login</th>
          <th style={{ padding: "8px", textAlign: "left" }}>Email</th>
          <th style={{ padding: "8px" }}>Zgłoszenia</th>
          <th style={{ padding: "8px" }}>Typ konta</th>
          <th style={{ padding: "8px" }}>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}>{u.login}</td>
            <td style={{ padding: "8px" }}>{u.email}</td>
            <td style={{ textAlign: "center" }}>{u.reportsCount ?? 0}</td>
            <td
              style={{
                color: u.accountType === "BLOCKED" ? "red" : "#007bff",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {u.accountType.toLowerCase()}
            </td>
            <td style={{ display: "flex", gap: "6px", padding: "8px" }}>
              <button
                onClick={() =>
                  handleToggleUser(u.id, u.accountType === "BLOCKED")
                }
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: u.accountType === "BLOCKED"
                    ? "linear-gradient(90deg, #00b85c, #28a745)"
                    : "linear-gradient(90deg, #ffc107, #ff9800)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {u.accountType === "BLOCKED" ? "Odblokuj" : "Zablokuj"}
              </button>
              <button
                onClick={() => handleDeleteUser(u.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(90deg, #ff4b5c, #dc3545)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Usuń
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OfferTable({
  offers,
  handleToggleOffer,
  handleDeleteOffer,
}: {
  offers: any[];
  handleToggleOffer: (id: string, isBlocked: boolean) => void;
  handleDeleteOffer: (id: string) => void;
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.95rem",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          <th style={{ padding: "8px", textAlign: "left" }}>Tytuł</th>
          <th style={{ padding: "8px", textAlign: "left" }}>Kategoria</th>
          <th style={{ padding: "8px", textAlign: "left" }}>Lokalizacja</th>
          <th style={{ padding: "8px" }}>Zgłoszenia</th>
          <th style={{ padding: "8px" }}>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((o) => (
          <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}>{o.title}</td>
            <td style={{ padding: "8px" }}>{o.category}</td>
            <td style={{ padding: "8px" }}>{o.localisation}</td>
            <td style={{ textAlign: "center" }}>{o.reportsCount ?? 0}</td>
            <td style={{ display: "flex", gap: "6px", padding: "8px" }}>
              <button
                onClick={() => handleToggleOffer(o.id, o.blocked ?? false)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: o.blocked
                    ? "linear-gradient(90deg, #00b85c, #28a745)"
                    : "linear-gradient(90deg, #ffc107, #ff9800)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {o.blocked ? "Odblokuj" : "Zablokuj"}
              </button>
              <button
                onClick={() => handleDeleteOffer(o.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(90deg, #ff4b5c, #dc3545)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Usuń
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
