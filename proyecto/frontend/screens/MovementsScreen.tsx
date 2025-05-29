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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { hasPermission } = useAuth()

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

  const handleAddMovement = () => {
    setIsModalVisible(true)
  }

  const handleSubmitMovement = async (formData: any) => {
    try {
      setIsSubmitting(true)
      
      // Convertir valores numéricos
      const processedData = {
        ...formData,
        producto_id: formData.producto_id,
        cantidad: parseInt(formData.cantidad, 10),
        tipo: formData.tipo.toLowerCase()
      }
      
      const response = await fetch("http://localhost:3000/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Actualizar la lista con el nuevo movimiento
        fetchMovements()
        Alert.alert("Éxito", "Movimiento registrado correctamente")
        setIsModalVisible(false)
      } else {
        Alert.alert("Error", result.message || "No se pudo registrar el movimiento")
      }
    } catch (error) {
      console.error("Error submitting movement:", error)
      Alert.alert("Error", "Error al registrar el movimiento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const movementFormFields = [
  { name: "producto_id", label: "ID del Producto", placeholder: "ID del producto" },
  { 
    name: "tipo", 
    label: "Tipo", 
    placeholder: "entrada o salida",
  },
  { name: "cantidad", label: "Cantidad", placeholder: "0", keyboardType: "number-pad" },
  { name: "motivo", label: "Motivo", placeholder: "Motivo del movimiento", multiline: true },
  // Agregar campo precio_producto que faltaba
  { name: "precio_producto", label: "Precio del Producto", placeholder: "0.00", keyboardType: "decimal-pad" },
]

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
      {hasPermission("create", "movements") && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMovement}
          >
            <Text style={styles.addButtonText}>➕ Registrar Movimiento</Text>
          </TouchableOpacity>
        </View>
      )}

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

      <FormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitMovement}
        title="Registrar Movimiento"
        fields={movementFormFields}
        initialValues={{}}
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