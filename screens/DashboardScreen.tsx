"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native"
import { useAuth } from "../contexts/AuthContext"

interface DashboardData {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:3000/dashboard")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        Alert.alert("Error", "No se pudieron cargar los datos del dashboard")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      Alert.alert("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido, {user?.username}</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {data && (
        <View style={styles.statsContainer}>
          <StatCard title="Total Productos" value={data.totalProducts} icon="📦" color="#2563eb" />

          <StatCard title="Stock Bajo" value={data.lowStockCount} icon="⚠️" color="#f59e0b" />

          <StatCard title="Sin Stock" value={data.outOfStockCount} icon="❌" color="#dc2626" />

          <StatCard title="Valor Total" value={formatCurrency(data.totalValue)} icon="💰" color="#059669" />
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <Text style={styles.sectionDescription}>
          Usa el menú lateral para navegar entre las diferentes secciones del sistema.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  quickActions: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
})
