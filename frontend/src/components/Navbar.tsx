import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn, setIsLoggedIn }: { isLoggedIn: boolean, setIsLoggedIn: (val: boolean) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div onClick={() => navigate("/")} className="cursor-pointer font-bold text-xl">
        Inżynierka
      </div>

      <div className="flex gap-4 items-center">
        <Link to="/offers" className="hover:text-blue-300">Oferty</Link>
        {isLoggedIn ? (
          <>
            <Link to="/add-offer" className="hover:text-blue-300">Dodaj ofertę</Link>
            <Link to="/profile" className="hover:text-blue-300">Profil</Link>
            <button onClick={handleLogout} className="hover:text-red-400">Wyloguj</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-300">Zaloguj się</Link>
            <Link to="/register" className="hover:text-blue-300">Zarejestruj się</Link>
          </>
        )}
      </div>
    </nav>
  );
}
