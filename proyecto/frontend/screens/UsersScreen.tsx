"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert,
  TouchableOpacity
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { FormModal } from "../components/CrudComponents"

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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentAuthUser } = useAuth()

  useEffect(() => {
    if (currentAuthUser?.role !== "admin") {
      Alert.alert("Acceso Denegado", "No tienes permisos para ver esta sección")
      return
    }
    fetchUsers()
  }, [currentAuthUser])

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

  const handleAddUser = () => {
    setCurrentUser(null)
    setIsModalVisible(true)
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setIsModalVisible(true)
  }

  const handleDeleteUser = async (user: User) => {
    // Evitar que el usuario elimine su propia cuenta
    if (user.id === currentAuthUser?.id) {
      Alert.alert("Error", "No puedes eliminar tu propia cuenta")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id))
        Alert.alert("Éxito", "Usuario eliminado correctamente")
      } else {
        Alert.alert("Error", result.message || "No se pudo eliminar el usuario")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      Alert.alert("Error", "Error al eliminar el usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitUser = async (formData: any) => {
    try {
      setIsSubmitting(true)
      
      const isEditing = !!currentUser
      const url = isEditing 
        ? `http://localhost:3000/users/${currentUser.id}` 
        : "http://localhost:3000/users"
      
      const method = isEditing ? "PUT" : "POST"
      
      // Si es una edición y no se proporciona contraseña, no la enviamos
      const dataToSend = { ...formData }
      if (isEditing && (!dataToSend.contraseña || dataToSend.contraseña.trim() === '')) {
        delete dataToSend.contraseña;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (isEditing) {
          setUsers(prev => 
            prev.map(u => u.id === currentUser.id ? { ...u, ...formData, contraseña: undefined } : u)
          )
          Alert.alert("Éxito", "Usuario actualizado correctamente")
        } else {
          setUsers(prev => [...prev, result.data])
          Alert.alert("Éxito", "Usuario creado correctamente")
        }
        setIsModalVisible(false)
      } else {
        Alert.alert("Error", result.message || "No se pudo guardar el usuario")
      }
    } catch (error) {
      console.error("Error submitting user:", error)
      Alert.alert("Error", "Error al guardar el usuario")
    } finally {
      setIsSubmitting(false)
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
const userFormFields = [
  { name: "nombre", label: "Nombre", placeholder: "Nombre de usuario" },
  { name: "correo", label: "Correo", placeholder: "correo@ejemplo.com" },
  { 
    name: "rol", 
    label: "Rol", 
    placeholder: "admin, visualizador o inventario",
  },
  { 
    name: "contraseña", 
    label: currentUser ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña", 
    placeholder: "Contraseña", 
    secureTextEntry: true 
  },
  // Removido el campo ID
]

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

      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        
        {/* No permitir eliminar el propio usuario */}
        {item.id !== currentAuthUser?.id && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              Alert.alert(
                "Confirmar eliminación",
                "¿Estás seguro de que deseas eliminar este usuario?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", onPress: () => handleDeleteUser(item), style: "destructive" }
                ]
              )
            }}
          >
            <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  if (currentAuthUser?.role !== "admin") {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedText}>🚫 Acceso Denegado</Text>
        <Text style={styles.accessDeniedSubtext}>Solo los administradores pueden ver esta sección</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddUser}
        >
          <Text style={styles.addButtonText}>➕ Agregar Usuario</Text>
        </TouchableOpacity>
      </View>

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

      <FormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitUser}
        title={currentUser ? "Editar Usuario" : "Agregar Usuario"}
        fields={userFormFields}
        initialValues={currentUser || {}}
        isSubmitting={isSubmitting}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  addButton: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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