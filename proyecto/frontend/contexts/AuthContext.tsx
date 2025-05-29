"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"

interface User {
  id: number
  username: string
  role: "admin" | "visualizador" | "inventario"
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  hasPermission: (action: "create" | "read" | "update" | "delete", resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userData = await AsyncStorage.getItem("user")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: username,
          contraseña: password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await AsyncStorage.setItem("token", data.token)
        await AsyncStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    // Función síncrona para logout inmediato
    AsyncStorage.removeItem("token")
      .then(() => AsyncStorage.removeItem("user"))
      .then(() => {
        setUser(null)
        console.log("Logout successful")
      })
      .catch((error) => {
        console.error("Logout error:", error)
        // Aún así, limpiar el estado del usuario
        setUser(null)
      })
  }

  // Sistema de permisos basado en roles
  const hasPermission = (action: "create" | "read" | "update" | "delete", resource: string): boolean => {
    if (!user) return false;

    // Todos los roles pueden leer (excepto usuarios para roles no admin)
    if (action === "read") {
      if (resource === "users" && user.role !== "admin") {
        return false;
      }
      return true;
    }

    // Admin puede hacer todo
    if (user.role === "admin") {
      return true;
    }

    // Inventario puede crear/actualizar/eliminar todo excepto usuarios
    if (user.role === "inventario") {
      return resource !== "users";
    }

    // Visualizador solo puede leer
    return false;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}