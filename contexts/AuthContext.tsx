import React, { createContext, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string) => boolean;
  signup: (username: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  signup: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);

  const login = (username: string): boolean => {
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    return false;
  };

  const signup = (username: string): boolean => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false; // User already exists
    }
    const newUser: User = { id: Date.now().toString(), username };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};