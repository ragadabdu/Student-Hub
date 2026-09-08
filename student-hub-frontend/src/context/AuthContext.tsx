import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type AuthContextType = {
  user: null; // Will be typed when we build auth
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // For now, just a placeholder
  // Eventually this will connect to Rails' Devise/JWT
  const value = {
    user: null,
    isAuthenticated: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}