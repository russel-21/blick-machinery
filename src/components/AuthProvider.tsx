'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, db, UserRole, Quote, SAVTicket } from '@/lib/auth';

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
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  adminResetPassword: (userId: string) => Promise<string>; // returns new generated password
  refreshUserList: () => Promise<User[]>;
  deleteUser: (userId: string) => Promise<void>;
  submitQuote: (quote: Omit<Quote, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  submitTicket: (ticket: Omit<SAVTicket, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: SAVTicket['status']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load of session
    const session = db.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const users = await db.getUsers();
    const passwords = await db.getPasswords();
    
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const email = 'google.user@gmail.com';
    const name = 'Visiteur Google';
    const users = await db.getUsers();
    
    let matchingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchingUser) {
      matchingUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'client', // Default to client so they can access B2B features
        isGoogleUser: true,
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...users, matchingUser];
      await db.saveUsers(updatedUsers);
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const users = await db.getUsers();
    
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
      role: 'client', // Standard registered users are clients
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    await db.saveUsers(updatedUsers);

    if (data.password) {
      const passwords = await db.getPasswords();
      passwords[data.email] = data.password;
      await db.savePasswords(passwords);
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
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = await db.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    return exists;
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    const users = await db.getUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const updated = { ...u, role };
        if (user && user.id === userId) {
          setUser(updated);
          db.setSession(updated);
        }
        return updated;
      }
      return u;
    });
    await db.saveUsers(updatedUsers);
  };

  const adminResetPassword = async (userId: string): Promise<string> => {
    const users = await db.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return '';

    const newPassword = Math.random().toString(36).slice(-8); // Generate random 8 char password
    const passwords = await db.getPasswords();
    passwords[targetUser.email] = newPassword;
    await db.savePasswords(passwords);
    return newPassword;
  };

  const refreshUserList = async (): Promise<User[]> => {
    return await db.getUsers();
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const users = await db.getUsers();
    const passwords = await db.getPasswords();
    
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    
    // Filter out target user
    const updatedUsers = users.filter((u) => u.id !== userId);
    await db.saveUsers(updatedUsers);
    
    // Delete password record
    delete passwords[targetUser.email];
    await db.savePasswords(passwords);
  };

  const submitQuote = async (quote: Omit<Quote, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const quotes = await db.getQuotes();
    const newQuote: Quote = {
      ...quote,
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await db.saveQuotes([newQuote, ...quotes]);
  };

  const submitTicket = async (ticket: Omit<SAVTicket, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const tickets = await db.getTickets();
    const newTicket: SAVTicket = {
      ...ticket,
      id: 'tk_' + Math.random().toString(36).substr(2, 9),
      status: 'open',
      createdAt: new Date().toISOString()
    };
    await db.saveTickets([newTicket, ...tickets]);
  };

  const updateQuoteStatus = async (quoteId: string, status: Quote['status']): Promise<void> => {
    const quotes = await db.getQuotes();
    const updated = quotes.map((q) => {
      if (q.id === quoteId) {
        return { ...q, status };
      }
      return q;
    });
    await db.saveQuotes(updated);
  };

  const updateTicketStatus = async (ticketId: string, status: SAVTicket['status']): Promise<void> => {
    const tickets = await db.getTickets();
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });
    await db.saveTickets(updated);
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
        refreshUserList,
        deleteUser,
        submitQuote,
        submitTicket,
        updateQuoteStatus,
        updateTicketStatus
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
