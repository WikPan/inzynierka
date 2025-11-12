import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage"; // 🔹 to będzie twoja strona główna z formularzem
import Home from "./pages/Home"; // 🔹 a to twoja strona z ofertami
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddOffer from "./pages/AddOffer";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ReviewPage from "./pages/ReviewPage";
import Terms from "./components/Terms";
import { useState } from "react";
import MessagesPage from "./pages/MessagesPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div>
      {/* Pasek nawigacji */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        {/* 🔹 Strona główna (formularz kontaktowy i opis projektu) */}
        <Route path="/" element={<HomePage />} />

        {/* 🔹 Oferty — osobna podstrona */}
        <Route path="/offers" element={<Home />} />

        {/* 🔹 Recenzje ofert */}
        <Route path="/reviews/:offerId" element={<ReviewPage />} />

        {/* 🔹 Logowanie i rejestracja */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        {/* 🔹 Regulamin */}
        <Route path="/terms" element={<Terms />} />

        {/* 🔹 Dodawanie oferty — tylko dla zalogowanych */}
        <Route
          path="/add-offer"
          element={isLoggedIn ? <AddOffer /> : <Navigate to="/login" replace />}
        />

        {/* 🔹 Profil użytkownika */}
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
        />

        {/* 🔹 Panel admina */}
        <Route path="/admin" element={<AdminPage />} />

        {/* 🔹 Wiadomości — tylko dla zalogowanych */}
        <Route
          path="/messages"
          element={isLoggedIn ? <MessagesPage /> : <Navigate to="/login" replace />}
        />

        {/* 🔹 Zmiana hasła */}
        <Route
          path="/change-password"
          element={
            isLoggedIn ? <ChangePasswordPage /> : <Navigate to="/login" replace />
          }
        />

        {/* 🔹 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
