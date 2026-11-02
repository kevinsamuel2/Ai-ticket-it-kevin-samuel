import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Boton } from "./Boton";
import { colores, espaciado, texto } from "../theme";

// Componentes para los tres estados de una pantalla que carga datos: cargando, error y sin resultados

export function Cargando({ mensaje = "Cargando..." }) {
  return (
    <View style={styles.centrado} accessibilityRole="progressbar" accessibilityLabel={mensaje}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

export function MensajeError({ mensaje, onReintentar }) {
  return (
    <View style={styles.centrado} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={48} color={colores.peligro} />
      <Text style={[styles.mensaje, { color: colores.peligro }]}>{mensaje}</Text>
      {onReintentar && <Boton titulo="Reintentar" variante="secundario" icono="refresh" onPress={onReintentar} />}
    </View>
  );
}

export function SinResultados({ icono = "search-outline", mensaje }) {
  return (
    <View style={styles.centrado}>
      <Ionicons name={icono} size={48} color={colores.textoSecundario} />
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", padding: espaciado.xl, gap: espaciado.m },
  mensaje: { ...texto.cuerpo, color: colores.textoSecundario, textAlign: "center" },
});
