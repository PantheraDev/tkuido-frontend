import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./pages/App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";

// Contraparte de public/404.html: GitHub Pages sirve ese 404 para cualquier
// enlace profundo (por ejemplo /checkout/success, adonde redirige el callback
// de Bancamiga) y allí la ruta original se guarda en ?redirect=. Aquí se
// restaura ANTES de montar el router para que resuelva la ruta correcta.
const restoreDeepLink = () => {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (!redirect) return;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  window.history.replaceState(
    null,
    "",
    `${normalizedBase}${redirect.replace(/^\//, "")}`,
  );
};

restoreDeepLink();

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
