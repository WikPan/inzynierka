import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
}: {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}) {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const accountType = user?.accountType?.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav
      style={{
        background:
          "linear-gradient(90deg, rgba(0,123,255,0.9), rgba(0,191,255,0.85))",
        color: "#fff",
        padding: "0.9rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* 🔹 Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <img
          src={logo}
          alt="Oofferto logo"
          style={{
            width: "52px",
            height: "52px",
            objectFit: "contain",
          }}
        />
        <span
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.5px",
          }}
        >
          Oofferto
        </span>
      </div>

      {/* 🔹 Linki */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.8rem",
          fontSize: "1rem",
          fontWeight: 500,
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
        >
          Strona główna
        </Link>

        <Link
          to="/offers"
          style={{
            color: "white",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
        >
          Oferty
        </Link>

        {isLoggedIn ? (
          <>
            {accountType === "admin" ? (
              <>
                <Link
                  to="/admin"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  👑 Panel admina
                </Link>

                <Link
                  to="/messages"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  💬 Wiadomości
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/add-offer"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  ➕ Dodaj ofertę
                </Link>

                <Link
                  to="/messages"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  💬 Wiadomości
                </Link>

                <Link
                  to="/profile"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d9f1ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  👤 Profil
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(90deg, #007bff, #00bfff)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "8px 18px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,123,255,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Wyloguj
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                background: "linear-gradient(90deg, #007bff, #00bfff)",
                color: "white",
                borderRadius: "10px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
                boxShadow: "0 4px 10px rgba(0,123,255,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Zaloguj się
            </Link>

            <Link
              to="/register"
              style={{
                border: "2px solid white",
                color: "white",
                borderRadius: "10px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#007bff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "white";
              }}
            >
              Zarejestruj się
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
