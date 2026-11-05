import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../../theme";

function iconoDeTab(nombre) {
  return function IconoDeTab({ color, size }) {
    return <Ionicons name={nombre} color={color} size={size} />;
  };
}

export default function TabsLayout() {
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
      <Tabs.Screen name="favoritos" options={{ title: "Favoritos", tabBarIcon: iconoDeTab("heart-outline") }} />
      <Tabs.Screen name="compras" options={{ title: "Mis compras", tabBarIcon: iconoDeTab("ticket-outline") }} />
      <Tabs.Screen name="mis-eventos" options={{ title: "Mis eventos", tabBarIcon: iconoDeTab("megaphone-outline") }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: iconoDeTab("person-circle-outline") }} />
    </Tabs>
  );
}
