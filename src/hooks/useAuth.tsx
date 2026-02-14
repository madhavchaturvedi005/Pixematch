import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '@/lib/authService';

interface User {
  id: number;
  username: string;
  email: string;
  age: number;
  gender: string;
  description?: string;
  interests?: string[];
  image1?: string;
  image2?: string;
  image3?: string;
  country?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  updateProfile: (data: any) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔄 Initializing auth...');
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token found:', !!token);
        
        if (token) {
          console.log('📥 Fetching current user...');
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            console.log('✅ User loaded:', currentUser.username);
            setUser(currentUser);
            setIsLoggedIn(true);
          } else {
            console.log('❌ No user data, logging out');
            authService.logout();
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          console.log('ℹ️ No token found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authService.logout();
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        console.log('✅ Auth initialization complete');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateProfile = (data: any) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const setUserAndLogin = (userData: User | null) => {
    console.log('🔄 setUserAndLogin called with:', userData);
    setUser(userData);
    setIsLoggedIn(!!userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, updateProfile, logout, setUser: setUserAndLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export type AuthUser = User;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};