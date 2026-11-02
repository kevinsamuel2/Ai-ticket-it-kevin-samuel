import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UsuarioProvider, useUsuario } from "../context/UsuarioContext";
import { colores } from "../theme";

export default function RootLayout() {
  return (
    <UsuarioProvider>
      <StatusBar style="light" />
      <Navegacion />
    </UsuarioProvider>
  );
}

// Rutas protegidas: sin sesión solo se puede ver el login, y con sesión no se puede volver al login.
// Si la sesión se pierde en cualquier pantalla (ej: expiró), Expo Router redirige solo al login.
function Navegacion() {
  const { usuario } = useUsuario();
  const haySesion = usuario !== null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.negro },
        headerTintColor: colores.primario,
        headerTitleStyle: { color: colores.blanco, fontWeight: "700" },
        contentStyle: { backgroundColor: colores.fondo },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Protected guard={haySesion}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="eventos/[id]/index" options={{ title: "Evento" }} />
        <Stack.Screen name="eventos/nuevo" options={{ title: "Publicar evento" }} />
        <Stack.Screen name="eventos/[id]/ventas" options={{ title: "Ventas" }} />
        <Stack.Screen name="compras/[id]/index" options={{ title: "Compra" }} />
        <Stack.Screen name="compras/[id]/chat" options={{ title: "Chat" }} />
      </Stack.Protected>
      <Stack.Protected guard={!haySesion}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
