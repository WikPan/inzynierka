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
type FilterType = "all" | "active" | "blocked";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [offers, setOffers] = useState<AdminOffer[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  // 🔐 Sprawdzenie czy zalogowany user to admin
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

        const type = (res.data.accountType || "").toLowerCase();
        console.log("👑 accountType z /users/me:", type);

        if (type !== "admin") {
          alert("Brak dostępu. To sekcja tylko dla administratora!");
          navigate("/");
          return;
        }

        setCheckingAccess(false);
        await Promise.all([loadUsers(token), loadOffers(token)]);
      } catch (err) {
        console.error("❌ Błąd weryfikacji administratora:", err);
        alert("Nie udało się zweryfikować uprawnień administratora.");
        navigate("/");
      }
    };

    checkAccess();
  }, [navigate]);

  // 🔹 Pobieranie użytkowników
  async function loadUsers(authToken: string) {
    setLoading(true);
    try {
      const res = await axios.get<AdminUser[]>(
        "http://localhost:3000/admin/reported-users",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Błąd pobierania użytkowników:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Pobieranie ofert
  async function loadOffers(authToken: string) {
    try {
      const res = await axios.get<AdminOffer[]>(
        "http://localhost:3000/admin/reported-offers",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setOffers(res.data);
    } catch (err) {
      console.error("❌ Błąd pobierania ofert:", err);
    }
  }

  // 🔧 Akcje na użytkownikach
  async function handleToggleUser(id: string, isBlocked: boolean) {
    const confirmMsg = isBlocked
      ? "Czy na pewno chcesz ODBLOKOWAĆ tego użytkownika?"
      : "Czy na pewno chcesz ZABLOKOWAĆ tego użytkownika?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint = isBlocked ? "unblock" : "block";
      await axios.patch(
        `http://localhost:3000/admin/users/${id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                accountType: isBlocked ? "user" : "BLOCKED",
              }
            : u
        )
      );
    } catch (err) {
      console.error("❌ Błąd zmiany statusu użytkownika:", err);
      alert("Nie udało się zmienić statusu użytkownika.");
    }
  }

  async function handleDeleteUser(id: string) {
    if (!window.confirm("Czy na pewno chcesz USUNĄĆ tego użytkownika?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("❌ Błąd usuwania użytkownika:", err);
      alert("Nie udało się usunąć użytkownika.");
    }
  }

  // 🔧 Akcje na ofertach
  async function handleToggleOffer(id: string, isBlocked: boolean) {
    const confirmMsg = isBlocked
      ? "Czy na pewno chcesz ODBLOKOWAĆ tę ofertę?"
      : "Czy na pewno chcesz ZABLOKOWAĆ tę ofertę?";
    if (!window.confirm(confirmMsg)) return;

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
    } catch (err) {
      console.error("❌ Błąd zmiany statusu oferty:", err);
      alert("Nie udało się zmienić statusu oferty.");
    }
  }

  async function handleDeleteOffer(id: string) {
    if (!window.confirm("Czy na pewno chcesz USUNĄĆ tę ofertę?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("❌ Błąd usuwania oferty:", err);
      alert("Nie udało się usunąć oferty.");
    }
  }

  // 🔎 Filtruj dane wg aktywności
  const filteredUsers = users.filter((u) => {
    if (filter === "active") return u.accountType !== "BLOCKED";
    if (filter === "blocked") return u.accountType === "BLOCKED";
    return true;
  });

  const filteredOffers = offers.filter((o) => {
    if (filter === "active") return !o.blocked;
    if (filter === "blocked") return o.blocked;
    return true;
  });

  if (checkingAccess) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2rem" }}>
        Sprawdzanie uprawnień administratora...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#f5f7fb",
        padding: "30px 0",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          width: "100%",
          gap: "25px",
          padding: "0 30px",
        }}
      >
        {/* LEWY PANEL */}
        <div
          style={{
            width: "260px",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#007bff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            👑 Admin Panel
          </h3>

          <button
            onClick={() => setActiveTab("users")}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              textAlign: "left",
              backgroundColor:
                activeTab === "users" ? "#007bff" : "#f1f3f5",
              color: activeTab === "users" ? "#fff" : "#333",
            }}
          >
            👤 Użytkownicy
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              textAlign: "left",
              backgroundColor:
                activeTab === "offers" ? "#007bff" : "#f1f3f5",
              color: activeTab === "offers" ? "#fff" : "#333",
            }}
          >
            📦 Oferty
          </button>

          {/* 🔽 Filtr */}
          <hr style={{ margin: "10px 0" }} />
          <label style={{ fontWeight: 600 }}>Filtruj:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">Wszystkie</option>
            <option value="active">Aktywne</option>
            <option value="blocked">Zablokowane</option>
          </select>
        </div>

        {/* PRAWA STRONA */}
        <div
          style={{
            flexGrow: 1,
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            padding: "24px 24px 30px",
          }}
        >
          {loading ? (
            <p>Ładowanie...</p>
          ) : activeTab === "users" ? (
            <>
              <h3 style={{ marginBottom: "16px" }}>
                👤 Użytkownicy ze zgłoszeniami
              </h3>
              {filteredUsers.length === 0 ? (
                <p>Brak pasujących użytkowników.</p>
              ) : (
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
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}>{u.login}</td>
                        <td style={{ padding: "8px" }}>{u.email}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {u.reportsCount ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textTransform: "lowercase",
                            color:
                              u.accountType === "BLOCKED"
                                ? "red"
                                : "#007bff",
                          }}
                        >
                          {u.accountType}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleToggleUser(u.id, u.accountType === "BLOCKED")
                            }
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor:
                                u.accountType === "BLOCKED"
                                  ? "#28a745"
                                  : "#ffc107",
                              color:
                                u.accountType === "BLOCKED" ? "#fff" : "#000",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            {u.accountType === "BLOCKED"
                              ? "Odblokuj"
                              : "Zablokuj"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: "16px" }}>
                📦 Oferty ze zgłoszeniami
              </h3>
              {filteredOffers.length === 0 ? (
                <p>Brak pasujących ofert.</p>
              ) : (
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
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Kategoria
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Lokalizacja
                      </th>
                      <th style={{ padding: "8px" }}>Zgłoszenia</th>
                      <th style={{ padding: "8px" }}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((o) => (
                      <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}>{o.title}</td>
                        <td style={{ padding: "8px" }}>{o.category}</td>
                        <td style={{ padding: "8px" }}>{o.localisation}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {o.reportsCount ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleToggleOffer(o.id, o.blocked ?? false)
                            }
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: o.blocked
                                ? "#28a745"
                                : "#ffc107",
                              color: o.blocked ? "#fff" : "#000",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            {o.blocked ? "Odblokuj" : "Zablokuj"}
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(o.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
