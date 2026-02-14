import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  interests?: string[];
  values?: string[];
  personalityTags?: string[];
  idealPartnerDescription?: string;
  mode?: "dating" | "friendship" | "study" | "co-founder";
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("pixematch_user");
    return saved ? JSON.parse(saved) : null;
  });

  const isLoggedIn = !!user;

  const login = useCallback((email: string, _password: string) => {
    const saved = localStorage.getItem("pixematch_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === email) {
        // Add ID if it doesn't exist (for existing users)
        if (!parsed.id) {
          parsed.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("pixematch_user", JSON.stringify(parsed));
        }
        setUser(parsed);
        return true;
      }
    }
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: AuthUser = { id: userId, name: email.split("@")[0], email };
    setUser(newUser);
    localStorage.setItem("pixematch_user", JSON.stringify(newUser));
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, _password: string) => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: AuthUser = { id: userId, name, email };
    setUser(newUser);
    localStorage.setItem("pixematch_user", JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("pixematch_user");
  }, []);

  const updateProfile = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("pixematch_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
