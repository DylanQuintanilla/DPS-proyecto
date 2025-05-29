"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"

interface AlertItem {
  id: number
  producto_id: string
  producto_nombre: string
  tipo_alerta: string
  mensaje: string
  leido: boolean
  fecha_creacion: string
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://localhost:3000/alerts")
      const result = await response.json()

      if (result.success) {
        setAlerts(result.data)
      } else {
        Alert.alert("Error", "No se pudieron cargar las alertas")
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      Alert.alert("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/alerts/${alertId}/read`, {
        method: "PUT",
      })

      const result = await response.json()

      if (result.success) {
        setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, leido: true } : alert)))
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const AlertItemComponent = ({ item }: { item: AlertItem }) => (
    <TouchableOpacity
      style={[styles.alertCard, !item.leido && styles.unreadAlert]}
      onPress={() => !item.leido && markAsRead(item.id)}
    >
      <View style={styles.alertHeader}>
        <Text style={styles.alertType}>⚠️ {item.tipo_alerta}</Text>
        {!item.leido && <View style={styles.unreadBadge} />}
      </View>

      <Text style={styles.productName}>{item.producto_nombre}</Text>
      <Text style={styles.alertMessage}>{item.mensaje}</Text>

      <Text style={styles.alertDate}>{new Date(item.fecha_creacion).toLocaleString("es-ES")}</Text>
    </TouchableOpacity>
  )

  const unreadCount = alerts.filter((alert) => !alert.leido).length

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertas del Sistema</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{unreadCount} sin leer</Text>
          </View>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={AlertItemComponent}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlerts} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay alertas</Text>
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
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  unreadCountBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  alertCard: {
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
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  alertDate: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
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
})
