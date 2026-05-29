'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthUser,
  googleLoginRequest,
  isNetworkError,
  loginRequest,
  registerRequest,
} from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role?: string;
  avatarUrl?: string | null;
}

interface StoredUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

function readLocalUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];

  const storedUsers = localStorage.getItem('users');
  if (!storedUsers) return [];

  try {
    return JSON.parse(storedUsers) as StoredUser[];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = (nextUser: User, token?: string) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const loginWithLocalStorage = async (email: string, password: string) => {
    const foundUser = readLocalUsers().find(
      (storedUser) => storedUser.email === email && storedUser.password === password
    );

    if (!foundUser) return false;

    const nextUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      username: foundUser.username || foundUser.email,
      role: foundUser.role || 'USER',
    };
    persistSession(nextUser);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginRequest(email, password);
      persistSession(toUser(response.user), response.token);
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        return loginWithLocalStorage(email, password);
      }
      return false;
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    try {
      const response = await googleLoginRequest(idToken);
      persistSession(toUser(response.user), response.token);
      return true;
    } catch {
      return false;
    }
  };

  const registerWithLocalStorage = async (
    name: string,
    email: string,
    password: string
  ) => {
    const users = readLocalUsers();
    if (users.some((storedUser) => storedUser.email === email)) {
      return false;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      username: email,
      password,
      role: 'USER',
    };

    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    persistSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });
    return true;
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await registerRequest(name, email, password);
      persistSession(toUser(response.user), response.token);
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        return registerWithLocalStorage(name, email, password);
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, isLoading }}>
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
