import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

// 1. Define qué forma tiene tu usuario (lo que viene en el payload del JWT).
// El claim de id real es `sub`; `id`/`idUser` se aceptan como alternativas
// por si el backend cambia de nombre, igual que en el resto de la app.
interface UserPayload {
  sub?: string;
  id?: string;
  email: string;
  role: string;
  exp: number;
}

// 2. Define qué ofrece el contexto a otros componentes
interface AuthContextType {
  user: UserPayload | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const appBase = import.meta.env.BASE_URL || "/";

  //const navigate = useNavigate();
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);

    window.location.href = appBase;
  }, [appBase]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<UserPayload>(token);
    setUser(decoded);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook con validación de seguridad para TS

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
