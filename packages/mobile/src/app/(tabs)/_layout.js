import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, fuente } from "../../theme";

function iconoDeTab(nombre, nombreActivo) {
  return function IconoDeTab({ color, size, focused }) {
    return <Ionicons name={focused ? nombreActivo : nombre} color={color} size={size} />;
  };
}

// Barra de pestañas flotante como la de la app de Punch: cápsula oscura con bordes redondeados, separada de los
// bordes de la pantalla, donde la pestaña activa se resalta con un fondo verde suave
export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        // Cada pantalla dibuja su propio encabezado
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Math.max(bottom, 12) + 4,
          height: 66,
          paddingBottom: 0,
          paddingTop: 0,
          borderRadius: 24,
          borderCurve: "continuous",
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: colores.borde,
          backgroundColor: "rgba(16,16,18,0.97)",
          elevation: 0,
        },
        tabBarItemStyle: { marginHorizontal: 4, marginVertical: 7, borderRadius: 18, borderCurve: "continuous" },
        tabBarActiveBackgroundColor: colores.primarioSuave,
        tabBarLabelStyle: { ...fuente, fontSize: 11, fontWeight: "700" },
        tabBarActiveTintColor: colores.primarioClaro,
        tabBarInactiveTintColor: colores.textoApagado,
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: iconoDeTab("home-outline", "home") }} />
      <Tabs.Screen
        name="eventos"
        options={{ title: "Eventos", tabBarIcon: iconoDeTab("calendar-outline", "calendar") }}
      />
      <Tabs.Screen
        name="entradas"
        options={{ title: "Entradas", tabBarIcon: iconoDeTab("ticket-outline", "ticket") }}
      />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: iconoDeTab("person-outline", "person") }} />
    </Tabs>
  );
}
