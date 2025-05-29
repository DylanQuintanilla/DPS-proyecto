"use client"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import { useAuth } from "../contexts/AuthContext"

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: logout },
    ])
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

  const getMenuItems = () => {
    const baseItems = [
      { name: "Dashboard", title: "Panel Principal", icon: "📊" },
      { name: "Products", title: "Productos", icon: "📦" },
      { name: "Categories", title: "Categorías", icon: "🏷️" },
      { name: "Movements", title: "Movimientos", icon: "📋" },
      { name: "Reports", title: "Reportes", icon: "📈" },
      { name: "Alerts", title: "Alertas", icon: "⚠️" },
    ]

    if (user?.role === "admin") {
      baseItems.splice(4, 0, { name: "Users", title: "Usuarios", icon: "👥" })
    }

    return baseItems
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.role}>{getRoleDisplayName(user?.role || "")}</Text>
      </View>

      <DrawerContentScrollView {...props} style={styles.content}>
        {getMenuItems().map((item) => (
          <DrawerItem
            key={item.name}
            label={({ focused }) => (
              <View style={styles.menuItem}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuText, focused && styles.menuTextFocused]}>{item.title}</Text>
              </View>
            )}
            onPress={() => props.navigation.navigate(item.name)}
            focused={props.state.routeNames[props.state.index] === item.name}
            activeTintColor="#2563eb"
            inactiveTintColor="#64748b"
          />
        ))}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2563eb",
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  role: {
    color: "#bfdbfe",
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
  },
  menuTextFocused: {
    color: "#2563eb",
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
})
