import { Routes, Route, Navigate } from "react-router-dom";

import MainPage from "../pages/MainPage";
import Login from "../pages/LoginPage";
import Register from "../pages/SignUpPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import UserProfilePage from "./UserProfilePage";
import PayMent from "../pages/PayMent";
import CheckoutResult from "../pages/CheckoutResult";
import ProtectedRoute from "../components/commons/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar" element={<ForgotPasswordPage />} />
      {/* Retorno del pago internacional (callback de Bancamiga → frontend) */}
      <Route
        path="/checkout/success"
        element={<CheckoutResult outcome="approved" />}
      />
      <Route
        path="/checkout/failed"
        element={<CheckoutResult outcome="rejected" />}
      />
      <Route
        path="/checkout/cancelled"
        element={<CheckoutResult outcome="cancelled" />}
      />
      {/*Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/payment" element={<PayMent />} />
        <Route path="/perfil" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
