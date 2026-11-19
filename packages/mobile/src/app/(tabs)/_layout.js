import { Platform, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colores, fuente } from "../../theme";

function iconoDeTab(nombre, nombreActivo) {
  return function IconoDeTab({ color, size, focused }) {
    return <Ionicons name={focused ? nombreActivo : nombre} color={color} size={size + 1} />;
  };
}

// Fondo translúcido de la barra de pestañas, como la de iOS: desenfoca lo que pasa por debajo
function FondoDeBarra() {
  return <BlurView intensity={80} tint="systemChromeMaterialLight" style={StyleSheet.absoluteFill} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Cada pantalla dibuja su propio título grande (EncabezadoGrande)
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(249,249,249,0.94)",
          borderTopColor: colores.borde,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarBackground: FondoDeBarra,
        tabBarLabelStyle: { ...fuente, fontSize: 10, fontWeight: "500" },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: "#8E8E93",
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Explorar", tabBarIcon: iconoDeTab("compass-outline", "compass") }} />
      <Tabs.Screen
        name="favoritos"
        options={{ title: "Favoritos", tabBarIcon: iconoDeTab("heart-outline", "heart") }}
      />
      <Tabs.Screen
        name="compras"
        options={{ title: "Mis compras", tabBarIcon: iconoDeTab("ticket-outline", "ticket") }}
      />
      <Tabs.Screen
        name="mis-eventos"
        options={{ title: "Mis eventos", tabBarIcon: iconoDeTab("megaphone-outline", "megaphone") }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarIcon: iconoDeTab("person-circle-outline", "person-circle") }}
      />
    </Tabs>
  );
}
