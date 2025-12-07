import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@techstore.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@techstore.com',
      name: 'Administrador',
      role: 'admin'
    }
  },
  {
    email: 'cliente@example.com',
    password: 'cliente123',
    user: {
      id: '2',
      email: 'cliente@example.com',
      name: 'Cliente Demo',
      role: 'client'
    }
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    if (found) {
      setUser(found.user);
      localStorage.setItem('user', JSON.stringify(found.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
