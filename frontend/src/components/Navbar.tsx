import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // 🔹 Twoje logo

export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
}: {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}) {
  const navigate = useNavigate();

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

      {/* 🔹 Linki nawigacyjne */}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
        >
          Oferty
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              to="/add-offer"
              style={{
                color: "#333",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              Dodaj ofertę
            </Link>

            {/* 💬 Nowy przycisk do wiadomości */}
            <Link
              to="/messages"
              style={{
                color: "#333",
                textDecoration: "none",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              💬 Wiadomości
            </Link>

            <Link
              to="/profile"
              style={{
                color: "#333",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              Profil
            </Link>

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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#007bff")
              }
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
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#007bff")
              }
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
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#007bff";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#007bff";
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
