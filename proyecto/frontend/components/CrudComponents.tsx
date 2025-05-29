import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native"
import { useAuth } from "../contexts/AuthContext"

// Botón de acción CRUD
export const ActionButton = ({ 
  title, 
  onPress, 
  color = "#2563eb", 
  icon = "➕",
  disabled = false 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: color }, disabled && styles.disabledButton]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionButtonIcon}>{icon}</Text>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  )
}

// Componente para mostrar acciones CRUD
export const CrudActions = ({ 
  resource, 
  onAdd, 
  onEdit, 
  onDelete, 
  item = null 
}) => {
  const { hasPermission } = useAuth()
  
  const canCreate = hasPermission("create", resource)
  const canUpdate = hasPermission("update", resource)
  const canDelete = hasPermission("delete", resource)

  return (
    <View style={styles.actionsContainer}>
      {!item && canCreate && (
        <ActionButton 
          title="Agregar" 
          icon="➕" 
          onPress={onAdd} 
          color="#059669" 
        />
      )}
      
      {item && (
        <>
          {canUpdate && (
            <ActionButton 
              title="Editar" 
              icon="✏️" 
              onPress={() => onEdit(item)} 
              color="#f59e0b" 
            />
          )}
          
          {canDelete && (
            <ActionButton 
              title="Eliminar" 
              icon="🗑️" 
              onPress={() => {
                Alert.alert(
                  "Confirmar eliminación",
                  "¿Estás seguro de que deseas eliminar este elemento?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", onPress: () => onDelete(item), style: "destructive" }
                  ]
                )
              }} 
              color="#dc2626" 
            />
          )}
        </>
      )}
    </View>
  )
}

// Componente de formulario genérico
export const FormModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  title, 
  fields, 
  initialValues = {},
  isSubmitting = false
}) => {
  const [formValues, setFormValues] = useState(initialValues)

  const handleChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(formValues)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <ScrollView style={styles.formContainer}>
            {fields.map((field) => (
              <View key={field.name} style={styles.formField}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder || field.label}
                  value={formValues[field.name]?.toString() || ''}
                  onChangeText={(value) => handleChange(field.name, value)}
                  keyboardType={field.keyboardType || 'default'}
                  secureTextEntry={field.secureTextEntry || false}
                  multiline={field.multiline || false}
                  numberOfLines={field.multiline ? 3 : 1}
                />
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton, isSubmitting && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// Componente para mostrar mensaje de acceso denegado
export const AccessDenied = () => (
  <View style={styles.accessDeniedContainer}>
    <Text style={styles.accessDeniedText}>🚫 Acceso Denegado</Text>
    <Text style={styles.accessDeniedSubtext}>No tienes permisos para realizar esta acción</Text>
  </View>
)

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  formContainer: {
    maxHeight: 400,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#4b5563',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
})