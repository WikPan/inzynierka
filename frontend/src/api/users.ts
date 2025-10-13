interface RegisterData {
  login: string;
  email: string;
}

interface LoginData {
  login: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Błąd podczas rejestracji");
  return res.json();
};

export const loginUser = async (data: LoginData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Niepoprawny login lub hasło");
  return res.json();
};
