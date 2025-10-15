import { Link } from "react-router-dom";

export default function Navbar({ isLoggedIn, setIsLoggedIn }: any) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/">Strona główna</Link>{" "}
      {isLoggedIn ? (
        <>
          <Link to="/add-offer">Dodaj ofertę</Link>{" "}
          <button onClick={handleLogout}>Wyloguj</button>
        </>
      ) : (
        <>
          <Link to="/login">Zaloguj</Link>{" "}
          <Link to="/register">Zarejestruj</Link>
        </>
      )}
    </nav>
  );
}
