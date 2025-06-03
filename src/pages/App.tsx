import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/MainPage";
import Login from "../pages/LoginPage";
import Register from "../pages/SignUpPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tkuido-frontend" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Routes>
    </Router>
  );
}

// function App() {
//   return (
//     <>
//       {/* <MainPage /> */}
//       {/* <LoginPage /> */}
//       <SignUpPage />
//     </>
//   );
// }

export default App;
