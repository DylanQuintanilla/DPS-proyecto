"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert, 
  TextInput 
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { CrudActions, FormModal } from "../components/CrudComponents"

interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  min_stock: number
  categoria_id: number
  codigo_barras: string
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, hasPermission } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/products");
      const result = await response.json();
      
      // Manejar la nueva estructura de respuesta
      if (result.success) {
        setProducts(result.data);
      } else {
        setProducts([]);
        Alert.alert("Error", "No se pudieron cargar los productos");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View>
      {loading ? (
        <Text>Cargando productos...</Text>
      ) : (
        products.map((product) => (
          <Text key={product.id}>{product.nombre}</Text>
        ))
      )}
    </View>
  );
};
export default ProductsScreen;

  const handleAddProduct = () => {
    setCurrentProduct(null)
    setIsModalVisible(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setIsModalVisible(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/products/${product.id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== product.id))
        Alert.alert("Éxito", "Producto eliminado correctamente")
      } else {
        Alert.alert("Error", result.message || "No se pudo eliminar el producto")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      Alert.alert("Error", "Error al eliminar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProduct = async (formData: any) => {
    try {
      setIsSubmitting(true)
      
      const isEditing = !!currentProduct
      const url = isEditing 
        ? `http://localhost:3000/products/${currentProduct.id}` 
        : "http://localhost:3000/products"
      
      const method = isEditing ? "PUT" : "POST"
      
      // Convertir valores numéricos
      const processedData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10),
        min_stock: parseInt(formData.min_stock, 10),
        categoria_id: parseInt(formData.categoria_id, 10)
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (isEditing) {
          setProducts(prev => 
            prev.map(p => p.id === currentProduct.id ? { ...p, ...processedData } : p)
          )
          Alert.alert("Éxito", "Producto actualizado correctamente")
        } else {
          setProducts(prev => [...prev, result.data])
          Alert.alert("Éxito", "Producto creado correctamente")
        }
        setIsModalVisible(false)
      } else {
        Alert.alert("Error", result.message || "No se pudo guardar el producto")
      }
    } catch (error) {
      console.error("Error submitting product:", error)
      Alert.alert("Error", "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchText.toLowerCase()) || 
      product.codigo_barras.includes(searchText)
  )

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { text: "Sin stock", color: "#dc2626" }
    if (stock <= minStock) return { text: "Stock bajo", color: "#f59e0b" }
    return { text: "En stock", color: "#059669" }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const productFormFields = [
  { name: "nombre", label: "Nombre", placeholder: "Nombre del producto" },
  { name: "descripcion", label: "Descripción", placeholder: "Descripción del producto", multiline: true },
  { name: "precio", label: "Precio", placeholder: "0.00", keyboardType: "decimal-pad" },
  { name: "stock", label: "Stock", placeholder: "0", keyboardType: "number-pad" },
  { name: "min_stock", label: "Stock Mínimo", placeholder: "0", keyboardType: "number-pad" },
  { name: "categoria_id", label: "ID de Categoría (opcional)", placeholder: "1", keyboardType: "number-pad" },
  { name: "codigo_barras", label: "Código de Barras", placeholder: "Código de barras" },
  // Removido el campo ID
]

  const ProductItem = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stock, item.min_stock)
    const canUpdate = hasPermission("update", "products")
    const canDelete = hasPermission("delete", "products")

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => canUpdate && handleEditProduct(item)}
        disabled={!canUpdate}
      >
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.statusText}>{stockStatus.text}</Text>
          </View>
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Precio:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.precio)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text style={styles.detailValue}>{item.stock} unidades</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Código:</Text>
            <Text style={styles.detailValue}>{item.codigo_barras}</Text>
          </View>
        </View>

        {(canUpdate || canDelete) && (
          <View style={styles.itemActions}>
            {canUpdate && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditProduct(item)}
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
                    "¿Estás seguro de que deseas eliminar este producto?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Eliminar", onPress: () => handleDeleteProduct(item), style: "destructive" }
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
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {hasPermission("create", "products") && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>➕ Agregar Producto</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={ProductItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      <FormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitProduct}
        title={currentProduct ? "Editar Producto" : "Agregar Producto"}
        fields={productFormFields}
        initialValues={currentProduct || {}}
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
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  actionsContainer: {
    padding: 16,
    paddingTop: 8,
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
  productCard: {
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
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  productDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    gap: 6,
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
  itemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
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