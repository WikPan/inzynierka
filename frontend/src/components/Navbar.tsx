import { Link } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

export default function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {
  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("Wylogowano!");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "#333",
        color: "white",
      }}
    >
      <div>
        <Link to="/" style={{ color: "white", textDecoration: "none", marginRight: "1rem" }}>
          Strona główna
        </Link>
        <Link to="/oferta" style={{ color: "white", textDecoration: "none" }}>
          Oferta
        </Link>
      </div>

      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{ background: "none", color: "white", border: "1px solid white", padding: "0.3rem 0.7rem", cursor: "pointer" }}>
            Wyloguj
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none", marginRight: "1rem" }}>
              Logowanie
            </Link>
            <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
              Rejestracja
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}