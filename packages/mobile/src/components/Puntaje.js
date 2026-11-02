import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../theme";
import { formatearPuntaje } from "../utils/formato";

// Puntaje del organizador con una estrella, ej: "★ 4.5 (2)"
export function Puntaje({ puntaje, cantidad, tamanio = 13 }) {
  const sinResenias = puntaje === null || puntaje === undefined;
  const descripcion = sinResenias
    ? "Organizador sin reseñas"
    : `Puntaje del organizador ${formatearPuntaje(puntaje)} de 5, ${cantidad} reseñas`;
  return (
    <View style={styles.fila} accessible accessibilityLabel={descripcion}>
      <Ionicons name={sinResenias ? "star-outline" : "star"} size={tamanio} color={colores.estrella} />
      <Text style={[styles.texto, { fontSize: tamanio }]}>
        {formatearPuntaje(puntaje)}
        {!sinResenias && cantidad !== undefined && <Text style={styles.cantidad}> ({cantidad})</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 3 },
  texto: { fontWeight: "600", color: colores.texto },
  cantidad: { fontWeight: "400", color: colores.textoSecundario },
});
