import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUsuario } from "../../context/UsuarioContext";
import { colores } from "../../theme";

function iconoDeTab(nombre) {
  return function IconoDeTab({ color, size }) {
    return <Ionicons name={nombre} color={color} size={size} />;
  };
}

export default function TabsLayout() {
  const { usuario } = useUsuario();

  // Sin sesión iniciada no se puede usar la app
  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.negro },
        headerTitleStyle: { color: colores.blanco, fontWeight: "700" },
        tabBarStyle: { backgroundColor: colores.negro, borderTopColor: colores.grisOscuro },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: "#A1A1AA",
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Explorar", tabBarIcon: iconoDeTab("compass-outline") }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: iconoDeTab("person-circle-outline") }} />
    </Tabs>
  );
}
