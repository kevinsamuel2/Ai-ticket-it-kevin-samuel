import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AvisosProvider } from "../context/AvisosContext";
import { UsuarioProvider, useUsuario } from "../context/UsuarioContext";
import { useConexionConServidor } from "../hooks/useConexionConServidor";
import { PantallaDeCarga } from "../components/PantallaDeCarga";
import { colores, fuente } from "../theme";

export default function RootLayout() {
  const conexion = useConexionConServidor();
  const mostrarCarga = conexion.verificando || conexion.error;

  return (
    <AvisosProvider>
      <UsuarioProvider>
        <Navegacion pantallaDeCargaVisible={mostrarCarga} />
        {/* La pantalla de carga va encima de la navegación: Expo Router necesita que el Stack esté montado */}
        {mostrarCarga && (
          <View style={StyleSheet.absoluteFill}>
            <PantallaDeCarga
              mensaje="Conectando con el servidor..."
              error={conexion.error}
              onReintentar={conexion.reintentar}
            />
          </View>
        )}
      </UsuarioProvider>
    </AvisosProvider>
  );
}

// Rutas protegidas: sin sesión solo se puede ver el login, y con sesión no se puede volver al login.
// Si la sesión se pierde en cualquier pantalla (ej: expiró), Expo Router redirige solo al login.
function Navegacion({ pantallaDeCargaVisible }) {
  const { usuario } = useUsuario();
  const haySesion = usuario !== null;

  return (
    <>
      {/* El login y la pantalla de carga son negros (íconos claros); el resto de la app es clara */}
      <StatusBar style={haySesion && !pantallaDeCargaVisible ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.fondo },
          headerShadowVisible: false,
          headerTintColor: colores.primario,
          headerTitleStyle: { ...fuente, color: colores.texto, fontWeight: "600", fontSize: 17 },
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
    </>
  );
}
