import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddOffer from "./pages/AddOffer";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useState } from "react";
import ReviewPage from "./pages/ReviewPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token") // jeśli token istnieje = zalogowany
  );

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/reviews/:offerId" element={<ReviewPage />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

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
      </Routes>
    </div>
  );
}
