import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UsuarioProvider } from "../context/UsuarioContext";
import { colores } from "../theme";

export default function RootLayout() {
  return (
    <UsuarioProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.negro },
          headerTintColor: colores.primario,
          headerTitleStyle: { color: colores.blanco, fontWeight: "700" },
          contentStyle: { backgroundColor: colores.fondo },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </UsuarioProvider>
  );
}
