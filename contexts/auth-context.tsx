"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  company: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, company: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Simple JWT-like token generation (for demo purposes)
function generateToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(JSON.stringify({ ...user, exp: Date.now() + 24 * 60 * 60 * 1000 }))
  const signature = btoa(`${header}.${payload}.secret`)
  return `${header}.${payload}.${signature}`
}

function verifyToken(token: string): User | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp < Date.now()) return null

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      company: payload.company,
      createdAt: payload.createdAt,
    }
  } catch {
    return null
  }
}

// Update the AuthProvider component to include demo user seeding

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Seed demo user if it doesn't exist
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const demoUser = users.find((u: any) => u.email === "demo@example.com")

    if (!demoUser) {
      const newDemoUser = {
        id: "demo-user-1",
        email: "demo@example.com",
        password: "demo123",
        name: "Demo User",
        company: "Demo Company Inc.",
        createdAt: new Date().toISOString(),
      }
      users.push(newDemoUser)
      localStorage.setItem("users", JSON.stringify(users))
    }

    // Check for existing auth token
    const token = localStorage.getItem("auth_token")
    if (token) {
      const userData = verifyToken(token)
      if (userData) {
        setUser(userData)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (user) {
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        createdAt: user.createdAt,
      }

      const token = generateToken(userData)
      localStorage.setItem("auth_token", token)
      setUser(userData)
      return true
    }

    return false
  }

  const register = async (email: string, password: string, name: string, company: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.find((u: any) => u.email === email)) {
      return false // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed
      name,
      company,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    return login(email, password)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}
