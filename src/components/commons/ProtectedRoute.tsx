import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizamos el contenido de la ruta (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
