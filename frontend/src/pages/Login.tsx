import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/users.ts";

interface LoginProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const data = await loginUser({ login, password });

    // ✅ zapis tokena w localStorage
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    alert("Zalogowano pomyślnie!");
    setIsLoggedIn(true);
    navigate("/");
  } catch (err: any) {
    alert("Błąd logowania: " + err.message);
  }
};


  return (
    <div style={{ padding: "2rem" }}>
      <h1>Logowanie</h1>
      <input
        type="text"
        placeholder="Login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Zaloguj</button>
    </div>
  );
}
