'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthUser,
  CartLinePayload,
  googleLoginRequest,
  isNetworkError,
  loginRequest,
  mergeServerCart,
  registerRequest,
} from '@/lib/api';
import useCartStore from '@/stores/cartStore';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  detailAddress?: string | null;
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
  updateSession: (updatedUser: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function localAuthFallbackEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK === 'true';
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

function toUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    province: user.province,
    district: user.district,
    ward: user.ward,
    detailAddress: user.detailAddress,
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

function cartItemsToPayload(): CartLinePayload[] {
  return useCartStore
    .getState()
    .items.map((item) => ({
      productId: Number(item.id),
      variantId:
        typeof item.variantId === 'number' && Number.isFinite(item.variantId)
          ? item.variantId
          : undefined,
      quantity: item.quantity,
    }))
    .filter((item) => Number.isFinite(item.productId));
}

async function syncCartWithServer() {
  if (typeof window === 'undefined' || !localStorage.getItem('token')) return;
  try {
    const mergedItems = await mergeServerCart(cartItemsToPayload());
    useCartStore.getState().replaceCart(mergedItems);
  } catch {
    // Cart sync is best-effort; auth should not fail because cart reconciliation failed.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      try {
        if (storedToken || localAuthFallbackEnabled()) {
          setUser(JSON.parse(storedUser));
          void syncCartWithServer();
        } else {
          clearStoredSession();
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        clearStoredSession();
      }
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      setUser(null);
      clearStoredSession();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const persistSession = (nextUser: User, token?: string) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
    if (token) {
      localStorage.setItem('token', token);
      void syncCartWithServer();
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
      if (isNetworkError(error) && localAuthFallbackEnabled()) {
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
      if (isNetworkError(error) && localAuthFallbackEnabled()) {
        return registerWithLocalStorage(name, email, password);
      }
      return false;
    }
  };

  const updateSession = (updatedUser: Partial<User>) => {
    if (user) {
      const nextUser = { ...user, ...updatedUser };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, updateSession, isLoading }}>
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
