import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "../pages/MainPage";
import Login from "../pages/LoginPage";
import Register from "../pages/SignUpPage";
import UserProfilePage from "./UserProfilePage";
import PayMent from "../pages/PayMent";

function App() {
  return (
    <Router basename="/tkuido-frontend">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/payment" element={<PayMent />} />
        <Route path="/perfil" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
