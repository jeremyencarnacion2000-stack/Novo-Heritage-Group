"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"

interface AuthContextType {
  user: any | null
  login: (provider: string) => void
  logout: () => void
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const { data: session, status } = useSession()

  const login = (provider: string) => {
    signIn(provider)
  }

  const logout = () => {
    signOut()
  }

  const context = {
    user: session?.user,
    login,
    logout,
    status,
  }

  if (context === undefined) {
    throw new Error('useAuth must be used within a SessionProviderWrapper')
  }
  return context
}

export function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
