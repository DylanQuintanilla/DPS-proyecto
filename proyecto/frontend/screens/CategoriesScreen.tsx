"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert 
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { FormModal } from "../components/CrudComponents"

interface Category {
  id: number
  nombre: string
  descripcion: string
  creado_en: string
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/categories")
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        Alert.alert("Error", "No se pudieron cargar las categorías")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      Alert.alert("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setCurrentCategory(null)
    setIsModalVisible(true)
  }

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setIsModalVisible(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/categories/${category.id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCategories(prev => prev.filter(c => c.id !== category.id))
        Alert.alert("Éxito", "Categoría eliminada correctamente")
      } else {
        Alert.alert("Error", result.message || "No se pudo eliminar la categoría")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      Alert.alert("Error", "Error al eliminar la categoría")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCategory = async (formData: any) => {
    try {
      setIsSubmitting(true)
      
      const isEditing = !!currentCategory
      const url = isEditing 
        ? `http://localhost:3000/categories/${currentCategory.id}` 
        : "http://localhost:3000/categories"
      
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (isEditing) {
          setCategories(prev => 
            prev.map(c => c.id === currentCategory.id ? { ...c, ...formData } : c)
          )
          Alert.alert("Éxito", "Categoría actualizada correctamente")
        } else {
          setCategories(prev => [...prev, result.data])
          Alert.alert("Éxito", "Categoría creada correctamente")
        }
        setIsModalVisible(false)
      } else {
        Alert.alert("Error", result.message || "No se pudo guardar la categoría")
      }
    } catch (error) {
      console.error("Error submitting category:", error)
      Alert.alert("Error", "Error al guardar la categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryFormFields = [
    { name: "nombre", label: "Nombre", placeholder: "Nombre de la categoría" },
    { name: "descripcion", label: "Descripción", placeholder: "Descripción de la categoría", multiline: true },
  ]

  const CategoryItem = ({ item }: { item: Category }) => {
    const canUpdate = hasPermission("update", "categories")
    const canDelete = hasPermission("delete", "categories")

    return (
      <TouchableOpacity 
        style={styles.categoryCard}
        onPress={() => canUpdate && handleEditCategory(item)}
        disabled={!canUpdate}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{item.nombre}</Text>
          <Text style={styles.categoryId}>#{item.id}</Text>
        </View>

        {item.descripcion && <Text style={styles.categoryDescription}>{item.descripcion}</Text>}

        <Text style={styles.createdDate}>Creado: {new Date(item.creado_en).toLocaleDateString("es-ES")}</Text>

        {(canUpdate || canDelete) && (
          <View style={styles.itemActions}>
            {canUpdate && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditCategory(item)}
              >
                <Text style={styles.actionButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
            
            {canDelete && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    "Confirmar eliminación",
                    "¿Estás seguro de que deseas eliminar esta categoría?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Eliminar", onPress: () => handleDeleteCategory(item), style: "destructive" }
                    ]
                  )
                }}
              >
                <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {hasPermission("create", "categories") && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCategory}
          >
            <Text style={styles.addButtonText}>➕ Agregar Categoría</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={CategoryItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCategories} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron categorías</Text>
          </View>
        }
      />

      <FormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitCategory}
        title={currentCategory ? "Editar Categoría" : "Agregar Categoría"}
        fields={categoryFormFields}
        initialValues={currentCategory || {}}
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
  categoryCard: {
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
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  categoryId: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  createdDate: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 12,
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
})