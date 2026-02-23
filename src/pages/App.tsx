import { Routes, Route } from "react-router-dom";

import MainPage from "../pages/MainPage";
import Login from "../pages/LoginPage";
import Register from "../pages/SignUpPage";
import UserProfilePage from "./UserProfilePage";
import PayMent from "../pages/PayMent";
import ProtectedRoute from "../components/commons/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      {/*Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/payment" element={<PayMent />} />
        <Route path="/perfil" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
