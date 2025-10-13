import { useState } from "react";
import { registerUser } from "../api/users.ts";

export default function Register() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    try {
      const data = await registerUser({ login, email });
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Rejestracja</h1>
      <input
        type="text"
        placeholder="Login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleRegister}>Zarejestruj</button>
    </div>
  );
}
