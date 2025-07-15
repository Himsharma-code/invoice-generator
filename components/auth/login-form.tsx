"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let success = false

      if (isLogin) {
        success = await login(formData.email, formData.password)
        if (!success) {
          setError("Invalid email or password. Try the demo account or create a new account.")
        }
      } else {
        if (!formData.name.trim() || !formData.company.trim()) {
          setError("Please fill in all required fields")
          setLoading(false)
          return
        }
        success = await register(formData.email, formData.password, formData.name, formData.company)
        if (!success) {
          setError("Email already exists. Please use a different email or sign in.")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = () => {
    setFormData({
      ...formData,
      email: "demo@example.com",
      password: "demo123",
    })
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back to Advanced Invoice Generator" : "Start managing your invoices professionally"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required={!isLogin}
                    placeholder="Enter your company name"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
                minLength={6}
              />
              {!isLogin && <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setFormData({ email: "", password: "", name: "", company: "" })
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 font-medium mb-2">🚀 Try the Demo Account:</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>
                <strong>Email:</strong> demo@example.com
              </p>
              <p>
                <strong>Password:</strong> demo123
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={useDemoAccount}>
              Use Demo Account
            </Button>
          </div>

          {/* Quick signup option */}
          {isLogin && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700 text-center">
                Or{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="font-medium underline hover:no-underline"
                >
                  create a new account
                </button>{" "}
                in seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
