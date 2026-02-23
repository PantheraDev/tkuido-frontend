import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./pages/App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
  <BrowserRouter basename="/tkuido-frontend/">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
