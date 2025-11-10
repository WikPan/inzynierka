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

  // Pobierz dane użytkownika z localStorage
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
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        padding: "0.8rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* 🔹 Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "55px",
            height: "55px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* 🔹 Linki */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          fontSize: "1rem",
          fontWeight: 500,
        }}
      >
        <Link
          to="/"
          style={{
            color: "#333",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          Strona główna
        </Link>

        <Link
          to="/offers"
          style={{
            color: "#333",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          Oferty
        </Link>

        {isLoggedIn ? (
          <>
            {accountType === "admin" ? (
              <Link
                to="/admin"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                👑 Panel admina
              </Link>
            ) : (
              <>
                <Link
                  to="/add-offer"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  Dodaj ofertę
                </Link>

                <Link
                  to="/messages"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  💬 Wiadomości
                </Link>

                <Link
                  to="/profile"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  Profil
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              Wyloguj
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                borderRadius: "8px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Zaloguj się
            </Link>

            <Link
              to="/register"
              style={{
                border: "1px solid #007bff",
                color: "#007bff",
                borderRadius: "8px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
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
