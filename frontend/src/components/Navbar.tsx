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
      {/* LEFT — Logo */}
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
          alt="Oofferto logo"
          style={{
            width: "58px",
            height: "58px",
            objectFit: "contain",
            filter: `
              drop-shadow(0 0 4px rgba(0, 160, 255, 0.55))
              drop-shadow(0 0 7px rgba(0, 110, 255, 0.35))
              drop-shadow(0 0 12px rgba(0, 180, 255, 0.25))
            `,
            transition: "0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter =
              "drop-shadow(0 0 6px rgba(0, 180, 255, 0.90)) drop-shadow(0 0 14px rgba(0, 160, 255, 0.60))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter =
              "drop-shadow(0 0 4px rgba(0, 160, 255, 0.55)) drop-shadow(0 0 7px rgba(0, 110, 255, 0.35)) drop-shadow(0 0 12px rgba(0, 180, 255, 0.25))";
          }}
        />

        <span
          style={{
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.5px",
          }}
        >
          Oofferto
        </span>
      </div>

      {/* RIGHT — Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.6rem",
          fontSize: "1.05rem",
          fontWeight: 500,
        }}
      >
        {/* Unified style for nav links */}
        {[
          { label: "Strona główna", path: "/" },
          { label: "Oferty", path: "/offers" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: "white",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {item.label}
          </Link>
        ))}

        {isLoggedIn ? (
          <>
            {accountType === "admin" ? (
              <>
                <Link
                  to="/admin"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  👑 Panel admina
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/add-offer"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  ➕ Dodaj ofertę
                </Link>

                <Link
                  to="/profile"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  👤 Profil
                </Link>
              </>
            )}

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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.35)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
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
                background: "rgba(255,255,255,0.25)",
                color: "white",
                borderRadius: "10px",
                padding: "8px 16px",
                textDecoration: "none",
                fontWeight: 600,
                transition: "0.25s",
                backdropFilter: "blur(6px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.35)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
              }
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
