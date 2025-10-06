import { useState } from "react";

export default function Register() {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = () => {
    alert(`Zarejestrowano: ${login}, email: ${email}`);
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
