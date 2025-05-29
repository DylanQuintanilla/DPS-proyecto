"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from "react-native"

interface Movement {
  id: number
  producto_id: string
  producto_nombre: string
  tipo: "entrada" | "salida"
  cantidad: number
  motivo: string
  stock_anterior: number
  stock_nuevo: number
  precio_producto: number
  fecha: string
}

export default function MovementsScreen() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovements()
  }, [])

  const fetchMovements = async () => {
    try {
      const response = await fetch("http://localhost:3000/movements")
      const result = await response.json()

      if (result.success) {
        setMovements(result.data)
      } else {
        Alert.alert("Error", "No se pudieron cargar los movimientos")
      }
    } catch (error) {
      console.error("Error fetching movements:", error)
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

  const MovementItem = ({ item }: { item: Movement }) => {
    const isEntry = item.tipo === "entrada"

    return (
      <View style={styles.movementCard}>
        <View style={styles.movementHeader}>
          <Text style={styles.productName}>{item.producto_nombre}</Text>
          <View style={[styles.typeBadge, { backgroundColor: isEntry ? "#059669" : "#dc2626" }]}>
            <Text style={styles.typeText}>{isEntry ? "ENTRADA" : "SALIDA"}</Text>
          </View>
        </View>

        <Text style={styles.motivo}>{item.motivo}</Text>

        <View style={styles.movementDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cantidad:</Text>
            <Text style={[styles.detailValue, { color: isEntry ? "#059669" : "#dc2626" }]}>
              {isEntry ? "+" : "-"}
              {item.cantidad}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock anterior:</Text>
            <Text style={styles.detailValue}>{item.stock_anterior}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock nuevo:</Text>
            <Text style={styles.detailValue}>{item.stock_nuevo}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Precio:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.precio_producto)}</Text>
          </View>
        </View>

        <Text style={styles.date}>{new Date(item.fecha).toLocaleString("es-ES")}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={MovementItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMovements} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron movimientos</Text>
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
  movementCard: {
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
  movementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  motivo: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    fontStyle: "italic",
  },
  movementDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
  },
  date: {
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
