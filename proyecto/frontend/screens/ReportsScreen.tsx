"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false)

  const generateReport = async (reportType: string) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_reporte: reportType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        Alert.alert("Reporte Generado", `Se encontraron ${result.data.length} registros`, [{ text: "OK" }])
      } else {
        Alert.alert("Error", "No se pudo generar el reporte")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      Alert.alert("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const ReportButton = ({ title, description, type, icon }: any) => (
    <TouchableOpacity style={styles.reportCard} onPress={() => generateReport(type)} disabled={loading}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportIcon}>{icon}</Text>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes del Sistema</Text>
        <Text style={styles.subtitle}>Genera reportes detallados sobre el inventario</Text>
      </View>

      <View style={styles.reportsContainer}>
        <ReportButton
          title="Reporte de Inventario"
          description="Lista completa de todos los productos"
          type="inventario"
          icon="📦"
        />

        <ReportButton
          title="Reporte de Ventas"
          description="Movimientos de salida de productos"
          type="ventas"
          icon="💰"
        />

        <ReportButton
          title="Reporte de Movimientos"
          description="Todos los movimientos de inventario"
          type="movimientos"
          icon="📋"
        />

        <ReportButton
          title="Productos con Stock Bajo"
          description="Productos que necesitan reabastecimiento"
          type="stock_bajo"
          icon="⚠️"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generando reporte...</Text>
        </View>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  reportsContainer: {
    padding: 16,
    gap: 12,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
})
