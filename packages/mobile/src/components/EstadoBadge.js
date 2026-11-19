import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { estilosDeEstado, espaciado, fuente } from "../theme";

// Etiqueta del estado de una compra: cada estado tiene su ícono y sus colores para distinguirlos de un vistazo
export function EstadoBadge({ estado, grande = false }) {
  const estilo = estilosDeEstado[estado];
  return (
    <View
      style={[styles.badge, { backgroundColor: estilo.fondo, borderColor: estilo.borde }, grande && styles.grande]}
      accessible
      accessibilityLabel={`Estado: ${estilo.etiqueta}`}
    >
      <Ionicons name={estilo.icono} size={grande ? 18 : 14} color={estilo.color} />
      <Text style={[styles.texto, { color: estilo.color }, grande && styles.textoGrande]}>{estilo.etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espaciado.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  grande: { paddingHorizontal: espaciado.m + 2, paddingVertical: 7 },
  texto: { ...fuente, fontSize: 12, fontWeight: "600", letterSpacing: -0.08 },
  textoGrande: { fontSize: 15 },
});
