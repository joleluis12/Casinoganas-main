import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, signIn, signUp, signOut, getUserProfile } from "../Apis/supabase";
import { User } from "../types/user";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 👇 Aquí defines el contexto
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// ✅ 👇 AGREGA ESTA LÍNEA NUEVA
export { AuthContext }; // <-- Esto permite importarlo en useAuth.ts sin error

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const profile = await getUserProfile(data.session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    await signIn(email, password);
    await refreshUser();
  };

  const register = async (email: string, password: string) => {
    await signUp(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Mantén esto si lo usas directamente también
export const useAuth = () => useContext(AuthContext);
