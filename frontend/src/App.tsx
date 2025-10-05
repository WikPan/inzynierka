import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

useEffect(() => {
  fetch("http://localhost:3000/users")
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
}, []);



  return <h1>{msg || "Łączenie z backendem..."}</h1>;
}

export default App;
