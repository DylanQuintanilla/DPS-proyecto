"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from "react-native"
import { useAuth } from "../contexts/AuthContext"

interface User {
  id: number
  nombre: string
  correo: string
  rol: "admin" | "visualizador" | "inventario"
  creado_en: string
  actualizado_en: string
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      Alert.alert("Acceso Denegado", "No tienes permisos para ver esta sección")
      return
    }
    fetchUsers()
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users")
      const result = await response.json()

      if (result.success) {
        setUsers(result.data)
      } else {
        Alert.alert("Error", "No se pudieron cargar los usuarios")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      Alert.alert("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "visualizador":
        return "Visualizador"
      case "inventario":
        return "Inventario"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#dc2626"
      case "visualizador":
        return "#2563eb"
      case "inventario":
        return "#059669"
      default:
        return "#6b7280"
    }
  }

  const UserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{item.nombre}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.rol) }]}>
          <Text style={styles.roleText}>{getRoleDisplayName(item.rol)}</Text>
        </View>
      </View>

      <Text style={styles.userEmail}>{item.correo}</Text>

      <View style={styles.userDetails}>
        <Text style={styles.detailText}>ID: {item.id}</Text>
        <Text style={styles.detailText}>Creado: {new Date(item.creado_en).toLocaleDateString("es-ES")}</Text>
      </View>
    </View>
  )

  if (currentUser?.role !== "admin") {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedText}>🚫 Acceso Denegado</Text>
        <Text style={styles.accessDeniedSubtext}>Solo los administradores pueden ver esta sección</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={UserItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "#2563eb",
    marginBottom: 12,
  },
  userDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
    textAlign: "center",
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
})
