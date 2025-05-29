"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { createStackNavigator } from "@react-navigation/stack"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import LoginScreen from "./screens/LoginScreen"
import DashboardScreen from "./screens/DashboardScreen"
import ProductsScreen from "./screens/ProductsScreen"
import CategoriesScreen from "./screens/CategoriesScreen"
import MovementsScreen from "./screens/MovementsScreen"
import UsersScreen from "./screens/UsersScreen"
import ReportsScreen from "./screens/ReportsScreen"
import AlertsScreen from "./screens/AlertsScreen"
import CustomDrawerContent from "./components/CustomDrawerContent"

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

function DrawerNavigator() {
  const { user } = useAuth()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2563eb",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Panel Principal" }} />

      <Drawer.Screen name="Products" component={ProductsScreen} options={{ title: "Productos" }} />

      <Drawer.Screen name="Categories" component={CategoriesScreen} options={{ title: "Categorías" }} />

      <Drawer.Screen name="Movements" component={MovementsScreen} options={{ title: "Movimientos" }} />

      {user?.role === "admin" && <Drawer.Screen name="Users" component={UsersScreen} options={{ title: "Usuarios" }} />}

      <Drawer.Screen name="Reports" component={ReportsScreen} options={{ title: "Reportes" }} />

      <Drawer.Screen name="Alerts" component={AlertsScreen} options={{ title: "Alertas" }} />
    </Drawer.Navigator>
  )
}

function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // O un componente de loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
