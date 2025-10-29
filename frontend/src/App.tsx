import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddOffer from "./pages/AddOffer";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ReviewPage from "./pages/ReviewPage";
import Terms from "./components/Terms"; // ✅ nowa strona regulaminu
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token") // jeśli token istnieje = zalogowany
  );

  return (
    <div>
      {/* ✅ Pasek nawigacji widoczny wszędzie */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {/* ✅ Wszystkie trasy aplikacji */}
      <Routes>
        {/* Strona główna */}
        <Route path="/" element={<Home />} />

        {/* Recenzje ofert */}
        <Route path="/reviews/:offerId" element={<ReviewPage />} />

        {/* Logowanie i rejestracja */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Nowa trasa: regulamin */}
        <Route path="/terms" element={<Terms />} />

        {/* 🔹 Tylko zalogowani mogą dodawać ofertę */}
        <Route
          path="/add-offer"
          element={isLoggedIn ? <AddOffer /> : <Navigate to="/login" replace />}
        />

        {/* 🔹 Tylko zalogowani mogą zobaczyć profil */}
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
        />

        {/* 🔹 Zmiana hasła też tylko po zalogowaniu */}
        <Route
          path="/change-password"
          element={
            isLoggedIn ? <ChangePasswordPage /> : <Navigate to="/login" replace />
          }
        />

        {/* Fallback: przekierowanie na stronę główną */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
