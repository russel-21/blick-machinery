'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, db, UserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    country?: string;
    company?: string;
    rememberMe: boolean;
  }) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserRole: (userId: string, role: UserRole) => void;
  adminResetPassword: (userId: string) => string; // returns new generated password
  refreshUserList: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const session = db.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const users = db.getUsers();
    const passwords = db.getPasswords();
    
    const matchingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (matchingUser && passwords[matchingUser.email] === password) {
      setUser(matchingUser);
      db.setSession(matchingUser, rememberMe);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate Google popup & redirect
    
    // Simulate successful Google login
    const email = 'google.user@gmail.com';
    const name = 'Visiteur Google';
    const users = db.getUsers();
    
    let matchingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchingUser) {
      // Create new user if not exist
      matchingUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'visitor',
        isGoogleUser: true,
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...users, matchingUser];
      db.saveUsers(updatedUsers);
    }
    
    setUser(matchingUser);
    db.setSession(matchingUser, true);
    setLoading(false);
    return true;
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    country?: string;
    company?: string;
    rememberMe: boolean;
  }): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const users = db.getUsers();
    
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      setLoading(false);
      return false; // Email already exists
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country || 'Cameroun',
      company: data.company,
      role: 'visitor', // Default role is visitor
      createdAt: new Date().toISOString()
    };

    // Save user
    const updatedUsers = [...users, newUser];
    db.saveUsers(updatedUsers);

    // Save password
    if (data.password) {
      const passwords = db.getPasswords();
      passwords[data.email] = data.password;
      db.savePasswords(passwords);
    }

    setUser(newUser);
    db.setSession(newUser, data.rememberMe);
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    db.setSession(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = db.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    return exists; // Returns true if reset instructions can be "sent" to email
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    const users = db.getUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const updated = { ...u, role };
        // If the updated user is the currently logged in user, update the active session
        if (user && user.id === userId) {
          setUser(updated);
          db.setSession(updated);
        }
        return updated;
      }
      return u;
    });
    db.saveUsers(updatedUsers);
  };

  const adminResetPassword = (userId: string): string => {
    const users = db.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return '';

    const newPassword = Math.random().toString(36).slice(-8); // Generate random 8 char password
    const passwords = db.getPasswords();
    passwords[targetUser.email] = newPassword;
    db.savePasswords(passwords);
    return newPassword;
  };

  const refreshUserList = (): User[] => {
    return db.getUsers();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateUserRole,
        adminResetPassword,
        refreshUserList
      }}
    >
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
