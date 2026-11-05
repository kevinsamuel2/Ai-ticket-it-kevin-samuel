import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Boton } from "./Boton";
import { colores, espaciado } from "../theme";

// Pantalla completa con la marca: se muestra al abrir la app mientras se verifica la conexión con el backend
export function PantallaDeCarga({ mensaje = "Cargando...", error, onReintentar }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.logo}>
        <Ionicons name="ticket" size={44} color={colores.negro} />
      </View>
      <Text style={styles.nombre}>
        AI <Text style={styles.verde}>Ticket</Text> It
      </Text>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="cloud-offline-outline" size={36} color={colores.peligro} />
          <Text style={styles.textoError}>{error}</Text>
          <Boton titulo="Reintentar" icono="refresh" onPress={onReintentar} />
        </View>
      ) : (
        <View style={styles.carga} accessibilityRole="progressbar" accessibilityLabel={mensaje}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={styles.mensaje}>{mensaje}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.l,
    padding: espaciado.xl,
    backgroundColor: colores.negro,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: { fontSize: 34, fontWeight: "800", color: colores.blanco },
  verde: { color: colores.primario },
  carga: { alignItems: "center", gap: espaciado.m, marginTop: espaciado.xl },
  mensaje: { color: "#A1A1AA", fontSize: 15 },
  error: { alignItems: "center", gap: espaciado.m, marginTop: espaciado.l, alignSelf: "stretch" },
  textoError: { color: colores.blanco, fontSize: 15, textAlign: "center" },
});
