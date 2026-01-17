import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/MainPage";
import Login from "../pages/LoginPage";
import Register from "../pages/SignUpPage";
import UserProfilePage from "./UserProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tkuido-frontend" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
