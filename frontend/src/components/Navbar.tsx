import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";

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
  const accountType = user?.accountType?.toLowerCase(); // "user" | "admin"

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navLinkStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "0.2s",
  };

  const hoverOn = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) =>
    (e.currentTarget.style.background = "rgba(255,255,255,0.18)");

  const hoverOff = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) =>
    (e.currentTarget.style.background = "transparent");

  return (
    <nav
      style={{
        background: "linear-gradient(90deg, #0088ff, #00c7ff)",
        color: "#fff",
        padding: "0.9rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 14px rgba(0,0,0,0.15)",
      }}
    >
      {/* LEFT — LOGO */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img
          src={logo}
          alt="Oofferto logo"
          style={{
            width: "58px",
            height: "58px",
            objectFit: "contain",
            filter:
              "drop-shadow(0 0 4px rgba(0, 160, 255, 0.55)) drop-shadow(0 0 10px rgba(0, 180, 255, 0.35))",
          }}
        />
        <span style={{ fontSize: "1.45rem", fontWeight: 700 }}>Oofferto</span>
      </div>

      {/* RIGHT — NAV */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.4rem",
          fontSize: "1.05rem",
          fontWeight: 500,
        }}
      >
        {/* PUBLIC */}
        <Link to="/" style={navLinkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
          Strona główna
        </Link>

        <Link
          to="/offers"
          style={navLinkStyle}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          Oferty
        </Link>

        {/* LOGGED (USER + ADMIN) */}
        {isLoggedIn && (
          <>
            <Link
              to="/messages"
              style={navLinkStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              💬 Wiadomości
            </Link>

            <Link
              to="/add-offer"
              style={navLinkStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              ➕ Dodaj ofertę
            </Link>
          </>
        )}

        {/* USER ONLY */}
        {isLoggedIn && accountType === "user" && (
          <Link
            to="/profile"
            style={navLinkStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            👤 Profil
          </Link>
        )}

        {/* ADMIN ONLY */}
        {isLoggedIn && accountType === "admin" && (
          <Link
            to="/admin"
            style={navLinkStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            👑 Panel admina
          </Link>
        )}

        {/* AUTH */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.25)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "8px 18px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.25s",
              backdropFilter: "blur(6px)",
            }}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            Wyloguj
          </button>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                background: "rgba(255,255,255,0.25)",
                color: "white",
                borderRadius: "10px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
                transition: "0.25s",
              }}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
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
                transition: "0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#0088ff";
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
